// Design v6: Dark Split Hero + Dashboard Mockup
// Merges the dark premium feel of index.tsx with the concrete dashboard mockup from v2,
// keeping everything dark-themed — no jarring light panels.
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

const DlIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

const drives = [
  { name: "Engineering Shared Drive", size: "2.4 TB", status: "Mounted", users: 14, color: "bg-sky-500" },
  { name: "Design Assets", size: "890 GB", status: "Synced", users: 6, color: "bg-violet-500" },
  { name: "Client Deliverables", size: "340 GB", status: "Mounted", users: 23, color: "bg-emerald-500" },
  { name: "Backup Archive", size: "12.1 TB", status: "Synced", users: 2, color: "bg-amber-500" },
];

const features = [
  { title: "Native Mounting", desc: "Appears in Finder and Explorer like a local drive — no extra software." },
  { title: "Live Index", desc: "Filesystem indexed in real-time so every operation is near-instant." },
  { title: "Cross-Device Sync", desc: "Edits propagate to all your devices the moment they happen." },
  { title: "Secure Sharing", desc: "Per-user permissions, expiry dates, and password-protected links." },
  { title: "Cloud Drives", desc: "Provision and manage drives from the dashboard in seconds." },
  { title: "File Explorer UI", desc: "Full browser-based file manager coming soon — work from anywhere." },
];

export default function LandingV6() {
  return (
    <div class="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Nav */}
      <header class="fixed top-0 inset-x-0 z-50 border-b border-white/8 bg-zinc-950/85 backdrop-blur-xl">
        <div class="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0">
              <span class="text-zinc-950 font-bold text-xs tracking-tight">OS</span>
            </div>
            <span class="font-semibold text-lg tracking-tight">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm text-zinc-500">
            <a href="#features" class="hover:text-white transition-colors">Features</a>
            <a href="#enterprise" class="hover:text-white transition-colors">Enterprise</a>
            <a href="/pricing" class="hover:text-white transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-white transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm text-zinc-500 hover:text-white transition-colors">Account</a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                Dashboard
              </Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-white text-zinc-950 hover:bg-zinc-100">
                <DlIcon />
                <span class="ml-1.5">Download</span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Split Hero */}
      <section class="relative pt-16 min-h-screen flex items-center overflow-hidden">
        {/* Grid bg */}
        <div
          class="pointer-events-none absolute inset-0 opacity-20"
          style="background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 56px 56px;"
        />
        {/* Glow */}
        <div class="pointer-events-none absolute top-1/3 left-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />

        <div class="relative mx-auto max-w-7xl px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left: Headline */}
          <div>
            <Badge variant="outline" class="mb-8 border-white/20 text-zinc-400 text-xs tracking-wide px-3 py-1">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 shrink-0 inline-block" />
              Now with native VFS mounting
            </Badge>
            <h1 class="text-5xl md:text-7xl font-bold tracking-tight leading-none mb-6">
              <span class="text-white">The cloud drive</span>
              <br />
              <span class="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                that feels local.
              </span>
            </h1>
            <p class="text-lg text-zinc-400 leading-relaxed mb-10 max-w-md">
              OSDrive mounts your cloud storage natively in Finder and Explorer, keeps a live index for instant operations, and syncs across every device automatically.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 mb-8">
              <a href="/download">
                <Button size="lg" class="px-8 h-12 text-base bg-white text-zinc-950 hover:bg-zinc-100">
                  <DlIcon />
                  <span class="ml-2">Download Free</span>
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="px-8 h-12 text-base border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  Open Dashboard →
                </Button>
              </a>
            </div>
            <p class="text-xs text-zinc-600">macOS · Windows · Linux · No credit card required</p>
          </div>

          {/* Right: Dark Dashboard Mockup */}
          <div class="relative">
            <div class="absolute -inset-4 bg-white/[0.02] rounded-3xl blur-xl" />
            <div class="relative rounded-2xl border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl">
              {/* Window chrome */}
              <div class="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-zinc-900">
                <div class="h-3 w-3 rounded-full bg-zinc-700" />
                <div class="h-3 w-3 rounded-full bg-zinc-700" />
                <div class="h-3 w-3 rounded-full bg-zinc-700" />
                <div class="flex-1 mx-4">
                  <div class="mx-auto w-40 h-5 rounded bg-zinc-800 flex items-center justify-center">
                    <span class="text-[10px] text-zinc-500 font-mono">app.osdrive.io/drives</span>
                  </div>
                </div>
              </div>
              {/* Sidebar + content */}
              <div class="flex">
                <div class="w-40 border-r border-white/5 p-3 space-y-1 shrink-0">
                  {["All Drives", "Shared", "Recent", "Trash"].map((item, i) => (
                    <div class={`px-2 py-1.5 rounded text-xs ${i === 0 ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                      {item}
                    </div>
                  ))}
                </div>
                <div class="flex-1 p-4 space-y-2">
                  {drives.map((d) => (
                    <div class="flex items-center gap-3 rounded-lg border border-white/5 bg-zinc-800/60 px-3 py-2.5">
                      <div class={`h-2 w-2 rounded-full ${d.color} shrink-0`} />
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-medium text-zinc-200 truncate">{d.name}</div>
                        <div class="text-[10px] text-zinc-500">{d.size} · {d.users} users</div>
                      </div>
                      <span class="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-zinc-400">
                        {d.status}
                      </span>
                    </div>
                  ))}
                  <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-600">
                    <span>4 drives · 15.7 TB</span>
                    <a href="/dashboard" class="text-zinc-400 hover:text-white transition-colors">Manage →</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section class="border-y border-white/5 bg-white/[0.015] py-10 px-6">
        <div class="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[["10B+", "Files Indexed"], ["500K+", "Active Mounts"], ["2,000+", "Enterprise Teams"], ["99.99%", "Uptime SLA"]].map(([v, l]) => (
            <div>
              <div class="text-2xl md:text-3xl font-bold text-white tracking-tight">{v}</div>
              <div class="text-xs text-zinc-600 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" class="py-24 px-6">
        <div class="mx-auto max-w-6xl">
          <h2 class="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3 text-center">Everything you need</h2>
          <p class="text-zinc-500 text-center mb-14 max-w-lg mx-auto">Native integration, live indexing, and seamless sync — designed for individuals and teams alike.</p>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <Card class="border-white/8 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200 group rounded-xl">
                <CardContent class="p-6">
                  <h3 class="font-semibold text-white mb-2 group-hover:text-zinc-100">{f.title}</h3>
                  <p class="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" class="py-24 px-6 border-t border-white/5">
        <div class="mx-auto max-w-5xl">
          <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-10 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="secondary" class="mb-6 text-xs text-zinc-400">Enterprise Ready</Badge>
              <h2 class="text-3xl font-bold text-white tracking-tight mb-5">
                From your home office<br />to your entire org
              </h2>
              <p class="text-zinc-400 leading-relaxed mb-8 text-sm">
                Start free as an individual. Scale to your full organisation with SSO, audit logs, custom data residency, and a dedicated SLA — no rearchitecting required.
              </p>
              <div class="flex gap-3">
                <a href="/dashboard"><Button size="default" class="px-5">Start free</Button></a>
                <a href="/contact"><Button variant="outline" size="default" class="px-5 border-zinc-700 text-zinc-300 hover:bg-zinc-800">Contact sales</Button></a>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              {[["SSO & SCIM", "Identity management"], ["RBAC", "Granular access control"], ["Audit Logs", "Full compliance trail"], ["On-Premise", "Custom deployment"], ["AES-256", "Encryption at rest"], ["99.99% SLA", "Dedicated uptime"]].map(([title, sub]) => (
                <div class="rounded-xl border border-white/8 bg-zinc-900/50 p-4">
                  <div class="text-sm font-semibold text-white mb-0.5">{title}</div>
                  <div class="text-xs text-zinc-600">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-24 px-6">
        <div class="mx-auto max-w-lg text-center">
          <h2 class="text-4xl font-bold text-white tracking-tight mb-4">Ready to mount your first drive?</h2>
          <p class="text-zinc-500 mb-8">Download OSDrive and be up in minutes. Free tier, no card required.</p>
          <a href="/download">
            <Button size="lg" class="px-10 h-12 bg-white text-zinc-950 hover:bg-zinc-100">
              <DlIcon /><span class="ml-2">Download OSDrive</span>
            </Button>
          </a>
        </div>
      </section>

      <footer class="border-t border-white/8 py-8 px-6">
        <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
          <span class="font-semibold text-white">OSDrive</span>
          <div class="flex flex-wrap justify-center gap-6">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([l, h]) => (
              <a href={h} class="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
