import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // Check for secret to confirm this is a valid request
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { collection, global, doc } = body

    // Revalidate based on collection/global type
    if (global) {
      // Revalidate global content
      revalidateTag(`global_${global}`)
      console.log(`Revalidated global: ${global}`)
      
      // Special handling for home page
      if (global === 'home') {
        revalidateTag('global_home')
        revalidateTag('global_settings')
      }
    }

    if (collection) {
      // Revalidate collection-based content
      revalidateTag(`collection_${collection}`)
      
      // Enhanced granular revalidation based on collection
      if (collection === 'galleries') {
        // Revalidate all gallery-related caches
        revalidateTag('galleries')
        revalidateTag('galleries-list-optimized')
        revalidateTag('galleries-paginated')
        
        if (doc?.slug) {
          revalidateTag(`gallery_${doc.slug}`)
          revalidateTag(`gallery-by-slug`)
        }
      }
      
      if (collection === 'blog-posts') {
        // Revalidate blog-related caches
        revalidateTag('blog-posts')
        revalidateTag('blog-posts-list')
        
        if (doc?.slug) {
          revalidateTag(`blog-post_${doc.slug}`)
        }
      }
      
      if (collection === 'images') {
        // Revalidate image caches and dependent galleries
        revalidateTag('images')
        revalidateTag('galleries')
        revalidateTag('galleries-list-optimized')
        revalidateTag('galleries-paginated')
        revalidateTag('gallery-by-slug')
        
        // If image belongs to a specific gallery, invalidate that gallery
        if (doc?.gallery && typeof doc.gallery === 'object' && doc.gallery.slug) {
          revalidateTag(`gallery_${doc.gallery.slug}`)
        }
      }
    }

    // Always revalidate the home page cache since most content affects it
    revalidateTag('global_home')
    
    return NextResponse.json({ 
      revalidated: true, 
      collection, 
      global, 
      timestamp: new Date().toISOString() 
    })
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json(
      { message: 'Error revalidating', error: err }, 
      { status: 500 }
    )
  }
}

// Also support GET for testing
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  // Manual revalidation of common tags
  revalidateTag('global_home')
  revalidateTag('global_settings')
  revalidateTag('galleries')
  revalidateTag('images')
  revalidateTag('blog-posts')
  
  return NextResponse.json({ 
    message: 'Manual revalidation completed',
    timestamp: new Date().toISOString()
  })
}