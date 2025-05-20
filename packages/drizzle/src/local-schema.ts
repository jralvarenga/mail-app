import { pgTable, varchar, text, boolean } from "drizzle-orm/pg-core"

export const messagesTable = pgTable("messages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  threadId: varchar("thread_id", { length: 255 }).notNull(),
  from: varchar("from", { length: 255 }).notNull(),
  to: varchar("to", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  date: varchar("date", { length: 255 }).notNull(),
  body: text("body").notNull(),
  snippet: text("snippet").notNull(),
  isRead: boolean("is_read").notNull().default(false),
})
