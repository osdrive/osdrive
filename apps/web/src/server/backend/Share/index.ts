import { createId } from "@paralleldrive/cuid2";
import { Effect } from "effect";
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { auth } from "~/server/lib/auth";
import { R2ObjectNotFoundError, R2Service, R2StorageError } from "~/server/lib/r2";
import { osDriveApi } from "../../domain";
import {
  InvalidShareUploadError,
  ShareDetails,
  type ShareId,
  ShareId as ShareIdSchema,
  ShareNotFoundError,
  ShareStorageError,
  ShareSummary,
  ShareUnauthenticatedError,
} from "~/server/domain/Share";

const SHARE_PREFIX = "share/";
const TEXT_PREVIEW_MAX_BYTES = 256_000;

const isTextMimeType = (mimeType: string) =>
  mimeType.startsWith("text/") || mimeType === "application/json";

const toShareKey = (shareId: ShareId) => `${SHARE_PREFIX}${shareId}`;

const toDownloadUrl = (shareId: ShareId) => `/api/share/${shareId}/content`;

const toMetadata = (object: R2Object) => {
  const name = object.customMetadata?.name;
  const uploader = object.customMetadata?.uploader;
  const displayName = object.customMetadata?.displayName;
  const mimeType = object.httpMetadata?.contentType ?? "application/octet-stream";

  if (!name || !uploader || !displayName) {
    return Effect.fail(
      new ShareStorageError({
        operation: "read-metadata",
        message: `Share metadata is incomplete for ${object.key}`,
      }),
    );
  }

  const shareId = ShareIdSchema.make(object.key.slice(SHARE_PREFIX.length));

  return Effect.succeed({
    shareId,
    name,
    uploader,
    displayName,
    mimeType,
    size: object.size,
    createdAt: object.uploaded,
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
    catch: () => new ShareUnauthenticatedError(),
  });

  if (!session?.user) {
    return yield* Effect.fail(new ShareUnauthenticatedError());
  }

  return session.user;
});

const mapStorageError = (cause: R2StorageError) =>
  new ShareStorageError({
    operation: cause.operation,
    message:
      cause.cause instanceof Error ? cause.cause.message : String(cause.cause ?? cause.operation),
  });

const readShareObject = (shareId: ShareId) =>
  Effect.gen(function* () {
    const r2 = yield* R2Service;
    const key = toShareKey(shareId);
    return yield* r2.headObject(key).pipe(
      Effect.mapError((cause) => {
        if (cause instanceof R2ObjectNotFoundError) {
          return new ShareNotFoundError({ id: shareId });
        }

        return mapStorageError(cause);
      }),
    );
  });

const toShareDetails = (shareId: ShareId) =>
  Effect.gen(function* () {
    const r2 = yield* R2Service;
    const object = yield* readShareObject(shareId);
    const metadata = yield* toMetadata(object);
    const shouldReadText =
      isTextMimeType(metadata.mimeType) && metadata.size <= TEXT_PREVIEW_MAX_BYTES;
    const textPreview = shouldReadText
      ? yield* r2.getObject(toShareKey(shareId)).pipe(
          Effect.flatMap((content) => Effect.tryPromise(() => content.text())),
          Effect.mapError((cause) => {
            if (cause instanceof R2ObjectNotFoundError) {
              return new ShareNotFoundError({ id: shareId });
            }

            if (cause instanceof R2StorageError) {
              return mapStorageError(cause);
            }

            return new ShareStorageError({
              operation: "read-text-preview",
              message: cause instanceof Error ? cause.message : String(cause),
            });
          }),
        )
      : null;

    const downloadUrl = toDownloadUrl(shareId);
    const previewUrl = isTextMimeType(metadata.mimeType) ? null : downloadUrl;

    return new ShareDetails({
      id: metadata.shareId,
      name: metadata.name,
      size: metadata.size,
      mimeType: metadata.mimeType,
      createdAt: metadata.createdAt,
      uploader: metadata.uploader,
      displayName: metadata.displayName,
      downloadUrl,
      previewUrl,
      textPreview,
    });
  });

export const shareApiLayer = HttpApiBuilder.group(osDriveApi, "Share", (handlers) =>
  handlers
    .handle("listShares", () =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        const r2 = yield* R2Service;
        const listing = yield* r2
          .listObjects({
            prefix: SHARE_PREFIX,
            include: ["customMetadata", "httpMetadata"],
          })
          .pipe(Effect.mapError(mapStorageError));

        return yield* Effect.forEach(listing.objects, (object) =>
          Effect.gen(function* () {
            const metadata = yield* toMetadata(object);

            if (metadata.uploader !== user.id) {
              return null;
            }

            return new ShareSummary({
              id: metadata.shareId,
              name: metadata.name,
              size: metadata.size,
              mimeType: metadata.mimeType,
              createdAt: metadata.createdAt,
              downloadUrl: toDownloadUrl(metadata.shareId),
            });
          }).pipe(Effect.catchTag("ShareStorageError", () => Effect.succeed(null))),
        ).pipe(Effect.map((shares) => shares.filter((share) => share !== null)));
      }).pipe(Effect.withSpan("share.list")),
    )
    .handle("getShare", ({ params }) =>
      toShareDetails(params.shareId).pipe(Effect.withSpan("share.get")),
    )
    .handle("getShareContent", ({ params }) =>
      Effect.gen(function* () {
        const r2 = yield* R2Service;
        const object = yield* readShareObject(params.shareId);
        const metadata = yield* toMetadata(object);
        const content = yield* r2.getObject(toShareKey(params.shareId)).pipe(
          Effect.mapError((cause) => {
            if (cause instanceof R2ObjectNotFoundError) {
              return new ShareNotFoundError({ id: params.shareId });
            }

            return mapStorageError(cause);
          }),
        );

        return HttpServerResponse.raw(content.body, {
          contentType: metadata.mimeType,
          contentLength: metadata.size,
          headers: object.httpMetadata?.contentDisposition
            ? { "content-disposition": object.httpMetadata.contentDisposition }
            : undefined,
        });
      }).pipe(Effect.withSpan("share.get-content")),
    )
    .handleRaw("createShare", ({ request }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
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
            new InvalidShareUploadError({
              reason: cause instanceof Error ? cause.message : "Invalid multipart form data",
            }),
        });
        const uploaded = formData.get("file");

        if (!(uploaded instanceof File)) {
          return yield* Effect.fail(
            new InvalidShareUploadError({ reason: "Share file is required" }),
          );
        }

        const providedName = formData.get("name");
        const name =
          (typeof providedName === "string" ? providedName.trim() : "") || uploaded.name.trim();

        if (!name) {
          return yield* Effect.fail(
            new InvalidShareUploadError({ reason: "Share name is required" }),
          );
        }

        const shareId = ShareIdSchema.make(createId());
        const mimeType = uploaded.type || "application/octet-stream";
        const downloadUrl = toDownloadUrl(shareId);
        const previewUrl = isTextMimeType(mimeType) ? null : downloadUrl;
        const stored = yield* r2
          .putObject({
            key: toShareKey(shareId),
            body: uploaded,
            httpMetadata: {
              contentType: mimeType,
              contentDisposition: `attachment; filename="${name.replaceAll('"', "")}"`,
            },
            customMetadata: {
              name,
              uploader: user.id,
              displayName: user.name,
            },
          })
          .pipe(Effect.mapError(mapStorageError));

        return new ShareDetails({
          id: shareId,
          name,
          size: stored.size,
          mimeType,
          createdAt: stored.uploaded,
          uploader: user.id,
          displayName: user.name,
          downloadUrl,
          previewUrl,
          textPreview: null,
        });
      }).pipe(Effect.withSpan("share.create")),
    ),
);
