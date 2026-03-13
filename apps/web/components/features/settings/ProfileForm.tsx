'use client'

import { useState, useTransition } from 'react'

interface ProfileFormProps {
  initialData: {
    displayName: string
    username: string
    bio: string
    isPublic: boolean
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [displayName, setDisplayName] = useState(initialData.displayName)
  const [username, setUsername] = useState(initialData.username)
  const [bio, setBio] = useState(initialData.bio)
  const [isPublic, setIsPublic] = useState(initialData.isPublic)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)

    startTransition(async () => {
      // TODO: Call updateProfile + updateProfileSocial server actions
      // For now, simulate save
      await new Promise((r) => setTimeout(r, 500))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium mb-1">
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          Username
        </label>
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground mr-1">@</span>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            pattern="[a-z0-9_]+"
            maxLength={30}
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 160))}
          rows={3}
          maxLength={160}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <p className="mt-1 text-xs text-muted-foreground">{bio.length}/160</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isPublic"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        <label htmlFor="isPublic" className="text-sm">
          Public profile — anyone can see your activity
        </label>
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {saved && <p className="text-sm text-cru-success" role="status">Profile updated!</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
