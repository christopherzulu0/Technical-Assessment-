'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, ChevronRight } from 'lucide-react'

// Breadcrumb Component
interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className='flex items-center gap-1 text-sm mb-6'>
      {items.map((item, index) => (
        <div key={index} className='flex items-center gap-1'>
          {index > 0 && <ChevronRight className='w-4 h-4 text-muted-foreground' />}
          {item.href || item.onClick ? (
            <button
              onClick={item.onClick}
              className='text-primary hover:underline font-medium'
            >
              {item.label}
            </button>
          ) : (
            <span className='text-foreground font-medium'>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Toast Notification Component
interface ToastProps {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }

  const icons = {
    success: <CheckCircle className='w-5 h-5 text-green-600' />,
    error: <AlertCircle className='w-5 h-5 text-red-600' />,
    info: <Info className='w-5 h-5 text-blue-600' />,
    warning: <AlertCircle className='w-5 h-5 text-yellow-600' />,
  }

  return (
    <div
      className={`border rounded-lg p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300 ${colors[type]}`}
    >
      {icons[type]}
      <div className='flex-1'>
        <p className='font-medium text-foreground'>{title}</p>
        {message && <p className='text-sm text-muted-foreground mt-1'>{message}</p>}
      </div>
      <button onClick={() => onClose(id)} className='text-muted-foreground hover:text-foreground'>
        <X className='w-4 h-4' />
      </button>
    </div>
  )
}

// Toast Container
interface ToastContainerProps {
  toasts: ToastProps[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className='fixed bottom-4 right-4 space-y-3 z-50 pointer-events-auto'>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  )
}

// Skeleton Loader
export function SkeletonLoader() {
  return (
    <div className='space-y-4'>
      {[1, 2, 3].map((i) => (
        <div key={i} className='space-y-3'>
          <div className='h-4 bg-muted rounded-lg w-32 animate-pulse' />
          <div className='h-10 bg-muted rounded-lg animate-pulse' />
        </div>
      ))}
    </div>
  )
}

// Stats Card with Skeleton
interface StatsCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  loading?: boolean
}

export function StatsCard({ label, value, icon, loading }: StatsCardProps) {
  if (loading) {
    return (
      <div className='bg-card border border-border rounded-lg p-6 space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='h-4 bg-muted rounded w-24 animate-pulse' />
          <div className='w-8 h-8 bg-muted rounded animate-pulse' />
        </div>
        <div className='h-8 bg-muted rounded w-16 animate-pulse' />
      </div>
    )
  }

  return (
    <div className='bg-card border border-border/50 rounded-lg p-6 hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-medium text-muted-foreground'>{label}</span>
        <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center'>
          {icon}
        </div>
      </div>
      <p className='text-2xl font-bold text-foreground mt-3'>{value}</p>
    </div>
  )
}

// Drag and Drop Preview
interface DragDropPreviewProps {
  onFileSelected?: (file: File) => void
  acceptedFormats?: string
}

export function DragDropPreview({
  onFileSelected,
  acceptedFormats = '.json',
}: DragDropPreviewProps) {
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        const files = e.dataTransfer.files
        if (files.length > 0) {
          onFileSelected?.(files[0])
        }
      }}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
      }`}
    >
      <div className='space-y-2'>
        <p className='font-medium text-foreground'>Drop your form here</p>
        <p className='text-xs text-muted-foreground'>
          Supported formats: {acceptedFormats}
        </p>
      </div>
    </div>
  )
}

// Tabs Component
interface TabProps {
  label: string
  value: string
  badge?: number
}

interface TabsProps {
  tabs: TabProps[]
  activeTab: string
  onTabChange: (value: string) => void
  children?: React.ReactNode
}

export function Tabs({ tabs, activeTab, onTabChange, children }: TabsProps) {
  return (
    <div className='space-y-4'>
      <div className='border-b border-border overflow-x-auto'>
        <div className='flex gap-1'>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.value
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className='ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full'>
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.value && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />
              )}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}
