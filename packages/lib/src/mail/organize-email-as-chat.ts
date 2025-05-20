import {
  EmailMessageType,
  ThreadedChatParticipantType,
  ThreadedMessageType,
} from "@budio/zod/types"

function parseEmailAddress(email: string): { email: string; name: string } {
  const match = email.match(/^(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)$/)
  return {
    name: match?.[1] || email,
    email: match?.[2] || email,
  }
}

// type ThreadedMessage = EmailMessageType & {
//   replies: ThreadedMessage[];
//   isReply: boolean;
// };

// type ThreadedChatParticipant = Omit<ChatParticipantType, 'messages'> & {
//   messages: ThreadedMessage[];
// };

// 🔁 Function to transform mail format into chat format
export function organizeEmailsAsChat(
  messages: EmailMessageType[],
): ThreadedChatParticipantType[] {
  const participants = new Map<string, ThreadedChatParticipantType>()
  const threadMap = new Map<string, ThreadedMessageType>()

  // First pass: Create thread structure
  for (const email of messages) {
    const { email: senderEmail, name: senderName } = parseEmailAddress(
      email.from,
    )

    // Initialize participant if not exists
    if (!participants.has(senderEmail)) {
      participants.set(senderEmail, {
        email: senderEmail,
        name: senderName,
        lastMessageDate: email.date,
        unreadCount: 0,
        messages: [],
      })
    }

    const participant = participants.get(senderEmail)!

    // Create threaded message
    const threadedMessage: ThreadedMessageType = {
      ...email,
      replies: [],
      isReply: false,
    }

    // If this is a reply to an existing thread
    if (email.threadId && threadMap.has(email.threadId)) {
      const parentMessage = threadMap.get(email.threadId)!
      parentMessage.replies.push(threadedMessage)
      threadedMessage.isReply = true
    } else {
      // This is a new thread
      threadMap.set(email.threadId, threadedMessage)
      participant.messages.push(threadedMessage)
    }

    if (!email.isRead) {
      participant.unreadCount++
    }

    // Update last message date if this message is more recent
    if (new Date(email.date) > new Date(participant.lastMessageDate)) {
      participant.lastMessageDate = email.date
    }
  }

  // Sort messages and their replies by date
  for (const participant of participants.values()) {
    participant.messages.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    // Sort replies within each message
    for (const message of participant.messages) {
      message.replies.sort(
        (a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
    }
  }

  // Convert to array and sort by last message date
  return Array.from(participants.values()).sort(
    (a, b) =>
      new Date(b.lastMessageDate).getTime() -
      new Date(a.lastMessageDate).getTime(),
  )
}
