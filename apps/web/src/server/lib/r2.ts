import { env } from "cloudflare:workers";
import { Context, Data, Effect, Layer } from "effect";

export class R2StorageError extends Data.TaggedError("R2StorageError")<{
  readonly operation: "put" | "get" | "head" | "list" | "delete";
  readonly key?: string;
  readonly cause?: unknown;
}> {}

export class R2ObjectNotFoundError extends Data.TaggedError("R2ObjectNotFoundError")<{
  readonly key: string;
}> {}

type PutObjectInput = {
  readonly key: string;
  readonly body: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob | null;
  readonly httpMetadata?: R2HTTPMetadata;
  readonly customMetadata?: Record<string, string>;
};

type ListObjectsInput = {
  readonly prefix: string;
  readonly include?: ("httpMetadata" | "customMetadata")[];
};

const tryR2 = <A>(
  operation: R2StorageError["operation"],
  key: string | undefined,
  effect: () => Promise<A>,
) =>
  Effect.tryPromise({
    try: effect,
    catch: (cause) => new R2StorageError({ operation, key, cause }),
  });

export class R2Service extends Context.Service<
  R2Service,
  {
    readonly putObject: (input: PutObjectInput) => Effect.Effect<R2Object, R2StorageError>;
    readonly getObject: (
      key: string,
    ) => Effect.Effect<R2ObjectBody, R2StorageError | R2ObjectNotFoundError>;
    readonly headObject: (
      key: string,
    ) => Effect.Effect<R2Object, R2StorageError | R2ObjectNotFoundError>;
    readonly listObjects: (input: ListObjectsInput) => Effect.Effect<R2Objects, R2StorageError>;
    readonly deleteObject: (key: string) => Effect.Effect<void, R2StorageError>;
  }
>()("app/R2Service") {
  static readonly Live = Layer.succeed(
    R2Service,
    R2Service.of({
      putObject: (input: PutObjectInput) =>
        tryR2("put", input.key, () =>
          env.DATA.put(input.key, input.body, {
            httpMetadata: input.httpMetadata,
            customMetadata: input.customMetadata,
          }),
        ),
      getObject: (key: string) =>
        tryR2("get", key, () => env.DATA.get(key)).pipe(
          Effect.flatMap((object) =>
            object ? Effect.succeed(object) : Effect.fail(new R2ObjectNotFoundError({ key })),
          ),
        ),
      headObject: (key: string) =>
        tryR2("head", key, () => env.DATA.head(key)).pipe(
          Effect.flatMap((object) =>
            object ? Effect.succeed(object) : Effect.fail(new R2ObjectNotFoundError({ key })),
          ),
        ),
      listObjects: (input: ListObjectsInput) =>
        tryR2("list", input.prefix, () =>
          env.DATA.list({
            prefix: input.prefix,
            include: input.include,
          }),
        ),
      deleteObject: (key: string) => tryR2("delete", key, () => env.DATA.delete(key)),
    }),
  );
}
