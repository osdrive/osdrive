export type ShareMetadata = {
  shareId: string;
  fileName: string;
  size: number;
  contentType: string;
  createdAt: string;
  etag: string;
  previewable: boolean;
};

const TEXT_TYPES = [
  "application/json",
  "application/ld+json",
  "application/xml",
  "application/javascript",
  "application/x-javascript",
  "application/typescript",
  "application/x-typescript",
];

export function sanitizeDisplayName(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "Untitled file";
  }

  return normalized.slice(0, 180);
}

export function sanitizeDownloadName(name: string) {
  return sanitizeDisplayName(name)
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\u0000/g, "")
    .slice(0, 180);
}

export function buildContentDisposition(type: "inline" | "attachment", name: string) {
  const safeName = sanitizeDownloadName(name);
  const encodedName = encodeURIComponent(safeName);
  return `${type}; filename="${safeName}"; filename*=UTF-8''${encodedName}`;
}

export function inferContentType(file: File) {
  return file.type || "application/octet-stream";
}

export function isPreviewable(contentType: string) {
  if (!contentType) {
    return false;
  }

  return (
    contentType.startsWith("image/") ||
    contentType.startsWith("video/") ||
    contentType.startsWith("audio/") ||
    contentType.startsWith("text/") ||
    contentType === "application/pdf" ||
    TEXT_TYPES.includes(contentType)
  );
}

export function getPreviewKind(contentType: string) {
  if (contentType.startsWith("image/")) {
    return "image" as const;
  }

  if (contentType.startsWith("video/")) {
    return "video" as const;
  }

  if (contentType.startsWith("audio/")) {
    return "audio" as const;
  }

  if (contentType === "application/pdf") {
    return "pdf" as const;
  }

  if (contentType.startsWith("text/") || TEXT_TYPES.includes(contentType)) {
    return "text" as const;
  }

  return "none" as const;
}

export function formatBytes(size: number) {
  if (size === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** unitIndex;

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatSharedDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getShareFileName(object: Pick<R2Object, "customMetadata" | "key">) {
  return sanitizeDisplayName(object.customMetadata?.fileName || object.key);
}

export function getOriginalUploadName(object: Pick<R2Object, "customMetadata" | "key">) {
  return sanitizeDownloadName(object.customMetadata?.originalName || getShareFileName(object));
}

export function toShareMetadata(shareId: string, object: R2Object): ShareMetadata {
  const contentType = object.httpMetadata?.contentType || "application/octet-stream";

  return {
    shareId,
    fileName: getShareFileName(object),
    size: object.size,
    contentType,
    createdAt: object.uploaded.toISOString(),
    etag: object.httpEtag,
    previewable: isPreviewable(contentType),
  };
}

export function createShareId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}
