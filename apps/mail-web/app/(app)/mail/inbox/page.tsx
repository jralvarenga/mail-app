"use client"

import { fetchGmailInbox } from "@/lib/gmail"
import { fetchOutlookInbox } from "@/lib/outlook"
import { authClient } from "@budio/auth/client"
import { useAccounts } from "@budio/lib/hooks/use-accounts"
import { MailInbox } from "@budio/web-ui/components/mail-inbox"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"

export default function MailPage() {
  const { data: sessionData } = authClient.useSession()
  const { state } = useAccounts()
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

  return (
    <div className="flex">
      <div className="flex-1 p-5">
        <div className="flex items-center">
          <h3>Inbox</h3>
        </div>
        <MailInbox messages={messages} />
      </div>
      {/* {children} */}
    </div>
  )
}
