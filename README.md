# Photography Portfolio Template 📷

A modern, production-ready photography portfolio template built with Next.js 15, Payload CMS 3.0, and TypeScript. **Perfect for photographers who want a professional website without starting from scratch.**

> **🎯 Template Ready!** This codebase is now configured as a reusable template. See [docs/00-DOCUMENTATION-INDEX.md](./docs/00-DOCUMENTATION-INDEX.md) for complete setup and customization guide.

## ✨ Features

- 🎨 **Modern Design**: Clean, responsive photography portfolio
- 🌐 **Internationalization**: Multi-language support (English included, easily extendable)
- 📱 **Mobile Optimized**: Perfect on all devices
- 🚀 **Performance**: Optimized images, lazy loading, caching
- 🛡️ **Security**: Enterprise-grade security headers and protection
- 📊 **CMS**: Full-featured content management with Payload CMS
- 🔍 **SEO**: Comprehensive SEO optimization
- 📈 **Analytics Ready**: Google Analytics integration
- 🎨 **Theming**: Customizable with tweakcn.com integration

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **CMS**: Payload CMS 3.0 with MongoDB
- **Styling**: Tailwind CSS 4.x with custom properties
- **Images**: Next.js Image Optimization (AVIF/WebP)
- **Database**: MongoDB with Mongoose
- **Deployment**: Vercel, Netlify, or any Node.js host
- **Monitoring**: Built-in health checks and logging

## 📋 Prerequisites

- **Node.js 20+** (18 is EOL) - Use [nvm](https://github.com/nvm-sh/nvm): `nvm use`
- **MongoDB** (local or Atlas)
- **pnpm** (recommended) or npm

## 🚀 Quick Start

### 1. Use This Template

```bash
# Clone the repository
git clone <repository>
cd photography-portfolio
nvm use  # Uses Node.js 20+ from .nvmrc
pnpm install
```

### 2. ⚠️ **REQUIRED**: Environment Setup

> **🚨 IMPORTANT**: You MUST create `.env.local` before starting the app, or it will fail to run.

```bash
# Copy template environment file
cp .env.template .env.local

# Edit with YOUR information (see TEMPLATE-SETUP.md for details)
nano .env.local

# Update these REQUIRED fields:
# NEXT_PUBLIC_SITE_OWNER_NAME="Your Full Name"
# NEXT_PUBLIC_SITE_OWNER_EMAIL="your@email.com"
# MONGODB_URI="mongodb://localhost:27017/your-portfolio-db"
# PAYLOAD_SECRET="your-secure-32-character-secret"
```

**⚡ Quick Tip**: Use `.env.example` for reference if you get stuck!

### 3. Start Your Portfolio

```bash
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

### 5. Deploy to Production

```bash
# Pre-deployment check
pnpm deploy:check

# Build for production
pnpm build
```

See [docs/02-PRODUCTION-DEPLOYMENT.md](./docs/02-PRODUCTION-DEPLOYMENT.md) for detailed deployment instructions.

## 📝 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run dev:turbo` - Start with Turbo mode (faster HMR)
- `npm run build` - Production build
- `npm run start` - Start production server

### Quality & Testing
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run lint:strict` - Strict linting (no warnings)
- `npm run type-check` - TypeScript validation

### Production & Deployment
- `npm run build:check` - Pre-build validation
- `npm run deploy:check` - Deployment readiness check
- `npm run start:prod` - Start in production mode
- `npm run health` - Check application health

### Security & Maintenance
- `npm run security:audit` - Security vulnerability scan
- `npm run security:audit:fix` - Fix security issues
- `npm run clean` - Clean build cache

### CMS & Database
- `npm run generate:types` - Generate Payload types
- `npm run db:migrate` - Run database migrations
- `npm run payload` - Payload CMS commands

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── [locale]/       # Internationalized routes
│   ├── api/            # API routes
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── frontend/       # Public-facing components
│   └── providers/      # Context providers
├── config/             # Payload CMS configuration
│   ├── collections/    # CMS collections
│   └── globals/        # Global settings
├── lib/                # Utilities and helpers
│   ├── api/           # API clients
│   ├── utils/         # Utility functions
│   └── i18n/          # Internationalization
└── middleware.ts       # Next.js middleware
```

## 🌐 Internationalization

Built-in internationalization system:
- English (en) - Default language included
- Easily extendable to additional languages
- Route-based localization (`/en/`, `/[locale]/`)
- Add new languages by creating translation files in `src/lib/i18n/messages/`
- Configure additional locales in environment variables

## 🛡️ Security Features

- **Security Headers**: CSP, HSTS, XSS protection
- **Request Filtering**: Blocks malicious requests
- **Rate Limiting**: API endpoint protection  
- **Input Validation**: Comprehensive data validation
- **Error Boundaries**: Graceful error handling
- **Environment Validation**: Secure configuration checks

## 📊 Monitoring

### Health Check
- Endpoint: `GET /api/health`
- Monitors: App status, database, system metrics
- Use for load balancer health checks

### Logging
- Structured JSON logs in production
- Multiple log levels (error, warn, info, debug)
- Request/response logging
- Database operation logging

## 🎨 Theming & Customization

### Custom Themes
Create your own color scheme using [tweakcn.com](https://tweakcn.com):

1. **Generate Theme**: Visit [tweakcn.com](https://tweakcn.com) to create your color palette
2. **Copy CSS Variables**: Copy the generated CSS custom properties
3. **Update Global Styles**: Paste into `src/app/globals.css`
4. **Customize Components**: Modify component styles as needed

### Theme System
- Built with CSS custom properties for easy theming
- Dark/light mode support with `next-themes`
- Tailwind CSS 4.x for consistent design system
- Professional photography-focused color schemes included

### Example Theme Update
```css
/* In src/app/globals.css */
:root {
  --background: your-custom-value;
  --foreground: your-custom-value;
  /* Add your tweakcn.com generated variables */
}
```

## 📁 Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `PAYLOAD_SECRET` - CMS secret key (32+ characters)
- `NEXT_PUBLIC_SERVER_URL` - Public server URL

### Optional
- `SMTP_HOST` - Email server
- `SENTRY_DSN` - Error tracking
- `GOOGLE_ANALYTICS_ID` - Analytics tracking

See `.env.example` for complete list.

## 🚀 Performance

The application is optimized for:
- **Core Web Vitals**: Google's performance metrics
- **Image Optimization**: Next.js automatic optimization
- **Caching**: Multiple caching layers
- **Bundle Size**: Code splitting and tree shaking
- **SEO**: Technical SEO best practices

## 📖 Documentation

**📚 Complete Documentation Guide**: [`docs/00-DOCUMENTATION-INDEX.md`](./docs/00-DOCUMENTATION-INDEX.md)

### Essential Docs
- [`docs/01-GETTING-STARTED.md`](./docs/01-GETTING-STARTED.md) - Local setup and configuration
- [`docs/02-PRODUCTION-DEPLOYMENT.md`](./docs/02-PRODUCTION-DEPLOYMENT.md) - Production deployment guide
- [`docs/03-TECHNICAL-ARCHITECTURE.md`](./docs/03-TECHNICAL-ARCHITECTURE.md) - Understanding the codebase
- [`docs/04-CUSTOMIZATION-GUIDE.md`](./docs/04-CUSTOMIZATION-GUIDE.md) - Customize for your brand

### Reference Docs
- [`SECURITY.md`](./docs/SECURITY.md) - Security best practices
- [`docker-compose.yml`](./docker-compose.yml) - Container orchestration

## 🎨 Template Customization

This template is designed to be easily customizable:

### Quick Personalization
- **5-minute setup**: Just update your `.env.local` file
- **No code changes needed**: All personal info comes from environment variables
- **Multi-language ready**: Enable/disable languages via configuration
- **Flexible content**: Show/hide sections based on your needs

### For Advanced Users
- **Design system**: Built with Tailwind CSS for easy styling
- **Component architecture**: Well-organized, reusable components
- **Type-safe**: Full TypeScript support with generated types
- **SEO optimized**: Built-in SEO best practices

See [docs/04-CUSTOMIZATION-GUIDE.md](./docs/04-CUSTOMIZATION-GUIDE.md) for detailed customization guide.

## 🤝 Contributing

1. Check Node.js version: `node --version` (should be 20+)
2. Run pre-commit checks: `pnpm lint && pnpm type-check`
3. Test build: `pnpm build`
4. Follow TypeScript strict mode guidelines

## 📄 License

MIT License - Feel free to use this template for your photography portfolio!

---

## 🎯 Quick Commands

```bash
# Check if ready for production
npm run deploy:check

# Full development setup
nvm use && npm install && cp .env.example .env && npm run dev

# Production build and start
npm run build:check && npm run start:prod
```

**Ready to deploy?** See [`docs/02-PRODUCTION-DEPLOYMENT.md`](./docs/02-PRODUCTION-DEPLOYMENT.md) for detailed instructions!