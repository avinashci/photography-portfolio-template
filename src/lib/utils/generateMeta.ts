import type { Metadata } from 'next'

import type { Config, Image, BlogPost } from '@/config/payload-types'
import { SITE_CONFIG, DERIVED_CONFIG } from '@/config/site.config'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Image | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const imageObj = image as any
    const ogUrl = imageObj.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + imageObj.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<BlogPost> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(null) // BlogPost doesn't have meta.image

  const title = doc?.title
    ? doc?.title + ` | ${SITE_CONFIG.site.name}`
    : SITE_CONFIG.site.name

  return {
    description: doc?.excerpt,
    openGraph: mergeOpenGraph({
      description: doc?.excerpt || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
