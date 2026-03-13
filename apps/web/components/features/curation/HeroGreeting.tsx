'use client'

import { useState, useEffect } from 'react'

export function HeroGreeting() {
  const [greeting, setGreeting] = useState('Good evening')

  useEffect(() => {
    const hour = new Date().getHours()
    setGreeting(
      hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    )
  }, [])

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-semibold">{greeting}</h1>
      <p className="mt-1 text-muted-foreground">
        Here&apos;s what we&apos;ve been saving for you.
      </p>
    </div>
  )
}
