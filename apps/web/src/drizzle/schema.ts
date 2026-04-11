import { createId } from "@paralleldrive/cuid2";
import { index, integer, sqliteTable, text, uniqueIndex, primaryKey } from "drizzle-orm/sqlite-core";

export const cuid2 = (name = "id") =>
  text(name, { length: 32 }).$defaultFn(() => createId());

export const user = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  table => [uniqueIndex("user_email_unique").on(table.email)],
);

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  table => [uniqueIndex("session_token_unique").on(table.token), index("session_user_id_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  table => [
    uniqueIndex("account_provider_account_unique").on(table.providerId, table.accountId),
    index("account_user_id_idx").on(table.userId),
  ],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  table => [index("verification_identifier_idx").on(table.identifier)],
);

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
