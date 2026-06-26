import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center py-12 px-4'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary mb-4'>
            <span className='text-white font-bold text-xl'>FB</span>
          </div>
          <h1 className='text-3xl font-bold text-foreground mb-2'>Start Building Forms</h1>
          <p className='text-muted-foreground'>Join thousands of creators using FormBuilder</p>
        </div>

        <div className='bg-white rounded-lg shadow-lg border border-border/50 p-8'>
          <SignUp 
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0 bg-transparent',
                headerTitle: 'text-2xl font-bold text-foreground',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton: 'bg-muted hover:bg-muted/80 text-foreground border-0',
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-white',
                footerActionLink: 'text-primary hover:text-primary/90',
                dividerLine: 'bg-border',
                dividerText: 'text-muted-foreground text-sm',
                formFieldInput: 'border-border focus:border-primary focus:ring-primary',
                formFieldLabel: 'text-foreground font-medium',
              },
            }}
            redirectUrl="/onboarding"
          />
        </div>
      </div>
    </div>
  )
}
