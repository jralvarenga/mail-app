'use client'

import { authClient } from "@budio/auth/client"
import { Button } from "@budio/web-ui/components/ui/button"
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter()

  async function logout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // redirect to login page
        },
      },
    });
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">Button</Button>


        <Button size="sm" onClick={logout}>Logout</Button>
      </div>
    </div>
  )
}
