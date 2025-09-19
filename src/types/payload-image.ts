export interface PayloadImage {
  id: string
  title: string | { en: string; ta: string }
  slug: string
  description?: string | { en: string; ta: string } | null
  caption?: string | { en: string; ta: string } | null
  altText?: string | { en: string; ta: string }
  alt?: { en: string; ta: string } // Legacy field support
  
  imageUrls: {
    full?: string
    large?: string
    medium?: string
    thumbnail?: string
  }
  
  location?: {
    name?: {
      en: string
      ta: string
    }
    coordinates?: any
  }
  
  technical?: {
    cameraBody?: {
      name: {
        en: string
        ta: string
      }
      brand: string
      model: string
    }
    lensGear?: {
      name: {
        en: string
        ta: string
      }
      brand: string
      model: string
    }
    aperture?: string
    shutterSpeed?: string
    iso?: number
    focalLength?: number
    flash?: boolean
  }
  
  // Additional Payload CMS fields
  gallery?: string
  photographyStyle?: string
  captureDate?: string
  updatedAt?: string
  createdAt?: string
  _status?: 'draft' | 'published'
}