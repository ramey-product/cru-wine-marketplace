// TODO: Check retailer member role — staff should only see the Notifications section.
//       Owner/manager see all sections. Fetch membership role from the session and
//       conditionally render StoreInfoForm, FulfillmentSettingsForm, and PosConnectionStatus.
// TODO: Replace mock data below with real getRetailerSettings and
//       getNotificationPreferences DAL calls once the backend is integrated.

import { Separator } from '@/components/ui/separator'
import { StoreInfoForm, type StoreInfoData } from '@/components/features/retailer/StoreInfoForm'
import { FulfillmentSettingsForm, type FulfillmentSettingsData } from '@/components/features/retailer/FulfillmentSettingsForm'
import { PosConnectionStatus } from '@/components/features/retailer/PosConnectionStatus'
import { NotificationPreferencesForm, type NotificationPreferencesData } from '@/components/features/retailer/NotificationPreferencesForm'

// ---------------------------------------------------------------------------
// Mock data — replace with DAL calls
// ---------------------------------------------------------------------------

const mockStoreInfo: StoreInfoData = {
  storeName: 'Wine House LA',
  street: '456 Vine Street',
  city: 'Los Angeles',
  state: 'CA',
  zip: '90028',
  phone: '(323) 555-0142',
  email: 'orders@winehousela.com',
  hours: {
    monday:    { open: '10:00', close: '21:00', closed: false },
    tuesday:   { open: '10:00', close: '21:00', closed: false },
    wednesday: { open: '10:00', close: '21:00', closed: false },
    thursday:  { open: '10:00', close: '21:00', closed: false },
    friday:    { open: '10:00', close: '21:00', closed: false },
    saturday:  { open: '10:00', close: '21:00', closed: false },
    sunday:    { open: '11:00', close: '19:00', closed: false },
  },
}

const mockFulfillment: FulfillmentSettingsData = {
  pickupEnabled: true,
  deliveryEnabled: true,
  deliveryRadiusMiles: 10,
  deliveryFeeDollars: 9.99,
  estimatedDeliveryMinutes: 45,
}

const mockNotifications: NotificationPreferencesData = {
  newOrderEmail: true,
  dailySummaryEmail: false,
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function RetailerSettingsPage() {
  return (
    <div className="space-y-10 pb-16">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your store details, fulfillment options, POS integration, and notification
          preferences.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Section 1: Store Information                                        */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="section-store-info">
        <div className="mb-4">
          <h3 id="section-store-info" className="text-base font-semibold">
            Store Information
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your store name, address, contact details, and hours of operation displayed to
            customers.
          </p>
        </div>
        <StoreInfoForm initialData={mockStoreInfo} />
      </section>

      <Separator />

      {/* ------------------------------------------------------------------ */}
      {/* Section 2: Fulfillment                                              */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="section-fulfillment">
        <div className="mb-4">
          <h3 id="section-fulfillment" className="text-base font-semibold">
            Fulfillment
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure how customers can receive their orders — pickup, delivery, or both.
          </p>
        </div>
        <FulfillmentSettingsForm initialData={mockFulfillment} />
      </section>

      <Separator />

      {/* ------------------------------------------------------------------ */}
      {/* Section 3: POS Connection                                           */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="section-pos">
        <div className="mb-4">
          <h3 id="section-pos" className="text-base font-semibold">
            POS Connection
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your point-of-sale integration keeps inventory and orders in sync automatically.
          </p>
        </div>
        <PosConnectionStatus
          connectionType="Lightspeed"
          lastSync={new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()}
          status="connected"
        />
      </section>

      <Separator />

      {/* ------------------------------------------------------------------ */}
      {/* Section 4: Notifications                                            */}
      {/* ------------------------------------------------------------------ */}
      <section aria-labelledby="section-notifications">
        <div className="mb-4">
          <h3 id="section-notifications" className="text-base font-semibold">
            Notifications
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose which email notifications you want to receive for your store activity.
          </p>
        </div>
        <NotificationPreferencesForm initialData={mockNotifications} />
      </section>
    </div>
  )
}
