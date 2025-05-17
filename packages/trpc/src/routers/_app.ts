import { createTRPCRouter } from "../init"
import { gmailRouter } from "./gmail"

export const appRouter = createTRPCRouter({
  gmail: gmailRouter
})

// export type definition of API
export type AppRouter = typeof appRouter
