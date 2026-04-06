// Design v8: v5 Refined — stone palette, italic/light typography, but adds a centred
// browser-frame dashboard mockup and strengthens the consumer + enterprise balance.
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

const capabilities = [
  {
    number: "01",
    title: "Mount in Finder",
    desc: "Your cloud drives appear as native volumes in Finder, Windows Explorer, and the Linux file manager. No extra apps, no abstraction — just your files where you expect them.",
  },
  {
    number: "02",
    title: "Indexed for instant speed",
    desc: "We maintain a live index of your filesystem so every directory listing, search, and move returns in milliseconds — no matter how large your drives get.",
  },
  {
    number: "03",
    title: "Sync everywhere, automatically",
    desc: "Edit on your Mac, pick up on your work PC, continue on your phone. OSDrive keeps everything in sync without you thinking about it.",
  },
  {
    number: "04",
    title: "Share precisely",
    desc: "Send a link to a file or an entire drive. Set view or edit permissions, an expiry date, and an optional password — all from the dashboard.",
  },
  {
    number: "05",
    title: "Create and manage drives",
    desc: "Provision cloud drives in seconds, set quotas, and manage access from a single dashboard. Scale from one personal drive to hundreds of team shares.",
  },
];

const drives = [
  { name: "Engineering Shared Drive", size: "2.4 TB", status: "Mounted", users: 14, col: "bg-sky-500" },
  { name: "Design Assets", size: "890 GB", status: "Synced", users: 6, col: "bg-violet-500" },
  { name: "Client Deliverables", size: "340 GB", status: "Mounted", users: 23, col: "bg-emerald-500" },
  { name: "Backup Archive", size: "12.1 TB", status: "Synced", users: 2, col: "bg-amber-500" },
];

export default function LandingV8() {
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
          <div class="flex items-center gap-4">
            <a href="/account" class="hidden sm:block text-sm text-stone-500 hover:text-stone-900 transition-colors">Account</a>
            <a href="/dashboard" class="hidden sm:block text-sm text-stone-500 hover:text-stone-900 transition-colors">Dashboard</a>
            <a href="/download">
              <Button size="sm" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-5">Download</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section class="py-28 px-8">
        <div class="mx-auto max-w-5xl grid md:grid-cols-2 gap-12 items-end">
          <div>
            <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-6">Cloud storage that disappears</p>
            <h1 class="text-6xl md:text-7xl font-light tracking-tight text-stone-900 leading-[1.02]">
              The cloud drive<br />
              that <span class="italic">feels</span> local.
            </h1>
          </div>
          <div class="md:pb-2">
            <p class="text-lg text-stone-500 leading-relaxed mb-8">
              OSDrive mounts your cloud storage natively in Finder, keeps it synced across every device, and maintains a live filesystem index so everything stays fast.
            </p>
            <div class="flex items-center gap-4 mb-5">
              <a href="/download">
                <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-8 h-12">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-8 h-12">
                  Dashboard →
                </Button>
              </a>
            </div>
            <p class="text-xs text-stone-400">macOS · Windows · Linux · Free to start</p>
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* Dashboard Mockup */}
      <section class="py-20 px-8">
        <div class="mx-auto max-w-5xl">
          <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-8 text-center">The dashboard</p>
          <div class="rounded-2xl border border-stone-200 bg-white shadow-xl overflow-hidden">
            {/* Browser chrome */}
            <div class="flex items-center gap-2 px-5 py-3.5 border-b border-stone-100 bg-stone-50">
              <div class="h-3 w-3 rounded-full bg-stone-200" />
              <div class="h-3 w-3 rounded-full bg-stone-200" />
              <div class="h-3 w-3 rounded-full bg-stone-200" />
              <div class="flex-1 mx-6">
                <div class="mx-auto w-48 h-5 rounded-md bg-stone-100 flex items-center justify-center">
                  <span class="text-[10px] text-stone-400 font-mono">app.osdrive.io/drives</span>
                </div>
              </div>
            </div>
            {/* App layout */}
            <div class="flex min-h-[280px]">
              {/* Sidebar */}
              <div class="w-48 border-r border-stone-100 bg-stone-50 p-4 space-y-1 shrink-0">
                <p class="text-[10px] uppercase tracking-widest text-stone-400 px-2 mb-3">Workspace</p>
                {[["All Drives", true], ["Shared with me", false], ["Recent", false], ["Trash", false]].map(([item, active]) => (
                  <div class={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${active ? "bg-stone-200 text-stone-900 font-medium" : "text-stone-500"}`}>
                    <div class={`h-1.5 w-1.5 rounded-full ${active ? "bg-stone-600" : "bg-stone-300"}`} />
                    {item}
                  </div>
                ))}
              </div>
              {/* Main area */}
              <div class="flex-1 p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-stone-800">All Drives</h3>
                  <button class="text-xs text-stone-400 border border-stone-200 rounded-md px-3 py-1 hover:bg-stone-50">+ New drive</button>
                </div>
                <div class="space-y-2">
                  {drives.map((d) => (
                    <div class="flex items-center gap-4 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3">
                      <div class={`h-8 w-8 rounded-lg ${d.col} flex items-center justify-center shrink-0`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
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
          <p class="text-center text-xs text-stone-400 mt-4">
            Manage all your drives at <a href="/dashboard" class="underline hover:text-stone-700">app.osdrive.io</a>
          </p>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* Capabilities */}
      <section id="product" class="py-20 px-8">
        <div class="mx-auto max-w-6xl">
          <div class="grid md:grid-cols-[200px_1fr] gap-16 mb-16">
            <div>
              <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4">How it works</p>
              <h2 class="text-2xl font-light text-stone-900 tracking-tight leading-snug">Five things OSDrive does exceptionally well</h2>
            </div>
            <p class="text-stone-500 leading-relaxed self-center">
              We started with the question: why does accessing cloud storage always feel slower and more cumbersome than local storage? OSDrive is our answer.
            </p>
          </div>
          <div class="space-y-0">
            {capabilities.map((c, i) => (
              <div>
                {i > 0 && <Separator class="bg-stone-150" />}
                <div class="grid md:grid-cols-[64px_200px_1fr] gap-8 py-8 items-start">
                  <span class="text-stone-300 font-light text-sm">{c.number}</span>
                  <h3 class="text-base font-medium text-stone-900">{c.title}</h3>
                  <p class="text-stone-500 text-sm leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* Numbers */}
      <section class="py-20 px-8 bg-stone-900">
        <div class="mx-auto max-w-6xl">
          <p class="text-xs text-stone-600 uppercase tracking-[0.2em] mb-12">By the numbers</p>
          <div class="grid md:grid-cols-3 gap-12">
            {[["10 billion", "files indexed", "across all active OSDrive installations worldwide"], ["99.99%", "uptime", "measured continuously over the past two years"], ["< 50ms", "index latency", "for filesystem operations on any mounted drive"]].map(([v, u, d]) => (
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
            <h2 class="text-4xl font-light tracking-tight text-stone-900 mb-6 leading-snug">
              Scales from one person<br />to your entire company
            </h2>
            <p class="text-stone-500 leading-relaxed mb-8 text-sm">
              Start with the free tier and grow into full enterprise controls — SSO, SCIM, audit logs, data residency, and a dedicated SLA — without changing how you work.
            </p>
            <div class="flex gap-3">
              <a href="/contact">
                <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-8">Talk to sales</Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-8">Start free</Button>
              </a>
            </div>
          </div>
          <div>
            {[
              "Single sign-on (SAML 2.0, OIDC)",
              "SCIM provisioning & deprovisioning",
              "Role-based access control",
              "Immutable audit trail",
              "Custom data residency",
              "On-premise deployment",
              "Dedicated SLA & priority support",
              "Volume licensing & invoice billing",
            ].map((item, i) => (
              <div>
                {i > 0 && <Separator class="bg-stone-100" />}
                <div class="flex items-center justify-between py-3.5">
                  <span class="text-stone-600 text-sm">{item}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-stone-300"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* CTA */}
      <section class="py-28 px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-5xl font-light tracking-tight text-stone-900 mb-6 leading-tight">
            One download.<br />
            <span class="italic">Everything connected.</span>
          </h2>
          <p class="text-stone-500 mb-10 leading-relaxed">
            Mount your first cloud drive in Finder in under two minutes. Free to start, no card required.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/download">
              <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-10 h-12 text-base">Download OSDrive</Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-10 h-12 text-base">Open Dashboard</Button>
            </a>
          </div>
        </div>
      </section>

      <footer class="border-t border-stone-200 py-8 px-8">
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
