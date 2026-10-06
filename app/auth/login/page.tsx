import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = {
  title: "Sign in | Bangle AI",
}

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" description="Sign in to pick up where you left off.">
      <AuthForm mode="login" />
    </AuthShell>
  )
}
