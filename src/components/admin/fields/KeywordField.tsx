'use client'
import React, { useState, useEffect, useCallback } from 'react'
// Stub hooks for payload forms when not available
const useField = () => ({ value: [], setValue: () => {} })
const useFormFields = (fn: (fields: any) => any) => fn ? fn([{}]) : [{}]
import { Badge } from '@/components/ui/base/badge'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { X, Plus, Lightbulb, Hash } from 'lucide-react'

const PREDEFINED_KEYWORDS = {
  landscape: ['landscape', 'nature', 'outdoor', 'scenic', 'natural beauty', 'wilderness'],
  astrophotography: ['night sky', 'stars', 'milky way', 'astrophotography', 'celestial', 'cosmos'],
  wildlife: ['wildlife', 'animals', 'nature', 'wild', 'fauna', 'conservation'],
  street: ['street photography', 'urban', 'city life', 'documentary', 'people', 'culture'],
  portrait: ['portrait', 'people', 'human', 'face', 'expression', 'personality'],
  macro: ['macro', 'close-up', 'detail', 'small', 'intimate', 'nature'],
  documentary: ['documentary', 'storytelling', 'real life', 'authentic', 'journalism'],
  architectural: ['architecture', 'building', 'structure', 'design', 'urban', 'construction'],
  abstract: ['abstract', 'artistic', 'creative', 'experimental', 'conceptual', 'modern'],
  travel: ['travel', 'adventure', 'exploration', 'destination', 'journey', 'culture'],
}

const COMMON_PHOTOGRAPHY_KEYWORDS = [
  'photography', 'fine art', 'wall art', 'home decor', 'office decor',
  'peaceful', 'serene', 'tranquil', 'majestic', 'dramatic',
  'vibrant', 'colorful', 'monochrome', 'contrast', 'composition',
  'professional photography', 'high quality', 'print ready', 'digital download'
]

const LOCATION_KEYWORDS = [
  'coastal', 'ocean', 'sea', 'beach', 'waves', 'maritime', 'seascape',
  'mountain', 'peak', 'alpine', 'summit', 'rocky', 'elevation',
  'desert', 'arid', 'canyon', 'sandstone', 'geological', 'erosion',
  'forest', 'trees', 'woodland', 'nature', 'green', 'natural',
  'urban', 'city', 'metropolitan', 'street', 'architecture', 'building'
]

const LIGHTING_KEYWORDS = [
  'golden hour', 'sunrise', 'sunset', 'warm light', 'magic hour',
  'blue hour', 'twilight', 'dawn', 'dusk', 'soft light',
  'dramatic lighting', 'natural light', 'atmospheric', 'moody'
]

interface KeywordFieldProps {
  path: string
  value?: string[]
  onChange?: (value: string[]) => void
  readOnly?: boolean
  required?: boolean
}

export const KeywordField: React.FC<KeywordFieldProps> = ({
  path,
  value = [],
  onChange,
  readOnly,
  required
}) => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Get other form fields for AI suggestions
  const photographyStyle = useFormFields(([fields]) => fields.photographyStyle?.value)
  const title = useFormFields(([fields]) => fields.title?.value)
  const description = useFormFields(([fields]) => fields.description?.value)
  const locationName = useFormFields(([fields]) => fields.location?.name?.value)
  const gallery = useFormFields(([fields]) => fields.gallery?.value)

  // Generate smart suggestions based on form data
  const generateSuggestions = useCallback(() => {
    const suggestions = new Set<string>()
    
    // Add keywords based on photography style
    if (photographyStyle && PREDEFINED_KEYWORDS[photographyStyle as keyof typeof PREDEFINED_KEYWORDS]) {
      PREDEFINED_KEYWORDS[photographyStyle as keyof typeof PREDEFINED_KEYWORDS].forEach(keyword => suggestions.add(keyword))
    }
    
    // Extract keywords from text fields
    const textFields = [title, description, locationName].filter(Boolean).join(' ')
    const words = textFields.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
    
    // Check for location-based keywords
    LOCATION_KEYWORDS.forEach(keyword => {
      if (textFields.toLowerCase().includes(keyword.toLowerCase())) {
        suggestions.add(keyword)
      }
    })
    
    // Check for lighting keywords
    LIGHTING_KEYWORDS.forEach(keyword => {
      if (textFields.toLowerCase().includes(keyword.toLowerCase())) {
        suggestions.add(keyword)
      }
    })
    
    // Add some common photography keywords
    COMMON_PHOTOGRAPHY_KEYWORDS.slice(0, 3).forEach(keyword => suggestions.add(keyword))
    
    // Remove already selected keywords
    const filtered = Array.from(suggestions).filter(suggestion => 
      !value.some(existing => existing.toLowerCase() === suggestion.toLowerCase())
    )
    
    setSuggestions(filtered.slice(0, 8)) // Limit to 8 suggestions
  }, [photographyStyle, title, description, locationName, value])

  useEffect(() => {
    generateSuggestions()
  }, [generateSuggestions])

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim().toLowerCase()
    if (trimmed && !value.some(existing => existing.toLowerCase() === trimmed) && onChange) {
      onChange([...value, trimmed])
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const removeKeyword = (index: number) => {
    if (onChange) {
      const newValue = value.filter((_, i) => i !== index)
      onChange(newValue)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      processCommaSeparatedInput()
    }
  }

  const processCommaSeparatedInput = () => {
    if (!inputValue.trim() || !onChange) return
    
    // Split by comma and process each keyword
    const keywords = inputValue
      .split(',')
      .map(keyword => keyword.trim().toLowerCase())
      .filter(keyword => keyword.length > 0)
      .filter(keyword => !value.some(existing => existing.toLowerCase() === keyword))
    
    if (keywords.length > 0) {
      // Don't exceed the 20 keyword limit
      const spaceAvailable = 20 - value.length
      const keywordsToAdd = keywords.slice(0, spaceAvailable)
      onChange([...value, ...keywordsToAdd])
      setInputValue('')
    }
  }

  const addAllSuggestions = () => {
    if (!onChange) return
    const newKeywords = suggestions.filter(suggestion => 
      !value.some(existing => existing.toLowerCase() === suggestion.toLowerCase())
    ).slice(0, 20 - value.length) // Don't exceed max limit
    
    onChange([...value, ...newKeywords])
    setSuggestions([])
  }

  if (readOnly) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Keywords</label>
        <div className="flex flex-wrap gap-2">
          {value.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {keyword}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Keywords {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-sm text-gray-500">
          Add keywords for SEO and search. Use commas to separate multiple keywords. Max 20 keywords.
        </div>
      </div>

      {/* Current Keywords */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
          {value.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800">
              <Hash className="w-3 h-3" />
              {keyword}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-red-100 ml-1"
                onClick={() => removeKeyword(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input Field */}
      {value.length < 20 && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Add keywords (separate with commas)..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={processCommaSeparatedInput}
            disabled={!inputValue.trim()}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && value.length < 20 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Lightbulb className="w-4 h-4" />
              Smart Suggestions
            </div>
            {suggestions.length > 3 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAllSuggestions}
                className="text-xs"
              >
                Add All
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                className="text-xs hover:bg-blue-50"
                onClick={() => addKeyword(suggestion)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Keyword Count */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{value.length}/20 keywords used</span>
        {value.length >= 18 && (
          <span className="text-orange-600">
            {value.length >= 20 ? 'Maximum reached' : 'Almost full'}
          </span>
        )}
      </div>
    </div>
  )
}