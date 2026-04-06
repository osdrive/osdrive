// Design v13: Product Forward Dark — large centred dashboard mockup IS the hero.
// Dark background, the product speaks first, then copy + features below.
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

const drives = [
  { name: "Engineering Shared Drive", size: "2.4 TB", status: "Mounted", users: 14, pct: 62, col: "bg-sky-500" },
  { name: "Design Assets", size: "890 GB", status: "Synced", users: 6, pct: 41, col: "bg-violet-500" },
  { name: "Client Deliverables", size: "340 GB", status: "Mounted", users: 23, pct: 28, col: "bg-emerald-500" },
  { name: "Backup Archive", size: "12.1 TB", status: "Synced", users: 2, pct: 87, col: "bg-amber-500" },
];

const features = [
  { title: "Appears in Finder", desc: "Your drives mount as native volumes — no extra apps, no FUSE quirks. Works with every tool that expects a local disk." },
  { title: "Live filesystem index", desc: "Every search, listing, and move is served from an in-memory index. Sub-50ms no matter the drive size." },
  { title: "Cross-device sync", desc: "Edit on any device. Changes propagate everywhere via block-level delta sync the moment they save." },
  { title: "Link sharing", desc: "Share anything — file or drive — with a link. Fine-grained permissions, expiry, and optional passwords." },
];

export default function LandingV13() {
  return (
    <div class="min-h-screen bg-[#0c0c10] text-white font-sans">
      {/* Nav */}
      <header class="fixed top-0 inset-x-0 z-50 border-b border-white/5" style="background: rgba(12,12,16,0.9); backdrop-filter: blur(16px);">
        <div class="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0">
              <span class="text-[#0c0c10] font-bold text-xs">OS</span>
            </div>
            <span class="font-semibold tracking-tight">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm text-white/40">
            <a href="#features" class="hover:text-white transition-colors">Features</a>
            <a href="#enterprise" class="hover:text-white transition-colors">Enterprise</a>
            <a href="/pricing" class="hover:text-white transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-white transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm text-white/40 hover:text-white transition-colors">Account</a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="border-white/10 text-white/60 hover:bg-white/8 hover:text-white bg-transparent">Dashboard</Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-white text-[#0c0c10] hover:bg-zinc-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Headline above mockup */}
      <section class="pt-36 pb-10 px-6 text-center">
        <div class="mx-auto max-w-3xl">
          <Badge variant="outline" class="mb-6 border-white/10 text-white/50 text-xs px-3 py-1">
            Cloud storage & native sync
          </Badge>
          <h1 class="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-4 text-white/90">
            Your files, indexed<br />
            <span class="text-white/30">and everywhere.</span>
          </h1>
          <p class="text-white/40 text-lg max-w-xl mx-auto">
            Mount cloud drives in Finder, sync across every device, and access everything instantly via a live filesystem index.
          </p>
        </div>
      </section>

      {/* Centred Mockup — the hero */}
      <section class="px-6 pb-8">
        <div class="mx-auto max-w-4xl">
          {/* Glow behind mockup */}
          <div class="relative">
            <div class="absolute -inset-8 rounded-3xl blur-3xl opacity-30" style="background: radial-gradient(ellipse, rgba(99,102,241,0.3) 0%, transparent 70%);" />
            <div class="relative rounded-2xl border overflow-hidden shadow-2xl" style="border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.03);">
              {/* Browser chrome */}
              <div class="flex items-center gap-2 px-5 py-3.5 border-b" style="border-color: rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);">
                <div class="h-3 w-3 rounded-full" style="background: rgba(255,255,255,0.08);" />
                <div class="h-3 w-3 rounded-full" style="background: rgba(255,255,255,0.08);" />
                <div class="h-3 w-3 rounded-full" style="background: rgba(255,255,255,0.08);" />
                <div class="flex-1 mx-6">
                  <div class="mx-auto h-6 w-48 rounded-md flex items-center justify-center" style="background: rgba(255,255,255,0.05);">
                    <span class="text-[10px] font-mono" style="color: rgba(255,255,255,0.25);">app.osdrive.io/drives</span>
                  </div>
                </div>
              </div>
              {/* Two-panel layout */}
              <div class="flex min-h-[320px]">
                {/* Sidebar */}
                <div class="w-44 shrink-0 p-4" style="border-right: 1px solid rgba(255,255,255,0.05);">
                  <p class="text-[9px] uppercase tracking-widest mb-3 px-2" style="color: rgba(255,255,255,0.2);">Workspace</p>
                  {[["All Drives", true], ["Shared", false], ["Recent", false], ["Trash", false]].map(([label, active]) => (
                    <div class={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs mb-0.5 ${active ? "bg-white/10 text-white" : "text-white/30"}`}>
                      <div class={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-white/20"}`} />
                      {label}
                    </div>
                  ))}
                </div>
                {/* Main */}
                <div class="flex-1 p-5">
                  <div class="flex items-center justify-between mb-5">
                    <span class="text-sm font-medium text-white/80">All Drives</span>
                    <span class="text-xs font-mono" style="color: rgba(255,255,255,0.25);">4 drives · 15.7 TB</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    {drives.map((d) => (
                      <div class="rounded-xl p-4" style="border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03);">
                        <div class="flex items-center gap-2 mb-3">
                          <div class={`h-2 w-2 rounded-full ${d.col} shrink-0`} />
                          <span class="text-xs font-medium text-white/70 truncate">{d.name}</span>
                        </div>
                        <div class="h-1 rounded-full mb-2" style="background: rgba(255,255,255,0.06);">
                          <div class={`h-full rounded-full ${d.col} opacity-60`} style={`width: ${d.pct}%`} />
                        </div>
                        <div class="flex items-center justify-between text-[10px]">
                          <span style="color: rgba(255,255,255,0.3);">{d.size}</span>
                          <span class="px-1.5 py-0.5 rounded" style="background: rgba(52,211,153,0.1); color: rgb(110,231,183);">{d.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAs beneath mockup */}
      <section class="py-8 px-6 text-center">
        <div class="flex flex-col sm:flex-row justify-center gap-4 mb-4">
          <a href="/download">
            <Button size="lg" class="px-8 h-12 bg-white text-[#0c0c10] hover:bg-zinc-100 text-base">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download free
            </Button>
          </a>
          <a href="/dashboard">
            <Button variant="outline" size="lg" class="px-8 h-12 border-white/10 text-white/60 hover:bg-white/8 hover:text-white bg-transparent text-base">
              Open dashboard →
            </Button>
          </a>
        </div>
        <p class="text-xs text-white/20">macOS · Windows · Linux · No credit card required</p>
      </section>

      {/* Stats */}
      <section class="py-10 px-6 border-y border-white/5">
        <div class="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[["10B+", "Files indexed"], ["500K+", "Active mounts"], ["2,000+", "Enterprise teams"], ["99.99%", "Uptime SLA"]].map(([v, l]) => (
            <div>
              <div class="text-2xl font-bold text-white/80">{v}</div>
              <div class="text-xs text-white/25 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" class="py-20 px-6">
        <div class="mx-auto max-w-5xl">
          <h2 class="text-3xl font-bold text-white/90 tracking-tight text-center mb-12">Why OSDrive is different</h2>
          <div class="grid md:grid-cols-2 gap-4">
            {features.map((f) => (
              <Card class="border-white/5 bg-white/[0.03] rounded-2xl hover:bg-white/[0.05] transition-colors">
                <CardContent class="p-7">
                  <h3 class="text-base font-semibold text-white/85 mb-3">{f.title}</h3>
                  <p class="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" class="py-16 px-6">
        <div class="mx-auto max-w-4xl rounded-3xl p-10 border border-white/6" style="background: rgba(255,255,255,0.025);">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge class="mb-5 text-xs" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5);">Enterprise</Badge>
              <h2 class="text-3xl font-bold text-white/90 tracking-tight mb-5">
                Scales to your<br />whole organisation
              </h2>
              <p class="text-sm text-white/40 leading-relaxed mb-8">
                Start free as an individual. Add SSO, audit logs, RBAC, and a dedicated SLA when your team needs them — same product, same native feel.
              </p>
              <div class="flex gap-3">
                <a href="/download">
                  <Button size="default" class="bg-white text-[#0c0c10] hover:bg-zinc-100 px-5">Download free</Button>
                </a>
                <a href="/contact">
                  <Button variant="outline" size="default" class="border-white/10 text-white/50 hover:bg-white/8 hover:text-white bg-transparent px-5">Contact sales</Button>
                </a>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              {[["SSO & SCIM", "Identity"], ["RBAC", "Access control"], ["Audit logs", "Compliance"], ["Data residency", "Sovereignty"], ["On-premise", "Deployment"], ["99.99% SLA", "Reliability"]].map(([t, s]) => (
                <div class="rounded-xl p-4" style="border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03);">
                  <div class="text-xs font-semibold text-white/70 mb-0.5">{t}</div>
                  <div class="text-[10px] text-white/25">{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer class="border-t border-white/5 py-8 px-6">
        <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/20">
          <span class="font-semibold text-white/50">OSDrive © 2025</span>
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
