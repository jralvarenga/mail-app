"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { TRPCProvider } from "@budio/trpc/client"
import { Provider } from "jotai"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

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
        <TRPCProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </TRPCProvider>
      </Provider>
    </NextThemesProvider>
  )
}
