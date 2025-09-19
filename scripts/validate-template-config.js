#!/usr/bin/env node

/**
 * Template Configuration Validator
 * 
 * This script validates that template users have properly configured
 * their environment variables and site configuration.
 */

import { SITE_CONFIG, validateSiteConfig } from '../src/config/site.config.js'

console.log('🎨 Photography Portfolio Template - Configuration Validator\n')

// Validate configuration
const errors = validateSiteConfig()

// Check for template defaults that need updating
const warnings = []

// Personal Information Checks
if (SITE_CONFIG.personal.name === 'Your Name') {
  errors.push('❌ NEXT_PUBLIC_SITE_OWNER_NAME still has default value "Your Name"')
}

if (SITE_CONFIG.personal.email === 'contact@yoursite.com') {
  errors.push('❌ NEXT_PUBLIC_SITE_OWNER_EMAIL still has default value "contact@yoursite.com"')
}

if (SITE_CONFIG.url.base === 'http://localhost:3000') {
  warnings.push('⚠️  Using localhost URL. Set NEXT_PUBLIC_SERVER_URL for production.')
}

// Database Checks
if (SITE_CONFIG.database.name === 'portfolio-template') {
  warnings.push('⚠️  Using default database name. Consider customizing DATABASE_NAME.')
}

// Secret Checks
if (!process.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET.length < 32) {
  errors.push('❌ PAYLOAD_SECRET must be at least 32 characters long')
}

// Results
if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Configuration validation passed!')
  console.log(`🎯 Site: ${SITE_CONFIG.personal.name} - ${SITE_CONFIG.site.name}`)
  console.log(`🌍 Languages: ${SITE_CONFIG.i18n.locales.map(l => l.name).join(', ')}`)
  console.log(`🔗 URL: ${SITE_CONFIG.url.base}`)
  console.log('\n🚀 Your photography portfolio template is ready!')
} else {
  if (errors.length > 0) {
    console.log('❌ Configuration Errors:')
    errors.forEach(error => console.log(`   ${error}`))
    console.log()
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Configuration Warnings:')
    warnings.forEach(warning => console.log(`   ${warning}`))
    console.log()
  }
  
  console.log('📖 See TEMPLATE-SETUP.md for configuration guide.')
  
  if (errors.length > 0) {
    process.exit(1)
  }
}

// Show enabled features
console.log('\n📊 Enabled Features:')
console.log(`   • About Page: ${SITE_CONFIG.content.showAboutPage ? '✅' : '❌'}`)
console.log(`   • Journal: ${SITE_CONFIG.content.showJournalSection ? '✅' : '❌'}`)
console.log(`   • Gear Reviews: ${SITE_CONFIG.content.showGearSection ? '✅' : '❌'}`)
console.log(`   • Contact: ${SITE_CONFIG.content.showContactSection ? '✅' : '❌'}`)
console.log(`   • SEO: ${SITE_CONFIG.features.enableSEO ? '✅' : '❌'}`)
console.log(`   • Analytics: ${SITE_CONFIG.features.enableAnalytics ? '✅' : '❌'}`)

console.log()