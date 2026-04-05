import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { HttpStatusCode } from "@solidjs/start";

export default function NotFound() {
  return (
    <main class="grid min-h-[calc(100vh-8rem)] place-items-center">
      <Title>Not Found | OpenDrive</Title>
      <HttpStatusCode code={404} />
      <section class="bg-panel border border-border rounded-[1.75rem] backdrop-blur-[18px] shadow-[0_28px_60px_rgba(0,0,0,0.28)] p-6 text-center grid place-items-center gap-4">
        <div class="text-primary-strong uppercase tracking-[0.18em] text-[0.72rem] font-bold">404</div>
        <h1 class="m-0 max-w-[14ch] text-[clamp(2.8rem,7vw,5.6rem)] leading-[0.96] tracking-[-0.05em]">
          That file route is missing.
        </h1>
        <p class="m-0 max-w-[64ch] text-muted leading-relaxed">
          The page you requested is gone, invalid, or the share link was copied incorrectly.
        </p>
        <div class="flex flex-wrap gap-3.5">
          <A
            href="/"
            class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-transparent cursor-pointer transition-all duration-150 hover:-translate-y-px bg-[linear-gradient(135deg,var(--color-primary),#83f0da)] text-[#08111f] font-bold"
          >
            Back to home
          </A>
          <A
            href="/share"
            class="inline-flex items-center justify-center min-h-[2.9rem] px-4.5 py-3 rounded-full border border-border bg-white/[0.03] text-text cursor-pointer transition-all duration-150 hover:-translate-y-px"
          >
            Upload a file
          </A>
        </div>
      </section>
    </main>
  );
}
