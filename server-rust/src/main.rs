mod db;
mod latency;

use axum::{
    extract::Path,
    routing::get,
    Json, Router,
    response::IntoResponse,
};
use tower_http::cors::CorsLayer;
use serde::{Serialize, Deserialize};
use once_cell::sync::Lazy;
use dashmap::DashMap;
use std::sync::RwLock;
use rand::seq::SliceRandom;
use db::NodeRecord;

static GEO_CACHE: Lazy<DashMap<String, GeoData>> = Lazy::new(|| DashMap::new());

// Seed IPs provided by user
static SEED_IPS: Lazy<Vec<&str>> = Lazy::new(|| vec![
    "173.212.203.145",
    "173.212.220.65",
    "161.97.97.41",
    "192.190.136.36",
    "192.190.136.37",
    "192.190.136.38",
    "192.190.136.28",
    "192.190.136.29",
    "207.244.255.1",
]);

#[tokio::main]
async fn main() {
    // Initialize Database
    db::init_db().await.expect("Failed to initialize database");

    // Spawn background task for history snapshots and data refreshing
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(30)); // Refresh every 30s
        loop {
            interval.tick().await;
            refresh_data().await;
        }
    });

    let app = Router::new()
        .route("/pods", get(get_pods))
        .route("/node/{id}", get(get_node))
        .route("/node/{id}/history", get(get_node_history_handler))
        .route("/history", get(get_history))
        .route("/credits", get(get_credits))
        .layer(CorsLayer::permissive());

    let port = std::env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let addr = format!("0.0.0.0:{}", port);
    println!("Rust API Server listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

#[derive(Clone, Serialize, Deserialize, Debug)]
struct GeoData {
    lat: f64,
    lon: f64,
    country: String,
    city: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct PodRaw {
    address: Option<String>,
    is_public: Option<bool>,
    last_seen_timestamp: Option<i64>,
    pubkey: Option<String>,
    rpc_port: Option<u16>,
    storage_committed: Option<i64>,
    storage_usage_percent: Option<f64>,
    storage_used: Option<i64>,
    uptime: Option<i64>,
    version: Option<String>,
}

#[derive(Serialize)]
struct PodsResponseDto {
    total_count: usize,
    pods: Vec<PodDto>,
}

#[derive(Serialize)]
struct PodDto {
    pubkey: Option<String>,
    address: Option<String>,
    uptime: Option<i64>,
    storage_used: Option<i64>,
    storage_committed: Option<i64>,
    storage_usage_percent: Option<f64>,
    version: Option<String>,
    last_seen_timestamp: Option<i64>,
    is_public: Option<bool>,
    geo: Option<GeoData>,
    latency_ms: Option<i64>,
}

async fn fetch_geo(ip: String) -> Option<GeoData> {
    if let Some(geo) = GEO_CACHE.get(&ip) {
        return Some(geo.clone());
    }
    
    // Basic rate limit protection
    tokio::time::sleep(std::time::Duration::from_millis(100)).await;

    let url = format!("http://ip-api.com/json/{}", ip);
    match reqwest::get(&url).await {
        Ok(resp) => {
            if let Ok(json) = resp.json::<serde_json::Value>().await {
                if json["status"] == "success" {
                    let geo = GeoData {
                        lat: json["lat"].as_f64().unwrap_or(0.0),
                        lon: json["lon"].as_f64().unwrap_or(0.0),
                        country: json["country"].as_str().unwrap_or("").to_string(),
                        city: json["city"].as_str().unwrap_or("").to_string(),
                    };
                    GEO_CACHE.insert(ip.clone(), geo.clone());
                    return Some(geo);
                }
            }
        }
        Err(_) => {}
    }
    None
}

async fn call_rpc_get_pods() -> Result<Vec<PodRaw>, String> {
    let client = reqwest::Client::new();
    
    let mut seeds = SEED_IPS.clone();
    {
        let mut rng = rand::thread_rng();
        seeds.shuffle(&mut rng);
    }

    for ip in seeds {
        let url = format!("http://{}:6000/rpc", ip);
        let body = serde_json::json!({
            "jsonrpc": "2.0",
            "method": "get-pods-with-stats",
            "id": 1
        });

        match client.post(&url)
            .header("Content-Type", "application/json")
            .json(&body)
            .timeout(std::time::Duration::from_secs(5))
            .send()
            .await 
        {
            Ok(resp) => {
                if let Ok(json) = resp.json::<serde_json::Value>().await {
                    if let Some(result) = json.get("result") {
                         if let Ok(pods) = serde_json::from_value::<Vec<PodRaw>>(result.clone()) {
                             return Ok(pods);
                         }
                         if let Some(pods_val) = result.get("pods") {
                             if let Ok(pods) = serde_json::from_value::<Vec<PodRaw>>(pods_val.clone()) {
                                 return Ok(pods);
                             }
                         }
                    }
                }
            }
            Err(e) => {
                println!("Failed to fetch from {}: {}", ip, e);
                continue;
            }
        }
    }

    Err("All seed nodes failed".to_string())
}

async fn refresh_data() {
    println!("Refreshing data...");
    if let Ok(pods) = call_rpc_get_pods().await {
        let total = pods.len() as u32;
        let online = pods.iter().filter(|p| p.uptime.unwrap_or(0) > 0).count() as u32;
        let storage: u64 = pods.iter().map(|p| p.storage_used.unwrap_or(0) as u64).sum();

        // Save snapshot
        if let Err(e) = db::save_snapshot(total, online, storage).await {
            eprintln!("Failed to save snapshot: {}", e);
        }

        // Process each pod
        for pod in pods {
            let ip_full = pod.address.clone().unwrap_or_default();
            let ip_clean = ip_full.split(':').next().unwrap_or(&ip_full).to_string();
            
            // Measure latency
            let latency = if !ip_clean.is_empty() {
                // Use the full address if it has a port, otherwise default to 6000? 
                // Actually the pod.address usually has the port.
                latency::measure_latency(&ip_full).await
            } else {
                None
            };

            // Fetch Geo (if not cached)
            let mut geo_data = None;
            if !ip_clean.is_empty() && ip_clean != "127.0.0.1" {
                 geo_data = fetch_geo(ip_clean.clone()).await;
            }

            let record = NodeRecord {
                pubkey: pod.pubkey.unwrap_or_default(),
                ip: ip_full,
                version: pod.version,
                status: if pod.uptime.unwrap_or(0) > 0 { Some("online".to_string()) } else { Some("offline".to_string()) },
                last_seen: pod.last_seen_timestamp,
                storage_used: pod.storage_used,
                storage_committed: pod.storage_committed,
                storage_usage_percent: pod.storage_usage_percent,
                credits: None, // Credits are fetched separately via proxy for now, or we could integrate here
                latency_ms: latency.map(|l| l as i64),
                country: geo_data.as_ref().map(|g| g.country.clone()),
                city: geo_data.as_ref().map(|g| g.city.clone()),
                lat: geo_data.as_ref().map(|g| g.lat),
                lon: geo_data.as_ref().map(|g| g.lon),
            };

            if let Err(e) = db::upsert_node(&record).await {
                eprintln!("Failed to upsert node: {}", e);
            }

            // Save history
            if let Err(e) = db::save_node_history(&record.pubkey, record.latency_ms, record.status.as_deref()).await {
                eprintln!("Failed to save node history: {}", e);
            }
        }
    }
}

async fn get_history() -> impl IntoResponse {
    match db::get_history(1440).await {
        Ok(history) => {
            let mapped: Vec<_> = history.into_iter().map(|(ts, total, online, storage)| {
                serde_json::json!({
                    "timestamp": ts,
                    "total_nodes": total,
                    "online_nodes": online,
                    "total_storage": storage
                })
            }).collect();
            Json(mapped)
        },
        Err(e) => Json(vec![serde_json::json!({"error": e.to_string()})]),
    }
}

async fn get_pods() -> impl IntoResponse {
    match db::get_all_nodes().await {
        Ok(nodes) => {
            let dto = PodsResponseDto {
                total_count: nodes.len(),
                pods: nodes.into_iter().map(|n| {
                    let geo = if n.lat.is_some() {
                        Some(GeoData {
                            lat: n.lat.unwrap_or(0.0),
                            lon: n.lon.unwrap_or(0.0),
                            country: n.country.unwrap_or_default(),
                            city: n.city.unwrap_or_default(),
                        })
                    } else {
                        None
                    };

                    PodDto {
                        pubkey: Some(n.pubkey),
                        address: Some(n.ip),
                        uptime: None, // We might want to store uptime in DB too if needed for frontend
                        storage_used: n.storage_used,
                        storage_committed: n.storage_committed,
                        storage_usage_percent: n.storage_usage_percent,
                        version: n.version,
                        last_seen_timestamp: n.last_seen,
                        is_public: None, // Store in DB if needed
                        geo,
                        latency_ms: n.latency_ms,
                    }
                }).collect(),
            };
            Json(serde_json::to_value(dto).unwrap_or_else(|e| serde_json::json!({ "error": e.to_string() })))
        },
        Err(e) => Json(serde_json::json!({ "error": e.to_string() })),
    }
}

async fn get_node(Path(id): Path<String>) -> impl IntoResponse {
    // For now, just reuse get_pods logic or implement specific DB query
    // Since we have get_all_nodes, we can filter in memory or add a get_node_by_id in db.rs
    // For simplicity/speed, let's just fetch all and find one (not efficient but works for small scale)
    match db::get_all_nodes().await {
        Ok(nodes) => {
            if let Some(n) = nodes.into_iter().find(|n| n.pubkey == id || n.ip.contains(&id)) {
                 let geo = if n.lat.is_some() {
                        Some(GeoData {
                            lat: n.lat.unwrap_or(0.0),
                            lon: n.lon.unwrap_or(0.0),
                            country: n.country.unwrap_or_default(),
                            city: n.city.unwrap_or_default(),
                        })
                    } else {
                        None
                    };

                let dto = PodDto {
                    pubkey: Some(n.pubkey),
                    address: Some(n.ip),
                    uptime: None,
                    storage_used: n.storage_used,
                    storage_committed: n.storage_committed,
                    storage_usage_percent: n.storage_usage_percent,
                    version: n.version,
                    last_seen_timestamp: n.last_seen,
                    is_public: None,
                    geo,
                    latency_ms: n.latency_ms,
                };
                return Json(serde_json::to_value(dto).unwrap_or_else(|e| serde_json::json!({ "error": e.to_string() })));
            }
            Json(serde_json::json!({ "error": "Node not found" }))
        },
        Err(e) => Json(serde_json::json!({ "error": e.to_string() })),
    }
}

async fn get_credits() -> impl IntoResponse {
    let url = "https://podcredits.xandeum.network/api/pods-credits";
    match reqwest::get(url).await {
        Ok(resp) => {
            match resp.json::<serde_json::Value>().await {
                Ok(json) => Json(json),
                Err(e) => Json(serde_json::json!({ "error": e.to_string() })),
            }
        },
        Err(e) => Json(serde_json::json!({ "error": e.to_string() })),
    }
}

async fn get_node_history_handler(Path(id): Path<String>) -> impl IntoResponse {
    match db::get_node_history(&id, 100).await {
        Ok(history) => Json(serde_json::to_value(history).unwrap()),
        Err(e) => Json(serde_json::json!({ "error": e.to_string() })),
    }
}
