'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ProfileActivityTab } from './ProfileActivityTab'
import { ProfileWishlistTab } from './ProfileWishlistTab'
import { ProfileTasteProfileTab } from './ProfileTasteProfileTab'

const TABS = [
  { key: 'activity', label: 'Activity' },
  { key: 'wishlist', label: 'Wishlist' },
  { key: 'taste-profile', label: 'Taste Profile' },
] as const

type TabKey = (typeof TABS)[number]['key']

function isValidTab(value: string | null): value is TabKey {
  return TABS.some((tab) => tab.key === value)
}

interface ProfileTabsProps {
  username: string
}

export function ProfileTabs({ username }: ProfileTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const rawTab = searchParams.get('tab')
  const activeTab: TabKey = isValidTab(rawTab) ? rawTab : 'activity'

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'activity') {
        params.delete('tab')
      } else {
        params.set('tab', tab)
      }
      const query = params.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  return (
    <div className="space-y-6">
      {/* Tab list */}
      <div
        role="tablist"
        aria-label={`${username}'s profile sections`}
        className="flex gap-6 border-b border-border"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'relative pb-3 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-sm',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTab === 'activity' && <ProfileActivityTab />}
        {activeTab === 'wishlist' && <ProfileWishlistTab />}
        {activeTab === 'taste-profile' && <ProfileTasteProfileTab />}
      </div>
    </div>
  )
}
