'use client'

// Stub types for when @payloadcms/admin-bar is not available
interface PayloadAdminBarProps {
  adminBarCollectionLabels?: any
  cmsURL?: string
  className?: string
  classNames?: {
    user?: string
    controls?: string
    logo?: string
  }
  logo?: React.ReactNode
  style?: any
  unstyled?: boolean
  user?: any
  collectionSlug?: string
  collectionLabels?: any
  onAuthChange?: (user: any) => void
  [key: string]: any // Allow any additional props
}

interface PayloadMeUser {
  id?: string
  user?: any
}

import { cn } from '@/lib/utils'
import { useSelectedLayoutSegments } from 'next/navigation'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

import './index.scss'

// Stub function for getClientSideURL
const getClientSideURL = () => process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''

// Stub component when admin-bar is not available
const PayloadAdminBar: React.FC<PayloadAdminBarProps> = () => null

const baseClass = 'admin-bar'

const collectionLabels = {
  pages: {
    plural: 'Pages',
    singular: 'Page',
  },
  posts: {
    plural: 'Posts',
    singular: 'Post',
  },
  projects: {
    plural: 'Projects',
    singular: 'Project',
  },
}

const Title: React.FC = () => <span>Dashboard</span>

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : 'pages'
  ) as keyof typeof collectionLabels
  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  return (
    <div
      className={cn(baseClass, 'py-2 bg-black text-white', {
        block: show,
        hidden: !show,
      })}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Pages',
            singular: collectionLabels[collection]?.singular || 'Page',
          }}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
