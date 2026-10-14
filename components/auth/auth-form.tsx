"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Mode = "login" | "sign-up"

const MIN_PASSWORD_LENGTH = 8

// Only the credential/existence signal is genericized so the form can't be used
// to discover registered emails; actionable errors are passed through.
function loginErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === "email_not_confirmed") return "Please confirm your email first. Check your inbox for the link."
  if (code === "over_request_rate_limit" || status === 429) return "Too many attempts. Please wait a moment and try again."
  if (code === "invalid_credentials") return "Invalid email or password."
  return "Something went wrong. Please try again."
}

function signUpErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === "weak_password") return "Please choose a stronger password."
  if (code === "email_address_invalid") return "Please use a real email address."
  if (code === "email_address_not_authorized") return "We can't send a confirmation email to that address. Try a different one."
  if (code === "validation_failed") return "Please check the details you entered."
  if (code === "over_email_send_rate_limit" || status === 429) return "Too many attempts. Please wait a moment and try again."
  return "Unable to complete sign-up. Please try again."
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isSignUp = mode === "sign-up"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isSignUp && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        // A session is returned immediately when email confirmation is disabled.
        if (data.session) {
          router.replace("/")
          router.refresh()
        } else {
          router.push(`/auth/sign-up-success?email=${encodeURIComponent(email.trim())}`)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        router.replace("/")
        router.refresh()
      }
    } catch (err) {
      console.error(isSignUp ? "Sign-up error:" : "Login error:", err)
      setError(isSignUp ? signUpErrorMessage(err) : loginErrorMessage(err))
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate={false}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          placeholder="you@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={isSignUp ? `At least ${MIN_PASSWORD_LENGTH} characters` : "Your password"}
            minLength={isSignUp ? MIN_PASSWORD_LENGTH : undefined}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isSignUp ? (isLoading ? "Creating account..." : "Create account") : isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account? " : "New to Bangle AI? "}
        <Link
          href={isSignUp ? "/auth/login" : "/auth/sign-up"}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  )
}
