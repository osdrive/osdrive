// Design v7: Bento Grid — asymmetric feature card layout on a light background
// Modern SaaS aesthetic, strong typography, colourful accent cards at different sizes.
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const drives = [
  { name: "Engineering Drive", size: "2.4 TB", users: 14, dot: "bg-blue-500" },
  { name: "Design Assets", size: "890 GB", users: 6, dot: "bg-violet-500" },
  { name: "Client Deliverables", size: "340 GB", users: 23, dot: "bg-emerald-500" },
];

export default function LandingV7() {
  return (
    <div class="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Nav */}
      <header class="sticky top-0 z-50 bg-zinc-50/95 backdrop-blur-sm border-b border-zinc-200">
        <div class="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0">
              <span class="text-white font-bold text-xs">OS</span>
            </div>
            <span class="font-bold text-lg tracking-tight">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-7 text-sm text-zinc-500">
            <a href="#product" class="hover:text-zinc-900 transition-colors">Product</a>
            <a href="#enterprise" class="hover:text-zinc-900 transition-colors">Enterprise</a>
            <a href="/pricing" class="hover:text-zinc-900 transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-zinc-900 transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Account</a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="border-zinc-300 text-zinc-700">Dashboard</Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg">Download</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section class="py-20 px-6">
        <div class="mx-auto max-w-5xl text-center">
          <Badge variant="outline" class="mb-8 border-zinc-300 text-zinc-500 text-xs px-3 py-1">
            Cloud storage for individuals and enterprises
          </Badge>
          <h1 class="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 leading-none mb-6">
            Mount. Sync.<br />
            <span class="text-zinc-400">Share.</span>
          </h1>
          <p class="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your cloud drives, indexed and mounted natively in Finder — then synced across every device you own.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-3">
            <a href="/download">
              <Button size="lg" class="px-8 h-12 bg-zinc-900 text-white hover:bg-zinc-800 text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download free
              </Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="px-8 h-12 border-zinc-300 text-zinc-700 text-base">Open dashboard →</Button>
            </a>
          </div>
          <p class="mt-4 text-xs text-zinc-400">macOS · Windows · Linux · No credit card required</p>
        </div>
      </section>

      {/* Bento Grid */}
      <section id="product" class="py-8 px-6">
        <div class="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px]">

          {/* Wide card — Native Mounting (spans 2 cols) */}
          <div class="md:col-span-2 rounded-2xl bg-zinc-900 text-white p-8 flex flex-col justify-between overflow-hidden relative">
            <div class="absolute inset-0 opacity-10" style="background-image: linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px); background-size: 32px 32px;" />
            <div class="relative">
              <div class="text-xs uppercase tracking-widest text-zinc-500 mb-3">Native Mounting</div>
              <h3 class="text-2xl font-bold leading-tight">Appears in Finder.<br />Feels completely local.</h3>
            </div>
            <div class="relative flex gap-2 text-xs">
              <span class="px-2 py-1 rounded bg-white/10 text-zinc-300">SMB 3.1.1</span>
              <span class="px-2 py-1 rounded bg-white/10 text-zinc-300">NFS v4</span>
              <span class="px-2 py-1 rounded bg-white/10 text-zinc-300">Custom VFS</span>
            </div>
          </div>

          {/* Tall card — Live Index (spans 2 rows) */}
          <div class="md:row-span-2 rounded-2xl bg-blue-600 text-white p-8 flex flex-col justify-between">
            <div>
              <div class="text-xs uppercase tracking-widest text-blue-300 mb-3">Live Index</div>
              <h3 class="text-xl font-bold mb-3 leading-tight">Every operation in under 50ms</h3>
              <p class="text-blue-200 text-sm leading-relaxed">We maintain a continuously updated in-memory index of your filesystem. Searches, listings, and moves return instantly — no cold starts.</p>
            </div>
            <div class="rounded-xl bg-blue-500/50 p-4 text-center">
              <div class="text-4xl font-black mb-1">&lt;50ms</div>
              <div class="text-blue-300 text-xs">Index latency</div>
            </div>
          </div>

          {/* Small — Sync */}
          <div class="rounded-2xl border border-zinc-200 bg-white p-6 flex flex-col justify-between">
            <div>
              <div class="text-xs uppercase tracking-widest text-zinc-400 mb-3">Sync</div>
              <h3 class="font-bold text-zinc-900 leading-tight">Every device. Always current.</h3>
            </div>
            <p class="text-zinc-500 text-sm">Delta-sync propagates changes the moment they happen.</p>
          </div>

          {/* Small — Sharing */}
          <div class="rounded-2xl bg-emerald-600 text-white p-6 flex flex-col justify-between">
            <div>
              <div class="text-xs uppercase tracking-widest text-emerald-300 mb-3">Sharing</div>
              <h3 class="font-bold leading-tight">Links with permissions, expiry & passwords.</h3>
            </div>
            <div class="text-emerald-200 text-sm">Granular, auditable access for every share.</div>
          </div>

          {/* Dashboard mockup card — spans 2 cols */}
          <div class="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 overflow-hidden">
            <div class="text-xs uppercase tracking-widest text-zinc-400 mb-4">Dashboard</div>
            <div class="space-y-2">
              {drives.map((d) => (
                <div class="flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-sm">
                  <div class={`h-2 w-2 rounded-full ${d.dot} shrink-0`} />
                  <span class="font-medium text-zinc-800 flex-1 truncate">{d.name}</span>
                  <span class="text-zinc-400 text-xs">{d.size}</span>
                  <span class="text-zinc-400 text-xs">{d.users} users</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                </div>
              ))}
            </div>
            <a href="/dashboard" class="mt-4 inline-block text-xs text-blue-600 hover:underline">Open dashboard →</a>
          </div>

          {/* Small — Enterprise */}
          <div class="rounded-2xl bg-zinc-900 text-white p-6 flex flex-col justify-between">
            <div>
              <div class="text-xs uppercase tracking-widest text-zinc-500 mb-3">Enterprise</div>
              <h3 class="font-bold leading-tight text-sm">SSO · SCIM · Audit logs · SLA</h3>
            </div>
            <a href="/contact" class="text-xs text-zinc-400 hover:text-white transition-colors">Contact sales →</a>
          </div>

          {/* Small — File Explorer */}
          <div class="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 flex flex-col justify-between">
            <div>
              <Badge variant="secondary" class="mb-3 text-[10px]">Coming soon</Badge>
              <h3 class="font-bold text-zinc-700 leading-tight text-sm">Browser-based File Explorer</h3>
            </div>
            <p class="text-zinc-400 text-xs">Manage every drive from any browser, anywhere.</p>
          </div>
        </div>
      </section>

      {/* Stats + Enterprise */}
      <section id="enterprise" class="mt-8 py-20 px-6 bg-zinc-900">
        <div class="mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-3xl font-black text-white tracking-tight mb-5">
              Individual power.<br />Enterprise security.
            </h2>
            <p class="text-zinc-400 leading-relaxed mb-8 text-sm">
              OSDrive starts simple enough for a single developer and scales to a 10,000-seat organisation — same product, same dashboard, same native feel.
            </p>
            <div class="space-y-2 mb-8">
              {["SSO (SAML, OIDC) & SCIM", "Role-based access control", "Audit logs & compliance exports", "Custom data residency", "On-premise deployment", "Volume licensing"].map((item) => (
                <div class="flex items-center gap-2 text-sm text-zinc-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  {item}
                </div>
              ))}
            </div>
            <div class="flex gap-3">
              <a href="/contact"><Button size="default" class="bg-white text-zinc-900 hover:bg-zinc-100">Contact sales</Button></a>
              <a href="/download"><Button variant="outline" size="default" class="border-zinc-700 text-zinc-300 hover:bg-zinc-800">Download free</Button></a>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            {[["10B+", "Files indexed"], ["2,000+", "Enterprise teams"], ["99.99%", "Uptime SLA"], ["AES-256", "Encryption"]].map(([v, l]) => (
              <div class="rounded-xl border border-zinc-700 bg-zinc-800 p-6 text-center">
                <div class="text-3xl font-black text-white mb-1">{v}</div>
                <div class="text-xs text-zinc-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-24 px-6">
        <div class="mx-auto max-w-xl text-center">
          <h2 class="text-4xl font-black text-zinc-900 tracking-tight mb-4">Start in minutes.</h2>
          <p class="text-zinc-500 mb-8">Download OSDrive, mount a drive, and it just works — in Finder, in the shell, everywhere.</p>
          <div class="flex justify-center gap-3">
            <a href="/download"><Button size="lg" class="px-8 bg-zinc-900 text-white hover:bg-zinc-800">Download free</Button></a>
            <a href="/dashboard"><Button variant="outline" size="lg" class="px-8 border-zinc-300">Open dashboard</Button></a>
          </div>
        </div>
      </section>

      <footer class="border-t border-zinc-200 py-8 px-6 bg-white">
        <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <span class="font-bold text-zinc-900">OSDrive © 2025</span>
          <div class="flex flex-wrap justify-center gap-6">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([l, h]) => (
              <a href={h} class="hover:text-zinc-900 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
