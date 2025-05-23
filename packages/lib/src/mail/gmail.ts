import {
  EmailMessageType,
  GmailMessageResponseType,
  GmailMessagesResponseType,
  GmailThreadResponseType,
} from "@budio/zod/types"

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1"
const EMAIL_COUNT = "20"

type MimeType = "text/plain" | "text/html"

interface UnifiedMessageBody {
  type: MimeType // 'text/html' if any part is HTML, else 'text/plain'
  html: string | null // All parts joined together
  text: string | null // Only the plain text parts joined together
}

/**
 * Decode base64url Gmail message data.
 */
function decodeBase64url(data?: string): string {
  if (!data) return ""
  const fixed = data.replace(/-/g, "+").replace(/_/g, "/")
  const padded = fixed + "=".repeat((4 - (fixed.length % 4)) % 4)
  return decodeURIComponent(escape(window.atob(padded)))
}

/**
 * Recursively collects parts of Gmail message payload.
 */
export function getUnifiedMessageBody(payload: any): UnifiedMessageBody {
  const allParts: string[] = []
  const htmlParts: string[] = []
  const textParts: string[] = []

  function walk(part: any) {
    if (part.parts) {
      part.parts.forEach(walk)
    } else if (part.body?.data) {
      const content = decodeBase64url(part.body.data)
      allParts.push(content)
      if (part.mimeType === "text/html") {
        htmlParts.push(content)
      }
      if (part.mimeType === "text/plain") {
        textParts.push(content)
      }
    }
  }

  walk(payload)

  // Fallback for top-level body
  if (allParts.length === 0 && payload.body?.data) {
    const content = decodeBase64url(payload.body.data)
    allParts.push(content)
    if (payload.mimeType === "text/html") {
      htmlParts.push(content)
    }
    if (payload.mimeType === "text/plain") {
      textParts.push(content)
    }
  }

  return {
    type: htmlParts.length > 0 ? "text/html" : "text/plain",
    html: htmlParts.length > 0 ? htmlParts.join("\n") : null,
    text: textParts.length > 0 ? textParts.join("\n") : null,
  }
}

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

  const data = (await response.json()) as GmailMessagesResponseType
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

  const msg = (await response.json()) as GmailMessageResponseType
  const headers = msg.payload.headers
  const get = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
      ?.value || ""
  const unifiedBody = getUnifiedMessageBody(msg.payload)

  return {
    id: msg.id,
    threadId: msg.threadId,
    from: get("From"),
    to: get("To"),
    subject: get("Subject"),
    date: get("Date"),
    body: unifiedBody.html ? unifiedBody.html : unifiedBody.text!,
    snippet: msg.snippet,
    isRead: !msg.labelIds?.includes("UNREAD"),
    type: unifiedBody.type,
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

  const data = (await response.json()) as GmailThreadResponseType
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
      fullBody: "",
      isRead: true,
      type: "text/html",
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
  const messages: EmailMessageType[] = []

  for (const messageId of messageIds) {
    const email = await getMessage(accessToken, messageId, userId)
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
