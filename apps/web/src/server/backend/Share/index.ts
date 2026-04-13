import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { osDriveApi } from "../../domain";
import { Share, ShareId } from "~/server/domain/Share";

export const shareApiLayer = HttpApiBuilder.group(osDriveApi, "Share", (handlers) =>
  handlers
    .handle(
		"getShare",
		({ params }) =>
			Effect.gen(function* () {
				return new Share({ id: params.shareId, name: "Testing Share!", createdAt: new Date() });
			}).pipe(Effect.withSpan("demo.errors")),
  )
  .handle(
		"createShare",
		({ payload }) =>
      Effect.gen(function*() {
        return new Share({ id: ShareId.make("brother"), name: `New Share '${payload.name}'!`, createdAt: new Date() });
			}).pipe(Effect.withSpan("demo.errors")),
	),
);
