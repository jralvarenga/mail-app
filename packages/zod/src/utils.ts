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
