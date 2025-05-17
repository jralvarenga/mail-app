import { _ClippingModel } from "@copi/prisma/zod"
import z from "zod"

export const ResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string(),
})
