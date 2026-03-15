import { DeleteAccountDialog } from '@/components/features/settings/DeleteAccountDialog'
import { AccountFieldRow } from '@/components/features/settings/AccountFieldRow'
import { ConnectedServices } from '@/components/features/settings/ConnectedServices'

export const metadata = {
  title: 'Account | Cru',
}

// TODO: Replace with real session/profile data from DAL
const MOCK_ACCOUNT = {
  name: 'Wine Explorer',
  email: 'user@example.com',
}

export default function AccountSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium">Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your credentials and linked services.
        </p>
      </div>

      {/* Account fields */}
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {/* Name */}
        <AccountFieldRow
          label="Name"
          fieldId="account-name"
          type="name"
          currentValue={MOCK_ACCOUNT.name}
        />

        {/* Email */}
        <AccountFieldRow
          label="Email"
          fieldId="account-email"
          type="email"
          currentValue={MOCK_ACCOUNT.email}
          actionLabel="Change"
        />

        {/* Password */}
        <AccountFieldRow
          label="Password"
          fieldId="account-password"
          type="password"
          currentValue="••••••••"
          actionLabel="Change"
        />
      </div>

      {/* Connected services */}
      <ConnectedServices />

      {/* Danger zone — left-border only per Design Bible §9.12 */}
      <div className="border-l-4 border-destructive/20 pl-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-destructive">Danger zone</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Permanently delete your Cru account and all associated data. This
            action cannot be reversed.
          </p>
        </div>
        <DeleteAccountDialog />
      </div>
    </div>
  )
}
