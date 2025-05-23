import { z } from "zod"

export const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string(),
})

export const MicrosoftIdTokenSchema = z.object({
  ver: z.string(),
  iss: z.string(),
  sub: z.string(),
  aud: z.string(),
  exp: z.number(),
  iat: z.number(),
  nbf: z.number(),
  name: z.string(),
  preferred_username: z.string(),
  oid: z.string(),
  email: z.string(),
  tid: z.string(),
  aio: z.string(),
})

export const GoogleIdTokenSchema = z.object({
  iss: z.string(),
  azp: z.string(),
  aud: z.string(),
  sub: z.string(),
  email: z.string(),
  email_verified: z.boolean(),
  at_hash: z.string(),
  name: z.string(),
  picture: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  iat: z.number(),
  exp: z.number(),
})

export const IdTokenSchema = z.union([
  MicrosoftIdTokenSchema,
  GoogleIdTokenSchema,
])

export const IdTokensArraySchema = z.array(
  z.object({
    accountId: z.string(),
    providerId: z.string(),
    token: IdTokenSchema,
  }),
)

export const EmailMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  date: z.string(),
  body: z.string(),
  type: z.enum(["text/html", "text/plain"]),
  snippet: z.string(),
  isRead: z.boolean(),
})

export const ChatParticipantSchema = z.object({
  email: z.string(),
  name: z.string(),
  lastMessageDate: z.string(),
  unreadCount: z.number(),
  messages: z.array(EmailMessageSchema),
})

export const ThreadedMessageSchema: z.ZodType = EmailMessageSchema.extend({
  replies: z.array(z.lazy(() => ThreadedMessageSchema)),
  isReply: z.boolean(),
})

export const ThreadedChatParticipantSchema = ChatParticipantSchema.omit({
  messages: true,
}).extend({
  messages: z.array(ThreadedMessageSchema),
})

export const AccountSwitcherAccountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  email: z.string(),
  name: z.string(),
  provider: z.string(),
  icon: z.any(),
})

export const AccountStateSchema = z.object({
  accounts: z.array(AccountSwitcherAccountSchema),
  selectedAccount: AccountSwitcherAccountSchema.nullable(),
})

export const MailStateSchema = z.object({
  accounts: AccountSwitcherAccountSchema.array(),
  selectedAccount: AccountSwitcherAccountSchema.nullable(),
  messages: EmailMessageSchema.array(),
  selectedMessages: EmailMessageSchema.array().nullable(),
  mailType: z.enum(["inbox", "sent", "drafts", "trash", "spam", "starred"]),
})

/**
 * Gmail schemas
 */
export const GmailHeaderSchema = z.object({
  name: z.string(),
  value: z.string(),
})

export const GmailBodySchema = z.object({
  size: z.number(),
  data: z.string().optional(), // base64url encoded
  attachmentId: z.string().optional(),
})

export const GmailMessagePayloadSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    partId: z.string().optional(),
    mimeType: z.string(),
    filename: z.string(),
    headers: z.array(GmailHeaderSchema),
    body: GmailBodySchema,
    parts: z.array(GmailMessagePayloadSchema).optional(),
  }),
)

export const GmailMessageResponseSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  labelIds: z.array(z.string()).optional(),
  snippet: z.string(),
  historyId: z.string().optional(),
  internalDate: z.string(), // ms timestamp
  payload: GmailMessagePayloadSchema.optional(),
  sizeEstimate: z.number().optional(),
  raw: z.string().optional(),
})

export const GmailMessagesResponseSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      threadId: z.string(),
    }),
  ),
  nextPageToken: z.string().optional(),
  resultSizeEstimate: z.number(),
})

export const GmailThreadResponseSchema = z.object({
  id: z.string(),
  historyId: z.string(),
  messages: z.array(GmailMessageResponseSchema),
})
