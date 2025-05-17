
import { createTRPCRouter, protectedProcedure } from "../init"
import { ResponseSchema } from "@budio/zod/utils"
import { z } from "@budio/zod"

export const gmailRouter = createTRPCRouter({
  list: protectedProcedure
    .output(
      ResponseSchema.extend({
        data: z.any(),
      }),
    )
    .query(async ({ ctx }) => {
      console.log(ctx);
      


      return {
        data: {
          xd: 'xd'
        },
        success: true,
        message: "EX",
      }
    }),
})
