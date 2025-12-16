use axum::{
    extract::Path,
    routing::get,
    Json, Router,
};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use xandeum_prpc::{PrpcClient, find_pnode};
use serde::Serialize;

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
}

async fn get_pods() -> Json<serde_json::Value> {
    let client = PrpcClient::new("173.212.220.65", None);
    match client.get_pods_with_stats().await {
        Ok(pods) => {
            let dto = PodsResponseDto {
                total_count: pods.total_count,
                pods: pods.pods.into_iter().map(|p| PodDto {
                    pubkey: p.pubkey,
                    address: p.address,
                    uptime: p.uptime,
                    storage_used: p.storage_used,
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
            let dto = PodDto {
                pubkey: pod.pubkey,
                address: pod.address,
                uptime: pod.uptime,
                storage_used: pod.storage_used,
            };
            Json(serde_json::to_value(dto).unwrap_or_else(|e| serde_json::json!({ "error": e.to_string() })))
        },
        Err(e) => Json(serde_json::json!({ "error": e.to_string() })),
    }
}
