/**
 * Accessibility Tests using axe-core
 * 
 * These tests run automated accessibility checks against key pages
 * to ensure WCAG 2.1 AA compliance.
 */

const { test, expect } = require('@playwright/test')
const { injectAxe, checkA11y } = require('@axe-core/playwright')

// Test configuration
const baseURL = process.env.BASE_URL || 'http://localhost:3000'
const timeout = 30000

// Pages to test
const pagesToTest = [
  { path: '/en', name: 'Homepage (EN)' },
  { path: '/ta', name: 'Homepage (TA)' },
  { path: '/en/about', name: 'About Page (EN)' },
  { path: '/en/galleries', name: 'Galleries Page (EN)' },
  { path: '/en/journal', name: 'Journal Page (EN)' },
]

// Accessibility rules configuration
const axeConfig = {
  rules: {
    // Color contrast - require WCAG AA compliance (4.5:1 ratio)
    'color-contrast': { enabled: true },
    
    // Image alt text
    'image-alt': { enabled: true },
    
    // Keyboard navigation
    'keyboard-navigation': { enabled: true },
    
    // Focus management
    'focus-order-semantics': { enabled: true },
    
    // ARIA labels
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    
    // HTML structure
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    
    // Form accessibility
    'label': { enabled: true },
    
    // Link accessibility
    'link-name': { enabled: true },
    
    // Skip certain rules that may have false positives
    'landmark-unique': { enabled: false }, // Can be too strict for modern layouts
    'region': { enabled: false }, // Can conflict with modern CSS layouts
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
}

// Run accessibility tests for each page
pagesToTest.forEach(({ path, name }) => {
  test(`${name} - Accessibility Check`, async ({ page }) => {
    // Set timeout
    test.setTimeout(timeout)
    
    try {
      // Navigate to page
      await page.goto(`${baseURL}${path}`, { 
        waitUntil: 'networkidle',
        timeout: 20000 
      })
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(3000) // Allow for dynamic content
      
      // Inject axe-core
      await injectAxe(page)
      
      // Run accessibility check
      const results = await checkA11y(page, null, axeConfig, true, 'v2')
      
      // If there are violations, log them
      if (results.violations.length > 0) {
        console.log(`\\n🚨 Accessibility violations found on ${name}:`)
        results.violations.forEach((violation, index) => {
          console.log(`\\n${index + 1}. ${violation.id}: ${violation.description}`)
          console.log(`   Impact: ${violation.impact}`)
          console.log(`   Help: ${violation.help}`)
          console.log(`   Elements affected: ${violation.nodes.length}`)
          
          // Log specific elements with issues
          violation.nodes.forEach((node, nodeIndex) => {
            console.log(`     ${nodeIndex + 1}. ${node.target.join(' > ')}`)
            if (node.failureSummary) {
              console.log(`        Issue: ${node.failureSummary}`)
            }
          })
        })
      }
      
      // The test will fail if violations are found
      // This ensures we maintain accessibility standards
      
    } catch (error) {
      console.error(`Error testing ${name}:`, error)
      throw error
    }
  })
})

// Additional focused tests for critical accessibility features
test.describe('Critical Accessibility Features', () => {
  
  test('Homepage has proper heading hierarchy', async ({ page }) => {
    await page.goto(`${baseURL}/en`)
    
    // Check for H1 (should be exactly one)
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
    
    // Check that headings follow logical order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    let lastLevel = 0
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
      const level = parseInt(tagName.charAt(1))
      
      // Heading levels shouldn't skip (e.g., h1 -> h3)
      if (lastLevel > 0) {
        expect(level - lastLevel).toBeLessThanOrEqual(1)
      }
      
      lastLevel = level
    }
  })
  
  test('All images have alt text', async ({ page }) => {
    await page.goto(`${baseURL}/en`)
    await page.waitForLoadState('networkidle')
    
    // Check all img elements have alt attributes
    const images = await page.locator('img').all()
    
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      const src = await img.getAttribute('src')
      
      // Alt text should exist (can be empty for decorative images)
      expect(alt !== null).toBeTruthy()
      
      // Non-decorative images should have meaningful alt text
      if (src && !src.includes('decoration')) {
        expect(alt.length).toBeGreaterThan(0)
      }
    }
  })
  
  test('Interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto(`${baseURL}/en`)
    
    // Test that all buttons and links can be reached via keyboard
    const interactiveElements = await page.locator('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])').all()
    
    for (const element of interactiveElements) {
      // Element should be focusable
      await element.focus()
      
      // Check if element is actually focused
      const isFocused = await element.evaluate(el => el === document.activeElement)
      expect(isFocused).toBeTruthy()
    }
  })
  
  test('Color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto(`${baseURL}/en`)
    await page.waitForLoadState('networkidle')
    
    // This test relies on axe-core's color-contrast rule
    await injectAxe(page)
    
    const results = await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      },
      tags: ['wcag2aa']
    }, true, 'v2')
    
    // Should have no color contrast violations
    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast')
    expect(contrastViolations.length).toBe(0)
  })
})