import type { APIEvent } from "@solidjs/start/server";
import { createShareUpload } from "~/lib/share-upload-server";

export async function POST({ request }: APIEvent) {
  return createShareUpload(request);
}
