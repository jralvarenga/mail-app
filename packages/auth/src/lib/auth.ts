import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@budio/drizzle/db";
import * as schema from "@budio/drizzle/schema";
import { nextCookies } from "better-auth/next-js"
 
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    schema
  }), 
  plugins: [nextCookies()],
  socialProviders: {
    google: { 
        prompt: "select_account",
        clientId: process.env.GOOGLE_CLIENT_ID as string, 
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        scope: [
          'https://www.googleapis.com/auth/gmail.modify', // gmail (read, write, delete)
        ]
    }, 
  }
});