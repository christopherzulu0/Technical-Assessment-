'use client'

import { useState } from 'react'
import { Star, Upload, FileText, Grid3x3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AdvancedFieldProps {
  type: string
  label: string
  required?: boolean
  onChange?: (value: any) => void
}

export function RatingField({ label, required }: AdvancedFieldProps) {
  const [rating, setRating] = useState(0)

  return (
    <div className='space-y-3'>
      <label className='text-sm font-medium text-foreground'>
        {label} {required && <span className='text-destructive'>*</span>}
      </label>
      <div className='flex gap-2'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className='transition-transform hover:scale-110'
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export function MatrixField({ label, required }: AdvancedFieldProps) {
  const rows = ['Option 1', 'Option 2', 'Option 3']
  const columns = ['Poor', 'Fair', 'Good', 'Excellent']

  return (
    <div className='space-y-3'>
      <label className='text-sm font-medium text-foreground'>
        {label} {required && <span className='text-destructive'>*</span>}
      </label>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr>
              <th className='text-left p-2 font-medium'></th>
              {columns.map((col) => (
                <th key={col} className='text-center p-2 font-medium text-muted-foreground'>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className='border-t border-border'>
                <td className='p-2 font-medium text-foreground'>{row}</td>
                {columns.map((col) => (
                  <td key={`${row}-${col}`} className='text-center p-2'>
                    <input
                      type='radio'
                      name={row}
                      value={col}
                      className='w-4 h-4 cursor-pointer'
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function FileUploadField({ label, required }: AdvancedFieldProps) {
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <div className='space-y-3'>
      <label className='text-sm font-medium text-foreground'>
        {label} {required && <span className='text-destructive'>*</span>}
      </label>
      <div className='relative border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group'>
        <div className='space-y-2'>
          <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors'>
            <Upload className='w-6 h-6 text-primary' />
          </div>
          <div>
            <p className='font-medium text-foreground'>
              {fileName ? fileName : 'Drop file here or click to upload'}
            </p>
            <p className='text-xs text-muted-foreground mt-1'>Max file size: 10MB</p>
          </div>
        </div>
        <input
          type='file'
          className='absolute inset-0 opacity-0 cursor-pointer'
          onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
        />
      </div>
    </div>
  )
}

export function RichTextField({ label, required }: AdvancedFieldProps) {
  const [content, setContent] = useState('')

  return (
    <div className='space-y-3'>
      <label className='text-sm font-medium text-foreground'>
        {label} {required && <span className='text-destructive'>*</span>}
      </label>
      <div className='border border-border rounded-lg overflow-hidden'>
        <div className='flex gap-1 p-2 bg-muted/50 border-b border-border flex-wrap'>
          {['B', 'I', 'U'].map((btn) => (
            <button
              key={btn}
              className='px-3 py-1.5 text-sm font-medium hover:bg-background rounded transition-colors'
            >
              {btn}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='Enter your response...'
          rows={6}
          className='w-full p-3 focus:outline-none resize-none'
        />
      </div>
    </div>
  )
}

export function SliderField({ label, required }: AdvancedFieldProps) {
  const [value, setValue] = useState(50)

  return (
    <div className='space-y-4'>
      <label className='text-sm font-medium text-foreground'>
        {label} {required && <span className='text-destructive'>*</span>}
      </label>
      <div className='space-y-3'>
        <input
          type='range'
          min='0'
          max='100'
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className='w-full h-2 bg-border rounded-lg appearance-none cursor-pointer'
          style={{
            background: `linear-gradient(to right, rgb(85, 112, 247) 0%, rgb(85, 112, 247) ${value}%, var(--color-border) ${value}%, var(--color-border) 100%)`,
          }}
        />
        <div className='flex justify-between text-xs text-muted-foreground'>
          <span>0</span>
          <span className='font-medium text-foreground'>{value}</span>
          <span>100</span>
        </div>
      </div>
    </div>
  )
}
