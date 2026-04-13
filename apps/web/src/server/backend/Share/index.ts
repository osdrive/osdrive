import { createId } from "@paralleldrive/cuid2";
import { Effect, Stream } from "effect";
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import * as Multipart from "effect/unstable/http/Multipart";
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

const parseUploadPayload = (payload: Stream.Stream<Multipart.Part, Multipart.MultipartError>) =>
  Stream.runCollect(payload).pipe(
    Effect.mapError(
      (cause) =>
        new InvalidShareUploadError({
          reason: cause.reason._tag,
        }),
    ),
    Effect.flatMap((parts) => {
      let file: Multipart.File | null = null;
      let name = "";

      for (const part of parts) {
        if (part._tag === "Field" && part.key === "name") {
          name = part.value;
        }

        if (part._tag === "File" && part.key === "file" && file === null) {
          file = part;
        }
      }

      if (!file) {
        return Effect.fail(new InvalidShareUploadError({ reason: "File is required" }));
      }

      return Effect.succeed({ file, name });
    }),
  );

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

        const body = yield* Effect.tryPromise({
          try: async () => new Uint8Array(await content.arrayBuffer()),
          catch: (cause) =>
            new ShareStorageError({
              operation: "read-content",
              message: cause instanceof Error ? cause.message : String(cause),
            }),
        });

        return HttpServerResponse.uint8Array(body, {
          contentType: metadata.mimeType,
          headers: object.httpMetadata?.contentDisposition
            ? { "content-disposition": object.httpMetadata.contentDisposition }
            : undefined,
        });
      }).pipe(Effect.withSpan("share.get-content")),
    )
    .handle("createShare", ({ payload }) =>
      Effect.gen(function* () {
        const user = yield* getCurrentUser;
        const r2 = yield* R2Service;
        const upload = yield* parseUploadPayload(payload);
        const name = upload.name.trim() || upload.file.name.trim();

        if (!name) {
          return yield* Effect.fail(
            new InvalidShareUploadError({ reason: "Share name is required" }),
          );
        }

        const file = upload.file;
        const shareId = ShareIdSchema.make(createId());
        const mimeType = file.contentType || "application/octet-stream";
        const fileBytes = yield* file.contentEffect.pipe(
          Effect.mapError(
            (cause) =>
              new ShareStorageError({
                operation: "read-upload",
                message: cause instanceof Error ? cause.message : String(cause),
              }),
          ),
        );
        const downloadUrl = toDownloadUrl(shareId);
        const previewUrl = isTextMimeType(mimeType) ? null : downloadUrl;
        const textPreview =
          isTextMimeType(mimeType) && fileBytes.byteLength <= TEXT_PREVIEW_MAX_BYTES
            ? new TextDecoder().decode(fileBytes)
            : null;

        yield* r2
          .putObject({
            key: toShareKey(shareId),
            body: fileBytes,
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
          size: fileBytes.byteLength,
          mimeType,
          createdAt: new Date(),
          uploader: user.id,
          displayName: user.name,
          downloadUrl,
          previewUrl,
          textPreview,
        });
      }).pipe(Effect.withSpan("share.create")),
    ),
);
