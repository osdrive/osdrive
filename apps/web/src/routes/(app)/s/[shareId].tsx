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
    <main class="grid gap-6">
      <Title>{share()?.fileName ? `${share()!.fileName} | OSDrive` : "Shared file | OSDrive"}</Title>

      <Switch>
        <Match when={share.loading}>
          <section class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 text-center grid place-items-center">
            <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Loading</div>
            <h1 class="m-0 max-w-[14ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.05em]">
              Fetching file metadata...
            </h1>
          </section>
        </Match>

        <Match when={share.error}>
          <section class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 text-center grid place-items-center gap-4">
            <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Unavailable</div>
            <h1 class="m-0 max-w-[14ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.05em]">
              We could not load this share.
            </h1>
            <p class="m-0 max-w-[64ch] text-muted leading-relaxed">
              Try the link again or upload a new file if the original object was removed.
            </p>
            <A
              href="/share"
              class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold"
            >
              Upload a file
            </A>
          </section>
        </Match>

        <Match when={share() === null}>
          <section class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 text-center grid place-items-center gap-4">
            <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Missing share</div>
            <h1 class="m-0 max-w-[14ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.05em]">
              This shared file does not exist.
            </h1>
            <p class="m-0 max-w-[64ch] text-muted leading-relaxed">
              The ID may be invalid, or the object is no longer available.
            </p>
            <div class="flex flex-wrap gap-3.5">
              <A
                href="/"
                class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-border bg-white/[0.03] text-text cursor-pointer transition-all duration-150 hover:-translate-y-px"
              >
                Back home
              </A>
              <A
                href="/share"
                class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold"
              >
                Upload a replacement
              </A>
            </div>
          </section>
        </Match>

        <Match when={share()}>
          {data => (
            <section class="grid grid-cols-[minmax(19rem,27rem)_minmax(0,1fr)] gap-6 max-lg:grid-cols-1">
              <article class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 grid gap-4 content-start">
                <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Shared file</div>
                <h1 class="m-0 max-w-[14ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.05em] max-lg:max-w-none">
                  {data().fileName}
                </h1>
                <div class="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                  <div>
                    <span class="block mb-1.5 text-sm text-muted">Type</span>
                    <strong class="block break-words">{data().contentType}</strong>
                  </div>
                  <div>
                    <span class="block mb-1.5 text-sm text-muted">Size</span>
                    <strong class="block break-words">{formatBytes(data().size)}</strong>
                  </div>
                  <div>
                    <span class="block mb-1.5 text-sm text-muted">Shared on</span>
                    <strong class="block break-words">{formatSharedDate(data().createdAt)}</strong>
                  </div>
                  <div>
                    <span class="block mb-1.5 text-sm text-muted">Share ID</span>
                    <strong class="block break-words">{data().shareId}</strong>
                  </div>
                </div>
                <div class="flex flex-wrap gap-3.5">
                  <a
                    target="_self"
                    href={downloadUrl()}
                    class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold"
                  >
                    Download file
                  </a>
                  <A
                    href="/share"
                    class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-border bg-white/[0.03] text-text cursor-pointer transition-all duration-150 hover:-translate-y-px"
                  >
                    Upload another
                  </A>
                </div>
              </article>

              <article class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 grid gap-4 min-h-[38rem]">
                <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Preview</div>
                <Show
                  when={data().previewable}
                  fallback={
                    <div class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 text-center grid place-items-center min-h-72 content-center">
                      <h2 class="my-2 mb-3 text-xl leading-tight">No inline preview for this file type.</h2>
                      <p class="m-0 text-muted">Download the file to inspect it locally.</p>
                    </div>
                  }
                >
                  <Switch>
                    <Match when={previewKind() === "image"}>
                      <img
                        class="w-full min-h-[32rem] border-0 rounded-[1.2rem] bg-black/30 object-contain p-4 max-sm:min-h-[22rem]"
                        src={previewUrl()}
                        alt={data().fileName}
                      />
                    </Match>
                    <Match when={previewKind() === "video"}>
                      <video
                        class="w-full min-h-[32rem] border-0 rounded-[1.2rem] bg-black/30 max-sm:min-h-[22rem]"
                        controls
                        preload="metadata"
                        src={previewUrl()}
                      />
                    </Match>
                    <Match when={previewKind() === "audio"}>
                      <div class="grid place-items-center min-h-72 rounded-[1.2rem] bg-white/[0.03]">
                        <audio class="w-[min(38rem,calc(100%-2rem))]" controls preload="metadata" src={previewUrl()} />
                      </div>
                    </Match>
                    <Match when={previewKind() === "pdf"}>
                      <iframe
                        class="w-full min-h-[32rem] border-0 rounded-[1.2rem] bg-black/30 max-sm:min-h-[22rem]"
                        src={previewUrl()}
                        title={data().fileName}
                      />
                    </Match>
                    <Match when={previewKind() === "text"}>
                      <iframe
                        class="w-full min-h-[32rem] border-0 rounded-[1.2rem] bg-white max-sm:min-h-[22rem]"
                        src={previewUrl()}
                        title={data().fileName}
                      />
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
