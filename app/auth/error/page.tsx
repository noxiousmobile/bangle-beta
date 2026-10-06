import type { Metadata } from "next"
import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"

export const metadata: Metadata = {
  title: "Authentication error | Bangle AI",
}

export default function AuthErrorPage() {
  return (
    <AuthShell title="That link didn't work" description="It may have expired or already been used.">
      <div className="flex flex-col items-center gap-3 text-center">
        <Link href="/auth/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  )
}
