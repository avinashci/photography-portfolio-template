// Utility function to trigger revalidation after content changes
import { getServerSideURL } from './getURL'

export async function triggerRevalidation(type: 'collection' | 'global', identifier: string, doc?: any) {
  const url = `${getServerSideURL()}/api/revalidate`
  const secret = process.env.REVALIDATE_SECRET
  
  if (!secret) {
    console.warn('REVALIDATE_SECRET not set - skipping revalidation')
    return
  }

  try {
    const body = type === 'global' 
      ? { global: identifier, doc }
      : { collection: identifier, doc }
    
    const response = await fetch(`${url}?secret=${secret}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      console.log(`✅ Successfully triggered revalidation for ${type}: ${identifier}`)
    } else {
      console.error(`❌ Failed to trigger revalidation: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ Revalidation trigger failed:', error)
  }
}

// Hook factory for collections
export const createCollectionHook = (collectionSlug: string) => ({
  afterChange: [
    async ({ doc, req }: any) => {
      // Only trigger revalidation if not during seed/migration
      if (!req?.user?.bypassRevalidation) {
        await triggerRevalidation('collection', collectionSlug, doc)
      }
    },
  ],
  afterDelete: [
    async ({ doc, req }: any) => {
      // Only trigger revalidation if not during seed/migration
      if (!req?.user?.bypassRevalidation) {
        await triggerRevalidation('collection', collectionSlug, doc)
      }
    },
  ],
})

// Hook factory for globals
export const createGlobalHook = (globalSlug: string) => ({
  afterChange: [
    async ({ doc, req }: any) => {
      // Only trigger revalidation if not during seed/migration
      if (!req?.user?.bypassRevalidation) {
        await triggerRevalidation('global', globalSlug, doc)
      }
    },
  ],
})