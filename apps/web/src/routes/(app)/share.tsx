import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { createSignal } from "solid-js";
import type { ShareMetadata } from "~/lib/shares";

type UploadResult = ShareMetadata & {
  shareUrl: string;
};

export default function SharePage() {
  const [file, setFile] = createSignal<File | null>(null);
  const [customName, setCustomName] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal("");
  const [result, setResult] = createSignal<UploadResult | null>(null);
  const [copied, setCopied] = createSignal(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    const selectedFile = file();

    if (!selectedFile) {
      setError("Choose a file to upload.");
      return;
    }

    if (!customName().trim()) {
      setError("Enter the file name you want people to see.");
      return;
    }

    setSubmitting(true);
    setError("");
    setCopied(false);

    const formData = new FormData();
    formData.set("file", selectedFile);
    formData.set("name", customName().trim());

    try {
      const response = await fetch("/api/shares", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as UploadResult | { error?: string };

      if (!response.ok) {
        setResult(null);
        setError(payload.error || "Upload failed.");
        return;
      }

      setResult(payload as UploadResult);
    } catch {
      setResult(null);
      setError("Upload failed. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyShareUrl() {
    const share = result();

    if (!share) {
      return;
    }

    try {
      await navigator.clipboard.writeText(share.shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
      setError("Could not copy the share link from this browser.");
    }
  }

  return (
    <main class="grid gap-6">
      <Title>Share a file | OSDrive</Title>

      <section class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 grid grid-cols-[1.1fr_0.9fr] gap-6 max-lg:grid-cols-1">
        <div class="grid gap-4 content-start">
          <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Upload + share</div>
          <h1 class="m-0 max-w-[14ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.05em] max-lg:max-w-none">
            Send a file to R2 and publish a clean share page.
          </h1>
          <p class="m-0 max-w-[64ch] text-muted leading-relaxed">
            The upload stores the file body in Cloudflare R2, saves your chosen file name in
            `customMetadata`, and returns a share page with metadata, preview, and download.
          </p>
        </div>

        <form class="grid gap-4 p-5 rounded-[1.35rem] bg-panel-strong border border-white/[0.07] content-start" onSubmit={handleSubmit}>
          <label class="grid gap-2">
            <span class="text-sm text-muted">File</span>
            <input
              type="file"
              class="w-full px-4 py-3.5 rounded-2xl border border-border bg-white/[0.04] text-text"
              onChange={event => {
                const selected = event.currentTarget.files?.[0] || null;
                setFile(selected);
                if (selected && !customName().trim()) {
                  setCustomName(selected.name);
                }
              }}
            />
          </label>

          <label class="grid gap-2">
            <span class="text-sm text-muted">Display name</span>
            <input
              type="text"
              value={customName()}
              onInput={event => setCustomName(event.currentTarget.value)}
              placeholder="Quarterly index export"
              maxLength={180}
              class="w-full px-4 py-3.5 rounded-2xl border border-border bg-white/[0.04] text-text"
            />
          </label>

          <button
            type="submit"
            class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold disabled:cursor-wait disabled:opacity-70 disabled:transform-none"
            disabled={submitting()}
          >
            {submitting() ? "Uploading..." : "Upload and create link"}
          </button>

          {error() && <p class="m-0 text-sm text-danger">{error()}</p>}
        </form>
      </section>

      {result() && (
        <section class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 grid gap-4">
          <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Share created</div>
          <h2 class="my-2 mb-3 text-xl leading-tight">{result()!.fileName}</h2>
          <p class="inline-block max-w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] text-primary-strong break-words">
            {result()!.shareUrl}
          </p>
          <div class="flex flex-wrap gap-3.5">
            <button
              type="button"
              class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold"
              onClick={copyShareUrl}
            >
              {copied() ? "Copied" : "Copy link"}
            </button>
            <A
              href={`/s/${result()!.shareId}`}
              class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-border bg-white/[0.03] text-text cursor-pointer transition-all duration-150 hover:-translate-y-px"
            >
              Open shared page
            </A>
          </div>
        </section>
      )}
    </main>
  );
}
