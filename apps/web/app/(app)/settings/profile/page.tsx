import { ProfileForm } from '@/components/features/settings/ProfileForm'

export const metadata = {
  title: 'Profile Settings | Cru',
}

// TODO: Fetch real profile data from DAL
const MOCK_PROFILE = {
  displayName: 'Wine Explorer',
  username: 'wineexplorer',
  bio: '',
  isPublic: true,
}

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage how you appear to other users on Cru.
        </p>
      </div>

      <ProfileForm initialData={MOCK_PROFILE} />
    </div>
  )
}
