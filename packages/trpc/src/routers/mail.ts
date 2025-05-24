import { createTRPCRouter, protectedProcedure } from "../init"
import { EmailMessageSchema, ResponseSchema } from "@budio/zod/utils"
import { z } from "@budio/zod"
import { fetchGmailInboxPage } from "../lib/gmail"
import { EmailMessageType } from "@budio/zod/types"

export const mailRouter = createTRPCRouter({
  inbox: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        accessToken: z.string(),
        provider: z.string(),
      }),
    )
    .output(
      ResponseSchema.extend({
        data: z.object({
          inbox: EmailMessageSchema.array(),
          nextPageToken: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      let inbox: EmailMessageType[] = []
      let nextPageToken: string | undefined

      if (input.provider === "google") {
        const { messages, nextPageToken: gmailNextPageToken } =
          await fetchGmailInboxPage(input.accessToken, input.userId)

        inbox = messages
        nextPageToken = gmailNextPageToken
      }

      return {
        data: {
          inbox,
          nextPageToken,
        },
        success: true,
        message: "Inbox fetched successfully",
      }
    }),
})
