import type { ReactNode } from "react"

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-muted/40 px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/bangle-logo.svg" alt="Bangle AI logo" className="h-12 w-12" />
          <div className="flex flex-col gap-1">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">{children}</div>
        <p className="text-center text-xs text-muted-foreground">Bangle AI · Beta preview</p>
      </div>
    </main>
  )
}
