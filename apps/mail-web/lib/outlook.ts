import { EmailMessageType } from "@budio/zod/types"

const GRAPH_API = "https://graph.microsoft.com/v1.0"
const EMAIL_COUNT = "20"

function parseAddress(entity: any): string {
  return entity?.emailAddress?.address || ""
}

function parseDate(dateString: string): string {
  return new Date(dateString).toUTCString()
}

async function listFocusedMessages(accessToken: string): Promise<any[]> {
  const url = new URL(`${GRAPH_API}/me/messages`)
  url.searchParams.append("$top", EMAIL_COUNT)
  url.searchParams.append("$filter", "inferenceClassification eq 'focused'")
  url.searchParams.append(
    "$select",
    "id,subject,from,toRecipients,conversationId,isRead,bodyPreview,receivedDateTime",
  )

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`)
  }

  const data = await response.json()
  return data.value || []
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
    (msg: any): EmailMessageType => ({
      id: msg.id,
      threadId: msg.conversationId,
      from: parseAddress(msg.from),
      to: msg.toRecipients?.map(parseAddress).join(", "),
      subject: msg.subject,
      date: parseDate(msg.receivedDateTime),
      body: msg.bodyPreview,
      snippet: msg.bodyPreview,
      isRead: msg.isRead,
    }),
  )
}

export async function fetchOutlook(
  accessToken: string,
): Promise<EmailMessageType[]> {
  const initialMessages = await listFocusedMessages(accessToken)
  const seenConversations = new Set<string>()
  const allMessages: EmailMessageType[] = []

  for (const msg of initialMessages) {
    const convId = msg.conversationId
    if (seenConversations.has(convId)) continue

    const threadMessages = await getConversationMessages(accessToken, convId)
    allMessages.push(...threadMessages)
    seenConversations.add(convId)
  }

  return allMessages.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}
