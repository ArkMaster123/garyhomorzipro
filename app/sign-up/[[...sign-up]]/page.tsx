import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground">Sign up to get started with Gary Hormozi Pro</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
              card: 'bg-card text-card-foreground shadow-lg border',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'border border-input bg-background hover:bg-accent',
              socialButtonsBlockButtonText: 'text-foreground',
              formFieldInput: 'bg-background border-input text-foreground',
              footerActionLink: 'text-primary hover:text-primary/80',
            },
          }}
          redirectUrl="/chat"
        />
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Prefer traditional sign up?{' '}
            <a href="/register" className="text-primary hover:underline">
              Use email & password
            </a>
            {' '}or{' '}
            <a href="/login" className="text-primary hover:underline">
              continue as guest
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
