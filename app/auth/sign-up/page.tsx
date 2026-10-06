import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { AuthForm } from "@/components/auth/auth-form"

export const metadata: Metadata = {
  title: "Create account | Bangle AI",
}

export default function SignUpPage() {
  return (
    <AuthShell title="Create your account" description="Just an email and a password. You'll be in within seconds.">
      <AuthForm mode="sign-up" />
    </AuthShell>
  )
}
