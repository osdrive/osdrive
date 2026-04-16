import { A, useParams, useSearchParams } from "@solidjs/router";
import { ArrowLeft, Download, ExternalLink, FileWarning } from "lucide-solid";
import { Match, Show, Switch } from "solid-js";
import { api } from "~/lib/tanstack";

function formatSize(bytes: number | null): string {
  if (bytes === null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function isImage(mime: string | null) {
  return !!mime && mime.startsWith("image/");
}

function isVideo(mime: string | null) {
  return !!mime && mime.startsWith("video/");
}

function isAudio(mime: string | null) {
  return !!mime && mime.startsWith("audio/");
}

function isText(mime: string | null) {
  return !!mime && (mime.startsWith("text/") || mime === "application/json");
}

function isPdf(mime: string | null) {
  return mime === "application/pdf";
}

function ImageViewer(props: { url: string; name: string }) {
  return (
    <div class="flex flex-1 items-center justify-center bg-stone-900/5 p-8">
      <img
        src={props.url}
        alt={props.name}
        class="max-h-full max-w-full rounded-lg object-contain shadow-xl"
      />
    </div>
  );
}

function PdfViewer(props: { url: string; name: string }) {
  return <iframe src={props.url} title={props.name} class="flex-1 w-full border-0" />;
}

function VideoViewer(props: { url: string }) {
  return (
    <div class="flex flex-1 items-center justify-center bg-stone-900/5 p-8">
      {/* biome-ignore lint/a11y/useMediaCaption: user preview */}
      <video src={props.url} controls class="max-h-full max-w-full rounded-lg shadow-xl" />
    </div>
  );
}

function AudioViewer(props: { url: string; name: string }) {
  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-6 bg-stone-900/5 p-8 text-center">
      <div>
        <p class="text-base font-semibold text-stone-900">{props.name}</p>
        <p class="mt-1 text-sm text-stone-500">Audio preview</p>
      </div>
      {/* biome-ignore lint/a11y/useMediaCaption: user preview */}
      <audio src={props.url} controls class="w-full max-w-xl" />
    </div>
  );
}

function TextViewer(props: { text: string }) {
  return (
    <div class="flex flex-1 overflow-auto bg-stone-950 p-6">
      <pre class="w-full whitespace-pre-wrap break-words font-mono text-xs text-stone-100">
        {props.text}
      </pre>
    </div>
  );
}

function UnsupportedViewer(props: { url: string | null; mimeType: string | null; name: string }) {
  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
        <FileWarning class="size-7 text-muted-foreground" />
      </div>
      <div>
        <p class="text-sm font-medium">Preview not available</p>
        <p class="mt-1 text-sm text-muted-foreground">
          {props.mimeType ?? "This file type"} cannot be previewed in the browser.
        </p>
      </div>
      <Show when={props.url}>
        {(url) => (
          <a
            href={url()}
            download={props.name}
            class="flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            <Download class="size-4" />
            Download file
          </a>
        )}
      </Show>
    </div>
  );
}

export default function DrivePreviewPage() {
  const params = useParams<{ driveId: string }>();
  const [searchParams] = useSearchParams();

  const entryQuery = api.Drive.query.getEntry(() => ({
    enabled: !!searchParams.file,
    request: {
      params: {
        driveId: params.driveId as never,
        entryId: searchParams.file as never,
      },
    },
  }));

  return (
    <Show
      when={!entryQuery.isLoading && entryQuery.data}
      fallback={<div class="p-6 text-sm text-muted-foreground">Loading preview...</div>}
    >
      {(entry) => (
        <div class="flex flex-col overflow-hidden" style={{ height: "calc(100svh - 3.5rem)" }}>
          <div class="flex h-11 shrink-0 items-center gap-3 border-b border-border bg-white px-4">
            <A
              href={`/drive/${params.driveId}`}
              class="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft class="size-4" />
              Back
            </A>
            <span class="shrink-0 text-stone-200">·</span>
            <span class="truncate text-sm font-medium text-stone-800">{entry().name}</span>
            <span class="hidden shrink-0 text-xs text-muted-foreground sm:block">
              {formatSize(entry().size)}
            </span>

            <div class="ml-auto flex shrink-0 items-center gap-2">
              <Show when={entry().contentUrl}>
                {(url) => (
                  <>
                    <a
                      href={url()}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ExternalLink class="size-4" />
                      <span class="hidden sm:inline">Open original</span>
                    </a>
                    <a
                      href={url()}
                      download={entry().name}
                      class="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                    >
                      <Download class="size-4" />
                      <span class="hidden sm:inline">Download</span>
                    </a>
                  </>
                )}
              </Show>
            </div>
          </div>

          <div class="flex flex-1 min-h-0 overflow-hidden">
            <Switch
              fallback={
                <UnsupportedViewer
                  url={entry().contentUrl}
                  mimeType={entry().mimeType}
                  name={entry().name}
                />
              }
            >
              <Match when={entry().previewUrl && isImage(entry().mimeType)}>
                <ImageViewer url={entry().previewUrl!} name={entry().name} />
              </Match>
              <Match when={entry().previewUrl && isPdf(entry().mimeType)}>
                <PdfViewer url={entry().previewUrl!} name={entry().name} />
              </Match>
              <Match when={entry().previewUrl && isVideo(entry().mimeType)}>
                <VideoViewer url={entry().previewUrl!} />
              </Match>
              <Match when={entry().previewUrl && isAudio(entry().mimeType)}>
                <AudioViewer url={entry().previewUrl!} name={entry().name} />
              </Match>
              <Match when={entry().textPreview && isText(entry().mimeType)}>
                <TextViewer text={entry().textPreview!} />
              </Match>
            </Switch>
          </div>

          <Show when={!isPdf(entry().mimeType)}>
            <div class="flex h-9 shrink-0 items-center justify-center border-t border-border bg-stone-50 px-4">
              <p class="text-xs text-muted-foreground">
                Viewing <span class="font-medium text-stone-700">{entry().name}</span> via OSDrive
              </p>
            </div>
          </Show>
        </div>
      )}
    </Show>
  );
}
