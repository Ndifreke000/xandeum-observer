# Build Stage
FROM rust:1.83-slim-bookworm as builder

WORKDIR /usr/src/app
COPY . .

# Install build dependencies (OpenSSL)
RUN apt-get update && apt-get install -y pkg-config libssl-dev

RUN cargo build --release

# Runtime Stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies (OpenSSL, CA Certificates)
RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy the binary from the builder stage
COPY --from=builder /usr/src/app/target/release/server-rust .

# Expose the port
EXPOSE 3001

# Run the binary
CMD ["./server-rust"]
