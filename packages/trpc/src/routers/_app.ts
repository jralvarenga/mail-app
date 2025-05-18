import { createTRPCRouter } from "../init"
import { gmailRouter } from "./gmail"
import { userRouter } from "./user"

export const appRouter = createTRPCRouter({
  gmail: gmailRouter,
  user: userRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
