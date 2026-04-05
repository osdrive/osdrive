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
    <main class="page">
      <Title>Share a file | OpenDrive</Title>

      <section class="panel panel--upload">
        <div class="panel-copy">
          <div class="eyebrow">Upload + share</div>
          <h1>Send a file to R2 and publish a clean share page.</h1>
          <p>
            The upload stores the file body in Cloudflare R2, saves your chosen file name in
            `customMetadata`, and returns a share page with metadata, preview, and download.
          </p>
        </div>

        <form class="upload-form" onSubmit={handleSubmit}>
          <label class="field">
            <span>File</span>
            <input
              type="file"
              onChange={event => {
                const selected = event.currentTarget.files?.[0] || null;
                setFile(selected);
                if (selected && !customName().trim()) {
                  setCustomName(selected.name);
                }
              }}
            />
          </label>

          <label class="field">
            <span>Display name</span>
            <input
              type="text"
              value={customName()}
              onInput={event => setCustomName(event.currentTarget.value)}
              placeholder="Quarterly index export"
              maxLength={180}
            />
          </label>

          <button type="submit" class="button button--primary" disabled={submitting()}>
            {submitting() ? "Uploading..." : "Upload and create link"}
          </button>

          {error() && <p class="message message--error">{error()}</p>}
        </form>
      </section>

      {result() && (
        <section class="panel panel--result">
          <div class="eyebrow">Share created</div>
          <h2>{result()!.fileName}</h2>
          <p class="share-link">{result()!.shareUrl}</p>
          <div class="hero-actions">
            <button type="button" class="button button--primary" onClick={copyShareUrl}>
              {copied() ? "Copied" : "Copy link"}
            </button>
            <A href={`/s/${result()!.shareId}`} class="button button--ghost">
              Open shared page
            </A>
          </div>
        </section>
      )}
    </main>
  );
}
