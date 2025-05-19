"use client"

import { authClient } from "@budio/auth/client"
import { BudioLayout } from "@budio/web-ui/components/budio-layout"
import { AccountSwitcherAccountType } from "@budio/zod/types"
import { useParams, useRouter } from "next/navigation"
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
  const { updateState, changeSelectedAccount } = useAccounts()
  const { data } = authClient.useSession()
  const { email } = useParams()
  const router = useRouter()

  function onAccountChange(email: string) {
    const account = accounts.find((account) => account.email === email)
    if (!account) return

    changeSelectedAccount(account)
    router.push(`/mail/${account.email}`)
  }

  useEffect(() => {
    updateState({
      accounts,
      selectedAccount: accounts[0]!,
    })
  }, [accounts])

  useEffect(() => {
    if (accounts && email) {
      const account = accounts.find((account) => account.email === email)
      if (account) {
        changeSelectedAccount(account)
      } else {
        // TODO: prevent user to go on other emails
        // router.back()
      }
    }
  }, [email, accounts])

  return (
    <BudioLayout
      defaultLayout={defaultLayout}
      defaultCollapsed={defaultCollapsed}
      accounts={accounts}
      switchAccount={onAccountChange}
      selectedAccountEmail={
        (email as string) ? (email as string).replaceAll("%40", "@") : ""
      }
      logout={async () => {
        authClient.signOut({
          fetchOptions: { onSuccess: () => router.push("/login") },
        })
      }}
      linkGoogleAccount={async () => {}}
      user={data?.user}
    >
      {children}
    </BudioLayout>
  )
}
