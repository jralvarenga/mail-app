"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { TRPCProvider } from "@budio/trpc/client"
import { Provider } from "jotai"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <Provider>
        <TRPCProvider>{children}</TRPCProvider>
      </Provider>
    </NextThemesProvider>
  )
}
