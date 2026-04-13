import { HttpApiBuilder } from "effect/unstable/httpapi";
import { osDriveApi } from "../../domain";

export const accountApiLayer = HttpApiBuilder.group(osDriveApi, "Account", (handlers) =>
	handlers
);
