import { createId } from "@paralleldrive/cuid2";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { Effect } from "effect";
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import * as schema from "~/drizzle/schema";
import {
  DriveConflictError,
  DriveDetails,
  type DriveEntryId,
  DriveEntryId as DriveEntryIdSchema,
  DriveEntryNotFoundError,
  type DriveId,
  DriveId as DriveIdSchema,
  DriveSummary as DriveSummarySchema,
  DriveEntry as DriveEntrySchema,
  DriveNotFoundError,
  DriveStorageError,
  DriveUnauthenticatedError,
  InvalidDriveInputError,
} from "~/server/domain/Drive";
import { auth } from "~/server/lib/auth";
import { db } from "~/server/lib/db";
import { R2ObjectNotFoundError, R2Service, R2StorageError } from "~/server/lib/r2";
import { osDriveApi } from "../../domain";

const DRIVE_PREFIX = "/drive";
const TEXT_PREVIEW_MAX_BYTES = 256_000;

type DriveRow = typeof schema.drive.$inferSelect;
type DriveEntryRow = typeof schema.driveEntry.$inferSelect;

const isTextMimeType = (mimeType: string) =>
  mimeType.startsWith("text/") || mimeType === "application/json";

const sanitizeName = (name: string, label: string) => {
  const value = name.trim();
  if (!value) {
    return Effect.fail(new InvalidDriveInputError({ reason: `${label} is required` }));
  }
  if (value.includes("/")) {
    return Effect.fail(
      new InvalidDriveInputError({ reason: `${label} cannot contain forward slashes` }),
    );
  }
  return Effect.succeed(value);
};

const toDriveStorageKey = (driveId: DriveId, entryId: DriveEntryId) =>
  `${DRIVE_PREFIX}/${driveId}/files/${entryId}`;

const toEntryContentUrl = (driveId: DriveId, entryId: DriveEntryId) =>
  `/api/drive/${driveId}/entry/${entryId}/content`;

const mapStorageError = (cause: R2StorageError) =>
  new DriveStorageError({
    operation: cause.operation,
    message:
      cause.cause instanceof Error ? cause.cause.message : String(cause.cause ?? cause.operation),
  });

const mapDriveRow = (row: DriveRow) =>
  new DriveSummarySchema({
    id: DriveIdSchema.make(row.id),
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });

const mapDriveEntryRow = (row: DriveEntryRow) => {
  const driveId = DriveIdSchema.make(row.driveId);
  const entryId = DriveEntryIdSchema.make(row.id);
  const isFile = row.kind === "file";
  const contentUrl = isFile ? toEntryContentUrl(driveId, entryId) : null;
  const previewUrl =
    isFile && row.mimeType && !isTextMimeType(row.mimeType)
      ? toEntryContentUrl(driveId, entryId)
      : null;

  return new DriveEntrySchema({
    id: entryId,
    driveId,
    parentId: row.parentId ? DriveEntryIdSchema.make(row.parentId) : null,
    kind: row.kind,
    name: row.name,
    mimeType: row.mimeType ?? null,
    size: row.size ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    contentUrl,
    previewUrl,
    textPreview: null,
  });
};

const getCurrentUser = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;

  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  const session = yield* Effect.tryPromise({
    try: () => auth.api.getSession({ headers }),
    catch: () => new DriveUnauthenticatedError(),
  });

  if (!session?.user) {
    return yield* Effect.fail(new DriveUnauthenticatedError());
  }

  return session.user;
});

const ensureDrive = (driveId: DriveId, userId: string) =>
  Effect.tryPromise({
    try: async () => {
      const rows = await db
        .select()
        .from(schema.drive)
        .where(and(eq(schema.drive.id, driveId), eq(schema.drive.userId, userId)))
        .limit(1);
      return rows[0] ?? null;
    },
    catch: (cause) => mapStorageError(new R2StorageError({ operation: "head", cause })),
  }).pipe(
    Effect.flatMap((row) =>
      row ? Effect.succeed(row) : Effect.fail(new DriveNotFoundError({ id: driveId })),
    ),
  );

const listDriveEntries = (driveId: DriveId) =>
  Effect.tryPromise({
    try: () =>
      db
        .select()
        .from(schema.driveEntry)
        .where(eq(schema.driveEntry.driveId, driveId))
        .orderBy(asc(schema.driveEntry.kind), asc(schema.driveEntry.name)),
    catch: (cause) => mapStorageError(new R2StorageError({ operation: "list", cause })),
  });

const ensureParentFolder = (driveId: DriveId, parentId?: string | null) =>
  Effect.gen(function* () {
    if (!parentId) {
      return null as DriveEntryRow | null;
    }

    const rows = yield* Effect.tryPromise({
      try: () =>
        db
          .select()
          .from(schema.driveEntry)
          .where(and(eq(schema.driveEntry.id, parentId), eq(schema.driveEntry.driveId, driveId)))
          .limit(1),
      catch: (cause) => mapStorageError(new R2StorageError({ operation: "head", cause })),
    });
    const row = rows[0] ?? null;

    if (!row) {
      return yield* Effect.fail(
        new DriveEntryNotFoundError({ id: DriveEntryIdSchema.make(parentId) }),
      );
    }
    if (row.kind !== "folder") {
      return yield* Effect.fail(
        new InvalidDriveInputError({ reason: "Files cannot contain child items" }),
      );
    }

    return row;
  });

const ensureUniqueSiblingName = (
  driveId: DriveId,
  parentId: string | null,
  name: string,
  excludeId?: string,
) =>
  Effect.tryPromise({
    try: async () => {
      const rows = await db
        .select({ id: schema.driveEntry.id })
        .from(schema.driveEntry)
        .where(
          and(
            eq(schema.driveEntry.driveId, driveId),
            parentId === null
              ? isNull(schema.driveEntry.parentId)
              : eq(schema.driveEntry.parentId, parentId),
            eq(schema.driveEntry.name, name),
          ),
        )
        .limit(10);
      return rows;
    },
    catch: (cause) => mapStorageError(new R2StorageError({ operation: "head", cause })),
  }).pipe(
    Effect.flatMap((rows) => {
      const conflict = rows.some((row) => row.id !== excludeId);
      return conflict
        ? Effect.fail(new DriveConflictError({ reason: `An item named "${name}" already exists` }))
        : Effect.void;
    }),
  );

const ensureEntry = (driveId: DriveId, entryId: DriveEntryId) =>
  Effect.tryPromise({
    try: async () => {
      const rows = await db
        .select()
        .from(schema.driveEntry)
        .where(and(eq(schema.driveEntry.id, entryId), eq(schema.driveEntry.driveId, driveId)))
        .limit(1);
      return rows[0] ?? null;
    },
    catch: (cause) => mapStorageError(new R2StorageError({ operation: "head", cause })),
  }).pipe(
    Effect.flatMap((row) =>
      row ? Effect.succeed(row) : Effect.fail(new DriveEntryNotFoundError({ id: entryId })),
    ),
  );

const getEntryWithPreview = (row: DriveEntryRow) =>
  Effect.gen(function* () {
    const entry = mapDriveEntryRow(row);
    if (
      row.kind !== "file" ||
      !row.mimeType ||
      !isTextMimeType(row.mimeType) ||
      (row.size ?? 0) > TEXT_PREVIEW_MAX_BYTES
    ) {
      return entry;
    }

    const r2 = yield* R2Service;
    const textPreview = yield* r2.getObject(row.storageKey!).pipe(
      Effect.flatMap((object) => Effect.tryPromise(() => object.text())),
      Effect.mapError((cause) => {
        if (cause instanceof R2ObjectNotFoundError) {
          return new DriveEntryNotFoundError({ id: entry.id });
        }
        if (cause instanceof R2StorageError) {
          return mapStorageError(cause);
        }
        return new DriveStorageError({
          operation: "get",
          message: cause instanceof Error ? cause.message : String(cause),
        });
      }),
    );

    return new DriveEntrySchema({
      ...entry,
      textPreview,
    });
  });

const collectEntryIds = (entries: ReadonlyArray<DriveEntryRow>, rootId: string) => {
  const ids = new Set<string>([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const entry of entries) {
      if (entry.parentId && ids.has(entry.parentId) && !ids.has(entry.id)) {
        ids.add(entry.id);
        changed = true;
      }
    }
  }

  return ids;
};

const deleteEntryTree = (driveId: DriveId, entryId: DriveEntryId) =>
  Effect.gen(function* () {
    const target = yield* ensureEntry(driveId, entryId);
    const allEntries = yield* listDriveEntries(driveId);
    const descendantIds = collectEntryIds(allEntries, target.id);
    const toDelete = allEntries.filter((entry) => descendantIds.has(entry.id));
    const fileKeys = toDelete
      .filter((entry) => entry.kind === "file" && entry.storageKey)
      .map((entry) => entry.storageKey as string);

    const r2 = yield* R2Service;
    yield* Effect.forEach(
      fileKeys,
      (key) => r2.deleteObject(key).pipe(Effect.mapError(mapStorageError)),
      {
        discard: true,
      },
    );

    yield* Effect.tryPromise({
      try: async () => {
        await db
          .delete(schema.driveEntry)
          .where(inArray(schema.driveEntry.id, Array.from(descendantIds)));
      },
      catch: (cause) => mapStorageError(new R2StorageError({ operation: "delete", cause })),
    });
  });

const deleteDriveTree = (driveId: DriveId) =>
  Effect.gen(function* () {
    const entries = yield* listDriveEntries(driveId);
    const r2 = yield* R2Service;
    const fileKeys = entries
      .filter((entry) => entry.kind === "file" && entry.storageKey)
      .map((entry) => entry.storageKey as string);

    yield* Effect.forEach(
      fileKeys,
      (key) => r2.deleteObject(key).pipe(Effect.mapError(mapStorageError)),
      {
        discard: true,
      },
    );

    yield* Effect.tryPromise({
      try: async () => {
        await db.delete(schema.drive).where(eq(schema.drive.id, driveId));
      },
      catch: (cause) => mapStorageError(new R2StorageError({ operation: "delete", cause })),
    });
  });

export const driveApiLayer = HttpApiBuilder.group(osDriveApi, "Drive", (handlers) =>
  handlers
    .handle("getDrives", () =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        const rows = yield* Effect.tryPromise({
          try: () =>
            db
              .select()
              .from(schema.drive)
              .where(eq(schema.drive.userId, user.id))
              .orderBy(asc(schema.drive.name)),
          catch: (cause) => mapStorageError(new R2StorageError({ operation: "list", cause })),
        });

        return rows.map(mapDriveRow);
      }).pipe(Effect.withSpan("drive.list")),
    )
    .handle("createDrive", ({ payload }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        const name = yield* sanitizeName(payload.name, "Drive name");

        const existing = yield* Effect.tryPromise({
          try: async () => {
            const rows = await db
              .select({ id: schema.drive.id })
              .from(schema.drive)
              .where(and(eq(schema.drive.userId, user.id), eq(schema.drive.name, name)))
              .limit(1);
            return rows[0] ?? null;
          },
          catch: (cause) => mapStorageError(new R2StorageError({ operation: "head", cause })),
        });

        if (existing) {
          return yield* Effect.fail(
            new DriveConflictError({ reason: `A drive named "${name}" already exists` }),
          );
        }

        const now = new Date();
        const id = DriveIdSchema.make(createId());
        const row = {
          id,
          userId: user.id,
          name,
          createdAt: now,
          updatedAt: now,
        } as const;

        yield* Effect.tryPromise({
          try: () => db.insert(schema.drive).values(row),
          catch: (cause) => mapStorageError(new R2StorageError({ operation: "put", cause })),
        });

        return mapDriveRow(row);
      }).pipe(Effect.withSpan("drive.create")),
    )
    .handle("getDrive", ({ params }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        const drive = yield* ensureDrive(params.driveId, user.id);
        const entries = yield* listDriveEntries(params.driveId);

        return new DriveDetails({
          id: DriveIdSchema.make(drive.id),
          name: drive.name,
          createdAt: drive.createdAt,
          updatedAt: drive.updatedAt,
          entries: entries.map(mapDriveEntryRow),
        });
      }).pipe(Effect.withSpan("drive.get")),
    )
    .handle("renameDrive", ({ params, payload }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        const drive = yield* ensureDrive(params.driveId, user.id);
        const name = yield* sanitizeName(payload.name, "Drive name");

        const existing = yield* Effect.tryPromise({
          try: async () => {
            const rows = await db
              .select({ id: schema.drive.id })
              .from(schema.drive)
              .where(and(eq(schema.drive.userId, user.id), eq(schema.drive.name, name)))
              .limit(10);
            return rows;
          },
          catch: (cause) => mapStorageError(new R2StorageError({ operation: "head", cause })),
        });

        if (existing.some((entry) => entry.id !== drive.id)) {
          return yield* Effect.fail(
            new DriveConflictError({ reason: `A drive named "${name}" already exists` }),
          );
        }

        const updatedAt = new Date();
        yield* Effect.tryPromise({
          try: () =>
            db.update(schema.drive).set({ name, updatedAt }).where(eq(schema.drive.id, drive.id)),
          catch: (cause) => mapStorageError(new R2StorageError({ operation: "put", cause })),
        });

        return mapDriveRow({ ...drive, name, updatedAt });
      }).pipe(Effect.withSpan("drive.rename")),
    )
    .handle("deleteDrive", ({ params }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        yield* ensureDrive(params.driveId, user.id);
        yield* deleteDriveTree(params.driveId);
        return { ok: true };
      }).pipe(Effect.withSpan("drive.delete")),
    )
    .handle("createFolder", ({ params, payload }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        yield* ensureDrive(params.driveId, user.id);

        const name = yield* sanitizeName(payload.name, "Folder name");
        const parent = yield* ensureParentFolder(params.driveId, payload.parentId ?? null);
        yield* ensureUniqueSiblingName(params.driveId, parent?.id ?? null, name);

        const now = new Date();
        const row = {
          id: DriveEntryIdSchema.make(createId()),
          driveId: params.driveId,
          parentId: parent?.id ?? null,
          kind: "folder" as const,
          name,
          storageKey: null,
          mimeType: null,
          size: null,
          createdAt: now,
          updatedAt: now,
        };

        yield* Effect.tryPromise({
          try: () => db.insert(schema.driveEntry).values(row),
          catch: (cause) => mapStorageError(new R2StorageError({ operation: "put", cause })),
        });

        return mapDriveEntryRow(row);
      }).pipe(Effect.withSpan("drive.create-folder")),
    )
    .handleRaw("uploadFile", ({ params, request }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        yield* ensureDrive(params.driveId, user.id);
        const r2 = yield* R2Service;

        const formData = yield* Effect.tryPromise({
          try: () => {
            if (request.source instanceof Request) {
              return request.source.formData();
            }

            const body = (request.source as { body?: { _tag?: string; formData?: FormData } }).body;
            if (body?._tag === "FormData" && body.formData instanceof FormData) {
              return Promise.resolve(body.formData);
            }

            throw new Error("Request body is not multipart form data");
          },
          catch: (cause) =>
            new InvalidDriveInputError({
              reason: cause instanceof Error ? cause.message : "Invalid multipart form data",
            }),
        });

        const uploaded = formData.get("file");
        if (!(uploaded instanceof File)) {
          return yield* Effect.fail(new InvalidDriveInputError({ reason: "File is required" }));
        }

        const rawName = formData.get("name");
        const parentIdValue = formData.get("parentId");
        const parent = yield* ensureParentFolder(
          params.driveId,
          typeof parentIdValue === "string" && parentIdValue.trim() ? parentIdValue.trim() : null,
        );
        const name = yield* sanitizeName(
          (typeof rawName === "string" ? rawName.trim() : "") || uploaded.name,
          "File name",
        );
        yield* ensureUniqueSiblingName(params.driveId, parent?.id ?? null, name);

        const entryId = DriveEntryIdSchema.make(createId());
        const storageKey = toDriveStorageKey(params.driveId, entryId);
        const mimeType = uploaded.type || "application/octet-stream";
        const stored = yield* r2
          .putObject({
            key: storageKey,
            body: uploaded,
            httpMetadata: {
              contentType: mimeType,
              contentDisposition: `inline; filename="${name.replaceAll('"', "")}"`,
            },
            customMetadata: {
              name,
              driveId: params.driveId,
              entryId,
              uploader: user.id,
            },
          })
          .pipe(Effect.mapError(mapStorageError));

        const row = {
          id: entryId,
          driveId: params.driveId,
          parentId: parent?.id ?? null,
          kind: "file" as const,
          name,
          storageKey,
          mimeType,
          size: stored.size,
          createdAt: stored.uploaded,
          updatedAt: stored.uploaded,
        };

        yield* Effect.tryPromise({
          try: () => db.insert(schema.driveEntry).values(row),
          catch: (cause) => mapStorageError(new R2StorageError({ operation: "put", cause })),
        });

        return mapDriveEntryRow(row);
      }).pipe(Effect.withSpan("drive.upload-file")),
    )
    .handle("getEntry", ({ params }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        yield* ensureDrive(params.driveId, user.id);
        const entry = yield* ensureEntry(params.driveId, params.entryId);
        return yield* getEntryWithPreview(entry);
      }).pipe(Effect.withSpan("drive.get-entry")),
    )
    .handle("renameEntry", ({ params, payload }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        yield* ensureDrive(params.driveId, user.id);
        const entry = yield* ensureEntry(params.driveId, params.entryId);
        const name = yield* sanitizeName(
          payload.name,
          entry.kind === "folder" ? "Folder name" : "File name",
        );
        yield* ensureUniqueSiblingName(params.driveId, entry.parentId ?? null, name, entry.id);

        const updatedAt = new Date();
        yield* Effect.tryPromise({
          try: () =>
            db
              .update(schema.driveEntry)
              .set({ name, updatedAt })
              .where(eq(schema.driveEntry.id, entry.id)),
          catch: (cause) => mapStorageError(new R2StorageError({ operation: "put", cause })),
        });

        return mapDriveEntryRow({ ...entry, name, updatedAt });
      }).pipe(Effect.withSpan("drive.rename-entry")),
    )
    .handle("deleteEntry", ({ params }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        yield* ensureDrive(params.driveId, user.id);
        yield* deleteEntryTree(params.driveId, params.entryId);
        return { ok: true };
      }).pipe(Effect.withSpan("drive.delete-entry")),
    )
    .handle("getEntryContent", ({ params }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        yield* ensureDrive(params.driveId, user.id);
        const entry = yield* ensureEntry(params.driveId, params.entryId);
        if (entry.kind !== "file" || !entry.storageKey) {
          return yield* Effect.fail(
            new InvalidDriveInputError({ reason: "Only files can be downloaded or previewed" }),
          );
        }

        const r2 = yield* R2Service;
        const object = yield* r2.getObject(entry.storageKey).pipe(
          Effect.mapError((cause) => {
            if (cause instanceof R2ObjectNotFoundError) {
              return new DriveEntryNotFoundError({ id: params.entryId });
            }

            return mapStorageError(cause);
          }),
        );

        return HttpServerResponse.raw(object.body, {
          contentType: entry.mimeType ?? "application/octet-stream",
          contentLength: entry.size ?? undefined,
          headers: {
            "content-disposition": `inline; filename="${entry.name.replaceAll('"', "")}"`,
          },
        });
      }).pipe(Effect.withSpan("drive.get-entry-content")),
    ),
);
