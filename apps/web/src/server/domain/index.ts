import { HttpApi, OpenApi } from "effect/unstable/httpapi";
import { driveEndpoints } from "../domain/Drive";
import { version } from "../../../package.json" with { type: "json" };

export const osDriveApi = HttpApi.make("OSDriveApi")
	.add(driveEndpoints)
	.prefix("/api")
	.annotateMerge(
		OpenApi.annotations({
			title: "OSDrive API",
			version,
			description: "OSDrive Web API",
			servers: [{ url: "/" }],
		}),
	);
