import { authClient } from "@budio/auth/client"
import { AccountStateType, LinkedAccountType } from "@budio/zod/types"
import { atom, useAtom } from "jotai"

const accountsStateAtom = atom<AccountStateType>({
  accounts: [],
  selectedAccount: null,
})

export function useAccounts() {
  const [state, setState] = useAtom(accountsStateAtom)

  /**
   * set linked accounts
   * @param accounts - array of linked accounts, can be empty
   */
  async function setLinkedAccounts(accounts: LinkedAccountType[]) {
    setState((prev) => ({
      ...prev,
      accounts,
    }))
  }

  /**
   * set selected linked account
   * @param account selected linked account
   */
  async function setSelectedAccount(account: LinkedAccountType) {
    setState((prev) => ({
      ...prev,
      selectedAccount: account,
    }))
  }

  /**
   * returns access token of 1 account
   * @param account account to get accessToken
   * @returns access token
   */
  async function getAccessToken(account: LinkedAccountType, userId: string) {
    const tokens = await authClient.getAccessToken({
      accountId: account.id,
      providerId: account.provider,
      userId,
    })

    return tokens.data?.accessToken
  }

  return {
    state,
    setLinkedAccounts,
    setSelectedAccount,
    getAccessToken,
  }
}
