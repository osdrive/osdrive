import { type Brand, Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi";

export type DriveId = string & Brand.Brand<"DriveId">;
export const DriveId = Schema.String.pipe(Schema.brand("DriveId"));

export class Drive extends Schema.Class<Drive>("Drive")(
  Schema.Struct({
    id: DriveId,
    name: Schema.String,
    createdAt: Schema.Date,
  }),
) {}

export class DriveNotFoundError extends Schema.TaggedErrorClass<DriveNotFoundError>()(
  "DriveNotFoundError",
  {
    id: DriveId,
  },
  { httpApiStatus: 404 },
) {}

export const driveEndpoints = HttpApiGroup.make("Drive")
  .add(
    HttpApiEndpoint.get("getDrives", "/drives", {
      params: {},
      success: Schema.Array(Drive),
    }).annotateMerge(
      OpenApi.annotations({
        summary: "List drives",
        description: "Return a list of available drives for the current user",
      }),
    ),
  )
  .add(
    HttpApiEndpoint.get("getDrive", "/drive/:driveId", {
      params: {
        driveId: DriveId,
      },
      success: Drive,
      error: DriveNotFoundError,
    }).annotateMerge(
      OpenApi.annotations({
        summary: "Get drive",
        description: "Return a drive by its ID",
      }),
    ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "Drive",
      // description: "TODO",
    }),
  );
