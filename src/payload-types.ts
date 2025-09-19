// Generated PayloadCMS types - stub file
export interface Post {
  id: string
  title: string
  slug: string
  description: string
  content: any
  featuredImage?: any
  publishDate?: string
  categories?: any[]
  meta?: any
  createdAt: string
  updatedAt: string
}

// Add other types as needed
export interface User {
  id: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  url: string
  alt?: string
  width?: number
  height?: number
  mimeType?: string
  filename?: string
  createdAt: string
  updatedAt: string
}