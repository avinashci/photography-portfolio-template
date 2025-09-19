module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      startServerReadyPattern: 'ready on',
      url: [
        'http://localhost:3000/en',
        'http://localhost:3000/en/about',
        'http://localhost:3000/en/galleries',
        'http://localhost:3000/en/journal'
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Performance thresholds
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        
        // Accessibility specifics
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'document-title': 'error',
        
        // Best practices
        'uses-https': 'error',
        'no-vulnerable-libraries': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}