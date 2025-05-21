import { EmailMessageType } from "@budio/zod/types"

const GRAPH_API = "https://graph.microsoft.com/v1.0"
const EMAIL_COUNT = "20"

function parseAddress(entity: any): string {
  return entity?.emailAddress?.address || ""
}

function parseDate(dateString: string): string {
  return new Date(dateString).toUTCString()
}

function parseMessage(msg: any): EmailMessageType {
  return {
    id: msg.id,
    threadId: msg.conversationId,
    from: parseAddress(msg.from),
    to: msg.toRecipients?.map(parseAddress).join(", "),
    subject: msg.subject,
    date: parseDate(msg.receivedDateTime),
    body: msg.bodyPreview,
    snippet: msg.bodyPreview,
    isRead: msg.isRead,
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
  return data.value.map((msg: any): EmailMessageType => parseMessage(msg))
}

export async function fetchOutlookInbox(
  accessToken: string,
  pageToken?: string,
): Promise<{ messages: EmailMessageType[]; nextPageToken: string }> {
  const { messages, nextPageToken } = await listFocusedMessages(
    accessToken,
    pageToken,
  )
  const seenConversations = new Set<string>()
  const allMessages: EmailMessageType[] = []

  for (const msg of messages) {
    console.log(msg)

    // const convId = msg.conversationId
    // if (seenConversations.has(convId)) continue

    // const threadMessages = await getConversationMessages(accessToken, convId)
    // allMessages.push(...threadMessages)
    // seenConversations.add(convId)
    allMessages.push(parseMessage(msg))
  }

  return {
    messages: allMessages,
    nextPageToken: nextPageToken,
  }
}
