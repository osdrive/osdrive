import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

export default function Home() {
  return (
    <main class="page page--landing">
      <Title>OpenDrive | Index and share files</Title>

      <section class="hero-card">
        <div class="eyebrow">File indexing for teams that move fast</div>
        <h1 class="hero-title">Upload once, share instantly, and keep every file addressable.</h1>
        <p class="hero-copy">
          OpenDrive gives your files a stable share ID, durable Cloudflare R2 storage, and a
          clean viewer experience with metadata, previews, and direct downloads.
        </p>
        <div class="hero-actions">
          <A href="/share" class="button button--primary">
            Upload a file
          </A>
          <a href="#workflow" class="button button--ghost">
            See the flow
          </a>
        </div>
        <div class="hero-grid">
          <article class="feature-card">
            <span class="feature-kicker">Addressable</span>
            <h2>Every upload gets a share link and a stable ID.</h2>
            <p>Keep references predictable for product demos, assets, logs, or release artifacts.</p>
          </article>
          <article class="feature-card">
            <span class="feature-kicker">Metadata-first</span>
            <h2>User-defined file names live in R2 custom metadata.</h2>
            <p>Shared pages show the name users chose, the file type, size, and when it was shared.</p>
          </article>
          <article class="feature-card">
            <span class="feature-kicker">Edge delivery</span>
            <h2>Preview and download responses are cacheable at the edge.</h2>
            <p>Images, PDFs, text, audio, and video can render inline while still supporting download.</p>
          </article>
        </div>
      </section>

      <section class="section-grid" id="workflow">
        <article class="section-card section-card--wide">
          <div class="eyebrow">Workflow</div>
          <h2>Built for a short path from upload to link.</h2>
          <ol class="step-list">
            <li>
              <strong>Pick a file.</strong> Upload binaries, docs, media, or text directly to R2.
            </li>
            <li>
              <strong>Name it for humans.</strong> The chosen file name is stored in
              `customMetadata.fileName`.
            </li>
            <li>
              <strong>Share the URL.</strong> The shared page exposes metadata, preview, and a direct
              download route.
            </li>
          </ol>
        </article>
        <article class="section-card stat-card">
          <div class="eyebrow">Storage layer</div>
          <div class="stat-value">Cloudflare R2</div>
          <p>Immutable object responses with cache-friendly preview and download endpoints.</p>
        </article>
      </section>
    </main>
  );
}
