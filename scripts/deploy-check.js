#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * 
 * This script runs before each deployment to ensure code quality,
 * accessibility standards, and build readiness.
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logStep(step, description) {
  log(`\n🔍 Step ${step}: ${description}`, colors.cyan)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function runCommand(command, description, options = {}) {
  try {
    log(`   Running: ${command}`, colors.blue)
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options 
    })
    return { success: true, output: result }
  } catch (error) {
    if (!options.allowFailure) {
      logError(`Failed: ${description}`)
      logError(`Command: ${command}`)
      logError(`Error: ${error.message}`)
      process.exit(1)
    }
    return { success: false, error: error.message, output: error.stdout }
  }
}

function checkFile(filePath, description) {
  if (existsSync(filePath)) {
    logSuccess(`${description} exists`)
    return true
  } else {
    logWarning(`${description} missing: ${filePath}`)
    return false
  }
}

async function main() {
  log('\n🚀 Photography Portfolio - Pre-Deployment Validation', colors.magenta)
  log('=' .repeat(60), colors.magenta)

  let warnings = 0
  let errors = 0

  // Step 1: Environment Validation
  logStep(1, 'Environment Validation')
  
  // Check Node.js version
  const nodeVersion = process.version
  const nodeMinVersion = '20.0.0'
  log(`   Node.js version: ${nodeVersion}`)
  
  if (parseInt(nodeVersion.slice(1)) < parseInt(nodeMinVersion)) {
    logError(`Node.js ${nodeMinVersion} or higher required`)
    errors++
  } else {
    logSuccess('Node.js version compatible')
  }

  // Check package manager
  const packageManager = process.env.npm_config_user_agent?.includes('pnpm') ? 'pnpm' : 'npm'
  if (packageManager !== 'pnpm') {
    logWarning('Using npm instead of pnpm - consider switching for better performance')
    warnings++
  } else {
    logSuccess('Using pnpm package manager')
  }

  // Step 2: Code Quality Checks
  logStep(2, 'Code Quality & Linting')
  
  // TypeScript check
  runCommand('pnpm type-check', 'TypeScript validation')
  logSuccess('TypeScript validation passed')
  
  // ESLint check - allow warnings for template flexibility
  const lintResult = runCommand('pnpm lint', 'ESLint validation', { allowFailure: true })
  if (lintResult.success) {
    logSuccess('ESLint validation passed')
  } else {
    logWarning('ESLint warnings found - this is expected for template flexibility')
    warnings++
  }

  // Step 3: Security Audit
  logStep(3, 'Security Audit')
  
  const auditResult = runCommand(
    'pnpm audit --audit-level=moderate', 
    'Security audit', 
    { allowFailure: true, silent: true }
  )
  
  if (auditResult.success) {
    logSuccess('No moderate or high security vulnerabilities found')
  } else {
    logWarning('Security vulnerabilities detected - review and fix if necessary')
    warnings++
  }

  // Step 4: Configuration Validation
  logStep(4, 'Configuration Validation')
  
  // Check critical files
  const criticalFiles = [
    { path: 'next.config.js', name: 'Next.js configuration' },
    { path: 'src/config/payload.config.ts', name: 'Payload CMS configuration' },
    { path: 'src/config/site.config.ts', name: 'Site configuration' },
    { path: 'tailwind.config.ts', name: 'Tailwind CSS configuration' },
  ]
  
  criticalFiles.forEach(({ path, name }) => {
    checkFile(path, name)
  })

  // Check environment variables
  const envFile = '.env.local'
  if (checkFile(envFile, 'Environment configuration')) {
    const envContent = readFileSync(envFile, 'utf-8')
    const requiredVars = ['MONGODB_URI', 'PAYLOAD_SECRET']
    
    requiredVars.forEach(varName => {
      if (envContent.includes(varName)) {
        logSuccess(`Required env var ${varName} is configured`)
      } else {
        logWarning(`Environment variable ${varName} not found in ${envFile}`)
        warnings++
      }
    })
  }

  // Step 5: Accessibility Pre-Check (Quick)
  logStep(5, 'Accessibility Pre-Check')
  
  // Check if accessibility tools are available
  if (existsSync('tests/accessibility.test.cjs')) {
    logSuccess('Accessibility test suite is available')
    log('   Note: Full accessibility audit will run in CI/CD pipeline', colors.blue)
  } else {
    logWarning('Accessibility test suite not found')
    warnings++
  }

  // Step 6: Build Validation
  logStep(6, 'Build Validation')
  
  log('   Generating Payload types...', colors.blue)
  runCommand('pnpm generate:types', 'Payload type generation')
  logSuccess('Payload types generated')

  // Clean previous builds
  log('   Cleaning previous builds...', colors.blue)
  runCommand('pnpm clean', 'Build cleanup', { allowFailure: true })

  // Test build (this is the critical step)
  log('   Testing production build...', colors.blue)
  runCommand('pnpm build', 'Production build test')
  logSuccess('Production build successful')

  // Step 7: Final Summary
  log('\n' + '='.repeat(60), colors.magenta)
  
  if (errors > 0) {
    logError(`Deployment blocked: ${errors} error(s) found`)
    process.exit(1)
  } else if (warnings > 0) {
    logWarning(`Deployment will proceed with ${warnings} warning(s)`)
    log('Consider addressing warnings for optimal performance and security.', colors.yellow)
  } else {
    logSuccess('All checks passed! Ready for deployment 🚀')
  }
  
  log('=' .repeat(60), colors.magenta)
  log('\n📋 Next Steps:', colors.cyan)
  log('   1. Deployment will build using: pnpm build', colors.blue)
  log('   2. Post-deployment: Health checks will run automatically', colors.blue)
  log('   3. Accessibility audit will run in production environment', colors.blue)
  log('\n🎯 Monitor deployment at: https://vercel.com', colors.cyan)
}

// Run the deployment check
main().catch((error) => {
  logError('Deployment check failed:')
  console.error(error)
  process.exit(1)
})