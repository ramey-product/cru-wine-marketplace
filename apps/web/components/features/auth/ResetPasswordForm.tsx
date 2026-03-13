'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

type FormState = { error?: string; success?: boolean } | undefined

async function resetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await resetPassword(formData)
  if (result?.error) {
    return { error: result.error }
  }
  if (result?.data?.success) {
    return { success: true }
  }
  return undefined
}

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetAction, undefined)

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
          If an account exists with that email address, we&apos;ve sent password reset instructions.
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
        <h2 className="text-xl font-semibold text-foreground">Reset your password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {state.error}
          </div>
        )}

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
            aria-label="Email address"
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          aria-label="Send reset link"
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
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
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
