'use client'

import { authClient } from "@budio/auth/client"
import { Button } from "@budio/web-ui/components/ui/button"

export default function Page() {
  async function loginWithGoogle() {
    const data = await authClient.signIn.social({
      provider: "google"
    })
    console.log(data)
  }

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <Button size="sm" onClick={loginWithGoogle}>Login with google</Button>
      </div>
    </div>
  )
}
