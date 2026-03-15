import { PrivacyForm } from '@/components/features/settings/PrivacyForm'

export const metadata = {
  title: 'Privacy | Cru',
}

// TODO: Replace with real profile visibility from DAL
const MOCK_PRIVACY = {
  isPublic: true,
}

export default function PrivacySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Privacy</h2>
        <p className="text-sm text-muted-foreground">
          Control who can see your profile and activity on Cru.
        </p>
      </div>

      <PrivacyForm initialData={MOCK_PRIVACY} />
    </div>
  )
}
