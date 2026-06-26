import Ajv, { JSONSchemaType } from 'ajv'
import addFormats from 'ajv-formats'
import { z } from 'zod'

const ajv = new Ajv()
addFormats(ajv)

export interface FormFieldDefinition {
  name: string
  type: 'text' | 'email' | 'number' | 'checkbox' | 'select' | 'textarea' | 'date'
  label: string
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
}

export interface FormSchema {
  title: string
  description?: string
  fields: FormFieldDefinition[]
}

// Validation schemas
export const formSchemaValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      name: z.string().min(1),
      type: z.enum(['text', 'email', 'number', 'checkbox', 'select', 'textarea', 'date']),
      label: z.string().min(1),
      required: z.boolean().optional(),
      placeholder: z.string().optional(),
      options: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
          })
        )
        .optional(),
      validation: z
        .object({
          minLength: z.number().optional(),
          maxLength: z.number().optional(),
          pattern: z.string().optional(),
          min: z.number().optional(),
          max: z.number().optional(),
        })
        .optional(),
    })
  ),
})

export type FormSchemaType = z.infer<typeof formSchemaValidation>

// Generate JSON Schema from form definition
export function generateJsonSchema(formDef: FormSchemaType): Record<string, any> {
  const properties: Record<string, any> = {}
  const required: string[] = []

  for (const field of formDef.fields) {
    const fieldSchema: Record<string, any> = {}

    switch (field.type) {
      case 'email':
        fieldSchema.type = 'string'
        fieldSchema.format = 'email'
        break
      case 'number':
        fieldSchema.type = 'number'
        if (field.validation?.min !== undefined) fieldSchema.minimum = field.validation.min
        if (field.validation?.max !== undefined) fieldSchema.maximum = field.validation.max
        break
      case 'checkbox':
        fieldSchema.type = 'boolean'
        break
      case 'select':
        fieldSchema.type = 'string'
        if (field.options) {
          fieldSchema.enum = field.options.map((o) => o.value)
        }
        break
      case 'date':
        fieldSchema.type = 'string'
        fieldSchema.format = 'date'
        break
      case 'textarea':
      case 'text':
      default:
        fieldSchema.type = 'string'
        if (field.validation?.minLength !== undefined)
          fieldSchema.minLength = field.validation.minLength
        if (field.validation?.maxLength !== undefined)
          fieldSchema.maxLength = field.validation.maxLength
        if (field.validation?.pattern) fieldSchema.pattern = field.validation.pattern
    }

    properties[field.name] = fieldSchema

    if (field.required) {
      required.push(field.name)
    }
  }

  return {
    type: 'object',
    properties,
    required,
    additionalProperties: false,
  }
}

// Validate form submission data
export function validateFormSubmission(
  schema: Record<string, any>,
  data: Record<string, any>
): { valid: boolean; errors: Record<string, string> } {
  const validate = ajv.compile(schema)
  const valid = validate(data)

  if (valid) {
    return { valid: true, errors: {} }
  }

  const errors: Record<string, string> = {}
  if (validate.errors) {
    for (const error of validate.errors) {
      const fieldName = error.instancePath ? error.instancePath.replace(/^\//, '') : 'root'
      errors[fieldName] = error.message || 'Invalid value'
    }
  }

  return { valid: false, errors }
}
