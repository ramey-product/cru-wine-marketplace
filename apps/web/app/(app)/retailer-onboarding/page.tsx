import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from '@/components/features/retailer-onboarding/OnboardingWizard'

export const metadata = {
  title: 'Retailer Onboarding | Cru Wine Marketplace',
  description: 'Set up your wine store on the Cru marketplace',
}

export default async function RetailerOnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome to Cru
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Let&apos;s get your store set up on the marketplace.
        </p>
      </div>
      <OnboardingWizard />
    </div>
  )
}
