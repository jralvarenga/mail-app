import { createTRPCRouter, protectedProcedure } from "../init"
import { ResponseSchema, IdTokensArraySchema } from "@budio/zod/utils"
import { z } from "@budio/zod"
import { account } from "@budio/drizzle/schema"
import { inArray } from "drizzle-orm"
import { jwtDecode } from "jwt-decode"

export const userRouter = createTRPCRouter({
  getLinkedAccountsIdToken: protectedProcedure
    .output(
      ResponseSchema.extend({
        data: z.object({
          tokens: IdTokensArraySchema,
        }),
      }),
    )
    .input(z.object({ accountIds: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const linkedAccounts = await ctx.db
        .select()
        .from(account)
        .where(inArray(account.id, input.accountIds))
      const decodedTokens = linkedAccounts.map((account) => ({
        accountId: account.accountId,
        providerId: account.providerId,
        token: jwtDecode(account.idToken!),
      }))
      const validatedTokens = IdTokensArraySchema.parse(decodedTokens)

      return {
        data: {
          tokens: validatedTokens,
        },
        success: true,
        message: "Id token retrieved",
      }
    }),
})
