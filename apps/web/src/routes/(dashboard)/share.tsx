import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Check, Copy, Link2, Upload } from "lucide-solid";
import { createSignal, For, Show } from "solid-js";
import { Effect } from "effect";
import { ApiClient, runApi } from "~/lib/client";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function buildShareUrl(id: string): string {
  if (typeof window === "undefined") {
    return `/share/${id}`;
  }

  return `${window.location.origin}/share/${id}`;
}

export default function SharePage() {
  const queryClient = useQueryClient();
  const [file, setFile] = createSignal<File | null>(null);
  const [name, setName] = createSignal("");
  const [dragging, setDragging] = createSignal(false);
  const [copied, setCopied] = createSignal(false);

  const sharesQuery = createQuery(() => ({
    queryKey: ["shares"],
    queryFn: () =>
      runApi(
        Effect.gen(function* () {
          const api = yield* ApiClient;
          return yield* api.Share.listShares();
        }),
      ),
  }));

  const createShareMutation = createMutation(() => ({
    mutationFn: async (input: { file: File; name: string }) => {
      const formData = new FormData();
      formData.set("name", input.name);
      formData.set("file", input.file);

      return runApi(
        Effect.gen(function* () {
          const api = yield* ApiClient;
          return yield* api.Share.createShare({ payload: formData });
        }),
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shares"] });
    },
  }));

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-colors";

  const handleFile = (nextFile: File) => {
    setFile(nextFile);
    setName(nextFile.name);
    createShareMutation.reset();
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer?.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleFileInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const selectedFile = input.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleUpload = async (event: SubmitEvent) => {
    event.preventDefault();

    const selectedFile = file();
    if (!selectedFile) {
      return;
    }

    await createShareMutation.mutateAsync({
      file: selectedFile,
      name: name().trim() || selectedFile.name,
    });
  };

  const copyLink = async () => {
    const id = createShareMutation.data?.id;
    if (!id) return;

    await navigator.clipboard.writeText(buildShareUrl(id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div class="flex max-w-2xl flex-1 flex-col gap-6 p-6">
      <div>
        <h1 class="text-xl font-semibold text-stone-900">Share a File</h1>
        <p class="mt-1 text-sm text-stone-500">
          Upload a file and get a shareable link anyone can access.
        </p>
      </div>

      <section class="space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 class="text-sm font-semibold">Upload file</h2>
        <form onSubmit={handleUpload} class="space-y-4">
          <label
            class={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
              dragging()
                ? "border-stone-500 bg-stone-50"
                : "border-stone-300 bg-muted/30 hover:border-stone-400 hover:bg-muted/50"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input type="file" class="sr-only" onChange={handleFileInput} />
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Upload class="size-5 text-muted-foreground" />
            </div>
            <Show
              when={file()}
              fallback={
                <div>
                  <p class="text-sm font-medium text-stone-700">
                    Drop a file here or click to browse
                  </p>
                  <p class="mt-1 text-xs text-muted-foreground">Any file type supported</p>
                </div>
              }
            >
              {(selectedFile) => (
                <div>
                  <p class="text-sm font-medium text-stone-700">{selectedFile().name}</p>
                  <p class="mt-1 text-xs text-muted-foreground">
                    {formatBytes(selectedFile().size)}
                  </p>
                </div>
              )}
            </Show>
          </label>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-stone-700">Share name</label>
            <input
              type="text"
              required
              value={name()}
              onInput={(event) => setName(event.currentTarget.value)}
              class={inputClass}
              placeholder="e.g. Q4 Report"
            />
          </div>

          <button
            type="submit"
            disabled={!file() || createShareMutation.isPending}
            class="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            {createShareMutation.isPending ? "Creating link..." : "Create share link"}
          </button>
        </form>

        <Show when={createShareMutation.isError}>
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to create share link.
          </div>
        </Show>

        <Show when={createShareMutation.data}>
          {(share) => (
            <div class="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
              <p class="flex items-center gap-2 text-sm font-medium text-green-800">
                <Link2 class="size-4" />
                Share link created
              </p>
              <div class="flex gap-2">
                <input
                  readOnly
                  value={buildShareUrl(share().id)}
                  class="flex-1 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none"
                />
                <button
                  onClick={copyLink}
                  class="flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-green-50"
                >
                  <Show when={copied()} fallback={<Copy class="size-4" />}>
                    <Check class="size-4 text-green-600" />
                  </Show>
                  {copied() ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </Show>
      </section>

      <section class="overflow-hidden rounded-xl border border-border bg-card">
        <div class="border-b border-border px-6 py-4">
          <h2 class="text-sm font-semibold">Your shared files</h2>
        </div>

        <Show
          when={!sharesQuery.isLoading}
          fallback={<div class="px-6 py-4 text-sm text-muted-foreground">Loading shares...</div>}
        >
          <Show
            when={!sharesQuery.isError}
            fallback={<div class="px-6 py-4 text-sm text-red-600">Failed to load your shares.</div>}
          >
            <Show
              when={(sharesQuery.data?.length ?? 0) > 0}
              fallback={
                <div class="px-6 py-4 text-sm text-muted-foreground">No shared files yet.</div>
              }
            >
              <ul class="divide-y divide-border">
                <For each={sharesQuery.data}>
                  {(share) => (
                    <li class="flex items-center gap-3 px-6 py-3">
                      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Link2 class="size-4 text-muted-foreground" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-stone-900">{share.name}</p>
                        <p class="text-xs text-muted-foreground">
                          {formatBytes(share.size)} · {share.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={`/share/${share.id}`}
                        target="_blank"
                        rel="noreferrer"
                        class="shrink-0 text-xs text-stone-500 transition-colors hover:text-stone-900"
                      >
                        View →
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Show>
        </Show>
      </section>
    </div>
  );
}
