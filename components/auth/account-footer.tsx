"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

async function fetchCurrentEmail() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  return data.user?.email ?? null
}

export function AccountFooter({ version }: { version: string }) {
  const router = useRouter()
  const { data: email } = useSWR("current-user-email", fetchCurrentEmail)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-1 border-t border-border px-4 py-3">
      {email && (
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground" title={email}>
            {email}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex flex-shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      )}
      <span className="text-xs text-muted-foreground/60">{version}</span>
    </div>
  )
}
