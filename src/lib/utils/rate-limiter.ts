interface RateLimit {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

// In-memory store for rate limiting (production should use Redis/database)
const rateLimitStore = new Map<string, RateLimit>()

// Rate limit configurations
export const RATE_LIMITS = {
  COMMENTS_PER_IP_PER_MINUTE: { windowMs: 60 * 1000, maxRequests: 2 },
  COMMENTS_PER_IP_PER_HOUR: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  COMMENTS_PER_IP_PER_DAY: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 50 },
  COMMENTS_PER_EMAIL_PER_HOUR: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
  COMMENTS_PER_EMAIL_PER_DAY: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 20 },
} as const

/**
 * Check if a request is within rate limits
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; resetTime?: number; remaining?: number } {
  const now = Date.now()
  const key = `${identifier}:${config.windowMs}`
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries()
  }
  
  const existing = rateLimitStore.get(key)
  
  if (!existing || now > existing.resetTime) {
    // First request or window expired - allow and create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    
    return {
      allowed: true,
      resetTime: now + config.windowMs,
      remaining: config.maxRequests - 1,
    }
  }
  
  // Check if under limit
  if (existing.count < config.maxRequests) {
    existing.count++
    rateLimitStore.set(key, existing)
    
    return {
      allowed: true,
      resetTime: existing.resetTime,
      remaining: config.maxRequests - existing.count,
    }
  }
  
  // Rate limit exceeded
  return {
    allowed: false,
    resetTime: existing.resetTime,
    remaining: 0,
  }
}

/**
 * Check multiple rate limits for comments
 */
export function checkCommentRateLimits(ipAddress: string, _email?: string | null): {
  allowed: boolean
  reason?: string
  resetTime?: number
} {
  // Check IP-based limits
  const ipPerMinute = checkRateLimit(
    `ip:${ipAddress}`,
    RATE_LIMITS.COMMENTS_PER_IP_PER_MINUTE
  )
  if (!ipPerMinute.allowed) {
    return {
      allowed: false,
      reason: 'Too many comments from this IP address. Please wait a minute.',
      resetTime: ipPerMinute.resetTime,
    }
  }
  
  const ipPerHour = checkRateLimit(
    `ip:${ipAddress}`,
    RATE_LIMITS.COMMENTS_PER_IP_PER_HOUR
  )
  if (!ipPerHour.allowed) {
    return {
      allowed: false,
      reason: 'Too many comments from this IP address. Please try again in an hour.',
      resetTime: ipPerHour.resetTime,
    }
  }
  
  const ipPerDay = checkRateLimit(
    `ip:${ipAddress}`,
    RATE_LIMITS.COMMENTS_PER_IP_PER_DAY
  )
  if (!ipPerDay.allowed) {
    return {
      allowed: false,
      reason: 'Daily comment limit reached for this IP address. Please try again tomorrow.',
      resetTime: ipPerDay.resetTime,
    }
  }
  
  // Only IP-based rate limiting now (no email)
  return { allowed: true }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }
  
  // Fallback (won't work in production behind proxies)
  return '127.0.0.1'
}

/**
 * Clean up expired rate limit entries to prevent memory leaks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  for (const [key, value] of Array.from(rateLimitStore.entries())) {
    if (now > value.resetTime) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => rateLimitStore.delete(key))
}

/**
 * Security validation for comment content
 */
export function validateCommentSecurity(data: {
  content: string
  name: string
  honeypot?: string
  submissionTime?: number
}): { valid: boolean; reason?: string; spamScore: number } {
  let spamScore = 0
  
  // Check honeypot field (should be empty)
  if (data.honeypot && data.honeypot.trim() !== '') {
    return {
      valid: false,
      reason: 'Bot detected',
      spamScore: 100,
    }
  }
  
  // Check submission time (should take at least 3 seconds for humans)
  if (data.submissionTime && data.submissionTime < 3000) {
    spamScore += 40
  }
  
  // Basic content validation
  if (!data.content || data.content.trim().length < 1) {
    return {
      valid: false,
      reason: 'Comment content is required',
      spamScore: 0,
    }
  }
  
  if (data.content.length > 1000) {
    return {
      valid: false,
      reason: 'Comment is too long (maximum 1000 characters)',
      spamScore: 20,
    }
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /https?:\/\/[^\s]+/g, // Multiple URLs
    /\b(buy|sale|discount|offer|deal|free|money|cash|loan|debt)\b/gi, // Commercial terms
    /\b(viagra|cialis|pharmacy|pills|medication)\b/gi, // Pharmaceutical spam
    /\b(casino|poker|gambling|bet|lottery)\b/gi, // Gambling spam
    /(.)\1{10,}/g, // Repeated characters
  ]
  
  suspiciousPatterns.forEach(pattern => {
    const matches = data.content.match(pattern)
    if (matches) {
      spamScore += matches.length * 10
    }
  })
  
  // URL count check
  const urlMatches = data.content.match(/https?:\/\/[^\s]+/g)
  if (urlMatches) {
    if (urlMatches.length > 2) {
      spamScore += 30
    } else if (urlMatches.length > 0) {
      spamScore += 10
    }
  }
  
  // Name validation
  if (!data.name || data.name.trim().length < 1) {
    return {
      valid: false,
      reason: 'Name is required',
      spamScore: 0,
    }
  }
  
  if (data.name.length > 100) {
    return {
      valid: false,
      reason: 'Name is too long (maximum 100 characters)',
      spamScore: 15,
    }
  }
  
  // Removed email and website validation
  
  // High spam score check
  if (spamScore >= 80) {
    return {
      valid: false,
      reason: 'Comment flagged as potential spam',
      spamScore,
    }
  }
  
  return {
    valid: true,
    spamScore,
  }
}