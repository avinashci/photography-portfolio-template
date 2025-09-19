# Accessibility Testing Guide

This document explains how to run accessibility tests for the photography portfolio application.

## Quick Start

```bash
# Run fast accessibility tests (Chrome only + basic Pa11y)
pnpm audit:a11y:quick

# Run comprehensive accessibility tests (all browsers + detailed Pa11y)
pnpm audit:a11y:full

# Clean up old test reports
pnpm reports:clean

# View test results
pnpm reports:open
```

## Available Test Commands

### Playwright (Cross-browser testing with axe-core)
```bash
# Full accessibility test suite (all browsers)
pnpm test:a11y

# Fast accessibility test (Chrome only)
pnpm test:a11y:fast
```

### Pa11y (WCAG 2.1 AA compliance)
```bash
# Optimized Pa11y tests with increased timeouts
pnpm test:a11y:pa11y

# Basic Pa11y tests (default config)
pnpm test:a11y:pa11y:basic
```

### Combined Audits
```bash
# Quick audit (recommended for development)
pnpm audit:a11y:quick

# Full audit (recommended for CI/CD)
pnpm audit:a11y:full

# Pa11y only
pnpm audit:accessibility
```

## Test Configurations

### Development Testing (Fast)
- **Configuration**: `playwright.a11y.config.cjs`
- **Browsers**: Chrome only
- **Timeout**: 45 seconds
- **Reports**: `reports/accessibility/`

### CI/CD Testing (Comprehensive)
- **Configuration**: `playwright.config.cjs`
- **Browsers**: Chrome, Firefox, Mobile Chrome
- **Timeout**: 30 seconds
- **Reports**: `reports/playwright/`

### Pa11y Testing (WCAG Compliance)
- **Configuration**: `.pa11yci.optimized.json`
- **Standard**: WCAG 2.1 AA
- **Timeout**: 30-60 seconds per page
- **Reports**: `reports/accessibility/`

## Report Structure

```
reports/
├── accessibility/           # Combined accessibility reports
│   ├── pa11y-results.json  # Pa11y WCAG results
│   ├── pa11y-results.csv   # Pa11y results in CSV format
│   ├── playwright-results.json  # Playwright results
│   └── test-summary.json   # Test run summary
├── playwright/             # Playwright-specific reports
│   ├── html/              # Interactive HTML reports
│   ├── results.json       # Raw test results
│   └── junit-results.xml  # JUnit format for CI/CD
└── pa11y/                 # Pa11y-specific reports
    └── results.json       # Detailed Pa11y results
```

## Common Issues & Solutions

### 1. Page Load Timeouts
**Problem**: Tests fail with "Timeout 20000ms exceeded"
**Solution**: Use optimized configuration with increased timeouts:
```bash
pnpm test:a11y:pa11y  # Uses increased timeouts
```

### 2. Image Loading Issues
**Problem**: Heavy images cause test instability
**Solution**: Tests automatically disable image optimization in test mode

### 3. Database Connection Issues
**Problem**: CMS queries fail during testing
**Solution**: Ensure development server is running:
```bash
pnpm dev  # In separate terminal
pnpm test:a11y:fast  # In another terminal
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run Accessibility Tests
  run: |
    npm run build
    npm run start &
    sleep 30
    npm run audit:a11y:full

- name: Upload Test Reports
  uses: actions/upload-artifact@v3
  with:
    name: accessibility-reports
    path: reports/accessibility/
```

### Pre-commit Hook
```bash
# Add to .husky/pre-commit
npm run audit:a11y:quick
```

## Best Practices

### 1. **Development Workflow**
- Run `pnpm audit:a11y:quick` during development
- Fix critical issues immediately
- Run full tests before PR creation

### 2. **Test Environment**
- Use production builds for final validation
- Test with real content, not dummy data
- Include mobile testing for responsive accessibility

### 3. **Performance Optimization**
- Clean up reports regularly: `pnpm reports:clean`
- Use fast tests during development
- Reserve comprehensive tests for CI/CD

## Accessibility Standards

### WCAG 2.1 AA Requirements
- **Color Contrast**: 4.5:1 minimum ratio
- **Keyboard Navigation**: All interactive elements accessible
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Images**: Descriptive alt text for non-decorative images
- **Forms**: Associated labels and error messages

### Testing Coverage
- ✅ Homepage (English & Tamil)
- ✅ About page
- ✅ Galleries list page
- ✅ Journal list page
- 📋 Gallery detail pages (TODO)
- 📋 Image detail pages (TODO)
- 📋 Journal article pages (TODO)

## Troubleshooting

### Clear Test Cache
```bash
pnpm reports:clean
rm -rf .pa11y-cache/
rm -rf playwright/.cache/
```

### Debug Test Failures
```bash
# Run with debug output
DEBUG=pa11y* pnpm test:a11y:pa11y

# Run single browser for faster debugging
pnpm test:a11y:fast
```

### Performance Issues
```bash
# Check server health
pnpm health

# Restart development server
pkill -f "next dev"
pnpm dev
```