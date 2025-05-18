"use client"

import { fetchGmail } from "@/lib/gmail"
import { organizeEmailsAsChat } from "@/lib/organize-email-as-chat"
import { fetchOutlook } from "@/lib/outlook"
import { authClient } from "@budio/auth/client"
import { Button } from "@budio/web-ui/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Page() {
  const { data } = authClient.useSession()
  const router = useRouter()

  async function fetchMail() {
    const { data: accounts } = await authClient.listAccounts()
    accounts?.map(async (account) => {
      /**
       * gmail fetch
       */
      if (account.provider === "google") {
        const accessToken = await authClient.getAccessToken({
          accountId: account.id,
          userId: data!.user.id,
          providerId: account.provider,
        })
        const emails = await fetchGmail(
          accessToken.data!.accessToken!,
          account.accountId,
        )
        const chat = organizeEmailsAsChat(emails)
      }

      /**
       * outlook fetch
       */
      if (account.provider === "microsoft") {
        const accessToken = await authClient.getAccessToken({
          accountId: account.id,
          userId: data!.user.id,
          providerId: account.provider,
        })
        const emails = await fetchOutlook(accessToken.data!.accessToken!)
        const chat = organizeEmailsAsChat(emails)
        console.log(chat)
      }
    })
  }

  async function logout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login") // redirect to login page
        },
      },
    })
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button onClick={fetchMail}>Fetch mail</Button>
        <Link href={"/account"}>
          <Button size="sm">Account</Button>
        </Link>

        <Button size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  )
}
