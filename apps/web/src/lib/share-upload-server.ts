import { env } from "cloudflare:workers";
import {
  buildContentDisposition,
  createShareId,
  getShareObjectKey,
  inferContentType,
  sanitizeDisplayName,
  toShareMetadata,
} from "~/lib/shares";

export async function createShareUpload(request: Request) {
  const formData = await request.formData();
  const uploadedFile = formData.get("file");
  const rawName = formData.get("name");

  if (!(uploadedFile instanceof File) || uploadedFile.size === 0) {
    return Response.json({ error: "Choose a file to upload." }, { status: 400 });
  }

  if (typeof rawName !== "string" || !rawName.trim()) {
    return Response.json({ error: "Give this shared file a name." }, { status: 400 });
  }

  const shareId = createShareId();
  const fileName = sanitizeDisplayName(rawName);
  const contentType = inferContentType(uploadedFile);
  const originalName = uploadedFile.name || fileName;

  const object = await env.DATA.put(getShareObjectKey(shareId), uploadedFile, {
    customMetadata: {
      fileName,
      originalName,
    },
    httpMetadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
      contentDisposition: buildContentDisposition("attachment", originalName),
    },
  });

  const origin = new URL(request.url).origin;

  return Response.json(
    {
      shareUrl: `${origin}/s/${shareId}`,
      ...toShareMetadata(shareId, object),
    },
    {
      status: 201,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
