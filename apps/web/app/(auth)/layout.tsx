export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
            Cru
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Discover wines you&apos;ll love
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  )
}
