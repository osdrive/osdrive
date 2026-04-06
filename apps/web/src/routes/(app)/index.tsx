import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

export default function Home() {
  return (
    <main class="grid gap-8">
      <Title>OSDrive | Index and share files</Title>

      <section class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 grid gap-6 min-h-[32rem] content-start">
        <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">
          File indexing for teams that move fast
        </div>
        <h1 class="m-0 max-w-[14ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.05em]">
          Upload once, share instantly, and keep every file addressable.
        </h1>
        <p class="m-0 max-w-[64ch] text-muted leading-relaxed">
          OSDrive gives your files a stable share ID, durable Cloudflare R2 storage, and a
          clean viewer experience with metadata, previews, and direct downloads.
        </p>
        <div class="flex flex-wrap gap-3.5">
          <A
            href="/share"
            class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold"
          >
            Upload a file
          </A>
          <A
            href="/dashboard"
            class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-border bg-white/[0.03] text-text cursor-pointer transition-all duration-150 hover:-translate-y-px"
          >
            Open dashboard
          </A>
          <a
            href="#workflow"
            class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-border bg-white/[0.03] text-text cursor-pointer transition-all duration-150 hover:-translate-y-px"
          >
            See the flow
          </a>
        </div>
        <div class="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
          <article class="p-5 rounded-[1.4rem] bg-white/[0.04] border border-white/[0.08]">
            <span class="block mb-1.5 text-sm text-muted">Addressable</span>
            <h2 class="my-2 mb-3 text-xl leading-tight">Every upload gets a share link and a stable ID.</h2>
            <p class="m-0 text-muted">Keep references predictable for product demos, assets, logs, or release artifacts.</p>
          </article>
          <article class="p-5 rounded-[1.4rem] bg-white/[0.04] border border-white/[0.08]">
            <span class="block mb-1.5 text-sm text-muted">Metadata-first</span>
            <h2 class="my-2 mb-3 text-xl leading-tight">User-defined file names live in R2 custom metadata.</h2>
            <p class="m-0 text-muted">Shared pages show the name users chose, the file type, size, and when it was shared.</p>
          </article>
          <article class="p-5 rounded-[1.4rem] bg-white/[0.04] border border-white/[0.08]">
            <span class="block mb-1.5 text-sm text-muted">Edge delivery</span>
            <h2 class="my-2 mb-3 text-xl leading-tight">Preview and download responses are cacheable at the edge.</h2>
            <p class="m-0 text-muted">Images, PDFs, text, audio, and video can render inline while still supporting download.</p>
          </article>
        </div>
      </section>

      <section class="grid grid-cols-[1.8fr_1fr] gap-4 max-lg:grid-cols-1" id="workflow">
        <article class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-5 min-h-72">
          <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Workflow</div>
          <h2 class="my-2 mb-3 text-xl leading-tight">Built for a short path from upload to link.</h2>
          <ol class="mt-4 pl-5 text-muted leading-relaxed">
            <li>
              <strong class="text-text">Pick a file.</strong> Upload binaries, docs, media, or text directly to R2.
            </li>
            <li>
              <strong class="text-text">Name it for humans.</strong> The chosen file name is stored in
              `customMetadata.fileName`.
            </li>
            <li>
              <strong class="text-text">Share the URL.</strong> The shared page exposes metadata, preview, and a direct
              download route.
            </li>
          </ol>
        </article>
        <article class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-5">
          <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">Storage layer</div>
          <div class="my-3 text-[clamp(1.8rem,4vw,3rem)] font-bold">Cloudflare R2</div>
          <p class="m-0 text-muted">Immutable object responses with cache-friendly preview and download endpoints.</p>
        </article>
      </section>
    </main>
  );
}
