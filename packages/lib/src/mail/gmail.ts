import { EmailMessageType } from "@budio/zod/types"

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1"
const EMAIL_COUNT = "6"

function decodeBase64(data: string): string {
  return Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf-8")
}

function extractPlainText(payload: any): string {
  if (payload.body?.data) return decodeBase64(payload.body.data)
  if (payload.parts) {
    for (const part of payload.parts) {
      const text = extractPlainText(part)
      if (text) return text
    }
  }
  return ""
}

async function listMessageIds(
  accessToken: string,
  userId: string,
  pageToken?: string,
): Promise<{ messages: string[]; nextPageToken: string }> {
  const url = new URL(`${GMAIL_API}/users/${userId}/messages`)
  url.searchParams.append("maxResults", EMAIL_COUNT)
  url.searchParams.append("labelIds", "INBOX")
  url.searchParams.append("q", "-category:promotions -category:social")
  if (pageToken) url.searchParams.set("pageToken", pageToken)

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`)
  }

  const data = await response.json()
  return {
    messages: data.messages?.map((msg: any) => msg.id) || [],
    nextPageToken: data.nextPageToken || "",
  }
}

async function getMessage(
  accessToken: string,
  messageId: string,
  userId: string,
): Promise<EmailMessageType> {
  const url = new URL(`${GMAIL_API}/users/${userId}/messages/${messageId}`)
  url.searchParams.append("format", "full")

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch message: ${response.statusText}`)
  }

  const msg = await response.json()
  console.log(msg)

  const headers = msg.payload.headers
  const get = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
      ?.value || ""

  return {
    id: msg.id,
    threadId: msg.threadId,
    preview: msg.snippet,
    from: get("From"),
    to: get("To"),
    subject: get("Subject"),
    date: get("Date"),
    body: extractPlainText(msg.payload),
    snippet: msg.snippet,
    isRead: !msg.labelIds?.includes("UNREAD"),
  }
}

async function getThreadMessages(
  accessToken: string,
  threadId: string,
  userId: string,
): Promise<EmailMessageType[]> {
  const url = new URL(`${GMAIL_API}/users/${userId}/threads/${threadId}`)
  url.searchParams.append("format", "full")

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch thread: ${response.statusText}`)
  }

  const data = await response.json()
  return data.messages.map((msg: any) => {
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
      body: extractPlainText(msg.payload),
      snippet: msg.snippet,
    }
  })
}

// 🔁 Main function for traditional mail client format
export async function fetchGmailInbox(
  accessToken: string,
  userId: string,
  nextPageToken?: string,
): Promise<{ messages: EmailMessageType[]; nextPageToken: string }> {
  const { messages: messageIds, nextPageToken: newPageToken } =
    await listMessageIds(accessToken, userId, nextPageToken)
  // const seenThreads = new Set<string>()
  const messages: EmailMessageType[] = []

  for (const messageId of messageIds) {
    const email = await getMessage(accessToken, messageId, userId)

    // Skip if we've already processed this thread
    // if (seenThreads.has(email.threadId)) continue

    // // Get all messages in this thread
    // const threadMessages = await getThreadMessages(
    //   accessToken,
    //   email.threadId,
    //   userId,
    // )
    messages.push(email)
  }

  // Sort by date, most recent first
  return {
    messages: messages.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
    nextPageToken: newPageToken,
  }
}
