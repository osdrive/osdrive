import { Layer } from "effect";
import { osDriveApi } from "../domain";
import { accountApiLayer } from "./Account";
import { driveApiLayer } from "./Drive";
import { shareApiLayer } from "./Share";
import { HttpApiBuilder, HttpApiScalar } from "effect/unstable/httpapi";

export const osDriveApiLayer = Layer.mergeAll(
	HttpApiBuilder.layer(osDriveApi, { openapiPath: "/api/openapi.json" }),
	HttpApiScalar.layerCdn(osDriveApi, { path: "/api/docs" }),
).pipe(Layer.provideMerge(Layer.mergeAll(accountApiLayer, driveApiLayer, shareApiLayer)));
