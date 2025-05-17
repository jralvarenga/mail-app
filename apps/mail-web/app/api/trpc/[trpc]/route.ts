import { fetchRequestHandler } from "@budio/trpc/server"
import { createTRPCContext } from "@budio/trpc/context"
import { appRouter } from "@budio/trpc/router"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
