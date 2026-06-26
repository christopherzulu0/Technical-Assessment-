'use client'

import { useState } from 'react'
import { FormFieldDefinition, FormSchemaType } from '@/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Trash2, Plus, FormInput } from 'lucide-react'
import { cn, nativeSelectClassName } from '@/lib/utils'

interface FormBuilderProps {
  initialForm?: FormSchemaType
  onSave: (form: FormSchemaType) => Promise<void>
  isLoading?: boolean
}

function optionsToLines(options?: { value: string; label: string }[]): string {
  if (!options?.length) return ''
  return options.map((o) => o.label || o.value).join('\n')
}

function linesToOptions(text: string): { value: string; label: string }[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ value: line, label: line }))
}

export function FormBuilder({
  initialForm,
  onSave,
  isLoading = false,
}: FormBuilderProps) {
  const [title, setTitle] = useState(initialForm?.title || '')
  const [description, setDescription] = useState(initialForm?.description || '')
  const [fields, setFields] = useState<FormFieldDefinition[]>(
    initialForm?.fields || []
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addField = () => {
    const newField: FormFieldDefinition = {
      name: `field_${fields.length + 1}`,
      type: 'text',
      label: `Field ${fields.length + 1}`,
      required: false,
    }
    setFields([...fields, newField])
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const updateField = (index: number, updates: Partial<FormFieldDefinition>) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], ...updates }
    setFields(newFields)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        title,
        description: description || undefined,
        fields,
      })
    } catch (error: any) {
      setErrors({
        submit: error.message || 'Failed to save form',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col min-h-[60vh]'>
      <div className='flex-1 space-y-6 pb-24'>
        <section className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='form-title'>
              Form title <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='form-title'
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setErrors((prev) => {
                  const next = { ...prev }
                  delete next.title
                  return next
                })
              }}
              aria-invalid={!!errors.title}
              placeholder='e.g. Customer feedback'
            />
            {errors.title && (
              <p className='text-sm text-destructive'>{errors.title}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='form-description'>Description</Label>
            <Textarea
              id='form-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Optional description shown to respondents'
              rows={2}
            />
          </div>
        </section>

        <section className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-foreground uppercase tracking-wide'>
              Fields
            </h2>
            {fields.length > 0 && (
              <span className='text-xs text-muted-foreground'>
                {fields.length} field{fields.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {fields.length === 0 && (
            <Card className='border-2 border-dashed border-border/50 bg-gradient-to-br from-muted/30 to-muted/10 hover:border-primary/30 transition-colors'>
              <CardContent className='py-12 text-center'>
                <div className='w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4'>
                  <FormInput className='w-7 h-7 text-primary' />
                </div>
                <CardTitle className='mb-2 text-lg'>No fields yet</CardTitle>
                <CardDescription className='mb-6 text-base'>
                  Add fields to collect responses, or save now and add them later.
                </CardDescription>
                <Button type='button' onClick={addField} className='bg-primary hover:bg-primary/90'>
                  <Plus className='w-4 h-4 mr-2' />
                  Add your first field
                </Button>
              </CardContent>
            </Card>
          )}

          {fields.map((field, index) => (
            <Card key={index} className='border-border/50 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md'>
              <CardHeader className='bg-gradient-to-r from-muted/30 to-transparent border-b border-border/30'>
                <CardTitle className='text-sm text-muted-foreground font-semibold'>
                  Field {index + 1}
                </CardTitle>
                <CardAction>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    onClick={() => removeField(index)}
                    className='text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Field name</Label>
                    <Input
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      placeholder='field_name'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Type</Label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(index, {
                          type: e.target.value as FormFieldDefinition['type'],
                        })
                      }
                      className={nativeSelectClassName}
                    >
                      <option value='text'>Text</option>
                      <option value='email'>Email</option>
                      <option value='number'>Number</option>
                      <option value='textarea'>Textarea</option>
                      <option value='select'>Select</option>
                      <option value='checkbox'>Checkbox</option>
                      <option value='date'>Date</option>
                    </select>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder='Label shown to users'
                  />
                </div>

                {field.type === 'select' && (
                  <div className='space-y-2'>
                    <Label>Options</Label>
                    <Textarea
                      value={optionsToLines(field.options)}
                      onChange={(e) =>
                        updateField(index, { options: linesToOptions(e.target.value) })
                      }
                      className='font-mono text-xs'
                      placeholder={'Option 1\nOption 2\nOption 3'}
                      rows={4}
                    />
                    <p className='text-xs text-muted-foreground'>One option per line</p>
                  </div>
                )}

                <div className='grid sm:grid-cols-2 gap-4 items-end'>
                  <div className='space-y-2'>
                    <Label>Placeholder</Label>
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) =>
                        updateField(index, { placeholder: e.target.value })
                      }
                      placeholder='Optional placeholder'
                    />
                  </div>
                  <label className='flex items-center gap-2 h-8 px-1'>
                    <input
                      type='checkbox'
                      checked={field.required || false}
                      onChange={(e) =>
                        updateField(index, { required: e.target.checked })
                      }
                      className='size-4 rounded border-input accent-primary'
                    />
                    <span className='text-sm text-foreground'>Required field</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}

          {fields.length > 0 && (
            <Button
              type='button'
              variant='outline'
              onClick={addField}
              className='w-full border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors'
            >
              <Plus className='w-4 h-4 mr-2' />
              Add another field
            </Button>
          )}
        </section>

        {errors.submit && (
          <Alert variant='destructive'>
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />
      <div className='sticky bottom-0 -mx-6 px-6 py-4 bg-card/95 backdrop-blur'>
        <Button
          type='submit'
          disabled={isSubmitting || isLoading}
          size='lg'
          className='w-full sm:w-auto min-w-[140px]'
        >
          {isSubmitting || isLoading ? 'Saving...' : 'Save form'}
        </Button>
      </div>
    </form>
  )
}
