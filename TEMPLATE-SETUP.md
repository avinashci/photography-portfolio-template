# 🎨 Photography Portfolio Template Setup Guide

Welcome! This guide will help you customize this photography portfolio template for your own use.

> **⚠️ CRITICAL**: The app will NOT start without proper `.env.local` configuration. Follow this guide carefully!

## 🚀 Quick Setup (5 minutes)

### 1. ⚠️ **REQUIRED**: Environment Configuration

**This step is mandatory - the application will fail to start without it!**

```bash
# Copy the template environment file
cp .env.template .env.local

# Edit with your information
nano .env.local  # or your preferred editor
```

> **💡 Pro Tip**: Both `.env.template` and `.env.example` contain all the variables you need. Use them as reference!

### 2. Update Required Variables
Edit `.env.local` and update these **REQUIRED** fields:

```bash
# Personal Information (Replace with your details)
NEXT_PUBLIC_SITE_OWNER_NAME="Your Full Name"
NEXT_PUBLIC_SITE_OWNER_EMAIL="contact@yoursite.com"
NEXT_PUBLIC_SITE_OWNER_LOCATION="Your City, Country"

# Site Configuration
NEXT_PUBLIC_SITE_NAME="Your Photography Portfolio"
NEXT_PUBLIC_SERVER_URL="https://yoursite.com"

# Database (Generate new database name)
MONGODB_URI="mongodb://localhost:27017/your-portfolio-db"

# Security (Generate a secure 32+ character secret)
PAYLOAD_SECRET="your-very-secure-32-character-secret-here"
```

### 3. Start Your Portfolio

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Visit http://localhost:3000
# Your personalized portfolio is ready! 🎉
```

### 4. Add Your Content

1. Go to `/admin` to access the CMS
2. Create your first user account
3. Upload your photos and create galleries
4. Customize your About page
5. Start blogging (optional)

## 🔧 Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Production build
- `pnpm start` - Start production server
- `pnpm type-check` - TypeScript validation
- `pnpm lint` - Code linting

## 📚 Documentation

- `README.md` - Main documentation with features and setup
- `.env.template` - Complete environment variables reference
- `.env.example` - Quick start environment example

## 🚀 Deployment

For production deployment, make sure to:

1. Set all environment variables in your hosting platform
2. Use a production MongoDB database (MongoDB Atlas recommended)
3. Generate a secure `PAYLOAD_SECRET`
4. Update `NEXT_PUBLIC_SERVER_URL` to your domain

## 🎯 Template Features

- 🎨 Modern, responsive design
- 📱 Mobile-optimized
- 🛡️ Security headers and protection
- 📊 Full CMS with Payload
- 🔍 SEO optimized
- 📈 Analytics ready
- 🌐 Internationalization ready

Built with Next.js 15, TypeScript, Payload CMS 3.0, and Tailwind CSS.

---

**Need help?** Check the README.md for more detailed information.