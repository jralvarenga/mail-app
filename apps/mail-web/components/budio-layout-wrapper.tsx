"use client"

import { authClient } from "@budio/auth/client"
import { BudioLayout } from "@budio/web-ui/components/budio-layout"
import { AccountSwitcherAccountType } from "@budio/zod/types"
import { useRouter } from "next/navigation"
import { useAccounts } from "@budio/lib/hooks/use-accounts"
import { useEffect } from "react"

interface Props {
  children: React.ReactNode
  defaultCollapsed?: boolean
  defaultLayout?: number[]
  accounts: AccountSwitcherAccountType[]
}

export function BudioLayoutWrapper({
  children,
  accounts,
  defaultCollapsed,
  defaultLayout,
}: Props) {
  const { updateState, changeSelectedAccount, state } = useAccounts()
  const { data } = authClient.useSession()
  const router = useRouter()

  function onAccountChange(email: string) {
    const account = accounts.find((account) => account.email === email)
    if (!account) return

    changeSelectedAccount(account)
  }

  useEffect(() => {
    updateState({
      accounts,
      selectedAccount: accounts[0]!,
    })
  }, [accounts])

  return (
    <BudioLayout
      defaultLayout={defaultLayout}
      defaultCollapsed={defaultCollapsed}
      accounts={state.accounts}
      switchAccount={onAccountChange}
      redirect={(href) => router.push(href)}
      selectedAccountEmail={state.selectedAccount?.email || ""}
      logout={async () => {
        authClient.signOut({
          fetchOptions: { onSuccess: () => router.push("/login") },
        })
      }}
      user={data?.user}
    >
      {children}
    </BudioLayout>
  )
}
