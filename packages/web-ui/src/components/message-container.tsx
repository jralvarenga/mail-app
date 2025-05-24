import { AccountSwitcherAccountType, EmailMessageType } from "@budio/zod/types"
import DOMPurify from "dompurify"
import { cn } from "../lib/utils"
import { useState } from "react"
import { Button } from "./ui/button"

interface Props {
  messages: EmailMessageType[]
  selectedAccount: AccountSwitcherAccountType
}

export function MessageContainer({ messages, selectedAccount }: Props) {
  const [onlyShowText, setOnlyShowText] = useState(false)

  function sanitizeHtml(htmlString: string) {
    return DOMPurify.sanitize(htmlString, {
      ALLOWED_TAGS: ["div"],
      ALLOWED_ATTR: ["class", "dir"],
      KEEP_CONTENT: true,
      // This ensures that content inside the tags is preserved
    })
  }

  function cleanBody(body: string) {
    return body
      .replace(/\r\n/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&#39;/g, "'")
  }
  console.log(messages)

  return (
    <div className="max-w-1/2 relative flex h-full flex-1 flex-col gap-3">
      <div className="bg-background/50 absolute top-0 z-50 h-16 w-full backdrop-blur-lg">
        Messages
        <Button onClick={() => setOnlyShowText(!onlyShowText)}>
          Toggle sanitize
        </Button>
      </div>
      <div className="overflow-y-auto px-4 pb-20 pt-20">
        {messages.map((message) => (
          <div
            className={cn(
              "flex",
              message.from === selectedAccount.email
                ? "justify-end"
                : "justify-start",
            )}
          >
            <div
              className="bg-muted max-w-11/12 flex flex-col gap-2 rounded-lg p-2"
              key={message.id}
            >
              <div>
                <div className={`overflow-auto`}>
                  {message.type === "text/html" ? (
                    <div
                      className={`max-w-none origin-top-left scale-100 transform`}
                      dangerouslySetInnerHTML={{
                        __html: onlyShowText
                          ? sanitizeHtml(cleanBody(message.body))
                          : cleanBody(message.body),
                      }}
                      style={{
                        lineHeight: "1.4",
                        color: "#374151",
                      }}
                    />
                  ) : (
                    // <pre className={`whitespace-pre-wrap text-sm text-foreground font-mono text-xs`}>
                    <pre
                      className={`text-foreground whitespace-pre-wrap font-mono text-sm`}
                    >
                      {cleanBody(message.body)}
                    </pre>
                  )}
                </div>
              </div>
              <div>Options</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background/50 absolute bottom-0 z-50 h-16 w-full backdrop-blur-lg">
        Replies
      </div>
    </div>
  )
}
