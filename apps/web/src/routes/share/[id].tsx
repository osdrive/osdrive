import { A } from "@solidjs/router";
import { Calendar, Download, FileAudio, FileImage, FileText, FileVideo, HardDrive, User } from "lucide-solid";
import { Show } from "solid-js";

// ---------------------------------------------------------------------------
// Hardcoded data — replace with API call keyed on useParams().id when wired up
// ---------------------------------------------------------------------------
const SHARE = {
  id: "sh_abc123",
  name: "Project Notes.txt",
  size: 1_843,
  mimeType: "text/plain",
  createdAt: new Date("2026-03-15T10:23:00Z"),
  author: {
    name: "Oscar Beaumont",
  },
  // Set a URL string for image/video/audio previews, or null if unavailable
  previewUrl: null as string | null,
  // Set for text / code previews
  textPreview: `# Project Notes — Q1 2026

## Goals
- Migrate file storage to R2
- Launch public share links
- Improve drive sync performance

## Decisions
- Use Effect for all server-side logic
- Tailwind CSS v4 + shadcn/ui (Kobalte) for the web UI
- Cloudflare Workers + D1 for the backend

## Open questions
- How should we handle very large file previews?
- Do we need a CDN for shared assets?
` as string | null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function isImage(mime: string) {
  return mime.startsWith("image/");
}

function isVideo(mime: string) {
  return mime.startsWith("video/");
}

function isAudio(mime: string) {
  return mime.startsWith("audio/");
}

function isText(mime: string) {
  return mime.startsWith("text/") || mime === "application/json";
}

function FileTypeIcon(props: { mimeType: string; class?: string }) {
  if (isImage(props.mimeType)) return <FileImage class={props.class} />;
  if (isVideo(props.mimeType)) return <FileVideo class={props.class} />;
  if (isAudio(props.mimeType)) return <FileAudio class={props.class} />;
  return <FileText class={props.class} />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PublicSharePage() {
  // In future: const params = useParams(); then fetch SHARE by params.id
  const share = SHARE;

  const hasImagePreview = () => !!share.previewUrl && isImage(share.mimeType);
  const hasVideoPreview = () => !!share.previewUrl && isVideo(share.mimeType);
  const hasAudioPreview = () => !!share.previewUrl && isAudio(share.mimeType);
  const hasTextPreview = () => !!share.textPreview && isText(share.mimeType);

  return (
    <div class="min-h-screen bg-stone-50">
      {/* Header */}
      <header class="border-b border-stone-200 bg-white px-6 py-3.5">
        <A href="/" class="flex items-center gap-2 w-fit">
          <img src="/assets/icon-dark.svg" alt="OSDrive" class="size-6 rounded" />
          <span class="font-semibold text-sm tracking-tight text-stone-900">OSDrive</span>
        </A>
      </header>

      <main class="mx-auto max-w-2xl px-4 py-12 space-y-4">
        {/* File info card */}
        <div class="rounded-xl border border-stone-200 bg-white p-6 space-y-6">
          {/* Icon + name */}
          <div class="flex items-start gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-100 shrink-0">
              <FileTypeIcon mimeType={share.mimeType} class="size-7 text-stone-500" />
            </div>
            <div class="min-w-0 pt-1">
              <h1 class="text-lg font-semibold text-stone-900 break-all leading-snug">
                {share.name}
              </h1>
              <p class="text-sm text-stone-500 mt-0.5">{share.mimeType}</p>
            </div>
          </div>

          {/* Metadata grid */}
          <dl class="grid grid-cols-3 gap-y-4 gap-x-6 text-sm border-t border-stone-100 pt-5">
            <div class="space-y-1">
              <dt class="flex items-center gap-1.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                <HardDrive class="size-3.5" />
                Size
              </dt>
              <dd class="font-medium text-stone-900">{formatBytes(share.size)}</dd>
            </div>
            <div class="space-y-1">
              <dt class="flex items-center gap-1.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                <Calendar class="size-3.5" />
                Created
              </dt>
              <dd class="font-medium text-stone-900">
                {share.createdAt.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </dd>
            </div>
            <div class="space-y-1">
              <dt class="flex items-center gap-1.5 text-xs font-medium text-stone-400 uppercase tracking-wide">
                <User class="size-3.5" />
                Shared by
              </dt>
              <dd class="font-medium text-stone-900">{share.author.name}</dd>
            </div>
          </dl>

          {/* Download */}
          <a
            href="#"
            class="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
          >
            <Download class="size-4" />
            Download
          </a>
        </div>

        {/* Image preview */}
        <Show when={hasImagePreview()}>
          <div class="rounded-xl border border-stone-200 bg-white p-4">
            <p class="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Preview</p>
            <img
              src={share.previewUrl!}
              alt={share.name}
              class="w-full rounded-lg object-contain max-h-96"
            />
          </div>
        </Show>

        {/* Video preview */}
        <Show when={hasVideoPreview()}>
          <div class="rounded-xl border border-stone-200 bg-white p-4">
            <p class="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Preview</p>
            {/* biome-ignore lint/a11y/useMediaCaption: preview only */}
            <video src={share.previewUrl!} controls class="w-full rounded-lg max-h-96" />
          </div>
        </Show>

        {/* Audio preview */}
        <Show when={hasAudioPreview()}>
          <div class="rounded-xl border border-stone-200 bg-white p-4">
            <p class="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Preview</p>
            {/* biome-ignore lint/a11y/useMediaCaption: preview only */}
            <audio src={share.previewUrl!} controls class="w-full" />
          </div>
        </Show>

        {/* Text / code preview */}
        <Show when={hasTextPreview()}>
          <div class="rounded-xl border border-stone-200 bg-white p-4">
            <p class="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Preview</p>
            <pre class="text-xs text-stone-700 bg-stone-50 rounded-lg p-4 overflow-auto max-h-96 font-mono whitespace-pre-wrap">
              {share.textPreview}
            </pre>
          </div>
        </Show>
      </main>
    </div>
  );
}
