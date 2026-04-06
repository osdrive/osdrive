// v7b: Bento-Hero — the headline IS the first bento card. The grid starts right below
// the nav with no separate hero section. Product-first, immersive from the first pixel.
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const drives = [
  { name: "Engineering Drive", size: "2.4 TB", users: 14, status: "Mounted", col: "bg-sky-500" },
  { name: "Design Assets", size: "890 GB", users: 6, status: "Synced", col: "bg-violet-500" },
  { name: "Client Work", size: "340 GB", users: 23, status: "Mounted", col: "bg-emerald-500" },
];

export default function LandingV7b() {
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
          <nav class="hidden md:flex items-center gap-7 text-sm text-zinc-400">
            <a href="#features" class="hover:text-zinc-900 transition-colors">Product</a>
            <a href="#enterprise" class="hover:text-zinc-900 transition-colors">Enterprise</a>
            <a href="/pricing" class="hover:text-zinc-900 transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-zinc-900 transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm text-zinc-400 hover:text-zinc-900 transition-colors">Account</a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="border-zinc-300 text-zinc-600">Dashboard</Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-zinc-900 text-white hover:bg-zinc-800">Download</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Full-bleed bento grid — the hero IS the first card */}
      <section id="features" class="p-4 md:p-6">
        <div class="mx-auto max-w-7xl">

          {/* Row 1: hero card (2 cols, tall) + two stacked right cards */}
          <div class="grid md:grid-cols-3 gap-4 mb-4">

            {/* HERO CARD — 2 cols wide */}
            <div class="md:col-span-2 rounded-3xl bg-zinc-900 text-white p-10 md:p-12 min-h-[420px] flex flex-col justify-between relative overflow-hidden">
              {/* Dot grid texture */}
              <div class="pointer-events-none absolute inset-0 opacity-[0.07]"
                style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 28px 28px;" />
              {/* Radial glow */}
              <div class="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl" style="background: rgba(255,255,255,0.04);" />
              <div class="relative">
                <Badge variant="outline" class="mb-8 border-white/15 text-zinc-400 text-xs w-fit">
                  Cloud storage & native sync
                </Badge>
                <h1 class="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-5">
                  The cloud drive<br />that feels local.
                </h1>
                <p class="text-zinc-400 text-lg leading-relaxed max-w-md">
                  Mount cloud drives in Finder, index them for instant access, and sync across every device — automatically.
                </p>
              </div>
              <div class="relative">
                <div class="flex flex-col sm:flex-row gap-3 mb-5">
                  <a href="/download">
                    <Button size="lg" class="px-8 h-11 bg-white text-zinc-900 hover:bg-zinc-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      Download free
                    </Button>
                  </a>
                  <a href="/dashboard">
                    <Button variant="outline" size="lg" class="px-8 h-11 border-white/20 text-zinc-300 hover:bg-white/10">
                      Open dashboard →
                    </Button>
                  </a>
                </div>
                <p class="text-zinc-600 text-xs">macOS · Windows · Linux · No credit card required</p>
              </div>
            </div>

            {/* Right column: 2 stacked cards */}
            <div class="flex flex-col gap-4">
              {/* Index speed card */}
              <div class="rounded-3xl bg-blue-600 text-white p-7 flex flex-col justify-between min-h-[196px]">
                <div>
                  <div class="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-3">Live Index</div>
                  <div class="text-5xl font-black tracking-tighter leading-none mb-2">&lt;50ms</div>
                  <p class="text-blue-200 text-sm leading-relaxed">Every operation served from an in-memory filesystem index. Always.</p>
                </div>
              </div>
              {/* Sync card */}
              <div class="rounded-3xl border border-zinc-200 bg-white p-7 flex flex-col justify-between min-h-[196px]">
                <div>
                  <div class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Sync</div>
                  <h3 class="text-xl font-bold text-zinc-900 leading-tight">Every device.<br />Always current.</h3>
                </div>
                <p class="text-zinc-500 text-sm leading-relaxed">Block-level delta sync propagates changes the moment they happen.</p>
              </div>
            </div>
          </div>

          {/* Row 2: three equal cards */}
          <div class="grid md:grid-cols-3 gap-4 mb-4">
            {/* Finder Mounting */}
            <div class="rounded-3xl border border-zinc-200 bg-white p-7 min-h-[200px] flex flex-col justify-between">
              <div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Native Mounting</div>
                <h3 class="text-xl font-bold text-zinc-900 leading-tight">Appears in Finder.<br />Works everywhere.</h3>
              </div>
              <div class="flex gap-2">
                {["SMB 3.1.1", "NFS v4"].map((t) => (
                  <span class="text-xs px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500">{t}</span>
                ))}
              </div>
            </div>

            {/* Sharing */}
            <div class="rounded-3xl bg-zinc-900 text-white p-7 min-h-[200px] flex flex-col justify-between">
              <div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Sharing</div>
                <h3 class="text-xl font-bold leading-tight">Links with permissions, expiry & passwords.</h3>
              </div>
              <p class="text-zinc-400 text-sm">Granular, auditable access for every share you create.</p>
            </div>

            {/* Enterprise teaser */}
            <div class="rounded-3xl border border-zinc-200 bg-white p-7 min-h-[200px] flex flex-col justify-between">
              <div>
                <div class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Enterprise</div>
                <h3 class="text-xl font-bold text-zinc-900 leading-tight">SSO. SCIM. Audit logs. SLA.</h3>
              </div>
              <a href="/contact" class="text-xs text-zinc-500 hover:text-zinc-900 transition-colors inline-flex items-center gap-1">
                Talk to sales
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            </div>
          </div>

          {/* Row 3: dashboard (wide) + coming soon */}
          <div class="grid md:grid-cols-3 gap-4">
            <div class="md:col-span-2 rounded-3xl border border-zinc-200 bg-white p-7 min-h-[200px]">
              <div class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-5">Dashboard</div>
              <div class="space-y-2">
                {drives.map((d) => (
                  <div class="flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-100 px-4 py-2.5">
                    <div class={`h-2 w-2 rounded-full ${d.col} shrink-0`} />
                    <span class="text-sm font-medium text-zinc-800 flex-1 truncate">{d.name}</span>
                    <span class="text-zinc-400 text-xs">{d.size}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{d.status}</span>
                  </div>
                ))}
              </div>
              <a href="/dashboard" class="mt-4 inline-block text-xs text-blue-600 hover:underline">Open dashboard →</a>
            </div>

            <div class="rounded-3xl border-2 border-dashed border-zinc-200 bg-transparent p-7 min-h-[200px] flex flex-col justify-between">
              <div>
                <Badge variant="secondary" class="mb-3 text-[10px] text-zinc-500">Coming soon</Badge>
                <h3 class="text-xl font-bold text-zinc-500 leading-tight">Browser File Explorer</h3>
                <p class="text-zinc-400 text-sm mt-2 leading-relaxed">Manage every drive from any browser, from anywhere in the world.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" class="mt-6 py-20 px-6 bg-zinc-900">
        <div class="mx-auto max-w-7xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-4xl font-black text-white tracking-tight mb-5 leading-tight">
              Built for one person.<br />Ready for your entire org.
            </h2>
            <p class="text-zinc-400 text-sm leading-relaxed mb-8 max-w-sm">
              Free tier for individuals, enterprise controls when your team needs them — same product, same native feel throughout.
            </p>
            <div class="space-y-2.5 mb-8">
              {["SSO (SAML, OIDC) & SCIM", "Role-based access control", "Audit logs & compliance exports", "Custom data residency", "Dedicated SLA & 24/7 support"].map((item) => (
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
            {[["10B+", "Files indexed"], ["2,000+", "Enterprise teams"], ["99.99%", "Uptime SLA"], ["AES-256", "Encryption"]].map(([v, l]) => (
              <div class="rounded-2xl border border-zinc-700/50 bg-zinc-800/60 p-7">
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
          <h2 class="text-4xl font-black text-zinc-900 tracking-tight mb-4">Download and go.</h2>
          <p class="text-zinc-400 mb-8">Mount your first cloud drive in Finder in under two minutes.</p>
          <div class="flex justify-center gap-3">
            <a href="/download"><Button size="lg" class="px-8 bg-zinc-900 text-white hover:bg-zinc-800">Download free</Button></a>
            <a href="/dashboard"><Button variant="outline" size="lg" class="px-8 border-zinc-300 text-zinc-600">Open dashboard</Button></a>
          </div>
        </div>
      </section>

      <footer class="border-t border-zinc-200 py-8 px-6 bg-white">
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
