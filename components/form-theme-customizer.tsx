'use client'

import { useState } from 'react'
import { Palette, Type, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const COLOR_PRESETS = [
  { name: 'Modern Blue', primary: '#5570F7', bg: '#F8F9FE' },
  { name: 'Ocean', primary: '#0EA5E9', bg: '#F0F9FF' },
  { name: 'Forest', primary: '#059669', bg: '#F0FDF4' },
  { name: 'Sunset', primary: '#EA580C', bg: '#FEF3C7' },
  { name: 'Grape', primary: '#7C3AED', bg: '#FAF5FF' },
  { name: 'Rose', primary: '#E11D48', bg: '#FFF1F2' },
]

const FONT_SIZES = [
  { name: 'Small', value: 'sm' },
  { name: 'Normal', value: 'base' },
  { name: 'Large', value: 'lg' },
  { name: 'Extra Large', value: 'xl' },
]

interface FormTheme {
  primaryColor: string
  backgroundColor: string
  fontSize: string
  buttonStyle: 'solid' | 'outline' | 'ghost'
}

interface FormThemeCustomizerProps {
  onThemeChange?: (theme: FormTheme) => void
  initialTheme?: FormTheme
}

export function FormThemeCustomizer({ onThemeChange, initialTheme }: FormThemeCustomizerProps) {
  const [theme, setTheme] = useState<FormTheme>(
    initialTheme || {
      primaryColor: '#5570F7',
      backgroundColor: '#F8F9FE',
      fontSize: 'base',
      buttonStyle: 'solid',
    }
  )

  const handleThemeChange = (newTheme: Partial<FormTheme>) => {
    const updated = { ...theme, ...newTheme }
    setTheme(updated)
    onThemeChange?.(updated)
  }

  return (
    <div className='space-y-6'>
      {/* Color Presets */}
      <Card className='border-border/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Palette className='w-5 h-5' />
            Color Presets
          </CardTitle>
          <CardDescription>Choose a color scheme for your form</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() =>
                  handleThemeChange({
                    primaryColor: preset.primary,
                    backgroundColor: preset.bg,
                  })
                }
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme.primaryColor === preset.primary
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <div
                    className='w-6 h-6 rounded'
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span className='text-sm font-medium text-foreground truncate'>
                    {preset.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card className='border-border/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Palette className='w-5 h-5' />
            Custom Colors
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-foreground block mb-2'>
              Primary Color
            </label>
            <div className='flex gap-2'>
              <input
                type='color'
                value={theme.primaryColor}
                onChange={(e) => handleThemeChange({ primaryColor: e.target.value })}
                className='w-12 h-10 rounded-lg cursor-pointer border border-border'
              />
              <input
                type='text'
                value={theme.primaryColor}
                onChange={(e) => handleThemeChange({ primaryColor: e.target.value })}
                className='flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
              />
            </div>
          </div>
          <div>
            <label className='text-sm font-medium text-foreground block mb-2'>
              Background Color
            </label>
            <div className='flex gap-2'>
              <input
                type='color'
                value={theme.backgroundColor}
                onChange={(e) => handleThemeChange({ backgroundColor: e.target.value })}
                className='w-12 h-10 rounded-lg cursor-pointer border border-border'
              />
              <input
                type='text'
                value={theme.backgroundColor}
                onChange={(e) => handleThemeChange({ backgroundColor: e.target.value })}
                className='flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className='border-border/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Type className='w-5 h-5' />
            Typography
          </CardTitle>
          <CardDescription>Adjust text size for better readability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <label className='text-sm font-medium text-foreground block'>Font Size</label>
            <div className='grid grid-cols-2 gap-2'>
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleThemeChange({ fontSize: size.value })}
                  className={`p-2 rounded-lg border transition-all text-sm font-medium ${
                    theme.fontSize === size.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button Style */}
      <Card className='border-border/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            Button Style
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-3'>
            {(['solid', 'outline', 'ghost'] as const).map((style) => (
              <button
                key={style}
                onClick={() => handleThemeChange({ buttonStyle: style })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  theme.buttonStyle === style
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className='capitalize text-sm font-medium text-foreground'>{style}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className='border-border/50 overflow-hidden'>
        <CardHeader className='bg-muted/30'>
          <CardTitle className='text-lg'>Preview</CardTitle>
        </CardHeader>
        <CardContent className='p-6' style={{ backgroundColor: theme.backgroundColor }}>
          <div className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-foreground block mb-2'>
                Sample Question
              </label>
              <input
                type='text'
                placeholder='Your answer here...'
                className='w-full px-3 py-2 border border-border/50 rounded-lg text-sm focus:outline-none'
              />
            </div>
            <button
              style={{
                backgroundColor:
                  theme.buttonStyle === 'solid' ? theme.primaryColor : 'transparent',
                color: theme.buttonStyle === 'solid' ? 'white' : theme.primaryColor,
                borderColor: theme.primaryColor,
              }}
              className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                theme.buttonStyle === 'outline' ? 'border-2' : ''
              }`}
            >
              Submit Form
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
