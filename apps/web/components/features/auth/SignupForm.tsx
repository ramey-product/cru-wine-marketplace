'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'
import { OAuthButtons } from './OAuthButtons'

type FormState = { error?: string; success?: boolean } | undefined

async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await signUp(formData)
  if (result?.error) {
    return { error: result.error }
  }
  if (result?.data?.success) {
    return { success: true }
  }
  return undefined
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, undefined)
  const [ageConfirmed, setAgeConfirmed] = useState(false)

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-6 w-6 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent you a confirmation link. Click it to activate your account and start discovering wines.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Join Cru to discover wines from local shops
        </p>
      </div>

      <OAuthButtons />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            id="form-error"
            role="alert"
          >
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="full_name"
            className="text-sm font-medium text-foreground"
          >
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-describedby={state?.error ? 'form-error' : undefined}
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm text-foreground',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-describedby={state?.error ? 'form-error' : undefined}
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm text-foreground',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-required="true"
            aria-describedby={state?.error ? 'form-error' : undefined}
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm text-foreground',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            placeholder="Create a password"
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            id="age_confirmed"
            name="age_confirmed"
            type="checkbox"
            value="true"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            required
            aria-label="Confirm you are 21 or older"
            className={cn(
              'mt-1 h-4 w-4 rounded border border-input text-primary',
              'focus:ring-2 focus:ring-ring focus:ring-offset-2'
            )}
          />
          <label
            htmlFor="age_confirmed"
            className="text-sm text-muted-foreground"
          >
            I confirm that I am 21 years of age or older
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending || !ageConfirmed}
          aria-label="Create account"
          className={cn(
            'flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm',
            'hover:bg-primary/90 active:scale-[0.98]',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-150'
          )}
        >
          {isPending ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
