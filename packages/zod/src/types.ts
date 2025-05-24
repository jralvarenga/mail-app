import { z } from "zod"
import * as ZodUtils from "./utils"

export type ResponseType = z.infer<typeof ZodUtils.ResponseSchema>
export type GoogleIdTokenType = z.infer<typeof ZodUtils.GoogleIdTokenSchema>
export type MicrosoftIdTokenType = z.infer<
  typeof ZodUtils.MicrosoftIdTokenSchema
>
export type IdTokenType = z.infer<typeof ZodUtils.IdTokenSchema>
export type IdTokensArrayType = z.infer<typeof ZodUtils.IdTokensArraySchema>

export type EmailMessageType = z.infer<typeof ZodUtils.EmailMessageSchema>
export type ChatParticipantType = z.infer<typeof ZodUtils.ChatParticipantSchema>
export type ThreadedMessageType = z.infer<typeof ZodUtils.ThreadedMessageSchema>
export type ThreadedChatParticipantType = z.infer<
  typeof ZodUtils.ThreadedChatParticipantSchema
>

export type AccountSwitcherAccountType = z.infer<
  typeof ZodUtils.AccountSwitcherAccountSchema
>
export type AccountStateType = z.infer<typeof ZodUtils.AccountStateSchema>
export type MailStateType = z.infer<typeof ZodUtils.MailStateSchema>

/**
 * Gmail types
 */
export type GmailHeaderType = z.infer<typeof ZodUtils.GmailHeaderSchema>
export type GmailMessagePayloadType = z.infer<
  typeof ZodUtils.GmailMessagePayloadSchema
>
export type GmailMessageResponseType = z.infer<
  typeof ZodUtils.GmailMessageResponseSchema
>
export type GmailMessagesResponseType = z.infer<
  typeof ZodUtils.GmailMessagesResponseSchema
>
export type GmailThreadsResponseType = z.infer<
  typeof ZodUtils.GmailThreadsResponseSchema
>
export type GmailThreadResponseType = z.infer<
  typeof ZodUtils.GmailThreadResponseSchema
>
