import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle/local",
  schema: "./src/local-schema.ts",
  dialect: "postgresql",
})
