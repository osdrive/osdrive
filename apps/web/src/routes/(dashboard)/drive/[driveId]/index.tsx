import { useNavigate, useParams } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
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
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-solid";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { api } from "~/lib/tanstack";

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
  if (bytes === null) return "—";
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

function fileIconColor(entry: { kind: string; mimeType: string | null }) {
  if (entry.kind === "folder") return "text-amber-500";
  if (!entry.mimeType) return "text-stone-400";
  if (entry.mimeType.startsWith("image/")) return "text-blue-500";
  if (entry.mimeType.startsWith("video/")) return "text-violet-500";
  if (entry.mimeType.startsWith("audio/")) return "text-emerald-500";
  if (entry.mimeType === "application/pdf") return "text-red-500";
  return "text-stone-400";
}

function fileIconBg(entry: { kind: string; mimeType: string | null }) {
  if (entry.kind === "folder") return "bg-amber-50";
  if (!entry.mimeType) return "bg-stone-100";
  if (entry.mimeType.startsWith("image/")) return "bg-blue-50";
  if (entry.mimeType.startsWith("video/")) return "bg-violet-50";
  if (entry.mimeType.startsWith("audio/")) return "bg-emerald-50";
  if (entry.mimeType === "application/pdf") return "bg-red-50";
  return "bg-stone-100";
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
    <nav class="flex min-w-0 items-center gap-0.5 overflow-hidden text-sm">
      <button
        onClick={() => props.onNavigate(null)}
        class="shrink-0 rounded px-1.5 py-0.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
      >
        {props.driveName}
      </button>
      <For each={props.trail}>
        {(crumb, i) => (
          <>
            <ChevronRight class="size-3.5 shrink-0 text-stone-300" />
            <button
              onClick={() => props.onNavigate(crumb.id)}
              class={`truncate rounded px-1.5 py-0.5 transition-colors ${
                i() === props.trail.length - 1
                  ? "font-medium text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
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
      class={`group cursor-pointer select-none transition-colors ${
        props.selected ? "bg-blue-50" : "hover:bg-stone-50"
      }`}
      onClick={props.onSelect}
      onDblClick={props.onOpen}
    >
      <td class="w-12 py-2 pl-3 pr-1">
        <div
          class={`flex h-8 w-8 items-center justify-center rounded-lg ${fileIconBg(props.file)} ring-1 ring-inset ring-black/5`}
        >
          <FileIcon
            kind={props.file.kind}
            mimeType={props.file.mimeType}
            open={props.file.kind === "folder" && props.selected}
            class={`size-[18px] ${fileIconColor(props.file)}`}
          />
        </div>
      </td>
      <td class="py-2 pr-4">
        <span class="text-sm font-medium text-stone-800">{props.file.name}</span>
      </td>
      <td class="hidden py-2 pr-4 text-right sm:table-cell">
        <span class="text-xs tabular-nums text-stone-400">{formatSize(props.file.size)}</span>
      </td>
      <td class="hidden py-2 pr-4 text-right md:table-cell">
        <span class="text-xs text-stone-400">{formatDate(props.file.updatedAt)}</span>
      </td>
      <td class="w-24 py-2 pr-3 text-right">
        <Show when={props.file.kind === "file" && isPreviewable(props.file.mimeType)}>
          <a
            href={`/drive/${props.driveId}/preview?file=${props.file.id}`}
            onClick={(event) => event.stopPropagation()}
            class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-stone-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-stone-900 hover:text-white"
          >
            <Eye class="size-3" />
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
    <aside class="flex w-72 shrink-0 flex-col border-l border-stone-100 bg-stone-50/40">
      <div class="border-b border-stone-100 px-4 py-3">
        <span class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
          Inspector
        </span>
      </div>

      <Show
        when={props.file}
        fallback={
          <div class="flex flex-1 flex-col">
            <div class="flex flex-1 items-center justify-center p-6">
              <div class="text-center">
                <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100">
                  <HardDrive class="size-6 text-stone-400" />
                </div>
                <p class="text-sm font-medium text-stone-600">Nothing selected</p>
                <p class="mt-1 text-xs text-stone-400">Click a file or folder to inspect it</p>
              </div>
            </div>

            <div class="border-t border-stone-100 p-3 space-y-1">
              <button
                onClick={props.onRenameDrive}
                class="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-white hover:shadow-sm"
              >
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 transition-colors group-hover:bg-stone-200">
                  <Pencil class="size-3.5 text-stone-500" />
                </div>
                Rename drive
              </button>
              <button
                onClick={props.onDeleteDrive}
                class="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 transition-colors group-hover:bg-red-100">
                  <Trash2 class="size-3.5 text-red-400" />
                </div>
                Delete drive
              </button>
            </div>

            <div class="border-t border-stone-100 px-4 py-3 text-xs text-stone-400">
              <div class="flex items-center gap-1.5">
                <HardDrive class="size-3.5 shrink-0" />
                <span class="truncate font-medium">{props.driveName}</span>
              </div>
              <p class="mt-1">Since {formatDate(props.driveCreatedAt)}</p>
            </div>
          </div>
        }
      >
        {(file) => (
          <div class="flex flex-1 flex-col overflow-y-auto">
            {/* Icon + name */}
            <div class="flex flex-col items-center gap-3 border-b border-stone-100 bg-gradient-to-b from-white to-stone-50/60 px-4 py-6">
              <div
                class={`flex h-16 w-16 items-center justify-center rounded-2xl ${fileIconBg(file())} shadow-sm ring-1 ring-inset ring-black/[0.06]`}
              >
                <FileIcon
                  kind={file().kind}
                  mimeType={file().mimeType}
                  class={`size-9 ${fileIconColor(file())}`}
                />
              </div>
              <div class="text-center">
                <p class="break-all text-sm font-semibold leading-snug text-stone-900">
                  {file().name}
                </p>
                <p class="mt-0.5 text-xs capitalize text-stone-400">{file().kind}</p>
              </div>
            </div>

            {/* Actions */}
            <div class="border-b border-stone-100 p-3 space-y-1">
              <Show when={file().kind === "file" && isPreviewable(file().mimeType)}>
                <a
                  href={`/drive/${props.driveId}/preview?file=${file().id}`}
                  class="flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                >
                  <Eye class="size-4 shrink-0" />
                  Preview file
                </a>
              </Show>
              <button
                onClick={props.onRenameEntry}
                class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100"
              >
                <Pencil class="size-4 shrink-0 text-stone-400" />
                Rename {file().kind}
              </button>
              <button
                onClick={props.onDeleteEntry}
                class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <Trash2 class="size-4 shrink-0 text-red-400" />
                Delete {file().kind}
              </button>
            </div>

            {/* Metadata */}
            <div class="p-4 space-y-4">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Details
              </p>
              <dl class="space-y-2.5">
                <div class="flex justify-between gap-4">
                  <dt class="text-xs text-stone-400">Size</dt>
                  <dd class="text-xs font-medium tabular-nums text-stone-700">
                    {formatSize(file().size)}
                  </dd>
                </div>
                <Show when={file().mimeType}>
                  <div class="flex justify-between gap-4">
                    <dt class="shrink-0 text-xs text-stone-400">Type</dt>
                    <dd class="break-all text-right text-xs font-medium text-stone-700">
                      {file().mimeType}
                    </dd>
                  </div>
                </Show>
                <div class="flex justify-between gap-4">
                  <dt class="shrink-0 text-xs text-stone-400">Created</dt>
                  <dd class="text-xs font-medium text-stone-700">{formatDate(file().createdAt)}</dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="shrink-0 text-xs text-stone-400">Modified</dt>
                  <dd class="text-xs font-medium text-stone-700">{formatDate(file().updatedAt)}</dd>
                </div>
              </dl>
            </div>

            {/* Path */}
            <div class="mt-auto border-t border-stone-100 p-4">
              <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Path
              </p>
              <p class="break-all font-mono text-xs leading-relaxed text-stone-500">{props.path}</p>
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

  // Dialog state
  const [createFolderOpen, setCreateFolderOpen] = createSignal(false);
  const [createFolderName, setCreateFolderName] = createSignal("");

  const [renameDriveOpen, setRenameDriveOpen] = createSignal(false);
  const [renameDriveName, setRenameDriveName] = createSignal("");

  const [deleteDriveOpen, setDeleteDriveOpen] = createSignal(false);

  const [renameEntryOpen, setRenameEntryOpen] = createSignal(false);
  const [renameEntryName, setRenameEntryName] = createSignal("");

  const [deleteEntryOpen, setDeleteEntryOpen] = createSignal(false);

  const invalidateDrive = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: api.Drive.getDrives.key() }),
      queryClient.invalidateQueries({
        queryKey: api.Drive.getDrive.key({ params: { driveId: params.driveId as never } }),
      }),
    ]);
  };

  const driveQuery = api.Drive.getDrive.useQuery(() => ({
    request: { params: { driveId: params.driveId as never } },
  }));

  const createFolderMutation = api.Drive.createFolder.useMutation(() => ({
    onSuccess: invalidateDrive,
  }));

  const uploadFileMutation = api.Drive.uploadFile.useMutation(() => ({
    onSuccess: invalidateDrive,
  }));

  const renameDriveMutation = api.Drive.renameDrive.useMutation(() => ({
    onSuccess: invalidateDrive,
  }));

  const deleteDriveMutation = api.Drive.deleteDrive.useMutation(() => ({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: api.Drive.getDrives.key() });
      navigate("/dashboard");
    },
  }));

  const renameEntryMutation = api.Drive.renameEntry.useMutation(() => ({
    onSuccess: invalidateDrive,
  }));

  const deleteEntryMutation = api.Drive.deleteEntry.useMutation(() => ({
    onSuccess: async () => {
      setSelectedEntryId(null);
      await invalidateDrive();
    },
  }));

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.set("file", file, file.name);
    if (currentFolderId()) {
      formData.set("parentId", currentFolderId()!);
    }

    return uploadFileMutation.mutateAsync({
      params: { driveId: params.driveId as never },
      payload: formData,
    });
  };

  const entries = createMemo<ReadonlyArray<BrowserEntry>>(() => driveQuery.data?.entries ?? []);

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

  const handleCreateFolder = () => {
    setCreateFolderName("");
    setCreateFolderOpen(true);
  };

  const handleCreateFolderSubmit = async () => {
    const name = createFolderName().trim();
    if (!name) return;
    setCreateFolderOpen(false);
    await createFolderMutation.mutateAsync({
      params: { driveId: params.driveId as never },
      payload: { name, parentId: (currentFolderId() ?? undefined) as never },
    });
  };

  const handleUpload = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    await uploadFile(file);
    input.value = "";
  };

  const handleRenameDrive = () => {
    if (!driveQuery.data) return;
    setRenameDriveName(driveQuery.data.name);
    setRenameDriveOpen(true);
  };

  const handleRenameDriveSubmit = async () => {
    const name = renameDriveName().trim();
    if (!name) return;
    setRenameDriveOpen(false);
    await renameDriveMutation.mutateAsync({
      params: { driveId: params.driveId as never },
      payload: { name },
    });
  };

  const handleDeleteDrive = () => {
    if (!driveQuery.data) return;
    setDeleteDriveOpen(true);
  };

  const handleDeleteDriveConfirm = async () => {
    setDeleteDriveOpen(false);
    await deleteDriveMutation.mutateAsync({ params: { driveId: params.driveId as never } });
  };

  const handleRenameEntry = () => {
    const entry = selectedEntry();
    if (!entry) return;
    setRenameEntryName(entry.name);
    setRenameEntryOpen(true);
  };

  const handleRenameEntrySubmit = async () => {
    const entry = selectedEntry();
    if (!entry) return;
    const name = renameEntryName().trim();
    if (!name) return;
    setRenameEntryOpen(false);
    await renameEntryMutation.mutateAsync({
      params: { driveId: params.driveId as never, entryId: entry.id as never },
      payload: { name },
    });
  };

  const handleDeleteEntry = () => {
    const entry = selectedEntry();
    if (!entry) return;
    setDeleteEntryOpen(true);
  };

  const handleDeleteEntryConfirm = async () => {
    const entry = selectedEntry();
    if (!entry) return;
    setDeleteEntryOpen(false);
    await deleteEntryMutation.mutateAsync({
      params: { driveId: params.driveId as never, entryId: entry.id as never },
    });
  };

  return (
    <>
      <Show
        when={!driveQuery.isLoading && driveQuery.data}
        fallback={
          <div class="flex flex-1 items-center justify-center p-6 text-sm text-stone-400">
            Loading…
          </div>
        }
      >
        {(drive) => (
          <div class="flex overflow-hidden" style={{ height: "calc(100svh - 3.5rem)" }}>
            {/* Main content */}
            <div class="flex min-w-0 flex-1 flex-col">
              {/* Toolbar */}
              <div class="flex shrink-0 flex-wrap items-center gap-2 border-b border-stone-100 bg-white px-4 py-2.5">
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

                <div class="relative min-w-[10rem] flex-1 sm:max-w-52 sm:flex-none">
                  <Search class="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-300" />
                  <input
                    type="search"
                    value={search()}
                    onInput={(event) => setSearch(event.currentTarget.value)}
                    placeholder="Search…"
                    class="h-8 w-full rounded-full border border-stone-200 bg-stone-50 pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-stone-300 focus:border-stone-300 focus:bg-white"
                  />
                </div>

                <input ref={fileInputRef} type="file" class="sr-only" onChange={handleUpload} />

                <button
                  onClick={handleCreateFolder}
                  class="flex h-8 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 text-sm text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
                >
                  <Plus class="size-3.5" />
                  <span>Folder</span>
                </button>
                <button
                  onClick={() => fileInputRef?.click()}
                  class="flex h-8 items-center gap-1.5 rounded-full bg-stone-900 px-4 text-sm font-medium text-white transition-colors hover:bg-stone-700"
                >
                  <Upload class="size-3.5" />
                  <span>Upload</span>
                </button>
              </div>

              {/* File table */}
              <div
                class="flex-1 overflow-y-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSelectedEntryId(null);
                }}
              >
                <table class="w-full">
                  <thead class="sticky top-0 z-10">
                    <tr class="border-b border-stone-100 bg-white/90 backdrop-blur-sm">
                      <th class="w-12 py-2.5 pl-3 pr-1" />
                      <th class="py-2.5 pr-4 text-left">
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                          Name
                        </span>
                      </th>
                      <th class="hidden py-2.5 pr-4 text-right sm:table-cell">
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                          Size
                        </span>
                      </th>
                      <th class="hidden py-2.5 pr-4 text-right md:table-cell">
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                          Modified
                        </span>
                      </th>
                      <th class="w-24 py-2.5 pr-3" />
                    </tr>
                  </thead>
                  <tbody>
                    <Show
                      when={currentFiles().length > 0}
                      fallback={
                        <tr>
                          <td colSpan={5} class="py-20 text-center">
                            <div class="flex flex-col items-center gap-2">
                              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100">
                                <Show
                                  when={search().trim()}
                                  fallback={<Folder class="size-6 text-stone-400" />}
                                >
                                  <Search class="size-6 text-stone-400" />
                                </Show>
                              </div>
                              <p class="text-sm font-medium text-stone-500">
                                {search().trim()
                                  ? "No files match this search"
                                  : "This folder is empty"}
                              </p>
                              <p class="text-xs text-stone-400">
                                {search().trim()
                                  ? "Try a different search term"
                                  : "Upload files or create a folder to get started"}
                              </p>
                            </div>
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

      {/* Create folder dialog */}
      <Dialog open={createFolderOpen()} onOpenChange={setCreateFolderOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader>
            <DialogTitle>New folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={createFolderName()}
            onInput={(e) => setCreateFolderName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolderSubmit()}
            autofocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolderSubmit} disabled={!createFolderName().trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename drive dialog */}
      <Dialog open={renameDriveOpen()} onOpenChange={setRenameDriveOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename drive</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Drive name"
            value={renameDriveName()}
            onInput={(e) => setRenameDriveName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameDriveSubmit()}
            autofocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDriveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameDriveSubmit} disabled={!renameDriveName().trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete drive dialog */}
      <Dialog open={deleteDriveOpen()} onOpenChange={setDeleteDriveOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete drive</DialogTitle>
            <DialogDescription>
              Delete{" "}
              <span class="font-medium text-foreground">{driveQuery.data?.name}</span> and all of
              its files? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDriveOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDriveConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename entry dialog */}
      <Dialog open={renameEntryOpen()} onOpenChange={setRenameEntryOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename {selectedEntry()?.kind}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Name"
            value={renameEntryName()}
            onInput={(e) => setRenameEntryName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameEntrySubmit()}
            autofocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameEntryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameEntrySubmit} disabled={!renameEntryName().trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete entry dialog */}
      <Dialog open={deleteEntryOpen()} onOpenChange={setDeleteEntryOpen}>
        <DialogContent class="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {selectedEntry()?.kind}</DialogTitle>
            <DialogDescription>
              <Show
                when={selectedEntry()?.kind === "folder"}
                fallback={
                  <>
                    Delete{" "}
                    <span class="font-medium text-foreground">{selectedEntry()?.name}</span>? This
                    cannot be undone.
                  </>
                }
              >
                Delete{" "}
                <span class="font-medium text-foreground">{selectedEntry()?.name}</span> and
                everything inside it? This cannot be undone.
              </Show>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEntryOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEntryConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
