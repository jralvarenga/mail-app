"use client"

import { authClient } from "@budio/auth/client"
import { trpc } from "@budio/trpc/client"
import { Button } from "@budio/web-ui/components/ui/button"
import { useEffect, useState } from "react"
import { IdTokensArrayType } from "@budio/zod/types"

export default function Page() {
  const getIdTokens = trpc.user.getLinkedAccountsIdToken.useMutation()
  const [accounts, setAccounts] = useState<IdTokensArrayType>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchAccounts() {
    try {
      const linkedAccounts = await authClient.listAccounts()
      const response = await getIdTokens.mutateAsync({
        accountIds: linkedAccounts.data!.map((account) => account.id),
      })

      setAccounts(response.data.tokens)
    } catch (err: any) {
      setError(err.message || "Failed to load accounts")
    } finally {
      setLoading(false)
    }
  }

  async function linkMicrosoftAccount() {
    authClient.linkSocial({
      provider: "microsoft",
    })
    await fetchAccounts()
  }

  async function linkGoogleAccount() {
    authClient.linkSocial({
      provider: "google",
    })
    await fetchAccounts()
  }

  async function unlinkProvider(accountId: string, providerId: string) {
    authClient.unlinkAccount({
      providerId: providerId,
      accountId: accountId,
    })
    await fetchAccounts()
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Account</h1>

        <div>
          {accounts.map((account, i) => (
            <div className="flex gap-2" key={i}>
              <span>{account.token.email}</span>
              <span>{account.token.name}</span>
              <Button
                onClick={() =>
                  unlinkProvider(account.accountId, account.providerId)
                }
                size="sm"
              >
                Unlink
              </Button>
            </div>
          ))}
        </div>
        <Button size="sm" onClick={linkMicrosoftAccount}>
          Link Microsoft
        </Button>
        <Button size="sm" onClick={linkGoogleAccount}>
          Link Google
        </Button>

        <div></div>
      </div>
    </div>
  )
}
