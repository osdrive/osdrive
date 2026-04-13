import { useParams, useSearchParams } from "@solidjs/router";
import { ArrowLeft, Download, ExternalLink } from "lucide-solid";
import { createMemo, Show, Switch, Match } from "solid-js";

// ---------------------------------------------------------------------------
// Hardcoded preview data — replace with fetched data later
// ---------------------------------------------------------------------------
type FileType = "image" | "pdf" | "video" | "folder" | "archive" | "file";

interface PreviewFile {
  id: string;
  name: string;
  type: FileType;
  size: number | null;
  mimeType: string;
  // Placeholder URL — swap with real signed URLs when the API is ready
  previewUrl: string;
}

const PREVIEW_FILES: PreviewFile[] = [
  {
    id: "file_2",
    name: "homepage.png",
    type: "image",
    size: 2_450_000,
    mimeType: "image/png",
    previewUrl: "https://placehold.co/1280x800/e2e8f0/94a3b8?text=homepage.png",
  },
  {
    id: "file_4",
    name: "project-brief.pdf",
    type: "pdf",
    size: 890_000,
    mimeType: "application/pdf",
    previewUrl:
      "https://docs.google.com/viewer?embedded=true&url=https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1.pdf",
  },
  {
    id: "file_5",
    name: "demo-video.mp4",
    type: "video",
    size: 45_000_000,
    mimeType: "video/mp4",
    previewUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  },
];

function formatSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ---------------------------------------------------------------------------
// Viewers
// ---------------------------------------------------------------------------
function ImageViewer(props: { file: PreviewFile }) {
  return (
    <div class="flex flex-1 items-center justify-center p-8 bg-stone-900/5">
      <img
        src={props.file.previewUrl}
        alt={props.file.name}
        class="max-h-full max-w-full rounded-lg shadow-xl object-contain"
      />
    </div>
  );
}

function PdfViewer(props: { file: PreviewFile }) {
  return (
    <div class="flex flex-1">
      <iframe
        src={props.file.previewUrl}
        title={props.file.name}
        class="flex-1 w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}

function VideoViewer(props: { file: PreviewFile }) {
  return (
    <div class="flex flex-1 items-center justify-center p-8 bg-stone-900/5">
      {/* biome-ignore lint/a11y/useMediaCaption: demo placeholder */}
      <video
        src={props.file.previewUrl}
        controls
        class="max-h-full max-w-full rounded-lg shadow-xl"
        style={{ "max-height": "calc(100vh - 10rem)" }}
      />
    </div>
  );
}

function UnsupportedViewer(props: { file: PreviewFile }) {
  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-4 text-center px-4">
      <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
        <ExternalLink class="size-7 text-muted-foreground" />
      </div>
      <div>
        <p class="text-sm font-medium">Preview not available</p>
        <p class="text-sm text-muted-foreground mt-1">
          This file type ({props.file.mimeType}) can't be previewed in the browser.
        </p>
      </div>
      <a
        href={props.file.previewUrl}
        download={props.file.name}
        class="flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
      >
        <Download class="size-4" />
        Download file
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DrivePreviewPage() {
  const params = useParams<{ driveId: string }>();
  const [searchParams] = useSearchParams();

  const file = createMemo(() => {
    const fileId = searchParams.file;
    return PREVIEW_FILES.find((f) => f.id === fileId) ?? PREVIEW_FILES[0];
  });

  return (
    <div class="flex flex-col overflow-hidden" style={{ height: "calc(100svh - 3.5rem)" }}>
      {/* Preview toolbar */}
      <div class="flex h-11 shrink-0 items-center gap-3 border-b border-border bg-white px-4">
        <a
          href={`/drive/${params.driveId}`}
          class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft class="size-4" />
          Back
        </a>
        <span class="text-stone-200 shrink-0">·</span>
        <span class="text-sm font-medium text-stone-800 truncate">{file().name}</span>
        <span class="text-xs text-muted-foreground hidden sm:block shrink-0">
          {formatSize(file().size)}
        </span>

        <div class="ml-auto flex items-center gap-2 shrink-0">
          <a
            href={file().previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink class="size-4" />
            <span class="hidden sm:inline">Open original</span>
          </a>
          <a
            href={file().previewUrl}
            download={file().name}
            class="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
          >
            <Download class="size-4" />
            <span class="hidden sm:inline">Download</span>
          </a>
        </div>
      </div>

      {/* Viewer */}
      <div class="flex flex-1 min-h-0 overflow-hidden">
        <Switch fallback={<UnsupportedViewer file={file()} />}>
          <Match when={file().type === "image"}>
            <ImageViewer file={file()} />
          </Match>
          <Match when={file().type === "pdf"}>
            <PdfViewer file={file()} />
          </Match>
          <Match when={file().type === "video"}>
            <VideoViewer file={file()} />
          </Match>
        </Switch>
      </div>

      {/* Footer bar (not shown for PDF since it fills entirely) */}
      <Show when={file().type !== "pdf"}>
        <div class="flex h-9 shrink-0 items-center justify-center border-t border-border bg-stone-50 px-4">
          <p class="text-xs text-muted-foreground">
            Viewing <span class="font-medium text-stone-700">{file().name}</span> via OSDrive
          </p>
        </div>
      </Show>
    </div>
  );
}
