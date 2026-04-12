import { Brand, Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi";

export type DriveId = string & Brand.Brand<"DriveId">;
export const DriveId = Schema.String.pipe(Schema.brand("DriveId"));

export class Drive extends Schema.Class<Drive>("Drive")(Schema.Struct({
  id: DriveId,
  name: Schema.String,
  createdAt: Schema.Date,
})) {
  // TODO: Remove this
  get testing() {
    return "Hello World!"
  }
}

// TODO: How to assign HttpApiSchema.annotations({ status: 404 }),
export class DriveNotFoundError extends Schema.TaggedErrorClass<DriveNotFoundError>()("DriveNotFoundError", {
  id: DriveId
}) {}

// TODO: Switch these out for RPC??? Should they be here???

export const drives = HttpApiEndpoint.get("drives", "/drives", {
	params: {},
	success: Schema.Array(Drive),
}).annotateMerge(
	OpenApi.annotations({
		summary: "Return a list of available drives for the current user",
		// description: "TODO",
	}),
);

export const drive = HttpApiEndpoint.get("drive", "/drive/:driveId", {
	params: {
		driveId: DriveId
	},
	success: Drive,
	error: DriveNotFoundError,
}).annotateMerge(
	OpenApi.annotations({
		summary: "Return a drive by its ID",
		// description: "TODO",
	}),
);

export const DriveEndpoints = HttpApiGroup.make("Drive")
	.add(drives)
	.add(drive)
	.annotateMerge(
		OpenApi.annotations({
			title: "Drive",
			// description: "TODO",
		}),
	);
