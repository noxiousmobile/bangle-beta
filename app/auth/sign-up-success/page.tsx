import type { Metadata } from "next"
import Link from "next/link"
import { MailCheck } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"

export const metadata: Metadata = {
  title: "Check your email | Bangle AI",
}

export default async function SignUpSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams

  return (
    <AuthShell title="Check your email" description="One last step to secure your account.">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          We sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{email || "your inbox"}</span>. Click it and you&apos;ll
          land straight in the app.
        </p>
        <Link href="/auth/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
