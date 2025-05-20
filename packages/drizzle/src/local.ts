import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import * as schema from "./local-schema"

// Initialize PGlite with a local database
const pglite = new PGlite()

// Initialize Drizzle with PGlite
export const localDb = drizzle(pglite, { schema })

// Helper function to execute SQL queries
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: any[] = [],
): Promise<T[]> {
  const result = await pglite.query(sql, params)
  return result.rows as T[]
}

// Initialize the database with any required tables
export async function initializeLocalDatabase() {
  // Drizzle will automatically create tables based on the schema
  // No need for manual table creation
}

// Call initializeDatabase when the module is imported
initializeLocalDatabase().catch(console.error)
