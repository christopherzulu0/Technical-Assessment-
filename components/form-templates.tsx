'use client'

import Link from 'next/link'
import { ArrowRight, FilePlus, LayoutTemplate } from 'lucide-react'
import { FormFieldDefinition, FormSchemaType } from '@/lib/validators'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type TemplateField = Omit<FormFieldDefinition, 'options'> & {
  options?: string[] | { value: string; label: string }[]
}

export const FORM_TEMPLATES: {
  id: string
  name: string
  description: string
  fields: TemplateField[]
}[] = [
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Simple contact form for customer inquiries',
    fields: [
      { name: 'name', type: 'text', label: 'Full Name', required: true },
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      { name: 'phone', type: 'text', label: 'Phone Number', required: false },
      { name: 'subject', type: 'text', label: 'Subject', required: true },
      { name: 'message', type: 'textarea', label: 'Message', required: true },
    ],
  },
  {
    id: 'survey',
    name: 'Customer Survey',
    description: 'Gather feedback from your customers',
    fields: [
      { name: 'email', type: 'email', label: 'Email', required: true },
      {
        name: 'satisfaction',
        type: 'select',
        label: 'How satisfied are you?',
        required: true,
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
      },
      {
        name: 'likelihood',
        type: 'text',
        label: 'How likely are you to recommend us? (1-10)',
        required: true,
      },
      { name: 'feedback', type: 'textarea', label: 'Additional Feedback', required: false },
    ],
  },
  {
    id: 'registration',
    name: 'Registration Form',
    description: 'User registration and signup',
    fields: [
      { name: 'firstName', type: 'text', label: 'First Name', required: true },
      { name: 'lastName', type: 'text', label: 'Last Name', required: true },
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      { name: 'password', type: 'text', label: 'Password', required: true },
      {
        name: 'terms',
        type: 'checkbox',
        label: 'I agree to the terms and conditions',
        required: true,
      },
    ],
  },
  {
    id: 'application',
    name: 'Job Application',
    description: 'Collect job applications',
    fields: [
      { name: 'fullName', type: 'text', label: 'Full Name', required: true },
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      {
        name: 'position',
        type: 'select',
        label: 'Position Applied For',
        required: true,
        options: ['Software Engineer', 'Product Manager', 'Designer', 'Other'],
      },
      { name: 'experience', type: 'text', label: 'Years of Experience', required: true },
      { name: 'portfolio', type: 'text', label: 'Portfolio URL', required: false },
      { name: 'resume', type: 'text', label: 'Resume Link', required: true },
    ],
  },
  {
    id: 'feedback',
    name: 'Product Feedback',
    description: 'Collect product and feature feedback',
    fields: [
      { name: 'name', type: 'text', label: 'Your Name', required: true },
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      {
        name: 'category',
        type: 'select',
        label: 'Feedback Category',
        required: true,
        options: ['Feature Request', 'Bug Report', 'Improvement', 'General'],
      },
      { name: 'title', type: 'text', label: 'Feedback Title', required: true },
      { name: 'details', type: 'textarea', label: 'Detailed Description', required: true },
      {
        name: 'severity',
        type: 'select',
        label: 'Priority',
        required: false,
        options: ['Low', 'Medium', 'High', 'Critical'],
      },
    ],
  },
  {
    id: 'event-rsvp',
    name: 'Event RSVP',
    description: 'Collect event registrations and RSVPs',
    fields: [
      { name: 'name', type: 'text', label: 'Full Name', required: true },
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      { name: 'phone', type: 'text', label: 'Phone Number', required: true },
      {
        name: 'attending',
        type: 'select',
        label: 'Will you be attending?',
        required: true,
        options: ['Yes', 'No', 'Maybe'],
      },
      { name: 'guests', type: 'text', label: 'Number of Additional Guests', required: false },
      { name: 'dietary', type: 'text', label: 'Dietary Restrictions', required: false },
      { name: 'comments', type: 'textarea', label: 'Any Comments?', required: false },
    ],
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Build your email list and newsletters',
    fields: [
      { name: 'firstName', type: 'text', label: 'First Name', required: true },
      { name: 'lastName', type: 'text', label: 'Last Name', required: true },
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      {
        name: 'interests',
        type: 'select',
        label: 'Interested In',
        required: false,
        options: ['News', 'Tips', 'Promotions', 'All'],
      },
      {
        name: 'frequency',
        type: 'select',
        label: 'Email Frequency',
        required: false,
        options: ['Daily', 'Weekly', 'Monthly'],
      },
    ],
  },
]

function normalizeFieldOptions(
  options?: string[] | { value: string; label: string }[]
): { value: string; label: string }[] | undefined {
  if (!options) return undefined
  return options.map((o) =>
    typeof o === 'string' ? { value: o, label: o } : o
  )
}

export function templateToFormSchema(template: (typeof FORM_TEMPLATES)[number]): FormSchemaType {
  return {
    title: template.name,
    description: template.description,
    fields: template.fields.map((field) => ({
      ...field,
      options: normalizeFieldOptions(field.options),
    })),
  }
}

interface FormTemplatesProps {
  onStartBlank?: () => void
  showBlankOption?: boolean
}

export function FormTemplates({ onStartBlank, showBlankOption = true }: FormTemplatesProps) {
  return (
    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {showBlankOption && onStartBlank && (
        <Card
          className='border-2 border-dashed cursor-pointer hover:border-primary hover:bg-muted/50 transition h-full'
          onClick={onStartBlank}
        >
          <CardContent className='flex flex-col items-center justify-center text-center py-8 h-full'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3'>
              <FilePlus className='w-5 h-5 text-primary' />
            </div>
            <CardTitle className='text-base'>Start blank</CardTitle>
            <CardDescription>Build from scratch</CardDescription>
          </CardContent>
        </Card>
      )}

      {FORM_TEMPLATES.map((template) => (
        <Link href={`/forms/new?template=${template.id}`} key={template.id}>
          <Card className='h-full transition hover:border-primary hover:shadow-sm group'>
            <CardHeader>
              <div className='w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-1'>
                <LayoutTemplate className='w-5 h-5 text-muted-foreground group-hover:text-primary transition' />
              </div>
              <CardTitle className='text-base'>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-1.5 text-sm text-primary font-medium'>
                <span>Use template</span>
                <ArrowRight className='w-4 h-4' />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
