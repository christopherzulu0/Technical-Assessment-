import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AuthHeaderActions } from '@/components/auth-header-actions'

interface SiteHeaderProps {
  title?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  className?: string
  containerClassName?: string
  showAuth?: boolean
}

export function SiteHeader({
  title,
  backHref = '/',
  backLabel,
  actions,
  className,
  containerClassName = 'max-w-7xl',
  showAuth = false,
}: SiteHeaderProps) {
  return (
    <nav
      className={cn(
        'border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4',
          containerClassName
        )}
      >
        <div className='flex items-center gap-4 min-w-0'>
          {backLabel ? (
            <Link
              href={backHref}
              className='text-primary hover:opacity-80 font-medium text-sm shrink-0 transition-opacity'
            >
              ← {backLabel}
            </Link>
          ) : (
            <Link href='/' className='flex items-center gap-2 shrink-0 group'>
              <div className='w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow'>
                <span className='text-primary-foreground font-bold text-sm'>FB</span>
              </div>
              <span className='font-bold text-foreground hidden sm:inline text-lg'>FormBuilder</span>
            </Link>
          )}
        </div>

        {title && (
          <h1 className='text-sm font-semibold text-foreground truncate flex-1 text-center'>{title}</h1>
        )}

        <div className='flex items-center gap-3 shrink-0'>
          {actions}
          {showAuth && <AuthHeaderActions />}
        </div>
      </div>
    </nav>
  )
}
