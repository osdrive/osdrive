import { HttpApi, OpenApi } from "effect/unstable/httpapi";
import { driveEndpoints } from "./Drive";
import { shareEndpoints } from "./Share";
import { version } from "../../../package.json" with { type: "json" };
import { accountEndpoints } from "./Account";

export const osDriveApi = HttpApi.make("OSDriveApi")
	.add(accountEndpoints)
	.add(driveEndpoints)
	.add(shareEndpoints)
	.prefix("/api")
	.annotateMerge(
		OpenApi.annotations({
			title: "OSDrive API",
			version,
			description: "OSDrive Web API",
			servers: [{ url: "/" }],
		}),
	);
