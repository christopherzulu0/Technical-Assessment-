import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-4xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
}

export function PageContainer({
  children,
  size = 'lg',
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8 py-8',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  )
}
