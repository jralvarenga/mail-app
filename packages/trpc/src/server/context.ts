import { db } from "@budio/drizzle/db"
import { cache } from "react"
import { auth } from "@budio/auth"

export const createTRPCContext = cache(async (opts?: { req?: Request }): Promise<{ 
  db: typeof db;
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
  user: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>["user"] | null;
}> => {
  const session = await auth.api.getSession({
    headers: opts?.req?.headers ?? new Headers()
  })

  return {
    db,
    session,
    user: session?.user ?? null
  }
})

export type Context = Awaited<ReturnType<typeof createTRPCContext>>
