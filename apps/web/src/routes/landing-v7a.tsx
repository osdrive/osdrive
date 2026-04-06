// v7a: Refined Bento — left-aligned hero with stat tiles, then a clean 2-tone bento
// (zinc-950 dark + white light, single blue accent). No chaotic multi-colour cards.
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const drives = [
  { name: "Engineering Drive", size: "2.4 TB", users: 14, status: "Mounted", col: "bg-sky-500" },
  { name: "Design Assets", size: "890 GB", users: 6, status: "Synced", col: "bg-violet-500" },
  { name: "Client Work", size: "340 GB", users: 23, status: "Mounted", col: "bg-emerald-500" },
];

export default function LandingV7a() {
  return (
    <div class="min-h-screen bg-white text-zinc-900 font-sans">
      {/* Nav */}
      <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
        <div class="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0">
              <span class="text-white font-bold text-xs">OS</span>
            </div>
            <span class="font-bold text-lg tracking-tight">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-7 text-sm text-zinc-400">
            <a href="#features" class="hover:text-zinc-900 transition-colors">Features</a>
            <a href="#enterprise" class="hover:text-zinc-900 transition-colors">Enterprise</a>
            <a href="/pricing" class="hover:text-zinc-900 transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-zinc-900 transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm text-zinc-400 hover:text-zinc-900 transition-colors">Account</a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="border-zinc-200 text-zinc-600">Dashboard</Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-zinc-900 text-white hover:bg-zinc-800">Download</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero — left headline, right stat tiles */}
      <section class="pt-16 pb-10 px-6">
        <div class="mx-auto max-w-7xl grid lg:grid-cols-[1fr_360px] gap-12 items-center py-16">
          <div>
            <Badge variant="outline" class="mb-7 border-zinc-200 text-zinc-400 text-xs">
              Cloud storage for individuals and enterprise
            </Badge>
            <h1 class="text-6xl md:text-7xl font-black tracking-tighter text-zinc-900 leading-none mb-6">
              Mount. Sync.<br />
              <span class="text-zinc-300">Share.</span>
            </h1>
            <p class="text-lg text-zinc-500 max-w-md leading-relaxed mb-8">
              Cloud drives mounted natively in Finder — indexed for instant access and synced to every device you own.
            </p>
            <div class="flex flex-wrap gap-3">
              <a href="/download">
                <Button size="lg" class="px-8 h-11 bg-zinc-900 text-white hover:bg-zinc-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download free
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="px-8 h-11 border-zinc-200 text-zinc-600">Open dashboard →</Button>
              </a>
            </div>
            <p class="mt-4 text-xs text-zinc-300">macOS · Windows · Linux · No credit card required</p>
          </div>

          {/* Stat tiles — 2×2 */}
          <div class="grid grid-cols-2 gap-3">
            {[
              ["10B+", "Files indexed", "bg-zinc-900 text-white"],
              ["<50ms", "Index latency", "bg-blue-600 text-white"],
              ["2,000+", "Enterprises", "bg-zinc-100 text-zinc-900"],
              ["99.99%", "Uptime SLA", "bg-zinc-100 text-zinc-900"],
            ].map(([v, l, cls]) => (
              <div class={`rounded-2xl p-6 flex flex-col justify-between min-h-[120px] ${cls}`}>
                <div class="text-3xl font-black tracking-tight">{v}</div>
                <div class={`text-xs mt-2 ${cls.includes("zinc-9") ? "text-zinc-500" : cls.includes("blue") ? "text-blue-200" : "text-zinc-400"}`}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento — 2-tone: zinc-950 dark + white light, one blue accent */}
      <section id="features" class="px-6 pb-8">
        <div class="mx-auto max-w-7xl">
          {/* Row 1: two equal cards */}
          <div class="grid md:grid-cols-2 gap-4 mb-4">
            {/* Mounting — dark, wide */}
            <div class="rounded-2xl bg-zinc-900 text-white p-8 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
              <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 24px 24px;" />
              <div class="relative">
                <div class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Native Mounting</div>
                <h3 class="text-2xl font-bold leading-tight">Appears in Finder.<br />Feels completely local.</h3>
                <p class="text-zinc-400 text-sm mt-3 leading-relaxed max-w-xs">A custom VFS layer — no FUSE, no extra apps. Every tool that expects a local disk works as-is.</p>
              </div>
              <div class="relative flex gap-2">
                {["SMB 3.1.1", "NFS v4", "VFS"].map((t) => (
                  <span class="text-xs px-2.5 py-1 rounded-full bg-white/8 text-zinc-400 border border-white/10">{t}</span>
                ))}
              </div>
            </div>

            {/* Live index — blue accent */}
            <div class="rounded-2xl bg-blue-600 text-white p-8 min-h-[220px] flex flex-col justify-between">
              <div>
                <div class="text-[10px] font-semibold uppercase tracking-widest text-blue-300 mb-3">Live Index</div>
                <h3 class="text-2xl font-bold leading-tight">Every operation<br />under 50ms.</h3>
                <p class="text-blue-200 text-sm mt-3 leading-relaxed">A continuously updated in-memory + on-disk filesystem index. No cold storage round-trips — ever.</p>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-5xl font-black">&lt;50ms</span>
                <span class="text-blue-300 text-sm">index latency</span>
              </div>
            </div>
          </div>

          {/* Row 2: three equal cards */}
          <div class="grid md:grid-cols-3 gap-4 mb-4">
            <div class="rounded-2xl border border-zinc-100 bg-white p-7 min-h-[180px] flex flex-col justify-between">
              <div>
                <div class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Sync</div>
                <h3 class="text-lg font-bold text-zinc-900 leading-tight">Every device,<br />always current.</h3>
              </div>
              <p class="text-zinc-400 text-sm leading-relaxed">Block-level delta sync. Changes propagate the instant they happen.</p>
            </div>
            <div class="rounded-2xl border border-zinc-100 bg-white p-7 min-h-[180px] flex flex-col justify-between">
              <div>
                <div class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Sharing</div>
                <h3 class="text-lg font-bold text-zinc-900 leading-tight">Links with<br />full control.</h3>
              </div>
              <p class="text-zinc-400 text-sm leading-relaxed">Per-user permissions, expiry dates, password protection, and access logs.</p>
            </div>
            <div class="rounded-2xl border border-zinc-100 bg-white p-7 min-h-[180px] flex flex-col justify-between">
              <div>
                <div class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">Cloud Drives</div>
                <h3 class="text-lg font-bold text-zinc-900 leading-tight">Create a drive<br />in seconds.</h3>
              </div>
              <p class="text-zinc-400 text-sm leading-relaxed">Provision, resize, and configure drives from the dashboard with built-in RBAC.</p>
            </div>
          </div>

          {/* Row 3: dashboard mockup (wide) + two small cards */}
          <div class="grid md:grid-cols-3 gap-4">
            {/* Dashboard — spans 2 cols */}
            <div class="md:col-span-2 rounded-2xl border border-zinc-100 bg-white p-6 min-h-[200px]">
              <div class="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-4">Dashboard</div>
              <div class="space-y-2">
                {drives.map((d) => (
                  <div class="flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-100 px-3.5 py-2.5">
                    <div class={`h-2 w-2 rounded-full ${d.col} shrink-0`} />
                    <span class="text-sm font-medium text-zinc-800 flex-1 truncate">{d.name}</span>
                    <span class="text-zinc-400 text-xs">{d.size}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{d.status}</span>
                  </div>
                ))}
              </div>
              <a href="/dashboard" class="mt-4 inline-block text-xs text-blue-600 hover:underline">Open dashboard →</a>
            </div>

            {/* Enterprise teaser */}
            <div class="rounded-2xl bg-zinc-900 text-white p-7 min-h-[200px] flex flex-col justify-between">
              <div>
                <div class="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Enterprise</div>
                <h3 class="text-base font-bold leading-snug">SSO · SCIM · Audit logs · SLA · On-premise</h3>
                <p class="text-zinc-400 text-xs mt-3 leading-relaxed">Everything your security and IT teams require, without changing how your people work.</p>
              </div>
              <a href="/contact" class="text-xs text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1">
                Contact sales
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise section */}
      <section id="enterprise" class="py-20 px-6 mt-8 bg-zinc-900">
        <div class="mx-auto max-w-7xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-4xl font-black text-white tracking-tight mb-5 leading-tight">
              Personal simplicity.<br />Enterprise security.
            </h2>
            <p class="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm">
              OSDrive works beautifully for a single developer and scales to 10,000 seats without changing your workflow — add SSO, audit logs, and data residency when you need them.
            </p>
            <div class="space-y-2.5 mb-8">
              {["SSO (SAML, OIDC) & SCIM provisioning", "Role-based access control", "Audit logs & compliance exports", "Custom data residency & on-premise", "Dedicated SLA with 24/7 support"].map((item) => (
                <div class="flex items-center gap-2.5 text-sm text-zinc-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  {item}
                </div>
              ))}
            </div>
            <div class="flex gap-3">
              <a href="/contact"><Button size="default" class="bg-white text-zinc-900 hover:bg-zinc-100 px-6">Contact sales</Button></a>
              <a href="/download"><Button variant="outline" size="default" class="border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-6">Download free</Button></a>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            {[["10B+", "Files indexed"], ["2,000+", "Enterprise teams"], ["99.99%", "Uptime SLA"], ["AES-256", "Encryption at rest"]].map(([v, l]) => (
              <div class="rounded-2xl border border-zinc-700/50 bg-zinc-800 p-7">
                <div class="text-3xl font-black text-white mb-1">{v}</div>
                <div class="text-xs text-zinc-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-24 px-6">
        <div class="mx-auto max-w-lg text-center">
          <h2 class="text-4xl font-black text-zinc-900 tracking-tight mb-4">Start in minutes.</h2>
          <p class="text-zinc-400 mb-8">Download OSDrive, mount a drive, and it just works — in Finder, the shell, everywhere.</p>
          <div class="flex justify-center gap-3">
            <a href="/download"><Button size="lg" class="px-8 bg-zinc-900 text-white hover:bg-zinc-800">Download free</Button></a>
            <a href="/dashboard"><Button variant="outline" size="lg" class="px-8 border-zinc-200 text-zinc-600">Open dashboard</Button></a>
          </div>
        </div>
      </section>

      <footer class="border-t border-zinc-100 py-8 px-6">
        <div class="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
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
