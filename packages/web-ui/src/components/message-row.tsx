import { EmailMessageType } from "@budio/zod/types"
import { cn } from "../lib/utils"

interface Props {
  message: EmailMessageType
}

export function MessageRow({ message }: Props) {
  return (
    <div className={cn("text-muted flex w-full items-center gap-3 text-sm")}>
      <div>{message.isRead && "unread"}</div>
      <div>{message.from}</div>
      <div className="flex-1">
        {message.subject} {message.body.slice(0, 50)}
      </div>
      <div>{message.date}</div>
    </div>
  )
}
