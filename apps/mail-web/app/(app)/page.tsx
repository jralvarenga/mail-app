"use client"

import { authClient } from "@budio/auth/client"
import { trpc } from "@budio/trpc/client"
import { Button } from "@budio/web-ui/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Page() {
  const query = trpc.gmail.list.useQuery()
  const router = useRouter()

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
