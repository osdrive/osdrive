import { type Brand, Schema } from "effect";
import * as Multipart from "effect/unstable/http/Multipart";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect/unstable/httpapi";

export type ShareId = string & Brand.Brand<"ShareId">;
export const ShareId = Schema.String.pipe(Schema.brand("ShareId"));

export class ShareSummary extends Schema.Class<ShareSummary>("ShareSummary")({
  id: ShareId,
  name: Schema.String,
  size: Schema.Number,
  mimeType: Schema.String,
  createdAt: Schema.Date,
  downloadUrl: Schema.String,
}) {}

export class ShareDetails extends Schema.Class<ShareDetails>("ShareDetails")({
  id: ShareId,
  name: Schema.String,
  size: Schema.Number,
  mimeType: Schema.String,
  createdAt: Schema.Date,
  uploader: Schema.String,
  displayName: Schema.String,
  downloadUrl: Schema.String,
  previewUrl: Schema.NullOr(Schema.String),
  textPreview: Schema.NullOr(Schema.String),
}) {}

export const CreateShareInput = Schema.Struct({
  file: Multipart.SingleFileSchema,
  name: Schema.optional(Schema.String),
}).pipe(HttpApiSchema.asMultipart());

export class ShareNotFoundError extends Schema.TaggedErrorClass<ShareNotFoundError>()(
  "ShareNotFoundError",
  {
    id: ShareId,
  },
  { httpApiStatus: 404 },
) {}

export class ShareUnauthenticatedError extends Schema.TaggedErrorClass<ShareUnauthenticatedError>()(
  "ShareUnauthenticatedError",
  {},
  { httpApiStatus: 401 },
) {}

export class InvalidShareUploadError extends Schema.TaggedErrorClass<InvalidShareUploadError>()(
  "InvalidShareUploadError",
  {
    reason: Schema.String,
  },
  { httpApiStatus: 400 },
) {}

export class ShareStorageError extends Schema.TaggedErrorClass<ShareStorageError>()(
  "ShareStorageError",
  {
    operation: Schema.String,
    message: Schema.String,
  },
  { httpApiStatus: 502 },
) {}

export const shareEndpoints = HttpApiGroup.make("Share")
  .add(
    HttpApiEndpoint.get("listShares", "/share", {
      success: Schema.Array(ShareSummary),
      error: Schema.Union([ShareUnauthenticatedError, ShareStorageError]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "List shares",
        description: "Return the current user's shared files",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.post("createShare", "/share", {
      payload: CreateShareInput,
      success: ShareDetails,
      error: Schema.Union([ShareUnauthenticatedError, InvalidShareUploadError, ShareStorageError]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Create share",
        description: "Upload a file and create a public share link",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.get("getShare", "/share/:shareId", {
      params: {
        shareId: ShareId,
      },
      success: ShareDetails,
      error: Schema.Union([ShareNotFoundError, ShareStorageError]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Get share",
        description: "Return a public share by its ID",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.get("getShareContent", "/share/:shareId/content", {
      params: {
        shareId: ShareId,
      },
      success: Schema.Uint8Array.pipe(HttpApiSchema.asUint8Array()),
      error: Schema.Union([ShareNotFoundError, ShareStorageError]),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Get share content",
        description: "Return the raw content for a public share",
      }),
    ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "Share",
    }),
  );
