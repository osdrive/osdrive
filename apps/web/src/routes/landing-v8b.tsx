// v8b: Stone Reveal — centred headline flows directly into a full-width mockup (no
// separator gap between them). Feature cards in a 2-col grid replace the monotonous list.
// No separators breaking the rhythm — sections breathe naturally with padding.
import { Button } from "~/components/ui/button";

const drives = [
  { name: "Engineering Shared Drive", size: "2.4 TB", status: "Mounted", users: 14, col: "bg-sky-500" },
  { name: "Design Assets", size: "890 GB", status: "Synced", users: 6, col: "bg-violet-500" },
  { name: "Client Deliverables", size: "340 GB", status: "Mounted", users: 23, col: "bg-emerald-500" },
  { name: "Backup Archive", size: "12.1 TB", status: "Synced", users: 2, col: "bg-amber-500" },
];

const features = [
  {
    title: "Appears in Finder",
    body: "Cloud drives mount as native volumes via a custom VFS layer. No extra apps, no FUSE. Spotlight, Quick Look, Git — every tool just works.",
    tag: "Mounting",
  },
  {
    title: "Indexed for instant speed",
    body: "A live in-memory + on-disk filesystem index means every directory listing, search, and move returns in milliseconds — on drives of any size.",
    tag: "Performance",
  },
  {
    title: "Syncs automatically",
    body: "Block-level delta sync pushes only what changed. Edit on one device and it's there on all the others before you switch windows.",
    tag: "Sync",
  },
  {
    title: "Share precisely",
    body: "Create links for any file or drive. Set view or edit access, an expiry date, and an optional password — then see the access log from the dashboard.",
    tag: "Sharing",
  },
  {
    title: "Cloud drives, your way",
    body: "Provision a drive in seconds. Set quotas, configure RBAC, and retire drives — all from a single dashboard that scales from one drive to thousands.",
    tag: "Management",
  },
  {
    title: "File Explorer UI",
    body: "A full browser-based file manager is in development. Browse, preview, and organise every drive from any device, without installing anything.",
    tag: "Coming soon",
    soon: true,
  },
];

export default function LandingV8b() {
  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Nav */}
      <header class="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
        <div class="mx-auto max-w-6xl px-8 flex h-16 items-center justify-between">
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

      {/* Hero — centred, then mockup flows directly below */}
      <section class="pt-24 pb-0 px-8">
        <div class="mx-auto max-w-4xl text-center mb-14">
          <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-7">Cloud storage for serious work</p>
          <h1 class="text-6xl md:text-8xl font-light tracking-tight text-stone-900 leading-[1.02] mb-8">
            Your files.<br />
            <span class="italic">Everywhere</span><br />
            you work.
          </h1>
          <p class="text-xl text-stone-500 leading-relaxed mb-10 max-w-xl mx-auto">
            OSDrive mounts cloud drives natively in Finder, indexes them for instant access, and keeps them synced across every device you own.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4 mb-5">
            <a href="/download">
              <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-10 h-12 text-base">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download free
              </Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="border-stone-300 text-stone-600 hover:bg-stone-100 rounded-full px-10 h-12 text-base">
                Open dashboard →
              </Button>
            </a>
          </div>
          <p class="text-xs text-stone-400">macOS · Windows · Linux · Free tier available</p>
        </div>

        {/* Mockup — directly below the headline, no separator */}
        <div class="mx-auto max-w-5xl relative">
          {/* Soft shadow-glow behind the mockup */}
          <div class="absolute -inset-6 -bottom-0 bg-stone-200/50 rounded-3xl blur-3xl pointer-events-none" />
          <div class="relative rounded-t-2xl border border-stone-200 border-b-0 bg-white shadow-xl overflow-hidden">
            {/* Browser chrome */}
            <div class="flex items-center gap-2 px-5 py-3.5 bg-stone-50 border-b border-stone-100">
              <div class="h-3 w-3 rounded-full bg-stone-200" />
              <div class="h-3 w-3 rounded-full bg-stone-200" />
              <div class="h-3 w-3 rounded-full bg-stone-200" />
              <div class="flex-1 mx-6">
                <div class="mx-auto w-48 h-5 rounded-md bg-stone-100 flex items-center justify-center">
                  <span class="text-[10px] text-stone-400 font-mono">app.osdrive.io/drives</span>
                </div>
              </div>
              <div class="flex gap-1.5">
                <div class="h-5 w-12 rounded bg-stone-100" />
                <div class="h-5 w-16 rounded bg-stone-100" />
              </div>
            </div>
            {/* App layout */}
            <div class="flex min-h-[260px]">
              <div class="w-44 border-r border-stone-100 bg-stone-50 p-4 space-y-0.5 shrink-0">
                <p class="text-[9px] uppercase tracking-widest text-stone-400 px-2 mb-3">Workspace</p>
                {[["All Drives", true], ["Shared with me", false], ["Recent", false], ["Trash", false]].map(([item, active]) => (
                  <div class={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-default ${active ? "bg-stone-200 text-stone-900 font-medium" : "text-stone-500"}`}>
                    <div class={`h-1.5 w-1.5 rounded-full shrink-0 ${active ? "bg-stone-700" : "bg-stone-300"}`} />
                    {item}
                  </div>
                ))}
              </div>
              <div class="flex-1 p-6">
                <div class="flex items-center justify-between mb-5">
                  <div>
                    <h3 class="text-sm font-semibold text-stone-800">All Drives</h3>
                    <p class="text-xs text-stone-400 mt-0.5">4 drives · 15.7 TB total</p>
                  </div>
                  <button class="text-xs text-stone-400 border border-stone-200 rounded-md px-3 py-1 cursor-default">+ New drive</button>
                </div>
                <div class="space-y-2">
                  {drives.map((d) => (
                    <div class="flex items-center gap-4 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
                      <div class={`h-8 w-8 rounded-lg ${d.col} flex items-center justify-center shrink-0`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-stone-800 truncate">{d.name}</div>
                        <div class="text-xs text-stone-400">{d.size} · {d.users} users</div>
                      </div>
                      <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — 2-col card grid, no separators */}
      <section id="product" class="pt-20 pb-20 px-8">
        <div class="mx-auto max-w-6xl">
          <div class="mb-12">
            <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4">Product</p>
            <h2 class="text-3xl font-light text-stone-900 tracking-tight max-w-sm leading-snug">
              Everything in one product, nothing missing.
            </h2>
          </div>
          <div class="grid md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div class={`rounded-2xl p-7 ${f.soon ? "border border-dashed border-stone-200 bg-transparent" : "bg-white border border-stone-100 shadow-sm"}`}>
                <div class="flex items-start justify-between mb-4">
                  <span class={`text-xs px-2.5 py-1 rounded-full border ${f.soon ? "bg-stone-50 text-stone-400 border-stone-200" : "bg-stone-100 text-stone-500 border-stone-200"}`}>{f.tag}</span>
                </div>
                <h3 class="text-lg font-semibold text-stone-900 mb-3 leading-tight">{f.title}</h3>
                <p class="text-stone-500 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers — dark, no separator needed, the bg change creates the division */}
      <section class="py-20 px-8 bg-stone-900">
        <div class="mx-auto max-w-6xl">
          <p class="text-xs text-stone-600 uppercase tracking-[0.2em] mb-12">By the numbers</p>
          <div class="grid md:grid-cols-3 gap-12">
            {[["10 billion", "files indexed", "across all active OSDrive installations"], ["99.99%", "uptime", "measured continuously over the past two years"], ["< 50ms", "index latency", "for filesystem operations on any mounted drive"]].map(([v, u, d]) => (
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
        <div class="mx-auto max-w-6xl grid md:grid-cols-2 gap-20 items-start">
          <div>
            <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-6">Enterprise</p>
            <h2 class="text-4xl font-light tracking-tight mb-6 leading-snug">
              Starts personal.<br />Scales enterprise.
            </h2>
            <p class="text-stone-500 text-sm leading-relaxed mb-8">
              Begin on the free tier and add SSO, SCIM, audit logs, data residency, and a dedicated SLA when your organisation needs them — without rearchitecting anything.
            </p>
            <div class="flex gap-3">
              <a href="/contact">
                <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-8">Talk to sales</Button>
              </a>
              <a href="/download">
                <Button variant="outline" size="lg" class="border-stone-300 text-stone-600 hover:bg-stone-100 rounded-full px-8">Start free</Button>
              </a>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            {[
              ["SSO & SCIM", "SAML, OIDC, auto-provisioning"],
              ["RBAC", "Per-drive access control"],
              ["Audit trail", "Immutable access history"],
              ["Data residency", "Custom region or on-premise"],
              ["99.99% SLA", "With dedicated support"],
              ["Volume licensing", "Invoice billing & custom terms"],
            ].map(([t, d]) => (
              <div class="rounded-xl border border-stone-100 bg-white p-5 shadow-sm">
                <div class="text-sm font-semibold text-stone-800 mb-1">{t}</div>
                <div class="text-xs text-stone-400 leading-relaxed">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-28 px-8 bg-stone-100">
        <div class="mx-auto max-w-xl text-center">
          <h2 class="text-5xl font-light tracking-tight mb-5 leading-tight">
            One download.<br />
            <span class="italic">Everything connected.</span>
          </h2>
          <p class="text-stone-500 mb-10">Mount your first cloud drive in Finder in under two minutes. Free to start, no card required.</p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/download">
              <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-10 h-12 text-base">Download OSDrive</Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="bg-white border-stone-300 text-stone-600 hover:bg-stone-50 rounded-full px-10 h-12 text-base">Open Dashboard</Button>
            </a>
          </div>
        </div>
      </section>

      <footer class="border-t border-stone-200 py-8 px-8 bg-stone-50">
        <div class="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-stone-400">
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
