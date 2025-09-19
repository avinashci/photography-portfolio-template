/**
 * Field Hooks for PayloadCMS
 * Reusable hooks for consistent field processing across collections
 */

/**
 * Hook for keywords fields - handles comma splitting and cleaning
 * Features:
 * - Comma-separated input support
 * - Quote stripping (removes start/end quotes and double quotes)  
 * - Lowercase normalization
 * - Whitespace cleanup
 * - Duplicate removal
 * - Length validation
 */
export const createKeywordsHook = ({ maxItems = 20, maxLength = 50 } = {}) => {
  return ({ value }: any) => {
    if (!Array.isArray(value) || value.length === 0) {
      return value
    }

    // Check if the last item contains commas (new input)
    const lastItem = value[value.length - 1]
    if (typeof lastItem === 'string' && lastItem.includes(',')) {
      // Remove the last item and split it
      const withoutLast = value.slice(0, -1)
      const splitItems = lastItem
        .split(',')
        .map(k => cleanKeyword(k))
        .filter(k => k.length > 0)
      const newArray = [...withoutLast, ...splitItems]
      
      // Remove duplicates and apply limits
      return newArray
        .filter(keyword => keyword && keyword.length > 0 && keyword.length <= maxLength)
        .filter((keyword, index, arr) => arr.indexOf(keyword) === index)
        .slice(0, maxItems)
    }
    
    // Just clean up existing items
    return value
      .map(keyword => 
        typeof keyword === 'string' 
          ? cleanKeyword(keyword)
          : keyword
      )
      .filter(keyword => keyword && keyword.length > 0 && keyword.length <= maxLength)
      .filter((keyword, index, arr) => arr.indexOf(keyword) === index)
      .slice(0, maxItems)
  }
}

/**
 * Hook for tags fields - handles comma splitting and cleaning
 * Features:
 * - Comma-separated input support
 * - Quote stripping (removes start/end quotes and double quotes)
 * - Lowercase normalization with dash conversion
 * - Whitespace cleanup  
 * - Duplicate removal
 * - Length validation
 */
export const createTagsHook = ({ maxItems = 15 } = {}) => {
  return ({ value }: any) => {
    if (!Array.isArray(value) || value.length === 0) {
      return value
    }

    // Check if the last item contains commas (new input)
    const lastItem = value[value.length - 1]
    if (typeof lastItem === 'string' && lastItem.includes(',')) {
      // Remove the last item and split it
      const withoutLast = value.slice(0, -1)
      const splitItems = lastItem
        .split(',')
        .map(t => cleanTag(t))
        .filter(t => t.length > 0)
      const newArray = [...withoutLast, ...splitItems]
      
      // Remove duplicates and apply limits
      return newArray
        .filter(tag => tag && tag.length > 0)
        .filter((tag, index, arr) => arr.indexOf(tag) === index)
        .slice(0, maxItems)
    }
    
    // Just clean up existing items
    return value
      .map(tag => 
        typeof tag === 'string' 
          ? cleanTag(tag)
          : tag
      )
      .filter(tag => tag && tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .slice(0, maxItems)
  }
}

/**
 * Clean a keyword string
 * - Strip start/end quotes and double quotes
 * - Normalize whitespace
 * - Convert to lowercase
 */
function cleanKeyword(keyword: string): string {
  return keyword
    .trim()
    .replace(/^["']|["']$/g, '') // Remove start/end quotes
    .replace(/^""|""$/g, '')     // Remove start/end double quotes
    .toLowerCase()
    .replace(/\s+/g, ' ')        // Normalize whitespace
    .trim()
}

/**
 * Clean a tag string
 * - Strip start/end quotes and double quotes
 * - Normalize whitespace and convert to dashes
 * - Convert to lowercase
 */
function cleanTag(tag: string): string {
  return tag
    .trim()
    .replace(/^["']|["']$/g, '') // Remove start/end quotes
    .replace(/^""|""$/g, '')     // Remove start/end double quotes
    .toLowerCase()
    .replace(/\s+/g, '-')        // Convert spaces to dashes
    .trim()
}