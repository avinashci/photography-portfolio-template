import { MetadataRoute } from 'next'
import { getSettings } from '@/lib/api/api-client'
import { SITE_CONFIG } from '@/config/site.config'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = SITE_CONFIG.url.base
  
  try {
    // Get custom robots content from CMS
    const settings = await getSettings()
    const customRobots = settings?.seo?.robots
    
    // Check if site is in maintenance mode
    const maintenanceMode = settings?.maintenance?.enabled
    
    if (maintenanceMode) {
      // Block all crawlers during maintenance
      return {
        rules: {
          userAgent: '*',
          disallow: '/',
        },
        sitemap: `${baseUrl}/sitemap.xml`,
      }
    }
    
    if (customRobots) {
      // Parse custom robots.txt content
      const lines = customRobots.split('\n')
      const rules: MetadataRoute.Robots['rules'] = []
      let currentRule: any = { userAgent: '*' }
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.startsWith('User-agent:')) {
          if (currentRule.userAgent) {
            rules.push(currentRule)
          }
          currentRule = { userAgent: trimmedLine.split(':')[1].trim() }
        } else if (trimmedLine.startsWith('Disallow:')) {
          const path = trimmedLine.split(':')[1].trim()
          currentRule.disallow = currentRule.disallow ? 
            (Array.isArray(currentRule.disallow) ? [...currentRule.disallow, path] : [currentRule.disallow, path]) :
            path
        } else if (trimmedLine.startsWith('Allow:')) {
          const path = trimmedLine.split(':')[1].trim()  
          currentRule.allow = currentRule.allow ?
            (Array.isArray(currentRule.allow) ? [...currentRule.allow, path] : [currentRule.allow, path]) :
            path
        }
      }
      
      if (currentRule.userAgent) {
        rules.push(currentRule)
      }
      
      return {
        rules: rules.length > 0 ? rules : {
          userAgent: '*',
          allow: '/',
          disallow: ['/admin', '/api']
        },
        sitemap: `${baseUrl}/sitemap.xml`,
      }
    }
    
    // Default robots.txt for photography portfolio
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: [
            '/admin',
            '/api',
            '/_next',
            '/admin/*',
            '/api/*',
            '*.json',
            '/temp/',
            '/uploads/temp/'
          ],
        },
        {
          userAgent: 'GPTBot',
          disallow: '/', // Block AI crawlers from using images
        },
        {
          userAgent: 'ChatGPT-User',
          disallow: '/',
        },
        {
          userAgent: 'CCBot',
          disallow: '/',
        },
        {
          userAgent: 'anthropic-ai',
          disallow: '/',
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    }
    
  } catch (error) {
    console.error('Error generating robots.txt:', error)
    
    // Fallback robots.txt
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    }
  }
}