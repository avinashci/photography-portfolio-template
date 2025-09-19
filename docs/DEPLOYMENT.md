# Production Deployment Guide

This guide covers deploying the Photography Portfolio to production with industry-standard security, performance, and reliability configurations.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (18 is EOL)
- MongoDB (Atlas recommended for production)
- Domain name with SSL certificate
- Environment variables configured

### Production Deployment Steps

1. **Environment Setup**
   ```bash
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Pre-deployment Checks**
   ```bash
   npm run deploy:check
   ```

3. **Build and Deploy**
   ```bash
   npm run deploy:build
   npm run start:prod
   ```

## 📋 Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | Database connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `PAYLOAD_SECRET` | CMS secret key (32+ chars) | `your-super-secure-secret-key` |
| `NEXT_PUBLIC_SERVER_URL` | Public server URL | `https://your-domain.com` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Email server host | - |
| `SMTP_PORT` | Email server port | `587` |
| `SENTRY_DSN` | Error monitoring DSN | - |
| `GOOGLE_ANALYTICS_ID` | GA4 tracking ID | - |

## 🛡️ Security Configuration

### SSL Certificate Setup
1. Obtain SSL certificate from Let's Encrypt or your provider
2. Configure Nginx with SSL (see `nginx/nginx.conf`)
3. Update environment variables to use HTTPS URLs

### Security Headers
The application includes comprehensive security headers:
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- HSTS (when SSL enabled)
- Referrer Policy

### Database Security
- Use MongoDB Atlas with authentication
- Enable IP whitelisting
- Use connection string with SSL
- Regular security updates

## 🚢 Deployment Options

### 1. Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual container
docker build -t photography-portfolio .
docker run -p 3000:3000 --env-file .env photography-portfolio
```

### 2. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Configure environment variables in Vercel dashboard
vercel env add MONGODB_URI
vercel env add PAYLOAD_SECRET
vercel env add NEXT_PUBLIC_SERVER_URL

# Deploy
vercel --prod
```

### 3. Traditional Server Deployment

```bash
# On your server
git clone <repository>
cd photography-portfolio
npm install
npm run build
npm run start:prod
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint
- URL: `GET /api/health`
- Returns application status, database connectivity, and system metrics
- Use for load balancer health checks

### Monitoring Setup
1. **Application Monitoring**
   - Configure Sentry for error tracking
   - Set up New Relic or similar APM tool

2. **Infrastructure Monitoring**
   - Monitor CPU, memory, disk usage
   - Set up alerts for high resource usage
   - Monitor database performance

3. **Uptime Monitoring**
   - Use services like Pingdom, UptimeRobot
   - Monitor `/api/health` endpoint
   - Set up SMS/email alerts

## 🔧 Performance Optimization

### Build Optimizations
- Bundle analysis: `npm run build:analyze`
- Image optimization with Next.js
- Code splitting and lazy loading
- Compression enabled

### Caching Strategy
1. **Static Assets**: 1 year cache (immutable)
2. **Images**: 7 days cache with stale-while-revalidate
3. **API Responses**: Custom cache headers
4. **Database**: Connection pooling enabled

### CDN Setup (Optional)
- Configure Cloudflare or AWS CloudFront
- Cache static assets globally
- Enable Brotli compression

## 🗄️ Database Management

### Backup Strategy
```bash
# MongoDB backup
mongodump --uri="your-mongodb-uri" --out=./backup/$(date +%Y%m%d)

# Automated backup script
npm run db:backup
```

### Migrations
```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

## 🔍 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and rebuild
npm run clean
npm run build:check
```

**Database Connection Issues**
- Check MongoDB URI format
- Verify IP whitelist settings
- Test connection with MongoDB client

**Memory Issues**
- Increase Node.js heap size: `--max-old-space-size=4096`
- Monitor memory usage with health endpoint
- Consider horizontal scaling

### Log Analysis
```bash
# View application logs
docker-compose logs -f app

# Check specific service logs
docker-compose logs nginx
docker-compose logs mongodb
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Session storage (Redis recommended)
- Database read replicas
- CDN for static assets

### Performance Monitoring
- Set up application metrics
- Database query optimization
- Image optimization and lazy loading
- Bundle size monitoring

## 🛠️ Maintenance

### Regular Tasks
1. **Weekly**
   - Security audit: `npm run security:audit`
   - Update dependencies
   - Monitor error rates

2. **Monthly**
   - Database cleanup
   - Log rotation
   - Performance review
   - Security patches

### Update Process
```bash
# Test updates locally
npm update
npm run test
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:prod
```

## 📞 Support

For deployment issues or questions:
1. Check logs: `docker-compose logs`
2. Run health check: `curl http://localhost:3000/api/health`
3. Review error monitoring dashboard
4. Contact system administrator

---

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database backups automated
- [ ] Monitoring and alerts set up
- [ ] Security headers configured
- [ ] Performance optimizations applied
- [ ] Health checks working
- [ ] Domain DNS configured
- [ ] CDN set up (if using)
- [ ] Error tracking configured