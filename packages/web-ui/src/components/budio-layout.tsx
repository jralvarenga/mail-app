"use client"

import { ReactNode, useState } from "react"
import { TooltipProvider } from "./ui/tooltip"
import { cn } from "../lib/utils"
import { BudioNav } from "./budio-nav"
import { LinkedAccountType } from "@budio/zod/types"
import {
  Archive,
  ArchiveX,
  Calendar,
  File,
  Inbox,
  Mail,
  Send,
  Trash2,
} from "lucide-react"
import { Separator } from "./ui/separator"
import { AccountSwitcher } from "./account-switcher"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable"
import { UserButton } from "./user-button"

interface Props {
  children: ReactNode
  defaultCollapsed?: boolean
  defaultLayout?: number[]
  accounts: LinkedAccountType[]
  selectedAccountEmail: string
  switchAccount: (email: string) => void

  redirect: (href: string) => void

  user?: { email: string; name: string; image?: string | null }
  logout: () => Promise<void>
}

export function BudioLayout({
  children,
  defaultCollapsed = false,
  accounts,
  defaultLayout = [20, 80],
  selectedAccountEmail,
  switchAccount,
  logout,
  user,
  redirect,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
            sizes,
          )}`
        }}
        className="h-full items-stretch"
      >
        {/* nav */}
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={4}
          collapsible={true}
          minSize={15}
          maxSize={30}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true,
            )}`
          }}
          onResize={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false,
            )}`
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <div
            className={cn(
              "flex h-[52px] items-center justify-end pr-2",
              isCollapsed ? "h-[52px]" : "",
            )}
          >
            <UserButton logout={logout} user={user} redirect={redirect} />
          </div>
          <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2",
            )}
          >
            <AccountSwitcher
              accounts={accounts}
              isCollapsed={isCollapsed}
              selectedAccount={selectedAccountEmail}
              switchAccount={switchAccount}
            />
          </div>
          <Separator />
          <BudioNav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Inbox",
                label: "128",
                icon: Inbox,
                variant: "selected",
              },
              {
                title: "Drafts",
                label: "9",
                icon: File,
                variant: "ghost",
              },
              {
                title: "Sent",
                label: "",
                icon: Send,
                variant: "ghost",
              },
              {
                title: "Junk",
                label: "23",
                icon: ArchiveX,
                variant: "ghost",
              },
              {
                title: "Trash",
                label: "",
                icon: Trash2,
                variant: "ghost",
              },
              {
                title: "Archive",
                label: "",
                icon: Archive,
                variant: "ghost",
              },
            ]}
          />
          <Separator />
          <BudioNav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Mail",
                label: "128",
                icon: Mail,
                variant: "selected",
              },
              {
                title: "Calendar",
                label: "9",
                icon: Calendar,
                variant: "ghost",
              },
            ]}
          />
          {/* <UserButton user={{
            name: "shadcn",
            email: "m@example.com",
            avatar: "https://github.com/shadcn.png",
          }}
          /> */}
        </ResizablePanel>
        <ResizableHandle withHandle />

        <ResizablePanel
          className="flex-1"
          defaultSize={defaultLayout[1]}
          minSize={30}
        >
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
