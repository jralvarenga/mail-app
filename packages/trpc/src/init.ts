import { initTRPC } from "@trpc/server"
import { Context } from "./server/context"

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create()

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.session?.user) {
    throw new Error("UNAUTHORIZED")
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user
    }
  })
})

// Base router and procedure helpers
export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

// Public procedure - no auth required
export const publicProcedure = t.procedure

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(isAuthed)
