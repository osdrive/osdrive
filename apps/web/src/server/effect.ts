import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi";
import { version } from "../../package.json" with { type: "json" };

export const HelloResponse = Schema.Struct({
	message: Schema.String,
	name: Schema.String,
}).annotate({ identifier: "HelloResponse" });

export const helloEndpoint = HttpApiEndpoint.get("hello", "/hello/:name", {
	params: {
		name: Schema.String,
	},
	success: HelloResponse,
}).annotateMerge(
	OpenApi.annotations({
		summary: "Say hello",
		description: "Returns a demo JSON response using Effect HttpApi and Effect Schema.",
	}),
);

export const demoApi = HttpApi.make("OSDriveApi")
	.add(
		HttpApiGroup.make("demo")
			.add(helloEndpoint)
			.annotateMerge(
				OpenApi.annotations({
					title: "Demo",
					description: "Demo endpoints for the Cloudflare Worker.",
				}),
			),
	)
	.prefix("/api")
	.annotateMerge(
		OpenApi.annotations({
			title: "OSDrive API",
			version,
			description: "OSDrive Web API",
			servers: [{ url: "/" }],
		}),
	);
