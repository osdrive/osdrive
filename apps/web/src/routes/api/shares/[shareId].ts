import type { APIEvent } from "@solidjs/start/server";
import { getShareMetadata } from "~/lib/shares-server";

export async function GET({ params }: APIEvent) {
  const shareId = params.shareId;
  const metadata = await getShareMetadata(shareId);

  if (!metadata) {
    return Response.json({ error: "Share not found." }, { status: 404 });
  }

  return Response.json(metadata, {
    headers: {
      "cache-control": "public, s-maxage=300, max-age=60, stale-while-revalidate=86400",
      etag: metadata.etag,
    },
  });
}
