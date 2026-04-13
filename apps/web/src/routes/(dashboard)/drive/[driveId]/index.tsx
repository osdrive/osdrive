import { useParams } from "@solidjs/router";
import {
  Archive,
  ChevronRight,
  Clock,
  Eye,
  File,
  FileImage,
  FileText,
  FileVideo,
  Filter,
  Folder,
  FolderOpen,
  HardDrive,
  Info,
  Search,
} from "lucide-solid";
import { createSignal, For, Show, Switch, Match } from "solid-js";

// ---------------------------------------------------------------------------
// Hardcoded drive data — replace with fetched data later
// ---------------------------------------------------------------------------
type FileType = "folder" | "image" | "pdf" | "video" | "archive" | "file";

interface DriveFile {
  id: string;
  name: string;
  type: FileType;
  size: number | null;
  createdAt: string;
  modifiedAt: string;
  children?: DriveFile[];
}

const DRIVE_DATA = {
  id: "drive_abc123",
  name: "Company Files",
  owner: "Oscar Beaumont",
  createdAt: "2024-01-15T10:30:00Z",
  files: [
    {
      id: "file_1",
      name: "design-mockups",
      type: "folder" as FileType,
      size: null,
      createdAt: "2024-01-15T10:30:00Z",
      modifiedAt: "2024-02-01T14:20:00Z",
      children: [
        {
          id: "file_2",
          name: "homepage.png",
          type: "image" as FileType,
          size: 2_450_000,
          createdAt: "2024-01-20T09:15:00Z",
          modifiedAt: "2024-01-20T09:15:00Z",
        },
        {
          id: "file_3",
          name: "mobile-app.fig",
          type: "file" as FileType,
          size: 5_120_000,
          createdAt: "2024-01-18T16:40:00Z",
          modifiedAt: "2024-02-01T14:20:00Z",
        },
      ],
    },
    {
      id: "file_4",
      name: "project-brief.pdf",
      type: "pdf" as FileType,
      size: 890_000,
      createdAt: "2024-01-10T08:00:00Z",
      modifiedAt: "2024-01-10T08:00:00Z",
    },
    {
      id: "file_5",
      name: "demo-video.mp4",
      type: "video" as FileType,
      size: 45_000_000,
      createdAt: "2024-01-22T11:30:00Z",
      modifiedAt: "2024-01-22T11:30:00Z",
    },
    {
      id: "file_6",
      name: "assets.zip",
      type: "archive" as FileType,
      size: 12_300_000,
      createdAt: "2024-01-25T13:45:00Z",
      modifiedAt: "2024-01-25T13:45:00Z",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isPreviewable(type: FileType): boolean {
  return type === "image" || type === "pdf" || type === "video";
}

function fileIconColor(type: FileType): string {
  switch (type) {
    case "folder":
      return "text-amber-500";
    case "image":
      return "text-blue-500";
    case "pdf":
      return "text-red-500";
    case "video":
      return "text-purple-500";
    default:
      return "text-stone-400";
  }
}

// ---------------------------------------------------------------------------
// File icon
// ---------------------------------------------------------------------------
function FileIcon(props: { type: FileType; open?: boolean; class?: string }) {
  return (
    <Switch>
      <Match when={props.type === "folder"}>
        <Show when={props.open} fallback={<Folder class={props.class} />}>
          <FolderOpen class={props.class} />
        </Show>
      </Match>
      <Match when={props.type === "image"}>
        <FileImage class={props.class} />
      </Match>
      <Match when={props.type === "pdf"}>
        <FileText class={props.class} />
      </Match>
      <Match when={props.type === "video"}>
        <FileVideo class={props.class} />
      </Match>
      <Match when={props.type === "archive"}>
        <Archive class={props.class} />
      </Match>
      <Match when={true}>
        <File class={props.class} />
      </Match>
    </Switch>
  );
}

// ---------------------------------------------------------------------------
// Path breadcrumb
// ---------------------------------------------------------------------------
function PathBreadcrumb(props: {
  driveName: string;
  trail: Array<{ id: string; name: string }>;
  onNavigate: (id: string | null) => void;
}) {
  return (
    <nav class="flex items-center gap-1 text-sm min-w-0 overflow-hidden">
      <button
        onClick={() => props.onNavigate(null)}
        class="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {props.driveName}
      </button>
      <For each={props.trail}>
        {(crumb, i) => (
          <>
            <ChevronRight class="size-3.5 shrink-0 text-muted-foreground" />
            <button
              onClick={() => props.onNavigate(crumb.id)}
              class={`truncate hover:text-foreground transition-colors ${
                i() === props.trail.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {crumb.name}
            </button>
          </>
        )}
      </For>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// File row
// ---------------------------------------------------------------------------
function FileRow(props: {
  file: DriveFile;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  driveId: string;
}) {
  return (
    <tr
      class={`group border-b border-border last:border-0 cursor-pointer select-none transition-colors ${
        props.selected ? "bg-stone-100" : "hover:bg-stone-50"
      }`}
      onClick={props.onSelect}
      onDblClick={props.onOpen}
    >
      <td class="py-2 pl-4 pr-2 w-8">
        <FileIcon
          type={props.file.type}
          open={props.file.type === "folder" && props.selected}
          class={`size-4 shrink-0 ${fileIconColor(props.file.type)}`}
        />
      </td>
      <td class="py-2 pr-4 text-sm font-medium text-stone-800">{props.file.name}</td>
      <td class="py-2 pr-4 text-sm text-muted-foreground text-right tabular-nums hidden sm:table-cell">
        {formatSize(props.file.size)}
      </td>
      <td class="py-2 pr-4 text-sm text-muted-foreground hidden md:table-cell">
        {formatDate(props.file.modifiedAt)}
      </td>
      <td class="py-2 pr-4 text-right w-20">
        <Show when={isPreviewable(props.file.type)}>
          <a
            href={`/drive/${props.driveId}/preview?file=${props.file.id}`}
            onClick={(e) => e.stopPropagation()}
            class="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye class="size-3.5" />
            Preview
          </a>
        </Show>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Metadata sidebar
// ---------------------------------------------------------------------------
function MetadataSidebar(props: { file: DriveFile | null; driveId: string }) {
  return (
    <aside class="w-72 shrink-0 border-l border-border bg-white flex flex-col">
      <div class="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Info class="size-4 text-muted-foreground" />
        <span class="text-sm font-medium">Info</span>
      </div>

      <Show
        when={props.file}
        fallback={
          <div class="flex flex-1 items-center justify-center text-sm text-muted-foreground p-6 text-center">
            Select a file to view its details
          </div>
        }
      >
        {(file) => (
          <div class="flex flex-col p-4 gap-4">
            {/* Icon + name */}
            <div class="flex flex-col items-center gap-3 py-3">
              <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                <FileIcon type={file().type} class={`size-8 ${fileIconColor(file().type)}`} />
              </div>
              <p class="text-sm font-semibold text-center break-all leading-snug">{file().name}</p>
            </div>

            {/* Metadata */}
            <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
              <dt class="text-muted-foreground">Size</dt>
              <dd class="font-medium tabular-nums">{formatSize(file().size)}</dd>

              <dt class="text-muted-foreground">Created</dt>
              <dd class="font-medium">{formatDate(file().createdAt)}</dd>

              <dt class="text-muted-foreground">Modified</dt>
              <dd class="font-medium">{formatDate(file().modifiedAt)}</dd>

              <dt class="text-muted-foreground">Type</dt>
              <dd class="font-medium capitalize">{file().type}</dd>
            </dl>

            {/* Preview button */}
            <Show when={isPreviewable(file().type)}>
              <a
                href={`/drive/${props.driveId}/preview?file=${file().id}`}
                class="flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
              >
                <Eye class="size-4" />
                Preview file
              </a>
            </Show>
          </div>
        )}
      </Show>

      {/* Drive info */}
      <div class="mt-auto border-t border-border p-4 space-y-1">
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <HardDrive class="size-3.5 shrink-0" />
          <span class="truncate">{DRIVE_DATA.name}</span>
        </div>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock class="size-3.5 shrink-0" />
          <span>Since {formatDate(DRIVE_DATA.createdAt)}</span>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DrivePage() {
  const params = useParams<{ driveId: string }>();

  const [openFolderId, setOpenFolderId] = createSignal<string | null>(null);
  const [selectedFile, setSelectedFile] = createSignal<DriveFile | null>(null);

  const currentFiles = () => {
    const folderId = openFolderId();
    if (!folderId) return DRIVE_DATA.files;
    const folder = DRIVE_DATA.files.find((f) => f.id === folderId);
    return folder?.children ?? [];
  };

  const breadcrumbTrail = () => {
    const folderId = openFolderId();
    if (!folderId) return [];
    const folder = DRIVE_DATA.files.find((f) => f.id === folderId);
    return folder ? [{ id: folder.id, name: folder.name }] : [];
  };

  const handleOpen = (file: DriveFile) => {
    if (file.type === "folder") {
      setOpenFolderId(file.id);
      setSelectedFile(null);
    }
  };

  const handleNavigate = (id: string | null) => {
    setOpenFolderId(id);
    setSelectedFile(null);
  };

  return (
    <div class="flex overflow-hidden" style={{ height: "calc(100svh - 3.5rem)" }}>
      {/* Main browser */}
      <div class="flex flex-1 flex-col min-w-0">
        {/* Toolbar: breadcrumb + search + filters */}
        <div class="flex items-center gap-2 px-4 py-2 border-b border-border bg-white shrink-0">
          {/* Breadcrumb — takes remaining space */}
          <div class="flex-1 min-w-0">
            <PathBreadcrumb
              driveName={DRIVE_DATA.name}
              trail={breadcrumbTrail()}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Search — disabled until wired up */}
          <div class="relative hidden sm:block">
            <Search class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-stone-300" />
            <input
              type="search"
              disabled
              placeholder="Search files…"
              title="Search coming soon"
              class="h-8 w-48 rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 text-sm text-stone-400 placeholder:text-stone-300 cursor-not-allowed outline-none"
            />
          </div>

          {/* Filter button — disabled until wired up */}
          <button
            type="button"
            disabled
            title="Filters coming soon"
            class="flex h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-300 cursor-not-allowed"
          >
            <Filter class="size-3.5" />
            <span class="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* File table */}
        <div class="flex-1 overflow-y-auto">
          <table class="w-full">
            <thead class="sticky top-0 z-10">
              <tr class="border-b border-border bg-stone-50">
                <th class="py-2 pl-4 pr-2 w-8" />
                <th class="py-2 pr-4 text-xs font-medium text-left text-muted-foreground">Name</th>
                <th class="py-2 pr-4 text-xs font-medium text-right text-muted-foreground hidden sm:table-cell">
                  Size
                </th>
                <th class="py-2 pr-4 text-xs font-medium text-left text-muted-foreground hidden md:table-cell">
                  Modified
                </th>
                <th class="py-2 pr-4 w-20" />
              </tr>
            </thead>
            <tbody>
              <Show
                when={currentFiles().length > 0}
                fallback={
                  <tr>
                    <td colspan="5" class="py-16 text-center text-sm text-muted-foreground">
                      This folder is empty
                    </td>
                  </tr>
                }
              >
                <For each={currentFiles()}>
                  {(file) => (
                    <FileRow
                      file={file}
                      selected={selectedFile()?.id === file.id}
                      onSelect={() => setSelectedFile(file)}
                      onOpen={() => handleOpen(file)}
                      driveId={params.driveId}
                    />
                  )}
                </For>
              </Show>
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata sidebar */}
      <MetadataSidebar file={selectedFile()} driveId={params.driveId} />
    </div>
  );
}
