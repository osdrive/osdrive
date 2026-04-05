import type { APIEvent } from "@solidjs/start/server";
import { env } from "cloudflare:workers";
import { buildContentDisposition, getShareFileName, isPreviewable } from "~/lib/shares";

export async function GET({ params, request }: APIEvent) {
  const rangeHeader = request.headers.get("range");
  const object = rangeHeader
    ? await env.DATA.get(params.shareId, { range: request.headers })
    : await env.DATA.get(params.shareId);

  if (!object) {
    return new Response("Share not found.", { status: 404 });
  }

  const contentType = object.httpMetadata?.contentType || "application/octet-stream";

  if (!isPreviewable(contentType)) {
    return new Response("Preview not available for this file type.", { status: 415 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("accept-ranges", "bytes");
  headers.set("etag", object.httpEtag);
  headers.set("content-disposition", buildContentDisposition("inline", getShareFileName(object)));
  headers.set("x-content-type-options", "nosniff");

  return new Response(object.body, {
    status: object.range ? 206 : 200,
    headers,
  });
}
