import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import * as Drive from "~/server/domain/drive";

// export const VideosEndpointsLive = Drive.DriveEndpoints,.toLayer(
// 	Effect.gen(function* () {
// // 		const videos = yield* Videos;

// 		return {};
// 	}),
// );

// export const VideosEndpointsLive = HttpApiBuilder.group(Drive.DriveEndpoints, "drive", (handlers) =>
// 	handlers.handle(
// 		"hello",
// 		({ params }) =>
// 			Effect.gen(function* () {
// 				yield* Effect.log("starting");

// 				return {
// 					message: `Hello, ${params.name}!`,
// 					name: params.name,
// 				};
// 			}).pipe(Effect.withSpan("demo.hello")),
// 	)
// 		.handle(
// 			"errors",
// 			() =>
// 				Effect.gen(function* () {
// 					if (Math.random() < 0.5) {
// 						const error = Schema.decodeUnknownSync(
// 							Schema.Struct({
// 								message: Schema.String,
// 							}),
// 						)({
// 							message: 123,
// 						});

// 						yield* Effect.fail({
// 							_tag: "MyErrorResponse" as const,
// 							message: error instanceof Error ? error.message : "Schema validation failed",
// 							issues: [
// 								Schema.isSchemaError(error)
// 									? SchemaIssue.makeFormatterDefault()(error.issue)
// 									: String(error),
// 							],
// 						});
// 					}

// 					return {
// 						message: "success",
// 					};
// 				}).pipe(Effect.withSpan("demo.errors")),
// 		),
// );
