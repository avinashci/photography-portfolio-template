/**
 * Global teardown for accessibility tests
 * Cleanup and summary generation
 */

const fs = require('fs')
const path = require('path')

async function globalTeardown() {
  console.log('🧹 Cleaning up accessibility testing environment...')

  // Generate test summary
  try {
    const reportDir = 'reports/accessibility'
    const files = fs.readdirSync(reportDir).filter(f => f.endsWith('.json'))

    if (files.length > 0) {
      console.log(`   Generated ${files.length} accessibility reports in ${reportDir}/`)

      // Create summary file
      const summary = {
        timestamp: new Date().toISOString(),
        testRun: 'accessibility-audit',
        reports: files.map(f => ({
          file: f,
          size: fs.statSync(path.join(reportDir, f)).size,
          modified: fs.statSync(path.join(reportDir, f)).mtime
        }))
      }

      fs.writeFileSync(
        path.join(reportDir, 'test-summary.json'),
        JSON.stringify(summary, null, 2)
      )

      console.log('   Created test summary: reports/accessibility/test-summary.json')
    }
  } catch (error) {
    console.warn('   Warning: Could not generate test summary:', error.message)
  }

  console.log('✅ Accessibility testing cleanup complete')
}

module.exports = globalTeardown