'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { Badge } from '@/components/ui/base/badge'
import { Search, X, Image as ImageIcon } from 'lucide-react'

interface Image {
  id: string
  title: string
  slug: string
  description?: string
  photographyStyle: string
  gallery: {
    id: string
    title: string
  }
  imageUrls: {
    thumbnail?: string
    small?: string
  }
}

interface SearchableImageFieldProps {
  path: string
  value?: string | Image
  onChange?: (value: string | null) => void
  readOnly?: boolean
  required?: boolean
}

export const SearchableImageField: React.FC<SearchableImageFieldProps> = ({
  path,
  value,
  onChange,
  readOnly,
  required
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Image[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)

  // Fetch selected image details when value changes
  useEffect(() => {
    const fetchImageDetails = async () => {
      if (typeof value === 'string' && value) {
        try {
          const response = await fetch(`/api/images/${value}`)
          if (response.ok) {
            const image = await response.json()
            setSelectedImage(image)
          }
        } catch (error) {
          console.error('Error fetching image details:', error)
        }
      } else if (typeof value === 'object' && value) {
        setSelectedImage(value as Image)
      } else {
        setSelectedImage(null)
      }
    }

    fetchImageDetails()
  }, [value])

  // Debounced search function
  const performSearch = useCallback(
    async (term: string) => {
      if (!term.trim() || term.length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      try {
        const searchParams = new URLSearchParams({
          search: term,
          limit: '20',
          depth: '1'
        })

        const response = await fetch(`/api/images?${searchParams}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.docs || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Error searching images:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    []
  )

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, performSearch])

  const handleSelectImage = (image: Image) => {
    if (onChange) {
      onChange(image.id)
    }
    setSelectedImage(image)
    setShowResults(false)
    setSearchTerm('')
  }

  const handleClearSelection = () => {
    if (onChange) {
      onChange(null)
    }
    setSelectedImage(null)
    setSearchTerm('')
    setShowResults(false)
  }

  if (readOnly) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Selected Image</label>
        {selectedImage ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            {selectedImage.imageUrls?.thumbnail && (
              <img
                src={selectedImage.imageUrls.thumbnail}
                alt={selectedImage.title}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div>
              <div className="font-medium">{selectedImage.title}</div>
              <div className="text-sm text-gray-500">
                {selectedImage.gallery?.title} • {selectedImage.photographyStyle}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No image selected</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Select Image {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-sm text-gray-500">
          Search by image title, description, or gallery name
        </div>
      </div>

      {/* Current Selection */}
      {selectedImage && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          {selectedImage.imageUrls?.thumbnail && (
            <img
              src={selectedImage.imageUrls.thumbnail}
              alt={selectedImage.title}
              className="w-12 h-12 object-cover rounded"
            />
          )}
          <div className="flex-1">
            <div className="font-medium">{selectedImage.title}</div>
            <div className="text-sm text-gray-500">
              {selectedImage.gallery?.title} • {selectedImage.photographyStyle}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="hover:bg-red-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for an image..."
            className="pl-10"
            onFocus={() => setShowResults(searchResults.length > 0)}
          />
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2 px-2">
                  {searchResults.length} images found
                </div>
                {searchResults.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-left"
                    onClick={() => handleSelectImage(image)}
                  >
                    {image.imageUrls?.thumbnail ? (
                      <img
                        src={image.imageUrls.thumbnail}
                        alt={image.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{image.title}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {image.gallery?.title} • {image.photographyStyle}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="p-4 text-center text-gray-500">
                No images found for "{searchTerm}"
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close results */}
      {showResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  )
}