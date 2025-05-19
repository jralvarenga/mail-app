import { createTRPCRouter } from "../init"
import { mailRouter } from "./mail"
import { userRouter } from "./user"

export const appRouter = createTRPCRouter({
  mail: mailRouter,
  user: userRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
