import { cookies, headers } from "next/headers"
import { auth } from "@budio/auth"
import { redirect } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { AccountSwitcherAccountType, IdTokenType } from "@budio/zod/types"
import { BudioLayoutWrapper } from "@/components/budio-layout-wrapper"

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

  async function getIdToken(id: string, provider: string) {
    const { idToken } = await auth.api.getAccessToken({
      headers: await headers(),
      body: {
        accountId: id,
        providerId: provider,
      },
    })
    return idToken
  }

  const linkedAccounts = await auth.api.listUserAccounts({
    headers: await headers(),
  })
  const accounts = await Promise.all(
    linkedAccounts.map(async (account) => {
      let idToken: string | undefined = undefined
      try {
        idToken = await getIdToken(account.id, account.provider)
      } catch (err: any) {
        console.log({ err, xd: "xd" })
        console.log(err.body)

        const { idToken: newIdToken } = await auth.api.refreshToken({
          headers: await headers(),
          body: {
            accountId: account.id,
            providerId: account.provider,
          },
        })
        // idToken = newIdToken
      }

      const decodedIdToken: IdTokenType = await jwtDecode(idToken!)

      return {
        id: account.id,
        accountId: account.accountId,
        email: decodedIdToken.email,
        name: decodedIdToken.name,
        provider: account.provider,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="52 42 88 66">
            <title>Gmail</title>
            <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
            <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
            <path
              fill="#fbbc04"
              d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"
            />
            <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
            <path
              fill="#c5221f"
              d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"
            />
          </svg>
        ),
        // TODO: fix icons
        // icon: account.provider === "google" ? Icons.gmail : Icons.outlook,
      } satisfies AccountSwitcherAccountType
    }),
  )

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
