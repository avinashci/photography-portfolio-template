/**
 * Global setup for accessibility tests
 * Prepares the environment for fast, reliable testing
 */

const fs = require('fs')
const path = require('path')

async function globalSetup() {
  console.log('🔧 Setting up accessibility testing environment...')

  // Ensure reports directories exist
  const reportDirs = [
    'reports/accessibility',
    'reports/playwright',
    'reports/pa11y',
    'reports/lighthouse'
  ]

  for (const dir of reportDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`   Created directory: ${dir}`)
    }
  }

  // Clean up old test artifacts
  const cleanupPatterns = [
    'reports/accessibility/*.json',
    'reports/playwright/*.json',
    'reports/pa11y/*.json'
  ]

  console.log('   Cleaning up old test artifacts...')

  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.DISABLE_ANALYTICS = 'true'
  process.env.FAST_REFRESH = 'false'

  console.log('✅ Accessibility testing environment ready')
}

module.exports = globalSetup