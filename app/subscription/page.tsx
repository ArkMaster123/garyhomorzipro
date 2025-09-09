import { auth } from '@/app/(auth)/auth'
import { SubscriptionStatus } from '@/components/subscription-status'
import { redirect } from 'next/navigation'

export default async function SubscriptionPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>
        <SubscriptionStatus userId={session.user.id} />
      </div>
    </div>
  )
}
