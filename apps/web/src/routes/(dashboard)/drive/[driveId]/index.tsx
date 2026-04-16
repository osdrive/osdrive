import { useNavigate, useParams } from "@solidjs/router";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import {
  Archive,
  ChevronRight,
  Eye,
  File,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
  HardDrive,
  Info,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-solid";
import { Effect } from "effect";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { ApiClient, runApi } from "~/lib/client";

type BrowserEntry = {
  id: string;
  driveId: string;
  parentId: string | null;
  kind: string;
  name: string;
  mimeType: string | null;
  size: number | null;
  createdAt: Date;
  updatedAt: Date;
  contentUrl: string | null;
  previewUrl: string | null;
  textPreview: string | null;
};

function formatSize(bytes: number | null): string {
  if (bytes === null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isPreviewable(mimeType: string | null) {
  if (!mimeType) return false;
  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/") ||
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/pdf"
  );
}

function fileIconClass(entry: { kind: string; mimeType: string | null }) {
  if (entry.kind === "folder") return "text-amber-500";
  if (!entry.mimeType) return "text-stone-400";
  if (entry.mimeType.startsWith("image/")) return "text-blue-500";
  if (entry.mimeType.startsWith("video/")) return "text-violet-500";
  if (entry.mimeType.startsWith("audio/")) return "text-emerald-500";
  if (entry.mimeType === "application/pdf") return "text-red-500";
  return "text-stone-400";
}

function FileIcon(props: {
  kind: string;
  mimeType: string | null;
  open?: boolean;
  class?: string;
}) {
  if (props.kind === "folder") {
    return props.open ? <FolderOpen class={props.class} /> : <Folder class={props.class} />;
  }

  if (props.mimeType?.startsWith("image/")) return <FileImage class={props.class} />;
  if (props.mimeType?.startsWith("video/")) return <FileVideo class={props.class} />;
  if (props.mimeType?.startsWith("audio/")) return <FileAudio class={props.class} />;
  if (props.mimeType === "application/pdf") return <FileText class={props.class} />;
  if (props.mimeType?.includes("zip") || props.mimeType?.includes("tar")) {
    return <Archive class={props.class} />;
  }

  return props.mimeType?.startsWith("text/") || props.mimeType === "application/json" ? (
    <FileText class={props.class} />
  ) : (
    <File class={props.class} />
  );
}

function PathBreadcrumb(props: {
  driveName: string;
  trail: Array<{ id: string; name: string }>;
  onNavigate: (id: string | null) => void;
}) {
  return (
    <nav class="flex min-w-0 items-center gap-1 overflow-hidden text-sm">
      <button
        onClick={() => props.onNavigate(null)}
        class="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
      >
        {props.driveName}
      </button>
      <For each={props.trail}>
        {(crumb, i) => (
          <>
            <ChevronRight class="size-3.5 shrink-0 text-muted-foreground" />
            <button
              onClick={() => props.onNavigate(crumb.id)}
              class={`truncate transition-colors ${
                i() === props.trail.length - 1
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
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

function FileRow(props: {
  driveId: string;
  file: BrowserEntry;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
}) {
  return (
    <tr
      class={`group cursor-pointer select-none border-b border-border transition-colors last:border-0 ${
        props.selected ? "bg-stone-100" : "hover:bg-stone-50"
      }`}
      onClick={props.onSelect}
      onDblClick={props.onOpen}
    >
      <td class="w-8 py-2 pl-4 pr-2">
        <FileIcon
          kind={props.file.kind}
          mimeType={props.file.mimeType}
          open={props.file.kind === "folder" && props.selected}
          class={`size-4 shrink-0 ${fileIconClass(props.file)}`}
        />
      </td>
      <td class="py-2 pr-4 text-sm font-medium text-stone-800">{props.file.name}</td>
      <td class="hidden py-2 pr-4 text-right text-sm tabular-nums text-muted-foreground sm:table-cell">
        {formatSize(props.file.size)}
      </td>
      <td class="hidden py-2 pr-4 text-sm text-muted-foreground md:table-cell">
        {formatDate(props.file.updatedAt)}
      </td>
      <td class="w-20 py-2 pr-4 text-right">
        <Show when={props.file.kind === "file" && isPreviewable(props.file.mimeType)}>
          <a
            href={`/drive/${props.driveId}/preview?file=${props.file.id}`}
            onClick={(event) => event.stopPropagation()}
            class="inline-flex items-center gap-1 text-xs text-stone-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-stone-800"
          >
            <Eye class="size-3.5" />
            Preview
          </a>
        </Show>
      </td>
    </tr>
  );
}

function MetadataSidebar(props: {
  driveName: string;
  driveCreatedAt: Date;
  file: BrowserEntry | null;
  driveId: string;
  path: string;
  onRenameDrive: () => void;
  onDeleteDrive: () => void;
  onRenameEntry: () => void;
  onDeleteEntry: () => void;
}) {
  return (
    <aside class="flex w-72 shrink-0 flex-col border-l border-border bg-white">
      <div class="flex items-center gap-2 border-b border-border px-4 py-3">
        <Info class="size-4 text-muted-foreground" />
        <span class="text-sm font-medium">Info</span>
      </div>

      <Show
        when={props.file}
        fallback={
          <div class="flex flex-1 flex-col justify-between p-4">
            <div class="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Select a file or folder to view its details
            </div>
            <div class="space-y-2 border-t border-border pt-4">
              <button
                onClick={props.onRenameDrive}
                class="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                <Pencil class="size-4" />
                Rename drive
              </button>
              <button
                onClick={props.onDeleteDrive}
                class="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                <Trash2 class="size-4" />
                Delete drive
              </button>
            </div>
          </div>
        }
      >
        {(file) => (
          <div class="flex flex-1 flex-col p-4">
            <div class="flex flex-col items-center gap-3 py-3">
              <div class="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                <FileIcon
                  kind={file().kind}
                  mimeType={file().mimeType}
                  class={`size-8 ${fileIconClass(file())}`}
                />
              </div>
              <p class="break-all text-center text-sm font-semibold leading-snug">{file().name}</p>
            </div>

            <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
              <dt class="text-muted-foreground">Type</dt>
              <dd class="font-medium capitalize">{file().kind}</dd>

              <dt class="text-muted-foreground">Size</dt>
              <dd class="font-medium tabular-nums">{formatSize(file().size)}</dd>

              <dt class="text-muted-foreground">Mime</dt>
              <dd class="break-all font-medium">{file().mimeType ?? "Folder"}</dd>

              <dt class="text-muted-foreground">Path</dt>
              <dd class="break-all font-medium">{props.path}</dd>

              <dt class="text-muted-foreground">Created</dt>
              <dd class="font-medium">{formatDate(file().createdAt)}</dd>

              <dt class="text-muted-foreground">Modified</dt>
              <dd class="font-medium">{formatDate(file().updatedAt)}</dd>
            </dl>

            <div class="mt-4 space-y-2">
              <Show when={file().kind === "file" && isPreviewable(file().mimeType)}>
                <a
                  href={`/drive/${props.driveId}/preview?file=${file().id}`}
                  class="flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                >
                  <Eye class="size-4" />
                  Preview file
                </a>
              </Show>
              <button
                onClick={props.onRenameEntry}
                class="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                <Pencil class="size-4" />
                Rename {file().kind}
              </button>
              <button
                onClick={props.onDeleteEntry}
                class="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                <Trash2 class="size-4" />
                Delete {file().kind}
              </button>
            </div>

            <div class="mt-auto border-t border-border pt-4 text-xs text-muted-foreground">
              <div class="flex items-center gap-2">
                <HardDrive class="size-3.5 shrink-0" />
                <span class="truncate">{props.driveName}</span>
              </div>
              <div class="mt-1">Since {formatDate(props.driveCreatedAt)}</div>
            </div>
          </div>
        )}
      </Show>
    </aside>
  );
}

export default function DrivePage() {
  const params = useParams<{ driveId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentFolderId, setCurrentFolderId] = createSignal<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = createSignal<string | null>(null);
  const [search, setSearch] = createSignal("");
  let fileInputRef: HTMLInputElement | undefined;

  const invalidateDrive = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["drives"] }),
      queryClient.invalidateQueries({ queryKey: ["drive", params.driveId] }),
    ]);
  };

  const driveQuery = createQuery(() => ({
    queryKey: ["drive", params.driveId],
    queryFn: () =>
      runApi(
        Effect.gen(function* () {
          const api = yield* ApiClient;
          return yield* api.Drive.getDrive({ params: { driveId: params.driveId as never } });
        }),
      ),
  }));

  const createFolderMutation = createMutation(() => ({
    mutationFn: async (name: string) =>
      runApi(
        Effect.gen(function* () {
          const api = yield* ApiClient;
          return yield* api.Drive.createFolder({
            params: { driveId: params.driveId as never },
            payload: { name, parentId: (currentFolderId() ?? undefined) as never },
          });
        }),
      ),
    onSuccess: invalidateDrive,
  }));

  const uploadFileMutation = createMutation(() => ({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.set("file", file, file.name);
      if (currentFolderId()) {
        formData.set("parentId", currentFolderId()!);
      }

      return runApi(
        Effect.gen(function* () {
          const api = yield* ApiClient;
          return yield* api.Drive.uploadFile({
            params: { driveId: params.driveId as never },
            payload: formData,
          });
        }),
      );
    },
    onSuccess: invalidateDrive,
  }));

  const renameDriveMutation = createMutation(() => ({
    mutationFn: async (name: string) =>
      runApi(
        Effect.gen(function* () {
          const api = yield* ApiClient;
          return yield* api.Drive.renameDrive({
            params: { driveId: params.driveId as never },
            payload: { name },
          });
        }),
      ),
    onSuccess: invalidateDrive,
  }));

  const deleteDriveMutation = createMutation(() => ({
    mutationFn: async () =>
      runApi(
        Effect.gen(function* () {
          const api = yield* ApiClient;
          return yield* api.Drive.deleteDrive({ params: { driveId: params.driveId as never } });
        }),
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["drives"] });
      navigate("/dashboard");
    },
  }));

  const renameEntryMutation = createMutation(() => ({
    mutationFn: async (input: { entryId: string; name: string }) =>
      runApi(
        Effect.gen(function* () {
          const api = yield* ApiClient;
          return yield* api.Drive.renameEntry({
            params: { driveId: params.driveId as never, entryId: input.entryId as never },
            payload: { name: input.name },
          });
        }),
      ),
    onSuccess: invalidateDrive,
  }));

  const deleteEntryMutation = createMutation(() => ({
    mutationFn: async (entryId: string) =>
      runApi(
        Effect.gen(function* () {
          const api = yield* ApiClient;
          return yield* api.Drive.deleteEntry({
            params: { driveId: params.driveId as never, entryId: entryId as never },
          });
        }),
      ),
    onSuccess: async () => {
      setSelectedEntryId(null);
      await invalidateDrive();
    },
  }));

  const entries = createMemo(() => driveQuery.data?.entries ?? []);

  createEffect(() => {
    const folderId = currentFolderId();
    if (folderId && !entries().some((entry) => entry.id === folderId && entry.kind === "folder")) {
      setCurrentFolderId(null);
    }

    const entryId = selectedEntryId();
    if (entryId && !entries().some((entry) => entry.id === entryId)) {
      setSelectedEntryId(null);
    }
  });

  const currentFiles = createMemo(() => {
    const term = search().trim().toLowerCase();
    return entries()
      .filter((entry) => {
        if ((entry.parentId ?? null) !== currentFolderId()) {
          return false;
        }
        if (!term) {
          return true;
        }
        return entry.name.toLowerCase().includes(term);
      })
      .slice()
      .sort((a, b) => {
        if (a.kind !== b.kind) {
          return a.kind === "folder" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
  });

  const selectedEntry = createMemo(
    () => entries().find((entry) => entry.id === selectedEntryId()) ?? null,
  );

  const breadcrumbTrail = createMemo(() => {
    const trail: Array<{ id: string; name: string }> = [];
    let cursor = currentFolderId();

    while (cursor) {
      const folder = entries().find((entry) => entry.id === cursor && entry.kind === "folder");
      if (!folder) break;
      trail.unshift({ id: folder.id, name: folder.name });
      cursor = folder.parentId ?? null;
    }

    return trail;
  });

  const selectedPath = createMemo(() => {
    const entry = selectedEntry();
    if (!entry || !driveQuery.data) return driveQuery.data?.name ?? "";

    const names = [entry.name];
    let cursor = entry.parentId ?? null;
    while (cursor) {
      const parent = entries().find((candidate) => candidate.id === cursor);
      if (!parent) break;
      names.unshift(parent.name);
      cursor = parent.parentId ?? null;
    }

    return `${driveQuery.data.name}/${names.join("/")}`;
  });

  const handleOpen = (entry: BrowserEntry) => {
    if (entry.kind === "folder") {
      setCurrentFolderId(entry.id);
      setSelectedEntryId(null);
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("Folder name");
    if (!name) return;
    await createFolderMutation.mutateAsync(name);
  };

  const handleUpload = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    await uploadFileMutation.mutateAsync(file);
    input.value = "";
  };

  const handleRenameDrive = async () => {
    if (!driveQuery.data) return;
    const name = window.prompt("Rename drive", driveQuery.data.name);
    if (!name) return;
    await renameDriveMutation.mutateAsync(name);
  };

  const handleDeleteDrive = async () => {
    if (!driveQuery.data) return;
    const confirmed = window.confirm(`Delete ${driveQuery.data.name} and all of its files?`);
    if (!confirmed) return;
    await deleteDriveMutation.mutateAsync();
  };

  const handleRenameEntry = async () => {
    const entry = selectedEntry();
    if (!entry) return;
    const name = window.prompt(`Rename ${entry.kind}`, entry.name);
    if (!name) return;
    await renameEntryMutation.mutateAsync({ entryId: entry.id, name });
  };

  const handleDeleteEntry = async () => {
    const entry = selectedEntry();
    if (!entry) return;
    const confirmed = window.confirm(
      entry.kind === "folder"
        ? `Delete ${entry.name} and everything inside it?`
        : `Delete ${entry.name}?`,
    );
    if (!confirmed) return;
    await deleteEntryMutation.mutateAsync(entry.id);
  };

  return (
    <Show
      when={!driveQuery.isLoading && driveQuery.data}
      fallback={<div class="p-6 text-sm text-muted-foreground">Loading drive...</div>}
    >
      {(drive) => (
        <div class="flex overflow-hidden" style={{ height: "calc(100svh - 3.5rem)" }}>
          <div class="flex min-w-0 flex-1 flex-col">
            <div class="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-white px-4 py-2">
              <div class="min-w-0 flex-1">
                <PathBreadcrumb
                  driveName={drive().name}
                  trail={breadcrumbTrail()}
                  onNavigate={(id) => {
                    setCurrentFolderId(id);
                    setSelectedEntryId(null);
                  }}
                />
              </div>

              <div class="relative min-w-[12rem] flex-1 sm:max-w-56 sm:flex-none">
                <Search class="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stone-300" />
                <input
                  type="search"
                  value={search()}
                  onInput={(event) => setSearch(event.currentTarget.value)}
                  placeholder="Search this folder..."
                  class="h-8 w-full rounded-lg border border-stone-200 bg-stone-50 pl-8 pr-3 text-sm outline-none transition-colors focus:border-stone-400"
                />
              </div>

              <input ref={fileInputRef} type="file" class="sr-only" onChange={handleUpload} />

              <button
                onClick={handleCreateFolder}
                class="flex h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm text-stone-700 transition-colors hover:bg-stone-100"
              >
                <Plus class="size-3.5" />
                Folder
              </button>
              <button
                onClick={() => fileInputRef?.click()}
                class="flex h-8 items-center gap-1.5 rounded-lg bg-stone-900 px-3 text-sm font-medium text-white transition-colors hover:bg-stone-800"
              >
                <Upload class="size-3.5" />
                Upload
              </button>
            </div>

            <div class="flex-1 overflow-y-auto">
              <table class="w-full">
                <thead class="sticky top-0 z-10">
                  <tr class="border-b border-border bg-stone-50">
                    <th class="w-8 py-2 pl-4 pr-2" />
                    <th class="py-2 pr-4 text-left text-xs font-medium text-muted-foreground">
                      Name
                    </th>
                    <th class="hidden py-2 pr-4 text-right text-xs font-medium text-muted-foreground sm:table-cell">
                      Size
                    </th>
                    <th class="hidden py-2 pr-4 text-left text-xs font-medium text-muted-foreground md:table-cell">
                      Modified
                    </th>
                    <th class="w-20 py-2 pr-4" />
                  </tr>
                </thead>
                <tbody>
                  <Show
                    when={currentFiles().length > 0}
                    fallback={
                      <tr>
                        <td colSpan={5} class="py-16 text-center text-sm text-muted-foreground">
                          {search().trim() ? "No files match this search" : "This folder is empty"}
                        </td>
                      </tr>
                    }
                  >
                    <For each={currentFiles()}>
                      {(file) => (
                        <FileRow
                          driveId={params.driveId}
                          file={file}
                          selected={selectedEntryId() === file.id}
                          onSelect={() => setSelectedEntryId(file.id)}
                          onOpen={() => handleOpen(file)}
                        />
                      )}
                    </For>
                  </Show>
                </tbody>
              </table>
            </div>
          </div>

          <MetadataSidebar
            driveName={drive().name}
            driveCreatedAt={drive().createdAt}
            file={selectedEntry()}
            driveId={params.driveId}
            path={selectedPath()}
            onRenameDrive={handleRenameDrive}
            onDeleteDrive={handleDeleteDrive}
            onRenameEntry={handleRenameEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        </div>
      )}
    </Show>
  );
}
