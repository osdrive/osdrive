// Design v15: Alternating Rhythm — white hero → dark feature bento → white product →
// dark enterprise → white CTA. Strong sectional contrast, confident and structured.
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const drives = [
  { name: "Engineering Shared Drive", size: "2.4 TB", status: "Mounted", users: 14, col: "bg-sky-500" },
  { name: "Design Assets", size: "890 GB", status: "Synced", users: 6, col: "bg-violet-500" },
  { name: "Client Deliverables", size: "340 GB", status: "Mounted", users: 23, col: "bg-emerald-500" },
];

const bentoItems = [
  {
    wide: true,
    tag: "Native",
    title: "Your drives in Finder.",
    sub: "One click and your cloud storage mounts as a native volume. No extra apps. Works with Git, Spotlight, shell tools — everything.",
    dark: true,
  },
  {
    wide: false,
    tag: "Speed",
    title: "< 50ms always.",
    sub: "Live filesystem index. Every operation instant.",
    dark: false,
    accent: "text-sky-900 bg-sky-50 border-sky-200",
  },
  {
    wide: false,
    tag: "Sync",
    title: "Every device. Always current.",
    sub: "Block-level delta sync — only changed data moves.",
    dark: false,
    accent: "text-emerald-900 bg-emerald-50 border-emerald-200",
  },
  {
    wide: false,
    tag: "Share",
    title: "Link sharing with full control.",
    sub: "Permissions, expiry, passwords, and access logs.",
    dark: false,
    accent: "text-violet-900 bg-violet-50 border-violet-200",
  },
  {
    wide: false,
    tag: "Drives",
    title: "Create drives in seconds.",
    sub: "Provision from the dashboard with quotas and RBAC.",
    dark: false,
    accent: "text-amber-900 bg-amber-50 border-amber-200",
  },
];

export default function LandingV15() {
  return (
    <div class="min-h-screen font-sans bg-white text-zinc-900">
      {/* Nav */}
      <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
        <div class="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0">
              <span class="text-white font-bold text-xs">OS</span>
            </div>
            <span class="font-bold tracking-tight text-lg">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm text-zinc-500">
            <a href="#features" class="hover:text-zinc-900 transition-colors">Features</a>
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
              <Button size="sm" class="bg-zinc-900 text-white hover:bg-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* ① White Hero */}
      <section class="py-24 px-6 border-b border-zinc-100">
        <div class="mx-auto max-w-6xl grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge variant="outline" class="mb-8 border-zinc-300 text-zinc-500 text-xs px-3 py-1">
              Enterprise-grade cloud storage · Free to start
            </Badge>
            <h1 class="text-6xl md:text-7xl font-bold tracking-tight leading-none mb-6 text-zinc-900">
              The cloud drive<br />
              <span class="text-zinc-400">that fits your<br />workflow.</span>
            </h1>
            <p class="text-xl text-zinc-500 leading-relaxed mb-10">
              Mount, sync, and share your cloud storage natively — with a live filesystem index that makes everything instant.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 mb-6">
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
            <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
              {["macOS · Windows · Linux", "Free tier available", "99.99% SLA"].map((t) => (
                <span class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>
          {/* Hero stats panel */}
          <div class="grid grid-cols-2 gap-4">
            {[["10B+", "Files indexed", "bg-zinc-900 text-white"], ["500K+", "Active mounts", "bg-zinc-100 text-zinc-900"], ["2,000+", "Enterprises", "bg-zinc-100 text-zinc-900"], ["99.99%", "Uptime SLA", "bg-zinc-900 text-white"]].map(([v, l, cls]) => (
              <div class={`rounded-2xl p-8 ${cls}`}>
                <div class="text-3xl font-bold mb-1">{v}</div>
                <div class={`text-xs ${cls.includes("white") ? "text-zinc-400" : "text-zinc-500"}`}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ② Dark Feature Bento */}
      <section id="features" class="py-16 px-6 bg-zinc-950">
        <div class="mx-auto max-w-6xl">
          <p class="text-xs uppercase tracking-widest text-zinc-600 mb-8">Features</p>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
            {/* Wide dark card */}
            <div class="lg:col-span-2 rounded-2xl bg-white/[0.04] border border-white/8 p-6 flex flex-col justify-between">
              <div class="text-xs uppercase tracking-widest text-zinc-600 mb-2">Native</div>
              <div>
                <h3 class="text-xl font-bold text-white mb-2">Your drives in Finder. Exactly as expected.</h3>
                <p class="text-zinc-500 text-sm">Mounts via custom VFS. Works with every tool that expects a local disk.</p>
              </div>
            </div>
            {/* Normal cards */}
            <div class="rounded-2xl bg-sky-950/60 border border-sky-900/40 p-6 flex flex-col justify-between">
              <div class="text-xs uppercase tracking-widest text-sky-700 mb-2">Speed</div>
              <div>
                <div class="text-3xl font-bold text-sky-300 mb-1">&lt;50ms</div>
                <p class="text-sky-800 text-xs">Live index. Every operation, instant.</p>
              </div>
            </div>
            <div class="rounded-2xl bg-emerald-950/60 border border-emerald-900/40 p-6 flex flex-col justify-between">
              <div class="text-xs uppercase tracking-widest text-emerald-700 mb-2">Sync</div>
              <div>
                <h3 class="text-base font-bold text-emerald-300 mb-1">Every device. Always current.</h3>
                <p class="text-emerald-800 text-xs">Block-level delta sync, conflict-free.</p>
              </div>
            </div>
            <div class="rounded-2xl bg-violet-950/60 border border-violet-900/40 p-6 flex flex-col justify-between">
              <div class="text-xs uppercase tracking-widest text-violet-700 mb-2">Share</div>
              <div>
                <h3 class="text-base font-bold text-violet-300 mb-1">Links with full control.</h3>
                <p class="text-violet-800 text-xs">Permissions, expiry, passwords, logs.</p>
              </div>
            </div>
            <div class="rounded-2xl bg-amber-950/60 border border-amber-900/40 p-6 flex flex-col justify-between">
              <div class="text-xs uppercase tracking-widest text-amber-700 mb-2">Drives</div>
              <div>
                <h3 class="text-base font-bold text-amber-300 mb-1">Create in seconds.</h3>
                <p class="text-amber-800 text-xs">Quotas and RBAC from the dashboard.</p>
              </div>
            </div>
            {/* Wide — coming soon */}
            <div class="lg:col-span-2 rounded-2xl border border-dashed border-white/8 p-6 flex flex-col justify-between">
              <div class="text-xs uppercase tracking-widest text-zinc-700 mb-2">Coming soon</div>
              <div>
                <h3 class="text-lg font-bold text-zinc-500">Browser-based File Explorer</h3>
                <p class="text-zinc-700 text-sm mt-1">Manage every drive from any browser, anywhere.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ③ White Dashboard Mockup */}
      <section class="py-20 px-6 border-b border-zinc-100">
        <div class="mx-auto max-w-5xl">
          <div class="text-center mb-10">
            <h2 class="text-3xl font-bold text-zinc-900 tracking-tight mb-3">One dashboard for everything</h2>
            <p class="text-zinc-500">Create drives, manage access, and see activity — all in one place.</p>
          </div>
          <div class="rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden">
            <div class="flex items-center gap-2 px-5 py-3.5 bg-zinc-50 border-b border-zinc-100">
              <div class="h-3 w-3 rounded-full bg-zinc-300" />
              <div class="h-3 w-3 rounded-full bg-zinc-300" />
              <div class="h-3 w-3 rounded-full bg-zinc-300" />
              <div class="mx-auto w-44 h-5 rounded bg-zinc-100 flex items-center justify-center">
                <span class="text-[10px] font-mono text-zinc-400">app.osdrive.io</span>
              </div>
            </div>
            <div class="flex">
              <div class="w-44 border-r border-zinc-100 p-4 space-y-1 shrink-0 bg-zinc-50">
                {[["All Drives", true], ["Shared", false], ["Recent", false], ["Settings", false]].map(([label, active]) => (
                  <div class={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${active ? "bg-zinc-900 text-white" : "text-zinc-500"}`}>
                    {label as string}
                  </div>
                ))}
              </div>
              <div class="flex-1 p-6">
                <div class="flex items-center justify-between mb-5">
                  <h3 class="text-sm font-semibold text-zinc-800">Your drives</h3>
                  <button class="text-xs text-zinc-400 border border-zinc-200 rounded-lg px-3 py-1.5">+ New drive</button>
                </div>
                <div class="space-y-2.5">
                  {drives.map((d) => (
                    <div class="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                      <div class={`h-2 w-2 rounded-full ${d.col} shrink-0`} />
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-zinc-800 truncate">{d.name}</div>
                        <div class="text-xs text-zinc-400">{d.size} · {d.users} users</div>
                      </div>
                      <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{d.status}</span>
                    </div>
                  ))}
                </div>
                <div class="mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-400">
                  3 drives · 3.6 TB total · <a href="/dashboard" class="text-zinc-600 hover:underline">View all →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ④ Dark Enterprise */}
      <section id="enterprise" class="py-20 px-6 bg-zinc-900">
        <div class="mx-auto max-w-5xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Badge class="mb-6 text-xs bg-zinc-700 text-zinc-300 border-0">Enterprise plan</Badge>
            <h2 class="text-4xl font-bold text-white tracking-tight mb-5 leading-tight">
              Built for one person.<br />Ready for your whole org.
            </h2>
            <p class="text-zinc-400 text-sm leading-relaxed mb-8">
              From a solo developer to a 10,000-seat enterprise — OSDrive scales without changing the experience. Add SSO, audit logs, and compliance controls when you need them.
            </p>
            <div class="flex gap-3">
              <a href="/contact">
                <Button size="lg" class="px-6 bg-white text-zinc-900 hover:bg-zinc-100">Contact sales</Button>
              </a>
              <a href="/download">
                <Button variant="outline" size="lg" class="px-6 border-zinc-700 text-zinc-300 hover:bg-zinc-800">Download free</Button>
              </a>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            {[["SSO & SCIM", "SAML, OIDC, auto-provisioning"], ["RBAC", "Per-drive access control"], ["Audit logs", "Immutable access history"], ["Data residency", "EU, US, APAC, custom"], ["On-premise", "Deploy your own infra"], ["SLA", "99.99% + 24/7 support"]].map(([t, d]) => (
              <div class="rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-4">
                <div class="text-sm font-semibold text-zinc-300 mb-0.5">{t}</div>
                <div class="text-xs text-zinc-600">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ White CTA */}
      <section class="py-28 px-6">
        <div class="mx-auto max-w-lg text-center">
          <h2 class="text-5xl font-bold text-zinc-900 tracking-tight mb-5">
            Download.<br />
            <span class="text-zinc-400">Mount in minutes.</span>
          </h2>
          <p class="text-zinc-500 mb-10 text-lg">Free tier, no credit card. Mount your first cloud drive in Finder in under two minutes.</p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/download">
              <Button size="lg" class="px-10 h-12 bg-zinc-900 text-white hover:bg-zinc-800 text-base">Download free</Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="px-10 h-12 border-zinc-300 text-zinc-700 text-base">Open dashboard</Button>
            </a>
          </div>
        </div>
      </section>

      <footer class="border-t border-zinc-200 py-8 px-6 bg-zinc-50">
        <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-400">
          <span class="font-bold text-zinc-900">OSDrive © 2025</span>
          <div class="flex flex-wrap justify-center gap-6">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "/security"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([l, h]) => (
              <a href={h} class="hover:text-zinc-900 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
