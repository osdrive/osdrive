import { createSignal, For, Show } from "solid-js";
import { Check, Copy, Link2, Upload } from "lucide-solid";

// ---------------------------------------------------------------------------
// Hardcoded data — replace with API calls when wired up
// ---------------------------------------------------------------------------
const EXISTING_SHARES = [
  {
    id: "sh_abc123",
    name: "Q4 Financial Report.pdf",
    size: 2_451_200,
    createdAt: new Date("2026-03-15T10:23:00Z"),
  },
  {
    id: "sh_def456",
    name: "Design Mockups.zip",
    size: 18_204_800,
    createdAt: new Date("2026-04-01T14:05:00Z"),
  },
  {
    id: "sh_ghi789",
    name: "Team Photo.jpg",
    size: 3_145_728,
    createdAt: new Date("2026-04-10T09:17:00Z"),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function buildShareUrl(id: string): string {
  return `${window.location.origin}/share/${id}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SharePage() {
  const [file, setFile] = createSignal<File | null>(null);
  const [name, setName] = createSignal("");
  const [dragging, setDragging] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);
  const [shareId, setShareId] = createSignal<string | null>(null);
  const [copied, setCopied] = createSignal(false);

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-colors";

  const handleFile = (f: File) => {
    setFile(f);
    setName(f.name);
    setShareId(null);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer?.files[0];
    if (f) handleFile(f);
  };

  const handleFileInput = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const f = input.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async (e: SubmitEvent) => {
    e.preventDefault();
    setUploading(true);
    // Simulate API call — replace with real upload when wired up
    await new Promise((r) => setTimeout(r, 800));
    setShareId("sh_" + Math.random().toString(36).slice(2, 9));
    setUploading(false);
  };

  const copyLink = () => {
    const id = shareId();
    if (!id) return;
    navigator.clipboard.writeText(buildShareUrl(id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div class="flex flex-1 flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 class="text-xl font-semibold text-stone-900">Share a File</h1>
        <p class="text-sm text-stone-500 mt-1">
          Upload a file and get a shareable link anyone can access.
        </p>
      </div>

      {/* Upload form */}
      <section class="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 class="text-sm font-semibold">Upload file</h2>
        <form onSubmit={handleUpload} class="space-y-4">
          {/* Drop zone */}
          <label
            class={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
              dragging()
                ? "border-stone-500 bg-stone-50"
                : "border-stone-300 bg-muted/30 hover:border-stone-400 hover:bg-muted/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
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
                  <p class="text-xs text-muted-foreground mt-1">Any file type supported</p>
                </div>
              }
            >
              {(f) => (
                <div>
                  <p class="text-sm font-medium text-stone-700">{f().name}</p>
                  <p class="text-xs text-muted-foreground mt-1">{formatBytes(f().size)}</p>
                </div>
              )}
            </Show>
          </label>

          {/* Share name */}
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-stone-700">Share name</label>
            <input
              type="text"
              required
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              class={inputClass}
              placeholder="e.g. Q4 Report"
            />
          </div>

          <button
            type="submit"
            disabled={!file() || uploading()}
            class="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            {uploading() ? "Creating link…" : "Create share link"}
          </button>
        </form>

        {/* Share link result */}
        <Show when={shareId()}>
          {(id) => (
            <div class="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
              <p class="text-sm font-medium text-green-800 flex items-center gap-2">
                <Link2 class="size-4" />
                Share link created
              </p>
              <div class="flex gap-2">
                <input
                  readOnly
                  value={buildShareUrl(id())}
                  class="flex-1 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none"
                />
                <button
                  onClick={copyLink}
                  class="flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-green-50 transition-colors"
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

      {/* Existing shares list */}
      <section class="rounded-xl border border-border bg-card overflow-hidden">
        <div class="px-6 py-4 border-b border-border">
          <h2 class="text-sm font-semibold">Your shared files</h2>
        </div>
        <ul class="divide-y divide-border">
          <For each={EXISTING_SHARES}>
            {(share) => (
              <li class="flex items-center gap-3 px-6 py-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
                  <Link2 class="size-4 text-muted-foreground" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-stone-900 truncate">{share.name}</p>
                  <p class="text-xs text-muted-foreground">
                    {formatBytes(share.size)} · {share.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={`/share/${share.id}`}
                  target="_blank"
                  class="shrink-0 text-xs text-stone-500 hover:text-stone-900 transition-colors"
                >
                  View →
                </a>
              </li>
            )}
          </For>
        </ul>
      </section>
    </div>
  );
}
