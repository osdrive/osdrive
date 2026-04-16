import { type Brand, Schema } from "effect";
import * as Multipart from "effect/unstable/http/Multipart";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect/unstable/httpapi";

export type DriveId = string & Brand.Brand<"DriveId">;
export const DriveId = Schema.String.pipe(Schema.brand("DriveId"));

export type DriveEntryId = string & Brand.Brand<"DriveEntryId">;
export const DriveEntryId = Schema.String.pipe(Schema.brand("DriveEntryId"));

export const DriveEntryKind = Schema.Union([Schema.Literal("folder"), Schema.Literal("file")]);

export class DriveSummary extends Schema.Class<DriveSummary>("DriveSummary")({
  id: DriveId,
  name: Schema.String,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
}) {}

export class DriveEntry extends Schema.Class<DriveEntry>("DriveEntry")({
  id: DriveEntryId,
  driveId: DriveId,
  parentId: Schema.NullOr(DriveEntryId),
  kind: DriveEntryKind,
  name: Schema.String,
  mimeType: Schema.NullOr(Schema.String),
  size: Schema.NullOr(Schema.Number),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  contentUrl: Schema.NullOr(Schema.String),
  previewUrl: Schema.NullOr(Schema.String),
  textPreview: Schema.NullOr(Schema.String),
}) {}

export class DriveDetails extends Schema.Class<DriveDetails>("DriveDetails")({
  id: DriveId,
  name: Schema.String,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  entries: Schema.Array(DriveEntry),
}) {}

export const CreateDriveInput = Schema.Struct({
  name: Schema.String,
});

export const RenameDriveInput = Schema.Struct({
  name: Schema.String,
});

export const CreateFolderInput = Schema.Struct({
  name: Schema.String,
  parentId: Schema.optional(DriveEntryId),
});

export const RenameEntryInput = Schema.Struct({
  name: Schema.String,
});

export const UploadDriveFileInput = Schema.Struct({
  file: Multipart.SingleFileSchema,
  name: Schema.optional(Schema.String),
  parentId: Schema.optional(Schema.String),
}).pipe(HttpApiSchema.asMultipart());

export class DriveNotFoundError extends Schema.TaggedErrorClass<DriveNotFoundError>()(
  "DriveNotFoundError",
  {
    id: DriveId,
  },
  { httpApiStatus: 404 },
) {}

export class DriveEntryNotFoundError extends Schema.TaggedErrorClass<DriveEntryNotFoundError>()(
  "DriveEntryNotFoundError",
  {
    id: DriveEntryId,
  },
  { httpApiStatus: 404 },
) {}

export class DriveUnauthenticatedError extends Schema.TaggedErrorClass<DriveUnauthenticatedError>()(
  "DriveUnauthenticatedError",
  {},
  { httpApiStatus: 401 },
) {}

export class InvalidDriveInputError extends Schema.TaggedErrorClass<InvalidDriveInputError>()(
  "InvalidDriveInputError",
  {
    reason: Schema.String,
  },
  { httpApiStatus: 400 },
) {}

export class DriveConflictError extends Schema.TaggedErrorClass<DriveConflictError>()(
  "DriveConflictError",
  {
    reason: Schema.String,
  },
  { httpApiStatus: 409 },
) {}

export class DriveStorageError extends Schema.TaggedErrorClass<DriveStorageError>()(
  "DriveStorageError",
  {
    operation: Schema.String,
    message: Schema.String,
  },
  { httpApiStatus: 502 },
) {}

const driveErrors = Schema.Union([
  DriveUnauthenticatedError,
  InvalidDriveInputError,
  DriveConflictError,
  DriveStorageError,
  DriveNotFoundError,
  DriveEntryNotFoundError,
]);

export const driveEndpoints = HttpApiGroup.make("Drive")
  .add(
    HttpApiEndpoint.get("getDrives", "/drives", {
      success: Schema.Array(DriveSummary),
      error: Schema.Union([DriveUnauthenticatedError, DriveStorageError]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "List drives",
        description: "Return the current user's drives",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("createDrive", "/drives", {
      payload: CreateDriveInput,
      success: DriveSummary,
      error: Schema.Union([
        DriveUnauthenticatedError,
        InvalidDriveInputError,
        DriveConflictError,
        DriveStorageError,
      ]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Create drive",
        description: "Create a new user-owned drive",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.get("getDrive", "/drive/:driveId", {
      params: {
        driveId: DriveId,
      },
      success: DriveDetails,
      error: Schema.Union([DriveUnauthenticatedError, DriveStorageError, DriveNotFoundError]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Get drive",
        description: "Return a drive and all of its entries",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("renameDrive", "/drive/:driveId/rename", {
      params: {
        driveId: DriveId,
      },
      payload: RenameDriveInput,
      success: DriveSummary,
      error: driveErrors,
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Rename drive",
        description: "Rename a drive owned by the current user",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("deleteDrive", "/drive/:driveId/delete", {
      params: {
        driveId: DriveId,
      },
      success: Schema.Struct({ ok: Schema.Boolean }),
      error: Schema.Union([DriveUnauthenticatedError, DriveStorageError, DriveNotFoundError]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Delete drive",
        description: "Delete a drive and all nested entries",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("createFolder", "/drive/:driveId/folder", {
      params: {
        driveId: DriveId,
      },
      payload: CreateFolderInput,
      success: DriveEntry,
      error: driveErrors,
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Create folder",
        description: "Create a folder inside a drive",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("uploadFile", "/drive/:driveId/file", {
      params: {
        driveId: DriveId,
      },
      payload: UploadDriveFileInput,
      success: DriveEntry,
      error: driveErrors,
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Upload file",
        description: "Upload a file into a drive folder",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.get("getEntry", "/drive/:driveId/entry/:entryId", {
      params: {
        driveId: DriveId,
        entryId: DriveEntryId,
      },
      success: DriveEntry,
      error: Schema.Union([
        DriveUnauthenticatedError,
        InvalidDriveInputError,
        DriveStorageError,
        DriveNotFoundError,
        DriveEntryNotFoundError,
      ]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Get entry",
        description: "Return a single drive entry with preview metadata",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("renameEntry", "/drive/:driveId/entry/:entryId/rename", {
      params: {
        driveId: DriveId,
        entryId: DriveEntryId,
      },
      payload: RenameEntryInput,
      success: DriveEntry,
      error: driveErrors,
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Rename entry",
        description: "Rename a file or folder",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("deleteEntry", "/drive/:driveId/entry/:entryId/delete", {
      params: {
        driveId: DriveId,
        entryId: DriveEntryId,
      },
      success: Schema.Struct({ ok: Schema.Boolean }),
      error: Schema.Union([
        DriveUnauthenticatedError,
        DriveStorageError,
        DriveNotFoundError,
        DriveEntryNotFoundError,
      ]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Delete entry",
        description: "Delete a file or recursively delete a folder",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.get("getEntryContent", "/drive/:driveId/entry/:entryId/content", {
      params: {
        driveId: DriveId,
        entryId: DriveEntryId,
      },
      success: Schema.Uint8Array.pipe(HttpApiSchema.asUint8Array()),
      error: Schema.Union([
        DriveUnauthenticatedError,
        InvalidDriveInputError,
        DriveStorageError,
        DriveNotFoundError,
        DriveEntryNotFoundError,
      ]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Get entry content",
        description: "Return the raw content for a drive file",
      }),
    ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "Drive",
    }),
  );
