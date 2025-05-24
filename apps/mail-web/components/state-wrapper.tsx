"use client"

import { useAccounts } from "@budio/lib/hooks/use-accounts-v2"
import { LinkedAccountType } from "@budio/zod/types"
import { useEffect } from "react"

interface Props {
  children: React.ReactNode
  accounts: LinkedAccountType[]
  selectedAccount: LinkedAccountType | null
}

export function StateWrapper({ children, accounts, selectedAccount }: Props) {
  const { setLinkedAccounts, setSelectedAccount } = useAccounts()

  /**
   * set linked accounts
   */
  useEffect(() => {
    setLinkedAccounts(accounts)
  }, [accounts])

  /**
   * set selected accounts
   * can be from cookies or from server
   */
  useEffect(() => {
    if (selectedAccount) {
      setSelectedAccount(selectedAccount)
    }
  }, [selectedAccount])

  return children
}
