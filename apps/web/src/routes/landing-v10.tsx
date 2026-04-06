// Design v10: Premium Glass Dark — near-black bg, muted indigo/blue glow blobs,
// large rounded glassmorphism panels. More refined and premium than v3.
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const drives = [
  { name: "Engineering Drive", size: "2.4 TB", status: "Mounted", dot: "bg-sky-400" },
  { name: "Design Assets", size: "890 GB", status: "Synced", dot: "bg-violet-400" },
  { name: "Client Work", size: "340 GB", status: "Mounted", dot: "bg-emerald-400" },
];

const pillars = [
  {
    tag: "Speed",
    title: "Indexed. Instant.",
    desc: "A live filesystem index means every directory listing, search, and move returns in milliseconds — on drives of any size.",
    glow: "rgba(56,189,248,0.08)",
    border: "border-sky-500/15",
    text: "text-sky-300",
  },
  {
    tag: "Native",
    title: "Lives in Finder.",
    desc: "Mount cloud drives as native volumes — no abstraction, no FUSE quirks. Spotlight, Quick Look, and every shell tool just work.",
    glow: "rgba(167,139,250,0.08)",
    border: "border-violet-500/15",
    text: "text-violet-300",
  },
  {
    tag: "Sync",
    title: "Always current.",
    desc: "Delta sync propagates changes the instant they happen, across every device, with automatic conflict-free resolution.",
    glow: "rgba(52,211,153,0.08)",
    border: "border-emerald-500/15",
    text: "text-emerald-300",
  },
  {
    tag: "Share",
    title: "Precise access.",
    desc: "Link sharing with per-user permissions, expiry dates, and optional passwords — with a full access log for every share.",
    glow: "rgba(251,191,36,0.06)",
    border: "border-amber-500/15",
    text: "text-amber-300",
  },
  {
    tag: "Manage",
    title: "One dashboard.",
    desc: "Create, resize, and configure cloud drives from a single dashboard. Quotas, policies, and RBAC built in from day one.",
    glow: "rgba(249,115,22,0.06)",
    border: "border-orange-500/15",
    text: "text-orange-300",
  },
  {
    tag: "Enterprise",
    title: "Compliance ready.",
    desc: "SSO, SCIM, audit logs, data residency, and a dedicated SLA for organisations that treat their filesystem as infrastructure.",
    glow: "rgba(236,72,153,0.06)",
    border: "border-pink-500/15",
    text: "text-pink-300",
  },
];

export default function LandingV10() {
  return (
    <div class="min-h-screen font-sans" style="background-color: #07080f; color: white;">
      {/* Ambient glows */}
      <div class="pointer-events-none fixed inset-0 overflow-hidden">
        <div class="absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full blur-[140px]" style="background: radial-gradient(circle, rgba(99,102,241,0.08), transparent 70%);" />
        <div class="absolute top-1/2 -right-32 w-[500px] h-[500px] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(56,189,248,0.05), transparent 70%);" />
        <div class="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px]" style="background: radial-gradient(circle, rgba(52,211,153,0.04), transparent 70%);" />
      </div>

      {/* Nav */}
      <header class="relative z-50 border-b" style="border-color: rgba(255,255,255,0.06); background: rgba(7,8,15,0.85); backdrop-filter: blur(20px);">
        <div class="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
              <span class="text-white font-bold text-xs">OS</span>
            </div>
            <span class="font-semibold text-lg">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm" style="color: rgba(255,255,255,0.4);">
            <a href="#features" class="hover:text-white transition-colors">Features</a>
            <a href="#enterprise" class="hover:text-white transition-colors">Enterprise</a>
            <a href="/pricing" class="hover:text-white transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-white transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm transition-colors" style="color: rgba(255,255,255,0.4);">
              Account
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="border-white/10 text-white/60 hover:bg-white/8 hover:text-white bg-transparent">
                Dashboard
              </Button>
            </a>
            <a href="/download">
              <Button size="sm" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none;" class="text-white hover:opacity-90">
                Download
              </Button>
            </a>
          </div>
        </div>
      </header>

      <div class="relative z-10">
        {/* Hero */}
        <section class="pt-32 pb-20 px-6">
          <div class="mx-auto max-w-4xl text-center">
            <div class="inline-flex items-center gap-2 mb-8 rounded-full px-4 py-1.5 text-xs" style="background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); color: rgba(167,139,250,1);">
              <span class="h-1.5 w-1.5 rounded-full bg-violet-400" />
              The cloud drive that feels local
            </div>
            <h1 class="text-6xl md:text-8xl font-bold tracking-tight leading-none mb-6" style="background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.5) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Your Filesystem.<br />Everywhere.
            </h1>
            <p class="text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style="color: rgba(255,255,255,0.45);">
              Mount, sync, and share your cloud drives natively — backed by a live filesystem index that makes every operation instant.
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/download">
                <Button size="lg" class="px-10 h-13 text-base text-white hover:opacity-90" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; box-shadow: 0 0 40px rgba(99,102,241,0.3);">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download free
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="px-10 h-13 text-base text-white/60 hover:text-white hover:bg-white/8 bg-transparent" style="border: 1px solid rgba(255,255,255,0.12);">
                  Open dashboard →
                </Button>
              </a>
            </div>
            <p class="mt-5 text-xs" style="color: rgba(255,255,255,0.2);">macOS · Windows · Linux · Free tier available</p>
          </div>
        </section>

        {/* Dashboard Mockup */}
        <section class="px-6 pb-20">
          <div class="mx-auto max-w-3xl">
            <div class="rounded-2xl overflow-hidden" style="border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); backdrop-filter: blur(20px);">
              <div class="flex items-center gap-2 px-5 py-3" style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <div class="h-3 w-3 rounded-full" style="background: rgba(255,255,255,0.1);" />
                <div class="h-3 w-3 rounded-full" style="background: rgba(255,255,255,0.1);" />
                <div class="h-3 w-3 rounded-full" style="background: rgba(255,255,255,0.1);" />
                <span class="ml-3 text-xs font-mono" style="color: rgba(255,255,255,0.2);">app.osdrive.io/drives</span>
              </div>
              <div class="p-6 space-y-3">
                {drives.map((d) => (
                  <div class="flex items-center gap-4 rounded-xl px-4 py-3" style="border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.04);">
                    <div class={`h-2 w-2 rounded-full ${d.dot} shrink-0`} />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-white/80 truncate">{d.name}</div>
                      <div class="text-xs" style="color: rgba(255,255,255,0.3);">{d.size}</div>
                    </div>
                    <span class="text-xs px-2.5 py-1 rounded-full" style="background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); color: rgb(110,231,183);">{d.status}</span>
                  </div>
                ))}
                <div class="pt-2 flex justify-between text-xs" style="border-top: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.2);">
                  <span>3 drives · 3.6 TB</span>
                  <a href="/dashboard" style="color: rgba(167,139,250,0.7);" class="hover:text-violet-300 transition-colors">Manage drives →</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section class="py-10 px-6" style="border-top: 1px solid rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.04); background: rgba(255,255,255,0.01);">
          <div class="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[["10B+", "Files Indexed"], ["500K+", "Mounts Active"], ["2,000+", "Enterprise Teams"], ["99.99%", "Uptime SLA"]].map(([v, l]) => (
              <div>
                <div class="text-3xl font-bold text-white/90">{v}</div>
                <div class="text-xs mt-1" style="color: rgba(255,255,255,0.3);">{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Pillars */}
        <section id="features" class="py-24 px-6">
          <div class="mx-auto max-w-6xl">
            <div class="text-center mb-14">
              <h2 class="text-4xl font-bold text-white/90 tracking-tight mb-4">Built around your workflow</h2>
              <p class="max-w-xl mx-auto" style="color: rgba(255,255,255,0.35);">From mounting in Finder to enterprise SSO — everything in one product.</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pillars.map((p) => (
                <div class={`rounded-2xl p-6 ${p.border}`} style={`border: 1px solid; background: rgba(255,255,255,0.02); border-color: ${p.border.replace("border-", "").replace("/15", "")}; transition: background 0.2s;`}>
                  <div class={`text-xs uppercase tracking-widest mb-3 ${p.text}`}>{p.tag}</div>
                  <h3 class="text-lg font-semibold text-white/85 mb-3">{p.title}</h3>
                  <p class="text-sm leading-relaxed" style="color: rgba(255,255,255,0.35);">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise */}
        <section id="enterprise" class="py-20 px-6">
          <div class="mx-auto max-w-4xl">
            <div class="rounded-3xl p-10 md:p-14" style="border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.025); backdrop-filter: blur(20px);">
              <div class="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge class="mb-6 text-xs" style="background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.2); color: rgb(167,139,250);">Enterprise</Badge>
                  <h2 class="text-3xl font-bold text-white/90 tracking-tight mb-5">
                    Free for one.<br />Secure for thousands.
                  </h2>
                  <p class="text-sm leading-relaxed mb-8" style="color: rgba(255,255,255,0.4);">
                    Start on the free tier and grow into full enterprise controls — same product, same native feel, with SSO, audit trails, data residency, and a dedicated SLA when you need them.
                  </p>
                  <div class="flex gap-3">
                    <a href="/download">
                      <Button size="default" class="px-5 text-white hover:opacity-90" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none;">Download free</Button>
                    </a>
                    <a href="/contact">
                      <Button variant="outline" size="default" class="px-5 text-white/60 hover:text-white hover:bg-white/8 bg-transparent" style="border: 1px solid rgba(255,255,255,0.12);">Contact sales</Button>
                    </a>
                  </div>
                </div>
                <div class="space-y-3">
                  {["SSO (SAML, OIDC) & SCIM", "Role-based access control", "Immutable audit trail", "Custom data residency", "On-premise deployment", "Dedicated SLA & support"].map((item) => (
                    <div class="flex items-center gap-3 text-sm" style="color: rgba(255,255,255,0.5);">
                      <div class="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section class="py-24 px-6 text-center">
          <h2 class="text-4xl font-bold text-white/90 tracking-tight mb-5">Start in minutes.</h2>
          <p class="mb-10 max-w-sm mx-auto" style="color: rgba(255,255,255,0.35);">Download OSDrive and mount your first drive in Finder in under two minutes.</p>
          <a href="/download">
            <Button size="lg" class="px-10 h-12 text-white hover:opacity-90 text-base" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; box-shadow: 0 0 40px rgba(99,102,241,0.25);">
              Download OSDrive
            </Button>
          </a>
        </section>

        <footer style="border-top: 1px solid rgba(255,255,255,0.06);" class="py-8 px-6">
          <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style="color: rgba(255,255,255,0.25);">
            <span class="font-semibold text-white/60">OSDrive © 2025</span>
            <div class="flex flex-wrap justify-center gap-6">
              {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([l, h]) => (
                <a href={h} class="hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
