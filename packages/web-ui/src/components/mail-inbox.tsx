import { EmailMessageType } from "@budio/zod/types"
import { Table, TableBody, TableCell, TableRow } from "./ui/table"
import dayjs from "@budio/lib/dayjs"

interface Props {
  messages: EmailMessageType[]
}

export function MailInbox({ messages }: Props) {
  // const toggleRead = (id: string) => {
  //   setMessages(messages.map((message) => (message.id === id ? { ...message, read: !message.read } : message)))

  return (
    <div className="w-full">
      <Table className="text-xs [&_td]:py-1 [&_th]:py-1 [&_tr]:h-[40px]">
        <TableBody>
          {messages.map((message) => (
            <TableRow
              key={message.id}
              className="hover:bg-muted/50 cursor-pointer"
              // onClick={() => toggleRead(message.id)}
            >
              <TableCell>
                <div
                  className={`h-2 w-2 rounded-full ${message.isRead ? "bg-inherit" : "bg-blue-500"}`}
                  aria-label={message.isRead ? "Read" : "Unread"}
                />
              </TableCell>
              <TableCell className="min-w-[70px] max-w-[100px] truncate py-1">
                {message.from.split(" <")[0]}
              </TableCell>
              <TableCell className="min-w-[200px] max-w-[400px] truncate py-1">
                <span className="font-medium">{message.subject}</span>{" "}
                <span className="text-muted-foreground">{message.snippet}</span>
              </TableCell>
              <TableCell className="text-right">
                {dayjs(message.date).fromNow()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
