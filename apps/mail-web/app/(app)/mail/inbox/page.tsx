"use client"

import { authClient } from "@budio/auth/client"
import { fetchGmailInbox, getThreadMessages } from "@budio/lib/mail/gmail"
import { fetchOutlookInbox } from "@budio/lib/mail/outlook"
import { MailInbox } from "@budio/web-ui/components/mail-inbox"
import { MessageContainer } from "@budio/web-ui/components/message-container"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { useMail } from "@budio/lib/hooks/use-mail"
import { EmailMessageType } from "@budio/zod/types"

export default function MailPage() {
  const { data: sessionData } = authClient.useSession()
  const { state, setSelectedMessages } = useMail()
  const { data, refetch, isLoading, fetchNextPage } = useInfiniteQuery({
    queryKey: ["email-inbox", state.selectedAccount?.email],
    queryFn: async ({ pageParam }) => {
      const accessToken = await authClient.getAccessToken({
        providerId: state.selectedAccount!.provider,
        accountId: state.selectedAccount?.id,
        userId: sessionData?.user.id,
      })

      if (state.selectedAccount?.provider === "google") {
        const { messages, nextPageToken } = await fetchGmailInbox(
          accessToken.data!.accessToken!,
          state.selectedAccount?.accountId!,
          pageParam,
        )
        return {
          data: messages,
          nextPageToken,
        }
      }

      if (state.selectedAccount?.provider === "microsoft") {
        const { messages, nextPageToken } = await fetchOutlookInbox(
          accessToken.data!.accessToken!,
          state.selectedAccount?.accountId!,
          pageParam,
        )

        return {
          data: messages,
          nextPageToken,
        }
      }

      return {
        data: [],
        nextPageToken: "",
      }
    },
    getNextPageParam: (lastPage: { nextPageToken?: string }) =>
      lastPage.nextPageToken,
    initialPageParam: undefined,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  })

  const messages = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  )

  useEffect(() => {
    if (state.selectedAccount && !isLoading) {
      refetch()
    }
  }, [state.selectedAccount])

  useEffect(() => {
    if (messages.length < 40 && !isLoading) {
      fetchNextPage()
    }
  }, [messages])

  // useEffect(() => {
  //   const xd = localDb.query.messagesTable.findMany()
  // }, [messages])

  async function onMessageClick(message: EmailMessageType) {
    const accessToken = await authClient.getAccessToken({
      providerId: state.selectedAccount!.provider,
      accountId: state.selectedAccount?.id,
      userId: sessionData?.user.id,
    })
    const threadMessages = await getThreadMessages({
      accessToken: accessToken.data!.accessToken!,
      threadId: message.threadId,
      userId: state.selectedAccount?.accountId!,
    })

    setSelectedMessages(threadMessages)
  }

  return (
    <div className="flex h-screen">
      <div className="h-full flex-1 overflow-y-auto p-5">
        <div className="flex items-center">
          <h3>Inbox</h3>
        </div>
        <MailInbox
          messages={messages}
          onMessageClick={onMessageClick}
          hideFields={
            !!state.selectedMessages && state.selectedMessages?.length > 0
          }
        />
      </div>

      {state.selectedMessages && state.selectedMessages?.length > 0 && (
        <MessageContainer
          messages={state.selectedMessages}
          selectedAccount={state.selectedAccount!}
        />
      )}
    </div>
  )
}
