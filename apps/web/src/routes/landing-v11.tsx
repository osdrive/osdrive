// Design v11: Bold Editorial — huge black typography on white, newspaper-grid sections,
// horizontal rules as dividers. High-contrast, confident, and brand-forward.
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export default function LandingV11() {
  return (
    <div class="min-h-screen bg-white text-black font-sans">
      {/* Nav */}
      <header class="sticky top-0 z-50 bg-white border-b border-black">
        <div class="mx-auto max-w-7xl px-6 flex h-14 items-center justify-between">
          <span class="font-black text-xl tracking-tighter">OSDRIVE</span>
          <nav class="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-zinc-500">
            <a href="#product" class="hover:text-black transition-colors">Product</a>
            <a href="#enterprise" class="hover:text-black transition-colors">Enterprise</a>
            <a href="/pricing" class="hover:text-black transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-black transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-4">
            <a href="/account" class="hidden sm:block text-xs uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">Account</a>
            <a href="/dashboard" class="hidden sm:block text-xs uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">Dashboard</a>
            <a href="/download">
              <Button size="sm" class="bg-black text-white hover:bg-zinc-800 rounded-none uppercase tracking-widest text-xs px-5">Download</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section class="px-6 pt-16 pb-12 border-b border-zinc-200">
        <div class="mx-auto max-w-7xl">
          <div class="grid lg:grid-cols-[1fr_320px] gap-12 items-end">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-8">Cloud storage & filesystem sync</p>
              <h1 class="text-[clamp(56px,10vw,120px)] font-black leading-none tracking-tighter text-black">
                Mount.<br />Sync.<br />Share.
              </h1>
            </div>
            <div class="lg:pb-4">
              <p class="text-base text-zinc-600 leading-relaxed mb-8">
                OSDrive mounts your cloud storage natively in Finder, syncs across every device automatically, and keeps a live filesystem index so everything stays instant.
              </p>
              <div class="flex flex-col gap-3">
                <a href="/download">
                  <Button size="lg" class="w-full bg-black text-white hover:bg-zinc-800 rounded-none uppercase tracking-widest text-sm h-12">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    Download Free
                  </Button>
                </a>
                <a href="/dashboard">
                  <Button variant="outline" size="lg" class="w-full border-black text-black hover:bg-zinc-100 rounded-none uppercase tracking-widest text-sm h-12">
                    Open Dashboard →
                  </Button>
                </a>
              </div>
              <p class="mt-3 text-xs text-zinc-400 text-center uppercase tracking-widest">macOS · Windows · Linux</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section class="py-8 px-6 border-b border-zinc-200">
        <div class="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-200">
          {[["10B+", "Files Indexed"], ["500K+", "Active Mounts"], ["2,000+", "Enterprises"], ["99.99%", "Uptime SLA"]].map(([v, l]) => (
            <div class="px-8 first:pl-0 last:pr-0 text-center md:text-left">
              <div class="text-3xl md:text-4xl font-black tracking-tighter text-black">{v}</div>
              <div class="text-xs uppercase tracking-widest text-zinc-400 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Product features — newspaper grid */}
      <section id="product" class="py-16 px-6 border-b border-zinc-200">
        <div class="mx-auto max-w-7xl">
          <div class="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
            {/* Left col */}
            <div class="md:pr-12 pb-12 md:pb-0 space-y-12">
              <div>
                <div class="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">01 — Native Mounting</div>
                <h3 class="text-3xl font-black tracking-tight mb-3">Appears in Finder.<br />Feels completely local.</h3>
                <p class="text-zinc-500 leading-relaxed">Your cloud drives mount as native volumes via a custom VFS layer — no FUSE, no third-party tools. Spotlight, Quick Look, Git, and every CLI tool work exactly as they would on a local disk.</p>
              </div>
              <Separator class="bg-zinc-200" />
              <div>
                <div class="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">02 — Live Index</div>
                <h3 class="text-3xl font-black tracking-tight mb-3">Every operation<br />under 50ms.</h3>
                <p class="text-zinc-500 leading-relaxed">We maintain a continuously updated in-memory + on-disk filesystem index. Searches, directory listings, and file moves are served from the index — not from cold cloud storage.</p>
              </div>
              <Separator class="bg-zinc-200" />
              <div>
                <div class="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">03 — Cross-Device Sync</div>
                <h3 class="text-3xl font-black tracking-tight mb-3">Edit on one.<br />It's on all.</h3>
                <p class="text-zinc-500 leading-relaxed">Delta sync propagates only changed blocks — not entire files. Changes appear on every device the moment they happen, with conflict-free resolution via CRDT-based metadata.</p>
              </div>
            </div>
            {/* Right col */}
            <div class="md:pl-12 pt-12 md:pt-0 space-y-12">
              <div>
                <div class="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">04 — Secure Sharing</div>
                <h3 class="text-3xl font-black tracking-tight mb-3">Share a link.<br />Control everything.</h3>
                <p class="text-zinc-500 leading-relaxed">Create shareable links with view/edit permissions, optional expiry, and password protection. Every access is logged for full visibility.</p>
              </div>
              <Separator class="bg-zinc-200" />
              <div>
                <div class="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">05 — Cloud Drives</div>
                <h3 class="text-3xl font-black tracking-tight mb-3">Create a drive<br />in seconds.</h3>
                <p class="text-zinc-500 leading-relaxed">Provision cloud drives from the dashboard with quotas, access policies, and user permissions set at creation. Scale from one personal drive to hundreds of team shares.</p>
              </div>
              <Separator class="bg-zinc-200" />
              <div>
                <div class="flex items-start gap-4">
                  <div class="flex-1">
                    <div class="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-3">06 — File Explorer</div>
                    <h3 class="text-3xl font-black tracking-tight mb-3">Browser UI<br /><span class="text-zinc-300">coming soon.</span></h3>
                    <p class="text-zinc-500 leading-relaxed">A full-featured file manager in your browser — manage, preview, and organise every drive from any device.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise — black section */}
      <section id="enterprise" class="py-20 px-6 bg-black text-white">
        <div class="mx-auto max-w-7xl grid md:grid-cols-[1fr_1fr] gap-16 items-start">
          <div>
            <p class="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-6">Enterprise</p>
            <h2 class="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-8">
              Built for one.<br />
              <span class="text-zinc-500">Ready for<br />ten thousand.</span>
            </h2>
            <p class="text-zinc-400 leading-relaxed mb-10 text-sm max-w-sm">
              OSDrive scales from a solo developer to a 10,000-seat enterprise without changing your workflow — full security and compliance controls when you need them.
            </p>
            <div class="flex gap-4">
              <a href="/contact">
                <Button size="lg" class="bg-white text-black hover:bg-zinc-100 rounded-none uppercase tracking-widest text-xs px-8 h-12">Contact Sales</Button>
              </a>
              <a href="/download">
                <Button variant="outline" size="lg" class="border-zinc-700 text-zinc-300 hover:bg-zinc-900 rounded-none uppercase tracking-widest text-xs px-8 h-12">Download Free</Button>
              </a>
            </div>
          </div>
          <div>
            <div class="grid grid-cols-2 gap-px bg-zinc-800">
              {[
                ["SSO & SCIM", "SAML 2.0, OIDC, SCIM user provisioning"],
                ["RBAC", "Per-drive role-based access control"],
                ["Audit Logs", "Immutable access history & exports"],
                ["Data Residency", "EU, US, APAC or custom regions"],
                ["On-Premise", "Deploy within your own infrastructure"],
                ["SLA", "99.99% uptime with 24/7 support"],
              ].map(([title, desc]) => (
                <div class="bg-black p-6">
                  <div class="text-xs font-black uppercase tracking-widest text-white mb-2">{title}</div>
                  <div class="text-xs text-zinc-500 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-20 px-6 border-b border-zinc-200">
        <div class="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <h2 class="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              Download.<br />
              <span class="text-zinc-400">Mount in minutes.</span>
            </h2>
          </div>
          <div class="flex flex-col gap-3 shrink-0">
            <a href="/download">
              <Button size="lg" class="bg-black text-white hover:bg-zinc-800 rounded-none uppercase tracking-widest px-10 h-12">Download Free</Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="border-black hover:bg-zinc-100 rounded-none uppercase tracking-widest px-10 h-12">Open Dashboard</Button>
            </a>
            <a href="/account" class="text-center text-xs uppercase tracking-widest text-zinc-400 hover:text-black transition-colors py-1">Account →</a>
          </div>
        </div>
      </section>

      <footer class="py-8 px-6">
        <div class="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <span class="font-black text-sm tracking-tight">OSDRIVE © 2025</span>
          <div class="flex flex-wrap justify-center gap-8 text-xs uppercase tracking-widest text-zinc-400">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([l, h]) => (
              <a href={h} class="hover:text-black transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
