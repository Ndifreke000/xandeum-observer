use sqlx::{sqlite::SqlitePool, Row};
use tokio::sync::OnceCell;

static DB_POOL: OnceCell<SqlitePool> = OnceCell::const_new();

pub async fn init_db() -> Result<(), sqlx::Error> {
    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:xandeum.db".to_string());
    
    // Create database file if it doesn't exist
    if !std::path::Path::new("xandeum.db").exists() {
        std::fs::File::create("xandeum.db").expect("Failed to create database file");
    }

    let pool = SqlitePool::connect(&database_url).await?;
    
    // Create tables
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS nodes (
            pubkey TEXT PRIMARY KEY,
            ip TEXT NOT NULL,
            version TEXT,
            status TEXT,
            last_seen INTEGER,
            storage_used INTEGER,
            storage_committed INTEGER,
            storage_usage_percent REAL,
            credits INTEGER,
            latency_ms INTEGER,
            country TEXT,
            city TEXT,
            lat REAL,
            lon REAL
        );
        "#
    ).execute(&pool).await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER NOT NULL,
            total_nodes INTEGER,
            online_nodes INTEGER,
            total_storage INTEGER
        );
        "#
    ).execute(&pool).await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS node_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pubkey TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            latency_ms INTEGER,
            status TEXT,
            FOREIGN KEY(pubkey) REFERENCES nodes(pubkey)
        );
        CREATE INDEX IF NOT EXISTS idx_node_history_pubkey_timestamp ON node_history(pubkey, timestamp);
        "#
    ).execute(&pool).await?;

    DB_POOL.set(pool).expect("Failed to set DB pool");
    Ok(())
}

pub fn get_pool() -> &'static SqlitePool {
    DB_POOL.get().expect("DB not initialized")
}

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct NodeRecord {
    pub pubkey: String,
    pub ip: String,
    pub version: Option<String>,
    pub status: Option<String>,
    pub last_seen: Option<i64>,
    pub storage_used: Option<i64>,
    pub storage_committed: Option<i64>,
    pub storage_usage_percent: Option<f64>,
    pub credits: Option<i64>,
    pub latency_ms: Option<i64>,
    pub country: Option<String>,
    pub city: Option<String>,
    pub lat: Option<f64>,
    pub lon: Option<f64>,
}

#[derive(Debug, Clone, sqlx::FromRow, serde::Serialize)]
pub struct NodeHistoryRecord {
    pub timestamp: i64,
    pub latency_ms: Option<i64>,
    pub status: Option<String>,
}

pub async fn upsert_node(node: &NodeRecord) -> Result<(), sqlx::Error> {
    let pool = get_pool();
    sqlx::query(
        r#"
        INSERT INTO nodes (pubkey, ip, version, status, last_seen, storage_used, storage_committed, storage_usage_percent, credits, latency_ms, country, city, lat, lon)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(pubkey) DO UPDATE SET
            ip = excluded.ip,
            version = excluded.version,
            status = excluded.status,
            last_seen = excluded.last_seen,
            storage_used = excluded.storage_used,
            storage_committed = excluded.storage_committed,
            storage_usage_percent = excluded.storage_usage_percent,
            credits = excluded.credits,
            latency_ms = excluded.latency_ms,
            country = excluded.country,
            city = excluded.city,
            lat = excluded.lat,
            lon = excluded.lon
        "#
    )
    .bind(&node.pubkey)
    .bind(&node.ip)
    .bind(&node.version)
    .bind(&node.status)
    .bind(node.last_seen)
    .bind(node.storage_used)
    .bind(node.storage_committed)
    .bind(node.storage_usage_percent)
    .bind(node.credits)
    .bind(node.latency_ms)
    .bind(&node.country)
    .bind(&node.city)
    .bind(node.lat)
    .bind(node.lon)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_all_nodes() -> Result<Vec<NodeRecord>, sqlx::Error> {
    let pool = get_pool();
    sqlx::query_as::<_, NodeRecord>("SELECT * FROM nodes")
        .fetch_all(pool)
        .await
}

pub async fn save_snapshot(total_nodes: u32, online_nodes: u32, total_storage: u64) -> Result<(), sqlx::Error> {
    let pool = get_pool();
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    sqlx::query(
        "INSERT INTO metrics (timestamp, total_nodes, online_nodes, total_storage) VALUES (?, ?, ?, ?)"
    )
    .bind(timestamp)
    .bind(total_nodes)
    .bind(online_nodes)
    .bind(total_storage as i64)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn save_node_history(pubkey: &str, latency_ms: Option<i64>, status: Option<&str>) -> Result<(), sqlx::Error> {
    let pool = get_pool();
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    sqlx::query(
        "INSERT INTO node_history (pubkey, timestamp, latency_ms, status) VALUES (?, ?, ?, ?)"
    )
    .bind(pubkey)
    .bind(timestamp)
    .bind(latency_ms)
    .bind(status)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn get_history(limit: i64) -> Result<Vec<(i64, i64, i64, i64)>, sqlx::Error> {
    let pool = get_pool();
    let rows = sqlx::query("SELECT timestamp, total_nodes, online_nodes, total_storage FROM metrics ORDER BY timestamp DESC LIMIT ?")
        .bind(limit)
        .fetch_all(pool)
        .await?;

    Ok(rows.into_iter().map(|r| (
        r.get(0), r.get(1), r.get(2), r.get(3)
    )).collect())
}

pub async fn get_node_history(pubkey: &str, limit: i64) -> Result<Vec<NodeHistoryRecord>, sqlx::Error> {
    let pool = get_pool();
    sqlx::query_as::<_, NodeHistoryRecord>(
        "SELECT timestamp, latency_ms, status FROM node_history WHERE pubkey = ? ORDER BY timestamp DESC LIMIT ?"
    )
    .bind(pubkey)
    .bind(limit)
    .fetch_all(pool)
    .await
}
