import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "effect/unstable/httpapi";
import { version } from "../../package.json" with { type: "json" };

export const HelloResponse = Schema.Struct({
	message: Schema.String,
	name: Schema.String,
}).annotate({ identifier: "HelloResponse" });

export const ErrorsResponse = Schema.Struct({
	message: Schema.String,
}).annotate({ identifier: "ErrorsResponse" });

export const SchemaErrorResponse = Schema.Struct({
	_tag: Schema.Literal("SchemaErrorResponse"),
	message: Schema.String,
	issues: Schema.Array(Schema.String),
})
	.pipe(HttpApiSchema.status(500))
	.annotate({ identifier: "SchemaErrorResponse" });

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

export const errorsEndpoint = HttpApiEndpoint.get("errors", "/errors", {
	success: ErrorsResponse,
	error: SchemaErrorResponse,
})
	.annotateMerge(
	OpenApi.annotations({
		summary: "Random schema failure",
		description: "Returns success half the time and fails with a schema parse error half the time.",
	}),
	);

export const demoApi = HttpApi.make("OSDriveApi")
	.add(
		HttpApiGroup.make("demo")
			.add(helloEndpoint)
			.add(errorsEndpoint)
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
