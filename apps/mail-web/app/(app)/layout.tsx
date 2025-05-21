import { cookies, headers } from "next/headers"
import { auth } from "@budio/auth"
import { redirect } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { AccountSwitcherAccountType, IdTokenType } from "@budio/zod/types"
import { BudioLayoutWrapper } from "@/components/budio-layout-wrapper"
import { getLinkedAccounts } from "@/server/auth"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookiesStore = await cookies()
  const collapsed = cookiesStore.get("react-resizable-panels:collapsed")
  const layout = cookiesStore.get("react-resizable-panels:layout:mail")
  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const accounts = await getLinkedAccounts()

  return (
    <BudioLayoutWrapper
      accounts={accounts || []}
      defaultCollapsed={defaultCollapsed}
      defaultLayout={defaultLayout}
    >
      {children}
    </BudioLayoutWrapper>
  )
}
