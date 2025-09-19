# 🚀 Getting Started - Photography Portfolio

This guide will help you set up the photography portfolio template locally and understand the codebase.

## 📋 Prerequisites

- **Node.js**: 20+ (18 is EOL) - Check with `node --version`
- **Package Manager**: pnpm (NOT npm or yarn) - Install with `npm install -g pnpm`
- **Database**: MongoDB (Local or Atlas)
- **Git**: For version control

## ⚡ Quick Local Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd avinashci

# Install dependencies
pnpm install
```

### 2. ⚠️ **CRITICAL**: Environment Configuration

> **🚨 REQUIRED**: The app will fail to start without `.env.local`. This step is mandatory!

```bash
# Copy environment template (use .env.template for full setup)
cp .env.template .env.local

# Edit with your settings
nano .env.local  # or your preferred editor
```

### 3. Required Environment Variables
Update `.env.local` with these **REQUIRED** fields:

```bash
# Personal Information (Replace with your details)
NEXT_PUBLIC_SITE_OWNER_NAME="Your Full Name"
NEXT_PUBLIC_SITE_OWNER_EMAIL="contact@yoursite.com"
NEXT_PUBLIC_SITE_OWNER_LOCATION="Your City, Country"

# Site Configuration
NEXT_PUBLIC_SITE_NAME="Your Photography Portfolio"
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"

# Database
MONGODB_URI="mongodb://localhost:27017/your-portfolio-db"
DATABASE_NAME="your-portfolio-db"

# Security (Generate a secure 32+ character string)
PAYLOAD_SECRET="your-super-secret-key-32-characters-minimum"
```

### 4. Start Development
```bash
# Start development server
pnpm dev

# The site will be available at:
# Frontend: http://localhost:3000
# Admin Panel: http://localhost:3000/admin
```

## 🗄️ Database Setup

### Option A: Local MongoDB
```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: apt install mongodb

# Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Ubuntu

# Use this in .env.local:
MONGODB_URI="mongodb://localhost:27017/your-portfolio-db"
```

### Option B: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Get connection string and add to `.env.local`:
```bash
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/your-portfolio-db"
```

## 🎯 First Time Setup

### 1. Create Admin User
1. Visit `http://localhost:3000/admin`
2. Create your first admin account
3. Log in to the admin panel

### 2. Configure Site Settings
1. Go to **Globals** → **Settings**
2. Update site information
3. Upload logo and favicon

### 3. Add Initial Content
1. **About Page**: Add your biography and photos
2. **Galleries**: Create your first photo gallery
3. **Images**: Upload and organize your photos

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes (en/ta)
│   ├── (payload)/         # Payload admin routes
│   └── api/               # API routes
├── components/
│   ├── admin/             # Payload admin components
│   ├── frontend/          # Public-facing components
│   ├── providers/         # React context providers
│   └── ui/                # Reusable UI components
├── config/                # Payload CMS configuration
│   ├── collections/       # CMS collections (Users, Images, Galleries, BlogPosts)
│   ├── globals/           # Global settings (Home, About, Settings)
│   └── fields/            # Reusable field configurations
├── lib/
│   ├── api/               # API clients
│   ├── i18n/              # Internationalization
│   └── utils/             # Utility functions
└── middleware.ts          # Next.js middleware for i18n routing
```

## 🔧 Development Commands

### Core Development
```bash
pnpm dev                 # Start development server
pnpm dev:turbo          # Start with Turbo mode (faster HMR)
pnpm build              # Production build
pnpm start              # Start production server
pnpm build:check        # Pre-build validation
```

### Code Quality
```bash
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix linting issues automatically
pnpm type-check         # TypeScript validation
```

### Payload CMS
```bash
pnpm generate:types     # Generate TypeScript types from Payload schema
pnpm payload            # Access Payload CLI commands
```

## 🌍 Language Configuration

### English Only (Default)
```bash
NEXT_PUBLIC_ENABLE_SECONDARY_LOCALE="false"
```

### English + Another Language
```bash
NEXT_PUBLIC_ENABLE_SECONDARY_LOCALE="true"
NEXT_PUBLIC_SECONDARY_LOCALE="es"           # Language code
NEXT_PUBLIC_SECONDARY_LOCALE_NAME="Español"  # Display name
NEXT_PUBLIC_SECONDARY_LOCALE_FLAG="🇪🇸"      # Flag emoji
```

## 🚨 Common Issues & Solutions

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
pnpm install
pnpm build:check
```

### Database Connection Issues
- Check MongoDB URI format
- Verify database is running
- Check firewall/network settings

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
pnpm dev --port 3001
```

### TypeScript Errors
```bash
# Regenerate types after CMS changes
pnpm generate:types
```

## 📱 Testing Your Setup

### 1. Frontend Test
- Visit `http://localhost:3000`
- Should see homepage with your site name
- Check responsive design on mobile

### 2. Admin Panel Test
- Visit `http://localhost:3000/admin`
- Log in with your admin account
- Create a test gallery with images

### 3. API Test
- Visit `http://localhost:3000/api/health`
- Should return JSON with system status

## ✅ Setup Checklist

- [ ] Node.js 20+ installed
- [ ] pnpm installed globally
- [ ] Repository cloned and dependencies installed
- [ ] `.env.local` configured with your information
- [ ] Database connection working
- [ ] Development server running on port 3000
- [ ] Admin panel accessible and admin user created
- [ ] Site settings configured with your information
- [ ] First gallery and images uploaded
- [ ] Health check endpoint returns success

## 🆘 Getting Help

### Development
- Check browser console for errors
- Review terminal output for build errors
- Verify environment variables are correct

### Database
- Test MongoDB connection separately
- Check database permissions and whitelist

### Next Steps
Once local setup is working, see:
- `02-PRODUCTION-DEPLOYMENT.md` for production setup
- `03-TECHNICAL-ARCHITECTURE.md` for understanding the codebase
- `04-CUSTOMIZATION-GUIDE.md` for making it your own

---

🎉 **Ready to customize your photography portfolio!**