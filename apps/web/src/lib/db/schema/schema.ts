import { createId } from "@paralleldrive/cuid2";
import { index, integer, sqliteTable, text, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core";

export const cuid2 = (name = "id") =>
  text(name, { length: 32 }).$defaultFn(() => createId());

// export const tenant = sqliteTable(
//   "tenant",
//   {
//     id: text("id").primaryKey(),
//     name: text("name").notNull(),
//     createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
//     updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
//   },
// );

// export const driveSources = ["r2"] as const;

// export const drives = sqliteTable(
//   "drive",
//   {
//     id: cuid2().primaryKey(),
//     tenantId: cuid2("tenant").notNull(),
//     name: text("name").notNull(),
//     description: text("description"),
//     source: text("source", { enum: driveSources }).notNull(),
//     createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
//   },
// );

// export const driveTenant = sqliteTable(
//   "drive_tenant",
//   {
//     tenant: cuid2().notNull(),
//     drive: cuid2().notNull(),
//   },
//   (table) => [
//     primaryKey({
//       name: "users_to_groups_pk",
//       columns: [table.tenant, table.drive],
//     }),
//   ]
// );
