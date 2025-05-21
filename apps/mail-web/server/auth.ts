"use server"

import { auth } from "@budio/auth"
import { AccountSwitcherAccountType, IdTokenType } from "@budio/zod/types"
import { jwtDecode } from "jwt-decode"
import { headers } from "next/headers"
import { Icons } from "@budio/web-ui/components/icons"

async function getIdToken(id: string, provider: string) {
  const { idToken } = await auth.api.getAccessToken({
    headers: await headers(),
    body: {
      accountId: id,
      providerId: provider,
    },
  })
  return idToken
}

export async function getLinkedAccounts() {
  const linkedAccounts = await auth.api.listUserAccounts({
    headers: await headers(),
  })

  return Promise.all(
    linkedAccounts.map(async (account) => {
      const idToken = await getIdToken(account.id, account.provider)

      const decodedIdToken: IdTokenType = await jwtDecode(idToken!)

      return {
        id: account.id,
        accountId: account.accountId,
        email: decodedIdToken.email,
        name: decodedIdToken.name,
        provider: account.provider,
        // TODO: fix icons
        icon: account.provider === "google" ? Icons.gmail : Icons.outlook,
      } satisfies AccountSwitcherAccountType
    }),
  )
}
