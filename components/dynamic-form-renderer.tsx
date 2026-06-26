'use client'

import { useState } from 'react'
import { FormSchemaType } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { nativeSelectClassName } from '@/lib/utils'

interface DynamicFormRendererProps {
  formDef: FormSchemaType
  onSubmit: (data: Record<string, any>) => Promise<void>
  isLoading?: boolean
}

export function DynamicFormRenderer({
  formDef,
  onSubmit,
  isLoading = false,
}: DynamicFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error: any) {
      if (error.details) {
        setErrors(error.details)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {formDef.fields.map((field) => (
        <div key={field.name} className='space-y-2'>
          {field.type !== 'checkbox' && (
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className='text-destructive ml-1'>*</span>}
            </Label>
          )}

          {field.type === 'text' && (
            <Input
              id={field.name}
              type='text'
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              aria-invalid={!!errors[field.name]}
            />
          )}

          {field.type === 'email' && (
            <Input
              id={field.name}
              type='email'
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              aria-invalid={!!errors[field.name]}
            />
          )}

          {field.type === 'number' && (
            <Input
              id={field.name}
              type='number'
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) =>
                handleInputChange(
                  field.name,
                  e.target.value ? parseFloat(e.target.value) : ''
                )
              }
              aria-invalid={!!errors[field.name]}
            />
          )}

          {field.type === 'textarea' && (
            <Textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              rows={4}
              aria-invalid={!!errors[field.name]}
            />
          )}

          {field.type === 'checkbox' && (
            <label className='flex items-center gap-2'>
              <input
                type='checkbox'
                name={field.name}
                checked={formData[field.name] || false}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                className='size-4 rounded border-input accent-primary'
              />
              <span className='text-sm text-foreground'>
                {field.label}
                {field.required && <span className='text-destructive ml-1'>*</span>}
              </span>
            </label>
          )}

          {field.type === 'select' && (
            <select
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={nativeSelectClassName}
              aria-invalid={!!errors[field.name]}
            >
              <option value=''>Select an option</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {field.type === 'date' && (
            <Input
              id={field.name}
              type='date'
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              aria-invalid={!!errors[field.name]}
            />
          )}

          {errors[field.name] && (
            <p className='text-sm text-destructive'>{errors[field.name]}</p>
          )}
        </div>
      ))}

      <Button type='submit' disabled={isSubmitting || isLoading} size='lg' className='w-full'>
        {isSubmitting || isLoading ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  )
}
