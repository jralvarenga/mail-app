import { EmailMessageType } from "@budio/zod/types"

export async function fetchGmailInboxPage(
  accessToken: string,
  userId: string,
  pageToken?: string,
): Promise<{ messages: EmailMessageType[]; nextPageToken?: string }> {
  const url = new URL(
    `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages`,
  )
  url.searchParams.set("maxResults", "25")
  url.searchParams.set("labelIds", "INBOX")
  url.searchParams.set("q", "is:important")
  if (pageToken) url.searchParams.set("pageToken", pageToken)

  const listRes = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!listRes.ok) throw new Error("Failed to list messages")
  const { messages, nextPageToken } = await listRes.json()

  const previews = await Promise.all(
    (messages ?? []).map(({ id }: any) =>
      fetch(
        `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${id}?format=metadata`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ),
  )

  const result = previews.filter(Boolean).map((msg) => {
    const headers = msg.payload.headers
    const get = (name: string) =>
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
        ?.value || ""
    return {
      id: msg.id,
      threadId: msg.threadId,
      from: get("From"),
      to: get("To"),
      subject: get("Subject"),
      date: get("Date"),
      body: "",
      snippet: msg.snippet,
      isRead: !msg.labelIds?.includes("UNREAD"),
    }
  })

  return { messages: result, nextPageToken }
}
