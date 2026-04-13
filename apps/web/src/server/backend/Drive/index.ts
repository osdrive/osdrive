import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { Drive, DriveId, DriveNotFoundError } from "~/server/domain/Drive";
import { osDriveApi } from "../../domain";

export const driveApiLayer = HttpApiBuilder.group(osDriveApi, "Drive", (handlers) =>
	handlers.handle(
		"drives",
		() =>
			Effect.gen(function* () {
				return [
					new Drive({ id: DriveId.make("1"), name: "Alice", createdAt: new Date() }),
					new Drive({ id: DriveId.make("2"), name: "Bob", createdAt: new Date() }),
				] as const;
			}).pipe(Effect.withSpan("demo.hello")),
	)
		.handle(
			"drive",
			({ params }) =>
				Effect.gen(function* () {
					if (params.driveId !== DriveId.make("1")) {
						yield* Effect.fail(new DriveNotFoundError({ id: params.driveId }));
					}

					return new Drive({ id: params.driveId, name: "Alice", createdAt: new Date() });
				}).pipe(Effect.withSpan("demo.errors")),
		),
);
