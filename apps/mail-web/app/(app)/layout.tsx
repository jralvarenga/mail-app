import { headers } from "next/headers"
import { auth } from "@budio/auth"
import { redirect } from "next/navigation"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({
      headers: await headers()
  })

  if(!session) {
    redirect('/login')
  }

  return (
    children
  )
}
