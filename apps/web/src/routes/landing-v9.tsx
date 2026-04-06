// Design v9: Dramatic Half-Split Hero — dark left panel + white right panel in the hero,
// then normal white sections below. Very striking visual contrast, consumer-first copy.
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

const drives = [
  { name: "Engineering Drive", size: "2.4 TB", users: 14, status: "Mounted", col: "bg-sky-500" },
  { name: "Design Assets", size: "890 GB", users: 6, status: "Synced", col: "bg-violet-500" },
  { name: "Client Work", size: "340 GB", users: 23, status: "Mounted", col: "bg-emerald-500" },
];

const features = [
  { emoji: "📁", title: "Appears in Finder", desc: "Mount cloud drives as native volumes — no extra apps, works with every tool you already use." },
  { emoji: "⚡", title: "Indexed, so it's fast", desc: "A live filesystem index means searches and directory listings are near-instant, always." },
  { emoji: "🔄", title: "Stays in sync", desc: "Edit on one device, it's there on all of them. Automatic, conflict-free, always current." },
  { emoji: "🔗", title: "Share with a link", desc: "Create shareable links with permission levels, expiry dates, and optional passwords." },
  { emoji: "☁️", title: "Create cloud drives", desc: "Provision drives in seconds from the dashboard with quotas and access controls built in." },
  { emoji: "🏢", title: "Enterprise grade", desc: "SSO, SCIM, audit logs, data residency, and dedicated SLA for your whole organisation." },
];

export default function LandingV9() {
  return (
    <div class="min-h-screen bg-white text-slate-900 font-sans">
      {/* Nav — transparent over the split hero */}
      <header class="fixed top-0 inset-x-0 z-50">
        <div class="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
              <span class="text-slate-900 font-bold text-xs">OS</span>
            </div>
            <span class="font-semibold text-lg text-white drop-shadow">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" class="hover:text-white transition-colors">Features</a>
            <a href="#enterprise" class="hover:text-white transition-colors">Enterprise</a>
            <a href="/pricing" class="hover:text-white transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-white transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm text-white/60 hover:text-white transition-colors">Account</a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="border-white/30 text-white hover:bg-white/10 bg-transparent">
                Dashboard
              </Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-white text-slate-900 hover:bg-slate-100">
                Download
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Split Hero */}
      <section class="relative min-h-screen flex flex-col lg:flex-row">
        {/* Left — dark */}
        <div class="lg:w-[52%] bg-slate-900 flex flex-col justify-center px-10 md:px-16 pt-24 pb-16 lg:pt-0 lg:pb-0 relative overflow-hidden">
          {/* Subtle dot grid */}
          <div
            class="pointer-events-none absolute inset-0 opacity-20"
            style="background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px); background-size: 28px 28px;"
          />
          {/* Gradient wash */}
          <div class="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-900 to-transparent" />
          <div class="relative max-w-md">
            <p class="text-xs text-slate-400 uppercase tracking-[0.2em] mb-6">Cloud storage & sync</p>
            <h1 class="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
              Your files.<br />
              <span class="text-slate-400 italic font-light">Everywhere</span><br />
              you work.
            </h1>
            <p class="text-slate-400 leading-relaxed mb-10">
              Download OSDrive and your cloud drives mount natively in Finder — then stay synced across every device, automatically.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <a href="/download">
                <Button size="lg" class="px-8 bg-white text-slate-900 hover:bg-slate-100 h-12">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download free
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="px-8 border-slate-600 text-slate-300 hover:bg-slate-800 h-12">
                  Dashboard →
                </Button>
              </a>
            </div>
            <p class="mt-4 text-xs text-slate-600">macOS · Windows · Linux</p>
          </div>
        </div>

        {/* Right — white with dashboard mockup */}
        <div class="lg:w-[48%] bg-white flex flex-col justify-center px-8 md:px-12 py-16 lg:py-0">
          <div class="max-w-md mx-auto w-full">
            <p class="text-xs text-slate-400 uppercase tracking-widest mb-6">Your dashboard</p>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-lg">
              <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <div class="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <div class="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <div class="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span class="ml-2 text-xs text-slate-300 font-mono">app.osdrive.io</span>
              </div>
              <div class="p-5 space-y-2.5">
                {drives.map((d) => (
                  <div class="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <div class={`h-2 w-2 rounded-full ${d.col} shrink-0`} />
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-slate-800 truncate">{d.name}</div>
                      <div class="text-xs text-slate-400">{d.size} · {d.users} users</div>
                    </div>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{d.status}</span>
                  </div>
                ))}
                <div class="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                  <span>3 drives · 3.6 TB total</span>
                  <a href="/dashboard" class="text-slate-500 hover:text-slate-900 transition-colors">View all →</a>
                </div>
              </div>
            </div>
            {/* Stats below mockup */}
            <div class="mt-8 grid grid-cols-3 gap-4">
              {[["10B+", "Indexed files"], ["99.99%", "Uptime"], ["< 50ms", "Latency"]].map(([v, l]) => (
                <div class="text-center">
                  <div class="text-xl font-bold text-slate-900">{v}</div>
                  <div class="text-[11px] text-slate-400 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" class="py-24 px-6 bg-slate-50">
        <div class="mx-auto max-w-6xl">
          <div class="text-center mb-14">
            <h2 class="text-4xl font-bold text-slate-900 tracking-tight mb-3">How OSDrive works</h2>
            <p class="text-slate-500 max-w-lg mx-auto">Everything from local Finder integration to enterprise compliance — in one product.</p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div class="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
                <div class="text-2xl mb-4">{f.emoji}</div>
                <h3 class="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p class="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" class="py-24 px-6 bg-white">
        <div class="mx-auto max-w-5xl">
          <Separator class="bg-slate-100 mb-24" />
          <div class="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="secondary" class="mb-6 text-xs text-slate-500">Enterprise plan</Badge>
              <h2 class="text-4xl font-bold text-slate-900 tracking-tight mb-5 leading-tight">
                Built for individuals.<br />Ready for enterprise.
              </h2>
              <p class="text-slate-500 leading-relaxed mb-8">
                OSDrive works beautifully for a single developer and scales transparently to 10,000 seats — with SSO, audit trails, and the compliance tools your IT team requires.
              </p>
              <div class="flex gap-3">
                <a href="/contact">
                  <Button size="lg" class="px-6 bg-slate-900 text-white hover:bg-slate-800">Contact sales</Button>
                </a>
                <a href="/download">
                  <Button variant="outline" size="lg" class="px-6 border-slate-300">Download free</Button>
                </a>
              </div>
            </div>
            <div class="space-y-3">
              {[
                ["SSO (SAML 2.0, OIDC)", "Connect your identity provider"],
                ["SCIM provisioning", "Automate user lifecycle management"],
                ["Role-based access", "Granular permissions per drive"],
                ["Audit logs", "Immutable access history"],
                ["Data residency", "Choose where your data lives"],
                ["On-premise option", "Deploy within your own infrastructure"],
              ].map(([title, sub]) => (
                <div class="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500 mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  <div>
                    <div class="text-sm font-medium text-slate-800">{title}</div>
                    <div class="text-xs text-slate-400 mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-24 px-6 bg-slate-900">
        <div class="mx-auto max-w-lg text-center">
          <h2 class="text-4xl font-bold text-white tracking-tight mb-5">Download and go.</h2>
          <p class="text-slate-400 mb-8">Mount your first cloud drive in Finder in under two minutes. Free tier, no card required.</p>
          <div class="flex flex-col sm:flex-row justify-center gap-3">
            <a href="/download">
              <Button size="lg" class="px-8 bg-white text-slate-900 hover:bg-slate-100">Download OSDrive</Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="px-8 border-slate-600 text-slate-300 hover:bg-slate-800">Open dashboard</Button>
            </a>
          </div>
        </div>
      </section>

      <footer class="border-t border-slate-800 bg-slate-900 py-8 px-6">
        <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <span class="font-semibold text-white">OSDrive © 2025</span>
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
