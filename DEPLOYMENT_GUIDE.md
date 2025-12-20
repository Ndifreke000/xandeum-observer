# 🚀 Production Deployment Guide

## Overview

This guide covers deploying the Xandeum Observer to production with 100% real data integration.

---

## 📋 **Pre-Deployment Checklist**

### ✅ **Required**
- [x] Backend (Rust) running and accessible
- [x] Frontend builds successfully
- [x] Environment variables configured
- [x] Real RPC data flowing
- [ ] SSL certificates ready (for HTTPS)
- [ ] Domain name configured
- [ ] Monitoring tools ready

### ⚠️ **Recommended**
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Plausible/Umami)
- [ ] Backup strategy in place
- [ ] Load testing completed

---

## 🐳 **Docker Deployment (Recommended)**

### 1. Configure Environment

Create `.env.production`:
```bash
# Backend API
VITE_API_URL=https://api.yourdomain.com

# Optional: Telegram Alerts
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_TELEGRAM_CHAT_ID=your_chat_id
```

### 2. Build and Deploy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Verify Deployment

```bash
# Test backend
curl http://localhost:3002/pods

# Test frontend
curl http://localhost:8080

# Check real data
curl http://localhost:3002/history
```

---

## 🌐 **Manual Deployment**

### Backend (Rust)

```bash
cd server-rust

# Build release
cargo build --release

# Run with environment variables
PORT=3002 DATABASE_URL=sqlite:xandeum.db ./target/release/server-rust

# Or use systemd service (see below)
```

### Frontend (React)

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Serve with nginx or similar
# Files are in dist/
```

---

## 🔧 **Nginx Configuration**

### Frontend (Port 80/443)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    root /var/www/xandeum-observer/dist;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Backend API (Port 3002)

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type";
    }
}
```

---

## 🔄 **Systemd Service (Linux)**

### Backend Service

Create `/etc/systemd/system/xandeum-backend.service`:

```ini
[Unit]
Description=Xandeum Observer Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/xandeum-observer/server-rust
Environment="PORT=3002"
Environment="DATABASE_URL=sqlite:xandeum.db"
ExecStart=/opt/xandeum-observer/server-rust/target/release/server-rust
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable xandeum-backend
sudo systemctl start xandeum-backend
sudo systemctl status xandeum-backend
```

---

## ☁️ **Cloud Deployment Options**

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Render (Full Stack)

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: xandeum-backend
    env: rust
    buildCommand: cd server-rust && cargo build --release
    startCommand: cd server-rust && ./target/release/server-rust
    envVars:
      - key: PORT
        value: 3002
      - key: DATABASE_URL
        value: sqlite:xandeum.db
  
  - type: web
    name: xandeum-frontend
    env: node
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        value: https://xandeum-backend.onrender.com
```

2. Connect GitHub repo to Render
3. Deploy automatically on push

### DigitalOcean App Platform

1. Create app from GitHub
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add backend as separate service
4. Configure environment variables

---

## 📊 **Monitoring Setup**

### 1. Error Tracking (Sentry)

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### 2. Analytics (Plausible)

Add to `index.html`:
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### 3. Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

Configure alerts for:
- Frontend down
- Backend API down
- High response times
- Error rates

---

## 🔒 **Security Hardening**

### 1. Environment Variables

Never commit:
- API keys
- Database credentials
- Bot tokens

Use:
- `.env.production` (gitignored)
- Cloud provider secrets
- Environment variable management

### 2. HTTPS Only

```nginx
# Force HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 3. Security Headers

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

### 4. Rate Limiting

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
    limit_req zone=api burst=20 nodelay;
    # ... rest of config
}
```

---

## 🔄 **CI/CD Pipeline**

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to server
        uses: easingthemes/ssh-deploy@main
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: /var/www/xandeum-observer
```

---

## 📈 **Performance Optimization**

### 1. CDN Configuration

Use Cloudflare or similar:
- Cache static assets
- DDoS protection
- Global distribution
- SSL/TLS

### 2. Database Optimization

```bash
# SQLite optimization
sqlite3 xandeum.db "VACUUM;"
sqlite3 xandeum.db "ANALYZE;"
```

### 3. Backend Optimization

```rust
// Increase connection pool
// Add caching layer
// Optimize database queries
```

---

## 🔍 **Health Checks**

### Frontend Health Check

```bash
curl -f https://yourdomain.com || exit 1
```

### Backend Health Check

```bash
curl -f https://api.yourdomain.com/pods || exit 1
```

### Database Health Check

```bash
sqlite3 xandeum.db "SELECT COUNT(*) FROM nodes;" || exit 1
```

---

## 🆘 **Troubleshooting**

### Frontend Issues

```bash
# Check build
npm run build

# Check for errors
npm run lint

# Test locally
npm run preview
```

### Backend Issues

```bash
# Check logs
docker-compose logs backend

# Check database
sqlite3 xandeum.db ".tables"

# Test RPC connection
curl http://localhost:3002/pods
```

### Network Issues

```bash
# Check DNS
nslookup yourdomain.com

# Check SSL
openssl s_client -connect yourdomain.com:443

# Check ports
netstat -tulpn | grep -E '(3002|8080)'
```

---

## 📝 **Post-Deployment**

### 1. Verify Real Data

- [ ] Check nodes are loading
- [ ] Verify historical data
- [ ] Test SLA verification
- [ ] Test alert system
- [ ] Check AI optimization

### 2. Monitor Performance

- [ ] Check response times
- [ ] Monitor error rates
- [ ] Watch memory usage
- [ ] Track API calls

### 3. User Testing

- [ ] Test all features
- [ ] Check mobile responsiveness
- [ ] Verify data accuracy
- [ ] Test alert notifications

---

## 🎉 **Success Criteria**

Your deployment is successful when:

- ✅ Frontend loads without errors
- ✅ Real node data displays correctly
- ✅ 3D globe shows node locations
- ✅ Historical charts populate
- ✅ Node inspector works
- ✅ Alerts trigger correctly
- ✅ No console errors
- ✅ Performance is acceptable (<3s load)
- ✅ Mobile works properly
- ✅ SSL certificate valid

---

## 📞 **Support**

For deployment issues:
1. Check logs first
2. Review this guide
3. Check GitHub issues
4. Contact support

---

**Last Updated**: December 20, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
