import { cookies, headers } from "next/headers"
import { auth } from "@budio/auth"
import { redirect } from "next/navigation"
import { BudioLayoutWrapper } from "@/components/budio-layout-wrapper"
import { getLinkedAccounts } from "@/server/auth"
import { StateWrapper } from "@/components/state-wrapper"

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookiesStore = await cookies()
  const collapsed = cookiesStore.get("react-resizable-panels:collapsed")
  const layout = cookiesStore.get("react-resizable-panels:layout:mail")
  const selectedAccountEmail = cookiesStore.get("selected-account-email")
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
    <StateWrapper
      accounts={accounts}
      selectedAccount={
        accounts.find(
          (account) => account.email === selectedAccountEmail?.value,
        ) || null
      }
    >
      <BudioLayoutWrapper
        accounts={accounts || []}
        defaultCollapsed={defaultCollapsed}
        defaultLayout={defaultLayout}
      >
        {children}
      </BudioLayoutWrapper>
    </StateWrapper>
  )
}
