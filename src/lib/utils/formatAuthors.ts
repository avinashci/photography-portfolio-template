import { BlogPost } from '@/config/payload-types'

/**
 * Formats author string from BlogPost.
 * @param author - The author string from a BlogPost.
 * @returns The author string or empty string if none.
 */
export const formatAuthors = (author: BlogPost['author']) => {
  return author || ''
}
