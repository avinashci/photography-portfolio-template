# 🚀 Production Deployment Guide

Complete guide for deploying your photography portfolio to production with security, performance, and reliability.

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Node.js 20+ on production server
- [ ] Production MongoDB database (Atlas recommended)
- [ ] Domain name with SSL certificate
- [ ] All environment variables configured for production

### Code Preparation
```bash
# Run pre-deployment checks
pnpm deploy:check

# Test production build locally
pnpm build
pnpm start
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

#### Environment Variables
Configure in Vercel dashboard or CLI:
```bash
vercel env add MONGODB_URI
vercel env add PAYLOAD_SECRET
vercel env add NEXT_PUBLIC_SERVER_URL
vercel env add NEXT_PUBLIC_SITE_OWNER_NAME
# ... add all other environment variables
```

#### Deploy
```bash
# Deploy to production
vercel --prod

# Your site will be live at: https://your-project.vercel.app
```

#### Custom Domain
1. Add domain in Vercel dashboard
2. Update DNS settings with your domain registrar
3. SSL automatically handled by Vercel

### Option 2: Netlify

#### Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login
```

#### Build Settings
Create `netlify.toml`:
```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Deploy
```bash
# Deploy to production
netlify deploy --prod --dir=.next
```

### Option 3: Traditional Server (VPS/AWS/DigitalOcean)

#### Server Requirements
- Ubuntu 20.04+ or similar
- 2GB+ RAM
- Node.js 20+
- Nginx (reverse proxy)
- PM2 (process manager)

#### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2 pnpm

# Install Nginx
sudo apt install nginx
```

#### Application Deployment
```bash
# On your server
git clone <your-repository>
cd your-portfolio
pnpm install
pnpm build

# Start with PM2
pm2 start npm --name "portfolio" -- start
pm2 startup
pm2 save
```

#### Nginx Configuration
Create `/etc/nginx/sites-available/your-domain`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/your-domain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot

# Generate certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🔧 Production Environment Variables

### Required Variables
```bash
# Environment
NODE_ENV=production

# Site Configuration
NEXT_PUBLIC_SITE_OWNER_NAME="Your Name"
NEXT_PUBLIC_SITE_OWNER_EMAIL="contact@yoursite.com"
NEXT_PUBLIC_SITE_NAME="Your Photography Portfolio"
NEXT_PUBLIC_SERVER_URL="https://your-domain.com"

# Database (Production MongoDB)
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/portfolio-prod"
DATABASE_NAME="portfolio-prod"

# Security
PAYLOAD_SECRET="your-super-secure-32-character-secret-for-production"

# Optional Features
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

### Security Best Practices
```bash
# Generate secure secrets
openssl rand -base64 32  # For PAYLOAD_SECRET

# Different secrets per environment
# Development: one secret
# Production: completely different secret
```

## 🗄️ Production Database Setup

### MongoDB Atlas (Recommended)
1. **Create Production Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create new cluster (M0 free tier or paid)
   - Note: Use different cluster than development

2. **Configure Network Access**
   - Add your production server IP to whitelist
   - Or use 0.0.0.0/0 for all IPs (less secure)

3. **Database User**
   - Create production database user
   - Use strong password
   - Assign read/write permissions

4. **Connection String**
   ```bash
   MONGODB_URI="mongodb+srv://produser:strongpassword@cluster.mongodb.net/portfolio-prod"
   ```

### Database Migration
```bash
# Run migrations in production
pnpm db:migrate

# Seed initial data if needed
pnpm db:seed
```

## 🔍 Health Checks & Monitoring

### Health Check Endpoint
Your site includes a health check at `/api/health`:
```bash
# Test health check
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "environment": "production"
}
```

### Monitoring Setup
```bash
# Set up uptime monitoring with services like:
# - Pingdom
# - UptimeRobot
# - StatusCake

# Monitor the health endpoint every 5 minutes
```

## 🚀 Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
pnpm build:analyze

# Check for optimization opportunities
pnpm lighthouse
```

### CDN Setup (Optional)
- **Vercel**: CDN included automatically
- **Netlify**: CDN included automatically
- **Traditional Server**: Configure Cloudflare or AWS CloudFront

### Caching Strategy
- **Static Assets**: 1 year cache
- **Images**: 7 days cache with stale-while-revalidate
- **API Responses**: Custom cache headers
- **Database**: Connection pooling enabled

## 🔐 Security Configuration

### Security Headers
The application includes comprehensive security headers:
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- HSTS (when SSL enabled)
- Referrer Policy

### SSL/HTTPS
- **Vercel/Netlify**: SSL automatic
- **Traditional Server**: Use Let's Encrypt
- **Always enforce HTTPS in production**

### Database Security
- Use strong passwords
- Enable IP whitelisting
- Use connection string with SSL
- Regular security updates

## 📊 Post-Deployment Validation

### 1. Functionality Tests
```bash
# Test critical paths
✅ Homepage loads correctly
✅ Admin panel accessible at /admin
✅ Galleries and images display
✅ Contact forms work
✅ Multi-language switching (if enabled)
✅ Mobile responsiveness
```

### 2. Performance Tests
```bash
# Use Google PageSpeed Insights
# Target scores:
✅ Performance: 90+
✅ Accessibility: 95+
✅ Best Practices: 90+
✅ SEO: 95+
```

### 3. SEO Validation
```bash
# Test SEO elements
✅ Meta titles and descriptions
✅ OpenGraph images
✅ Structured data (JSON-LD)
✅ XML sitemap at /sitemap.xml
✅ Robots.txt at /robots.txt
```

## 🔄 Deployment Workflow

### Initial Deployment
```bash
1. Configure production environment
2. Set up production database
3. Deploy application code
4. Run database migrations
5. Configure domain and SSL
6. Test all functionality
7. Set up monitoring
```

### Updates & Maintenance
```bash
# Regular update process
git pull origin main
pnpm install
pnpm build
pm2 restart portfolio  # or redeploy on Vercel/Netlify
```

### Backup Strategy
```bash
# Database backups
mongodump --uri="production-mongodb-uri" --out=./backup/$(date +%Y%m%d)

# Automate with cron job
0 2 * * * /path/to/backup-script.sh
```

## 🆘 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

**Database Connection**
- Verify MongoDB URI format
- Check IP whitelist settings
- Test connection string separately

**SSL Issues**
- Verify DNS propagation
- Check certificate validity
- Review redirect rules

**Performance Issues**
- Check Core Web Vitals
- Optimize images
- Review bundle size

### Support Resources
```bash
# Application logs
pm2 logs portfolio

# System logs
sudo journalctl -u nginx
sudo tail -f /var/log/nginx/error.log

# Health check
curl https://your-domain.com/api/health
```

## ✅ Production Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Production database set up and connected
- [ ] SSL certificate installed and working
- [ ] Domain DNS configured correctly
- [ ] All functionality tested in production
- [ ] Performance scores above 90
- [ ] Security headers configured
- [ ] Monitoring and alerts set up

### Post-Launch
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (if enabled)
- [ ] Configure backup schedule
- [ ] Document update and maintenance procedures
- [ ] Train content managers on CMS usage

---

🎉 **Your photography portfolio is now live and production-ready!**

**Next Steps**: See `04-CUSTOMIZATION-GUIDE.md` to learn how to customize content and branding.