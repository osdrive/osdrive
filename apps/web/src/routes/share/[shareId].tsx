import { A, useParams } from "@solidjs/router";
import {
  Calendar,
  Download,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  HardDrive,
  User,
} from "lucide-solid";
import { Show } from "solid-js";
import { api } from "~/lib/tanstack";

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

export default function Page() {
  const params = useParams();

  const shareQuery = api.Share.getShare.useQuery(() => ({
    request: {
      params: {
        shareId: params.shareId as any,
      },
    },
  }));

  return (
    <div class="min-h-screen bg-stone-50">
      <header class="border-b border-stone-200 bg-white px-6 py-3.5">
        <A href="/" class="flex w-fit items-center gap-2">
          <img src="/assets/icon-dark.svg" alt="OSDrive" class="size-6 rounded" />
          <span class="text-sm font-semibold tracking-tight text-stone-900">OSDrive</span>
        </A>
      </header>

      <main class="mx-auto max-w-2xl space-y-4 px-4 py-12">
        <Show
          when={!shareQuery.isLoading}
          fallback={
            <div class="rounded-xl border border-stone-200 bg-white p-6">Loading share...</div>
          }
        >
          <Show
            when={shareQuery.data}
            fallback={
              <div class="rounded-xl border border-red-200 bg-white p-6 text-red-700">
                This share could not be loaded.
              </div>
            }
          >
            {(share) => {
              const hasImagePreview = () => !!share().previewUrl && isImage(share().mimeType);
              const hasVideoPreview = () => !!share().previewUrl && isVideo(share().mimeType);
              const hasAudioPreview = () => !!share().previewUrl && isAudio(share().mimeType);
              const hasTextPreview = () => !!share().textPreview && isText(share().mimeType);

              return (
                <>
                  <div class="space-y-6 rounded-xl border border-stone-200 bg-white p-6">
                    <div class="flex items-start gap-4">
                      <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-stone-100">
                        <FileTypeIcon mimeType={share().mimeType} class="size-7 text-stone-500" />
                      </div>
                      <div class="min-w-0 pt-1">
                        <h1 class="break-all text-lg font-semibold leading-snug text-stone-900">
                          {share().name}
                        </h1>
                        <p class="mt-0.5 text-sm text-stone-500">{share().mimeType}</p>
                      </div>
                    </div>

                    <dl class="grid grid-cols-3 gap-x-6 gap-y-4 border-t border-stone-100 pt-5 text-sm">
                      <div class="space-y-1">
                        <dt class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                          <HardDrive class="size-3.5" />
                          Size
                        </dt>
                        <dd class="font-medium text-stone-900">{formatBytes(share().size)}</dd>
                      </div>
                      <div class="space-y-1">
                        <dt class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                          <Calendar class="size-3.5" />
                          Created
                        </dt>
                        <dd class="font-medium text-stone-900">
                          {share().createdAt.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </dd>
                      </div>
                      <div class="space-y-1">
                        <dt class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-stone-400">
                          <User class="size-3.5" />
                          Shared by
                        </dt>
                        <dd class="font-medium text-stone-900">{share().displayName}</dd>
                      </div>
                    </dl>

                    <a
                      href={share().downloadUrl}
                      download={share().name}
                      class="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                    >
                      <Download class="size-4" />
                      Download
                    </a>
                  </div>

                  <Show when={hasImagePreview()}>
                    <div class="rounded-xl border border-stone-200 bg-white p-4">
                      <p class="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400">
                        Preview
                      </p>
                      <img
                        src={share().previewUrl!}
                        alt={share().name}
                        class="max-h-96 w-full rounded-lg object-contain"
                      />
                    </div>
                  </Show>

                  <Show when={hasVideoPreview()}>
                    <div class="rounded-xl border border-stone-200 bg-white p-4">
                      <p class="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400">
                        Preview
                      </p>
                      {/* biome-ignore lint/a11y/useMediaCaption: public file preview */}
                      <video
                        src={share().previewUrl!}
                        controls
                        class="max-h-96 w-full rounded-lg"
                      />
                    </div>
                  </Show>

                  <Show when={hasAudioPreview()}>
                    <div class="rounded-xl border border-stone-200 bg-white p-4">
                      <p class="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400">
                        Preview
                      </p>
                      {/* biome-ignore lint/a11y/useMediaCaption: public file preview */}
                      <audio src={share().previewUrl!} controls class="w-full" />
                    </div>
                  </Show>

                  <Show when={hasTextPreview()}>
                    <div class="rounded-xl border border-stone-200 bg-white p-4">
                      <p class="mb-3 text-xs font-medium uppercase tracking-wide text-stone-400">
                        Preview
                      </p>
                      <pre class="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-stone-50 p-4 font-mono text-xs text-stone-700">
                        {share().textPreview}
                      </pre>
                    </div>
                  </Show>
                </>
              );
            }}
          </Show>
        </Show>
      </main>
    </div>
  );
}
