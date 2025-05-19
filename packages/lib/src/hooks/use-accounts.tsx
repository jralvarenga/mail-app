import { AccountStateType } from "@budio/zod/types"
import { atom, useAtom } from "jotai"

const accountsStateAtom = atom<AccountStateType>({
  accounts: [],
  selectedAccount: null,
})

export function useAccounts() {
  const [state, setState] = useAtom(accountsStateAtom)

  function updateState(initialState: AccountStateType) {
    setState(initialState)
  }

  function changeSelectedAccount(account: AccountStateType["selectedAccount"]) {
    setState((prev) => ({
      ...prev,
      selectedAccount: account,
    }))
  }

  return {
    state,
    updateState,
    changeSelectedAccount,
  }
}
