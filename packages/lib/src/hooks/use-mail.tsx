import { MailStateType } from "@budio/zod/types"
import { atom, useAtom } from "jotai"

const mailStateAtom = atom<MailStateType>({
  accounts: [],
  selectedAccount: null,
  messages: [],
  selectedMessages: null,
  mailType: "inbox",
})

export function useMail() {
  const [state, setState] = useAtom(mailStateAtom)

  function updateState(newState: Partial<MailStateType>) {
    setState((prev) => ({
      ...prev,
      ...newState,
    }))
  }

  function changeSelectedAccount(account: MailStateType["selectedAccount"]) {
    setState((prev) => ({
      ...prev,
      selectedAccount: account,
    }))
  }
  function setSelectedMessages(messages: MailStateType["selectedMessages"]) {
    setState((prev) => ({
      ...prev,
      selectedMessages: messages,
    }))
  }

  return {
    state,
    updateState,
    changeSelectedAccount,
    setSelectedMessages,
  }
}
