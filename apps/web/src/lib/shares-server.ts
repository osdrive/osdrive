import { env } from "cloudflare:workers";
import { toShareMetadata } from "~/lib/shares";

export async function getShareMetadata(shareId: string) {
  const object = await env.DATA.head(shareId);

  if (!object) {
    return null;
  }

  return toShareMetadata(shareId, object);
}
