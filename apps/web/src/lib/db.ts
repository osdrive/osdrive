import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { authSchema } from "~/lib/db/schema/auth";

export function getDb() {
  return drizzle(env.AUTH_DB, { schema: authSchema });
}
