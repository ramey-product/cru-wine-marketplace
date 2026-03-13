import { DeleteAccountDialog } from '@/components/features/settings/DeleteAccountDialog'

export const metadata = {
  title: 'Account | Cru',
}

export default function AccountSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium">Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account and data.
        </p>
      </div>

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/30 p-6 space-y-4">
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
