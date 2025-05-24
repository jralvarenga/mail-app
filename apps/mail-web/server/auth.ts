"use server"

import { auth } from "@budio/auth"
import { LinkedAccountType, IdTokenType } from "@budio/zod/types"
import { jwtDecode } from "jwt-decode"
import { headers } from "next/headers"

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

  if (!linkedAccounts || linkedAccounts.length === 0) {
    return []
  }

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
      } satisfies LinkedAccountType
    }),
  )
}
