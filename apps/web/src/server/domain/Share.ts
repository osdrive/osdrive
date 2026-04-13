import { type Brand, Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi";

export type ShareId = string & Brand.Brand<"ShareId">;
export const ShareId = Schema.String.pipe(Schema.brand("ShareId"));

export class Share extends Schema.Class<Share>("Share")(Schema.Struct({
  id: ShareId,
  name: Schema.String,
  createdAt: Schema.Date,
})) { }

export const ShareInput = Schema.Struct({
  name: Schema.String,
});

export class ShareNotFoundError extends Schema.TaggedErrorClass<ShareNotFoundError>()("ShareNotFoundError", {
  id: ShareId
},  { httpApiStatus: 404 }) {}

export const shareEndpoints = HttpApiGroup.make("Share")
  .add(HttpApiEndpoint.post("createShare", "/share", {
    payload: ShareInput,
    success: Share,
  }).annotateMerge(
    OpenApi.annotations({
      // summary: "List drives",
      // description: "Return a list of available drives for the current user",
    }),
  ))
  .add(HttpApiEndpoint.get("getShare", "/share/:shareId", {
    params: {
      shareId: ShareId
    },
    success: Share,
    error: ShareNotFoundError,
  }).annotateMerge(
    OpenApi.annotations({
      // summary: "List drives",
      // description: "Return a list of available drives for the current user",
    }),
  ));
