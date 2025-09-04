import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue to Gary Hormozi Pro</p>
        </div>
        <SignIn 
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
            Existing users with email/password accounts can{' '}
            <a href="/login" className="text-primary hover:underline">
              sign in here
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
