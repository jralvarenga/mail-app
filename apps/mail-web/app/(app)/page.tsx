"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccounts } from "@budio/lib/hooks/use-accounts"

export default function Home() {
  const { state } = useAccounts()
  const router = useRouter()

  useEffect(() => {
    if (state.selectedAccount) {
      router.push(`/mail/${state.selectedAccount.email}`)
    }
  }, [state, router])

  return null
}
