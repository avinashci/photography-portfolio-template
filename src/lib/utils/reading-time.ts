// Server-side utility for calculating reading time

interface LexicalNode {
  type: string
  version: number
  [key: string]: any
}

function extractTextFromLexical(content: any): string {
  if (!content || !content.root || !content.root.children) {
    return ''
  }

  const extractFromChildren = (children: LexicalNode[]): string => {
    return children.map(child => {
      if (child.type === 'text') {
        return child.text || ''
      }
      
      if (child.children && Array.isArray(child.children)) {
        return extractFromChildren(child.children)
      }
      
      return ''
    }).join(' ')
  }

  return extractFromChildren(content.root.children)
}

export function calculateReadingTime(content: any): string {
  let text = ''
  
  // Handle content blocks (from blog posts)
  if (Array.isArray(content)) {
    text = content.map(block => {
      if (block.content) {
        return extractTextFromLexical(block.content)
      }
      return ''
    }).join(' ')
  } 
  // Handle single lexical content
  else {
    text = extractTextFromLexical(content)
  }
  
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200)) // Average reading speed: 200 words/minute
  
  return `${readTime} min read`
}

export function calculateWordCount(content: any): number {
  const text = extractTextFromLexical(content)
  return text.split(/\s+/).filter(word => word.length > 0).length
}