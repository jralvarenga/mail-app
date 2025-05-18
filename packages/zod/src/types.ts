import { z } from "zod"
import * as ZodUtils from "./utils"

export type ResponseType = z.infer<typeof ZodUtils.ResponseSchema>
export type GoogleIdTokenType = z.infer<typeof ZodUtils.GoogleIdTokenSchema>
export type MicrosoftIdTokenType = z.infer<
  typeof ZodUtils.MicrosoftIdTokenSchema
>
export type IdTokenType = z.infer<typeof ZodUtils.IdTokenSchema>
export type IdTokensArrayType = z.infer<typeof ZodUtils.IdTokensArraySchema>
