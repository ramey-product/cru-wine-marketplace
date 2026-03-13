'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'
import { OAuthButtons } from './OAuthButtons'

type FormState = { error?: string } | undefined

async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await signIn(formData)
  if (result?.error) {
    return { error: result.error }
  }
  // signIn redirects on success, so we only reach here on error
  return undefined
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your account
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-label="Password"
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          aria-label="Sign in"
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
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-primary underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
