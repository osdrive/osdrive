import { Title } from "@solidjs/meta";
import { A, createAsync, query, useParams, type RouteDefinition } from "@solidjs/router";
import { Match, Show, Switch, createMemo } from "solid-js";
import { getShareMetadata } from "~/lib/shares-server";
import { formatBytes, formatSharedDate, getPreviewKind } from "~/lib/shares";

const getShareQuery = query(async (shareId: string) => {
  "use server";

  return getShareMetadata(shareId);
}, "share");

export const route = {
  preload: ({ params }) => getShareQuery(params.shareId),
} satisfies RouteDefinition;

export default function SharedFilePage() {
  const params = useParams();
  const share = createAsync(() => getShareQuery(params.shareId));

  const previewUrl = createMemo(() => `/api/shares/${params.shareId}/preview`);
  const downloadUrl = createMemo(() => `/api/shares/${params.shareId}/download`);
  const previewKind = createMemo(() => {
    const data = share();
    return data ? getPreviewKind(data.contentType) : "none";
  });

  return (
    <main class="page">
      <Title>{share()?.fileName ? `${share()!.fileName} | OpenDrive` : "Shared file | OpenDrive"}</Title>

      <Switch>
        <Match when={share.loading}>
          <section class="panel panel--centered">
            <div class="eyebrow">Loading</div>
            <h1>Fetching file metadata...</h1>
          </section>
        </Match>

        <Match when={share.error}>
          <section class="empty-state">
            <div class="eyebrow">Unavailable</div>
            <h1>We could not load this share.</h1>
            <p>Try the link again or upload a new file if the original object was removed.</p>
            <A href="/share" class="button button--primary">
              Upload a file
            </A>
          </section>
        </Match>

        <Match when={share() === null}>
          <section class="empty-state">
            <div class="eyebrow">Missing share</div>
            <h1>This shared file does not exist.</h1>
            <p>The ID may be invalid, or the object is no longer available.</p>
            <div class="hero-actions">
              <A href="/" class="button button--ghost">
                Back home
              </A>
              <A href="/share" class="button button--primary">
                Upload a replacement
              </A>
            </div>
          </section>
        </Match>

        <Match when={share()}>
          {data => (
            <section class="viewer-layout">
              <article class="viewer-card">
                <div class="eyebrow">Shared file</div>
                <h1>{data().fileName}</h1>
                <div class="meta-grid">
                  <div>
                    <span class="meta-label">Type</span>
                    <strong>{data().contentType}</strong>
                  </div>
                  <div>
                    <span class="meta-label">Size</span>
                    <strong>{formatBytes(data().size)}</strong>
                  </div>
                  <div>
                    <span class="meta-label">Shared on</span>
                    <strong>{formatSharedDate(data().createdAt)}</strong>
                  </div>
                  <div>
                    <span class="meta-label">Share ID</span>
                    <strong>{data().shareId}</strong>
                  </div>
                </div>
                <div class="hero-actions">
                  <a target="_self" href={downloadUrl()} class="button button--primary">
                    Download file
                  </a>
                  <A href="/share" class="button button--ghost">
                    Upload another
                  </A>
                </div>
              </article>

              <article class="preview-card">
                <div class="eyebrow">Preview</div>
                <Show
                  when={data().previewable}
                  fallback={
                    <div class="empty-state empty-state--compact">
                      <h2>No inline preview for this file type.</h2>
                      <p>Download the file to inspect it locally.</p>
                    </div>
                  }
                >
                  <Switch>
                    <Match when={previewKind() === "image"}>
                      <img class="preview-image" src={previewUrl()} alt={data().fileName} />
                    </Match>
                    <Match when={previewKind() === "video"}>
                      <video class="preview-media" controls preload="metadata" src={previewUrl()} />
                    </Match>
                    <Match when={previewKind() === "audio"}>
                      <div class="audio-preview">
                        <audio controls preload="metadata" src={previewUrl()} />
                      </div>
                    </Match>
                    <Match when={previewKind() === "pdf"}>
                      <iframe class="preview-frame" src={previewUrl()} title={data().fileName} />
                    </Match>
                    <Match when={previewKind() === "text"}>
                      <iframe class="preview-frame preview-frame--text" src={previewUrl()} title={data().fileName} />
                    </Match>
                  </Switch>
                </Show>
              </article>
            </section>
          )}
        </Match>
      </Switch>
    </main>
  );
}
