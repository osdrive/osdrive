// v8a: Stone + Split Mockup — fixes v8's hero: left = elegant headline, right = dashboard
// mockup. No detached mockup section. Capabilities become a 2×3 icon card grid.
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

const drives = [
  { name: "Engineering Drive", size: "2.4 TB", status: "Mounted", users: 14, col: "bg-sky-500" },
  { name: "Design Assets", size: "890 GB", status: "Synced", users: 6, col: "bg-violet-500" },
  { name: "Client Work", size: "340 GB", status: "Mounted", users: 23, col: "bg-emerald-500" },
  { name: "Backup Archive", size: "12.1 TB", status: "Synced", users: 2, col: "bg-amber-500" },
];

const capabilities = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
    ),
    title: "Native Mounting",
    desc: "Your drives appear in Finder and Explorer as local volumes. No abstraction, no extra apps.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    ),
    title: "Live Filesystem Index",
    desc: "Every search, listing, and move served from an in-memory index. Under 50ms, always.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
    ),
    title: "Cross-Device Sync",
    desc: "Block-level delta sync propagates changes instantly. Every device, always current.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
    ),
    title: "Secure Sharing",
    desc: "Shareable links with per-user permissions, expiry, passwords, and a full access log.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    ),
    title: "Cloud Drive Creation",
    desc: "Provision drives in seconds. Set quotas, access policies, and RBAC from day one.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
    title: "File Explorer UI",
    desc: "A full browser-based file manager is coming — manage every drive from any device.",
    soon: true,
  },
];

export default function LandingV8a() {
  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Nav */}
      <header class="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
        <div class="mx-auto max-w-7xl px-8 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-6 w-6 rounded bg-stone-900 shrink-0" />
            <span class="font-semibold tracking-tight">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm text-stone-500">
            <a href="#product" class="hover:text-stone-900 transition-colors">Product</a>
            <a href="#enterprise" class="hover:text-stone-900 transition-colors">Enterprise</a>
            <a href="/pricing" class="hover:text-stone-900 transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-stone-900 transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm text-stone-500 hover:text-stone-900 transition-colors">Account</a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="rounded-full border-stone-300 text-stone-600">Dashboard</Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-5">Download</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero — left headline, right mockup */}
      <section class="py-20 px-8">
        <div class="mx-auto max-w-7xl grid lg:grid-cols-[1fr_480px] gap-16 xl:gap-24 items-center">

          {/* Left: headline */}
          <div>
            <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-7">Cloud storage that disappears into your workflow</p>
            <h1 class="text-6xl md:text-7xl font-light tracking-tight text-stone-900 leading-[1.02] mb-7">
              The cloud drive<br />
              that <em class="italic">feels</em> local.
            </h1>
            <p class="text-lg text-stone-500 leading-relaxed mb-9 max-w-md">
              OSDrive mounts your cloud storage natively in Finder, keeps a live filesystem index for instant access, and syncs across every device — automatically.
            </p>
            <div class="flex flex-wrap gap-3 mb-6">
              <a href="/download">
                <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-8 h-12">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download free
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="border-stone-300 text-stone-600 hover:bg-stone-100 rounded-full px-8 h-12">Dashboard →</Button>
              </a>
            </div>
            <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-400">
              {["macOS · Windows · Linux", "Free tier available", "99.99% SLA"].map((t) => (
                <span class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-stone-400"><polyline points="20 6 9 17 4 12"/></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: dashboard mockup */}
          <div class="relative">
            <div class="absolute -inset-4 bg-stone-200/40 rounded-3xl blur-2xl" />
            <div class="relative rounded-2xl border border-stone-200 bg-white shadow-xl overflow-hidden">
              {/* Browser chrome */}
              <div class="flex items-center gap-2 px-5 py-3 bg-stone-50 border-b border-stone-100">
                <div class="h-3 w-3 rounded-full bg-stone-200" />
                <div class="h-3 w-3 rounded-full bg-stone-200" />
                <div class="h-3 w-3 rounded-full bg-stone-200" />
                <div class="flex-1 mx-4">
                  <div class="mx-auto w-40 h-5 rounded bg-stone-100 flex items-center justify-center">
                    <span class="text-[10px] font-mono text-stone-400">app.osdrive.io</span>
                  </div>
                </div>
              </div>
              {/* App panel */}
              <div class="flex">
                <div class="w-36 shrink-0 border-r border-stone-100 bg-stone-50 p-3 space-y-1">
                  <p class="text-[9px] uppercase tracking-widest text-stone-400 px-2 mb-2">Workspace</p>
                  {[["All Drives", true], ["Shared", false], ["Recent", false], ["Trash", false]].map(([label, active]) => (
                    <div class={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${active ? "bg-stone-200 text-stone-900 font-medium" : "text-stone-400"}`}>
                      <div class={`h-1.5 w-1.5 rounded-full ${active ? "bg-stone-600" : "bg-stone-300"}`} />
                      {label}
                    </div>
                  ))}
                </div>
                <div class="flex-1 p-5">
                  <div class="flex items-center justify-between mb-4">
                    <span class="text-sm font-semibold text-stone-800">All Drives</span>
                    <button class="text-xs text-stone-400 border border-stone-200 rounded-md px-2.5 py-1">+ New</button>
                  </div>
                  <div class="space-y-2">
                    {drives.map((d) => (
                      <div class="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 px-3.5 py-2.5">
                        <div class={`h-7 w-7 rounded-lg ${d.col} flex items-center justify-center shrink-0`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="text-xs font-medium text-stone-800 truncate">{d.name}</div>
                          <div class="text-[10px] text-stone-400">{d.size} · {d.users} users</div>
                        </div>
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">{d.status}</span>
                      </div>
                    ))}
                  </div>
                  <div class="mt-3 pt-3 border-t border-stone-100 flex justify-between text-[10px] text-stone-400">
                    <span>4 drives · 15.7 TB</span>
                    <a href="/dashboard" class="hover:text-stone-700 underline">View all →</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* Capabilities — icon card grid */}
      <section id="product" class="py-20 px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-14">
            <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4">Product</p>
            <h2 class="text-4xl font-light text-stone-900 tracking-tight max-w-lg leading-snug">
              Everything you need, nothing you don't.
            </h2>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((c) => (
              <div class={`rounded-2xl border p-7 ${c.soon ? "border-dashed border-stone-200 bg-transparent" : "border-stone-150 bg-white shadow-sm"}`}>
                <div class="text-stone-400 mb-4">{c.icon}</div>
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-base font-semibold text-stone-900">{c.title}</h3>
                  {c.soon && <span class="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 border border-stone-200">Soon</span>}
                </div>
                <p class="text-stone-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers — dark section */}
      <section class="py-20 px-8 bg-stone-900">
        <div class="mx-auto max-w-7xl">
          <p class="text-xs text-stone-600 uppercase tracking-[0.2em] mb-12">Scale</p>
          <div class="grid md:grid-cols-3 gap-12">
            {[["10 billion", "files indexed", "across all active installations globally"], ["99.99%", "uptime", "measured continuously for two years"], ["< 50ms", "index latency", "for any filesystem operation on mounted drives"]].map(([v, u, d]) => (
              <div>
                <div class="text-5xl font-light text-stone-100 mb-2">{v}</div>
                <div class="text-stone-400 font-medium mb-2 text-sm">{u}</div>
                <div class="text-xs text-stone-600 leading-relaxed">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" class="py-20 px-8">
        <div class="mx-auto max-w-7xl grid md:grid-cols-2 gap-20 items-start">
          <div>
            <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-6">Enterprise</p>
            <h2 class="text-4xl font-light tracking-tight mb-6 leading-snug">
              Scales from one person<br />to your entire org
            </h2>
            <p class="text-stone-500 text-sm leading-relaxed mb-8">
              Start on the free tier and grow into SSO, SCIM, audit logs, data residency, and a dedicated SLA — same product, same native feel throughout.
            </p>
            <div class="flex gap-3">
              <a href="/contact">
                <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-8">Talk to sales</Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="border-stone-300 text-stone-600 hover:bg-stone-100 rounded-full px-8">Start free</Button>
              </a>
            </div>
          </div>
          <div>
            {["SSO (SAML 2.0, OIDC)", "SCIM provisioning & deprovisioning", "Role-based access control", "Immutable audit trail", "Custom data residency", "On-premise deployment", "Dedicated SLA & priority support", "Volume licensing & invoice billing"].map((item, i) => (
              <div>
                {i > 0 && <Separator class="bg-stone-100" />}
                <div class="flex items-center justify-between py-3.5">
                  <span class="text-stone-600 text-sm">{item}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-stone-300 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* CTA */}
      <section class="py-28 px-8">
        <div class="mx-auto max-w-xl text-center">
          <h2 class="text-5xl font-light tracking-tight mb-5 leading-tight">
            One download.<br />
            <span class="italic">Everything connected.</span>
          </h2>
          <p class="text-stone-500 mb-10">Mount your first cloud drive in Finder in under two minutes. Free to start.</p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/download">
              <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-10 h-12 text-base">Download OSDrive</Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="border-stone-300 text-stone-600 hover:bg-stone-100 rounded-full px-10 h-12 text-base">Open Dashboard</Button>
            </a>
          </div>
        </div>
      </section>

      <footer class="border-t border-stone-200 py-8 px-8">
        <div class="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-stone-400">
          <div class="flex items-center gap-2">
            <div class="h-4 w-4 rounded bg-stone-900" />
            <span class="font-medium text-stone-900">OSDrive</span>
            <span>© 2025</span>
          </div>
          <div class="flex flex-wrap justify-center gap-6">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "/security"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([l, h]) => (
              <a href={h} class="hover:text-stone-900 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
