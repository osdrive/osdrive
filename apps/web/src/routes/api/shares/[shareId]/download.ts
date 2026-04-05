import type { APIEvent } from "@solidjs/start/server";
import { env } from "cloudflare:workers";
import { buildContentDisposition, getOriginalUploadName } from "~/lib/shares";

export async function GET({ params }: APIEvent) {
  const object = await env.DATA.get(params.shareId);

  if (!object) {
    return new Response("Share not found.", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);
  headers.set("content-disposition", buildContentDisposition("attachment", getOriginalUploadName(object)));
  headers.set("content-length", object.size.toString());

  return new Response(object.body, {
    status: 200,
    headers,
  });
}
