import { NotificationForm } from '@/components/features/settings/NotificationForm'

export const metadata = {
  title: 'Notifications | Cru',
}

export default function NotificationSettingsPage() {
  // TODO: Fetch real notification preferences from DAL
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Control how and when we reach out.
        </p>
      </div>

      <NotificationForm initialFrequency="weekly" />
    </div>
  )
}
