'use client'
import React, { useState } from 'react'
import { Badge } from '@/components/ui/base/badge'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/base/input'
import { X, Plus, Tag, ChevronDown, ChevronUp } from 'lucide-react'

const PREDEFINED_TAGS = [
  'featured',
  'portfolio', 
  'prints-available',
  'licensed',
  'award-winning',
  'exhibition',
  'editorial',
  'commercial',
  'personal-project',
  'client-work',
  'stock-photo',
  'fine-art',
  'documentary',
  'conceptual',
  'experimental',
  'black-and-white',
  'color',
  'high-resolution',
  'limited-edition',
  'signature-piece'
]

interface TagFieldProps {
  path: string
  value?: string[]
  onChange?: (value: string[]) => void
  readOnly?: boolean
}

export const TagField: React.FC<TagFieldProps> = ({
  path,
  value = [],
  onChange,
  readOnly
}) => {
  const [inputValue, setInputValue] = useState('')
  const [showPresets, setShowPresets] = useState(false)

  const availablePresets = PREDEFINED_TAGS.filter(preset => 
    !value.some(existing => existing.toLowerCase() === preset.toLowerCase())
  )

  const addTag = (tag: string) => {
    const formatted = tag.trim().toLowerCase().replace(/\s+/g, '-')
    if (formatted && !value.some(existing => existing === formatted) && onChange) {
      onChange([...value, formatted])
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    if (onChange) {
      onChange(value.filter((_, i) => i !== index))
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
    
    // Split by comma and process each tag
    const tags = inputValue
      .split(',')
      .map(tag => tag.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(tag => tag.length > 0)
      .filter(tag => !value.some(existing => existing === tag))
    
    if (tags.length > 0) {
      // Don't exceed the 15 tag limit
      const spaceAvailable = 15 - value.length
      const tagsToAdd = tags.slice(0, spaceAvailable)
      onChange([...value, ...tagsToAdd])
      setInputValue('')
    }
  }

  if (readOnly) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Tags</label>
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Tags</label>
        <div className="text-sm text-gray-500">
          Organizational tags for categorization and filtering. Use commas to separate multiple tags. Max 15 tags.
        </div>
      </div>

      {/* Current Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
          {value.map((tag, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
              <Tag className="w-3 h-3" />
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-red-100 ml-1"
                onClick={() => removeTag(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input Field */}
      {value.length < 15 && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Add tags (separate with commas)..."
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

          {/* Preset Tags Toggle */}
          {availablePresets.length > 0 && (
            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPresets(!showPresets)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {showPresets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showPresets ? 'Hide' : 'Show'} Common Tags ({availablePresets.length})
              </Button>
              
              {showPresets && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 mb-2">
                    Click to add commonly used tags:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availablePresets.map((preset, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs hover:bg-green-50 hover:border-green-300"
                        onClick={() => addTag(preset)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {preset}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tag Count and Status */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{value.length}/15 tags used</span>
        {value.length >= 12 && (
          <span className="text-orange-600">
            {value.length >= 15 ? 'Maximum reached' : 'Almost full'}
          </span>
        )}
      </div>

      {/* Quick Info */}
      {value.length === 0 && (
        <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded border">
          💡 Tip: Tags help organize your images and make them easier to find. Use tags like "featured", "portfolio", or "prints-available" for better organization.
        </div>
      )}
    </div>
  )
}