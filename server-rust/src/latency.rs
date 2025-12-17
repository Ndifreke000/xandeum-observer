use std::time::{Duration, Instant};
use tokio::net::TcpStream;

pub async fn measure_latency(ip: &str) -> Option<u64> {
    let start = Instant::now();
    // Try to connect with a 2 second timeout
    let timeout = Duration::from_secs(2);
    
    // Ensure IP has a port, if not add default 6000 (RPC port) or 9001 (Gossip port)
    // Usually we want to check the port that is actually open. 
    // The input IP usually comes with a port from the RPC response (e.g. "1.2.3.4:9001")
    // If it doesn't have a port, we might fail.
    
    match tokio::time::timeout(timeout, TcpStream::connect(ip)).await {
        Ok(Ok(_)) => {
            let duration = start.elapsed();
            Some(duration.as_millis() as u64)
        }
        _ => None,
    }
}
