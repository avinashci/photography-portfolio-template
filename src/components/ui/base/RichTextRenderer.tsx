import React from 'react'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
type HeadingTag = `h${HeadingLevel}`

interface RichTextRendererProps {
  content: any
  className?: string
}

function renderLexicalChildren(children: any[]): React.ReactNode[] {
  return children.map((child: any, index: number) => {
    if (child.type === 'text') {
      const textElement = child.text
      let className = ''
      
      // Handle text formatting
      if (child.format) {
        if (child.format & 1) className += ' font-bold'  // Bold
        if (child.format & 2) className += ' italic'     // Italic
        if (child.format & 4) className += ' underline'  // Underline
        if (child.format & 8) className += ' line-through' // Strikethrough
      }
      
      return <span key={index} className={className.trim()}>{textElement}</span>
    }
    
    if (child.type === 'paragraph') {
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {child.children ? renderLexicalChildren(child.children) : ''}
        </p>
      )
    }
    
    if (child.type === 'heading') {
      const level = Math.max(1, Math.min(6, child.tag || 2)) as HeadingLevel
      const HeadingTag = `h${level}` as HeadingTag
      const headingClasses = level === 1 ? 'text-3xl font-bold mb-6 mt-8' :
                           level === 2 ? 'text-2xl font-bold mb-5 mt-7' :
                           level === 3 ? 'text-xl font-semibold mb-4 mt-6' :
                           'text-lg font-semibold mb-3 mt-5'
      return React.createElement(
        HeadingTag,
        { key: index, className: headingClasses },
        child.children ? renderLexicalChildren(child.children) : ''
      )
    }
    
    if (child.type === 'list') {
      const ListTag = child.listType === 'number' ? 'ol' : 'ul'
      const listClasses = child.listType === 'number' 
        ? 'list-decimal list-inside mb-4 space-y-2 ml-4' 
        : 'list-disc list-inside mb-4 space-y-2 ml-4'
      return (
        <ListTag key={index} className={listClasses}>
          {child.children ? renderLexicalChildren(child.children) : ''}
        </ListTag>
      )
    }
    
    if (child.type === 'listitem') {
      return (
        <li key={index} className="leading-relaxed">
          {child.children ? renderLexicalChildren(child.children) : ''}
        </li>
      )
    }
    
    if (child.type === 'link') {
      const url = child.fields?.url || child.url || '#'
      const isExternal = url.startsWith('http://') || url.startsWith('https://')
      return (
        <a 
          key={index} 
          href={url}
          className="text-primary hover:text-primary/80 underline transition-colors"
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {child.children ? renderLexicalChildren(child.children) : url}
        </a>
      )
    }
    
    // Handle other node types or fallback
    if (child.children) {
      return <div key={index}>{renderLexicalChildren(child.children)}</div>
    }
    
    return <span key={index}>{child.text || ''}</span>
  })
}

export default function RichTextRenderer({ content, className = "" }: RichTextRendererProps) {
  if (!content) {
    return null
  }

  // Handle string content
  if (typeof content === 'string') {
    return (
      <div 
        className={`prose max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // Handle rich text object content 
  if (content?.root?.children) {
    return (
      <div className={`prose prose-lg max-w-none text-foreground ${className}`}>
        {renderLexicalChildren(content.root.children)}
      </div>
    )
  }

  // Handle array content
  if (Array.isArray(content)) {
    return (
      <div className={`prose max-w-none ${className}`}>
        {content.map((item, index) => (
          <div key={index}>{item.text || JSON.stringify(item)}</div>
        ))}
      </div>
    )
  }

  // Fallback: show the raw content for debugging
  return (
    <div className={`prose max-w-none ${className}`}>
      <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '10px' }}>
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  )
}