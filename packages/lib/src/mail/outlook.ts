import { EmailMessageType } from "@budio/zod/types"

const GRAPH_API = "https://graph.microsoft.com/v1.0"
const EMAIL_COUNT = "20"

function parseAddress(entity: any): string {
  return entity?.emailAddress?.address || ""
}

function parseDate(dateString: string): string {
  return new Date(dateString).toUTCString()
}

async function getMessage(
  msg: any,
  accessToken: string,
  userId: string,
): Promise<EmailMessageType> {
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${msg.id}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!res.ok) {
    throw new Error("Failed to fetch full email")
  }

  const data = await res.json()

  return {
    id: data.id,
    threadId: data.conversationId,
    from: parseAddress(msg.from),
    to: msg.toRecipients?.map(parseAddress).join(", "),
    subject: data.subject,
    date: parseDate(data.receivedDateTime),
    body: data.body.content,
    snippet: data.bodyPreview,
    isRead: data.isRead,
    accountId: userId,
    type: "text/html",
  }
}

async function listFocusedMessages(
  accessToken: string,
  pageToken?: string,
): Promise<{ messages: any[]; nextPageToken: string }> {
  const url = new URL(
    pageToken ? pageToken : `${GRAPH_API}/me/mailFolders/inbox/messages`,
  )
  if (!pageToken) {
    url.searchParams.append("$top", EMAIL_COUNT)
    url.searchParams.append(
      "$select",
      "id,subject,from,toRecipients,conversationId,isRead,bodyPreview,receivedDateTime,inferenceClassification",
    )
    url.searchParams.append("$orderby", "receivedDateTime desc") // ✅ Sort newest first
  }

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    messages: data.value || [],
    nextPageToken: data["@odata.nextLink"] || "",
  }
}

async function getConversationMessages(
  accessToken: string,
  conversationId: string,
): Promise<EmailMessageType[]> {
  const url = new URL(`${GRAPH_API}/me/messages`)
  url.searchParams.append("$filter", `conversationId eq '${conversationId}'`)
  // url.searchParams.append("$orderby", "receivedDateTime asc")
  url.searchParams.append(
    "$select",
    "id,subject,from,toRecipients,conversationId,isRead,bodyPreview,receivedDateTime",
  )

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.statusText}`)
  }

  const data = await response.json()
  return data.value.map(
    async (msg: any): Promise<EmailMessageType> => getMessage(msg, "", ""),
  )
}

export async function fetchOutlookInbox(
  accessToken: string,
  userId: string,
  pageToken?: string,
): Promise<{ messages: EmailMessageType[]; nextPageToken: string }> {
  const { messages, nextPageToken } = await listFocusedMessages(
    accessToken,
    pageToken,
  )
  const seenConversations = new Set<string>()
  const allMessages: EmailMessageType[] = []

  for (const msg of messages) {
    const parsedMessage = await getMessage(msg, accessToken, userId)
    allMessages.push(parsedMessage)
  }

  return {
    messages: allMessages,
    nextPageToken: nextPageToken,
  }
}
