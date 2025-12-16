use axum::{
    extract::Path,
    routing::get,
    Json, Router,
};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use xandeum_prpc::{PrpcClient, find_pnode};
use serde::{Serialize, Deserialize};
use once_cell::sync::Lazy;
use dashmap::DashMap;

static GEO_CACHE: Lazy<DashMap<String, GeoData>> = Lazy::new(|| DashMap::new());

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/pods", get(get_pods))
        .route("/node/{id}", get(get_node))
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

#[derive(Serialize)]
struct PodsResponseDto {
    total_count: u32,
    pods: Vec<PodDto>,
}

#[derive(Serialize)]
struct PodDto {
    pubkey: Option<String>,
    address: Option<String>,
    uptime: Option<i64>,
    storage_used: Option<i64>,
    geo: Option<GeoData>,
}

async fn fetch_geo(ip: String) {
    if GEO_CACHE.contains_key(&ip) { return; }
    
    // Basic rate limit protection: wait a bit
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
                    GEO_CACHE.insert(ip, geo);
                }
            }
        }
        Err(_) => {}
    }
}

async fn get_pods() -> Json<serde_json::Value> {
    let client = PrpcClient::new("173.212.220.65", None);
    match client.get_pods_with_stats().await {
        Ok(pods) => {
            let dto = PodsResponseDto {
                total_count: pods.total_count,
                pods: pods.pods.into_iter().map(|p| {
                    let ip = p.address.clone().unwrap_or_default();
                    let ip_clean = ip.split(':').next().unwrap_or(&ip).to_string();
                    
                    let geo = if let Some(g) = GEO_CACHE.get(&ip_clean) {
                        Some(g.clone())
                    } else {
                        if !ip_clean.is_empty() && ip_clean != "127.0.0.1" {
                            tokio::spawn(async move {
                                fetch_geo(ip_clean).await;
                            });
                        }
                        None
                    };

                    PodDto {
                        pubkey: p.pubkey,
                        address: p.address,
                        uptime: p.uptime,
                        storage_used: p.storage_used,
                        geo,
                    }
                }).collect(),
            };
            Json(serde_json::to_value(dto).unwrap_or_else(|e| serde_json::json!({ "error": e.to_string() })))
        },
        Err(e) => Json(serde_json::json!({ "error": e.to_string() })),
    }
}

async fn get_node(Path(id): Path<String>) -> Json<serde_json::Value> {
    match find_pnode(&id, None).await {
        Ok(pod) => {
            let ip = pod.address.clone().unwrap_or_default();
            let ip_clean = ip.split(':').next().unwrap_or(&ip).to_string();
            let geo = GEO_CACHE.get(&ip_clean).map(|g| g.clone());

            let dto = PodDto {
                pubkey: pod.pubkey,
                address: pod.address,
                uptime: pod.uptime,
                storage_used: pod.storage_used,
                geo,
            };
            Json(serde_json::to_value(dto).unwrap_or_else(|e| serde_json::json!({ "error": e.to_string() })))
        },
        Err(e) => Json(serde_json::json!({ "error": e.to_string() })),
    }
}
