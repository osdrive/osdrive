// Design v12: Stone + Indigo — v5's minimal stone palette refined with an indigo accent.
// More visual personality than v5, with pill buttons, a product mockup, and clearer hierarchy.
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

const drives = [
  { name: "Engineering Drive", size: "2.4 TB", users: 14, status: "Mounted", bar: "w-3/5" },
  { name: "Design Assets", size: "890 GB", users: 6, status: "Synced", bar: "w-2/5" },
  { name: "Client Work", size: "340 GB", users: 23, status: "Mounted", bar: "w-1/4" },
];

const capabilities = [
  { n: "01", title: "Native mounting", desc: "Cloud drives appear in Finder and Explorer as local volumes. Open them with any app, any tool, no modification needed." },
  { n: "02", title: "Live index", desc: "A continuously updated filesystem index means directory listings and searches take milliseconds — not seconds." },
  { n: "03", title: "Automatic sync", desc: "Changes propagate to every device the moment they happen. No manual triggers, no version confusion." },
  { n: "04", title: "Link sharing", desc: "Share files or entire drives with a link. Set view/edit access, expiry, and a password — all from the dashboard." },
];

export default function LandingV12() {
  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Nav */}
      <header class="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
        <div class="mx-auto max-w-6xl px-8 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <span class="text-white font-bold text-[10px]">OS</span>
            </div>
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
            <a href="/dashboard" class="hidden sm:block">
              <Button variant="outline" size="sm" class="rounded-full border-stone-300 text-stone-700">Dashboard</Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5">Download</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section class="pt-24 pb-16 px-8">
        <div class="mx-auto max-w-4xl">
          <Badge variant="outline" class="mb-8 border-indigo-200 text-indigo-600 bg-indigo-50 text-xs px-3 py-1 rounded-full">
            Cloud storage for everyone — enterprise-ready from day one
          </Badge>
          <h1 class="text-6xl md:text-8xl font-light tracking-tight text-stone-900 leading-[1.02] mb-6">
            Your files,<br />
            <em class="not-italic text-indigo-600">always there.</em>
          </h1>
          <div class="max-w-xl">
            <p class="text-xl text-stone-500 leading-relaxed mb-10">
              OSDrive mounts your cloud drives natively in Finder, keeps them synced across every device, and makes every operation instant with a live filesystem index.
            </p>
            <div class="flex flex-wrap gap-3 mb-5">
              <a href="/download">
                <Button size="lg" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-12 text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download free
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-8 h-12 text-base">Open dashboard →</Button>
              </a>
            </div>
            <p class="text-xs text-stone-400">macOS · Windows · Linux · No credit card required</p>
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* Mockup */}
      <section class="py-16 px-8">
        <div class="mx-auto max-w-4xl">
          <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-6">Dashboard</p>
          <div class="rounded-2xl border border-stone-200 bg-white shadow-lg overflow-hidden">
            <div class="flex items-center gap-2 px-5 py-3.5 bg-stone-50 border-b border-stone-100">
              <div class="h-3 w-3 rounded-full bg-stone-200" />
              <div class="h-3 w-3 rounded-full bg-stone-200" />
              <div class="h-3 w-3 rounded-full bg-stone-200" />
              <div class="mx-auto flex h-6 w-44 items-center justify-center rounded-md bg-stone-100">
                <span class="text-[10px] font-mono text-stone-400">app.osdrive.io</span>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h3 class="text-sm font-semibold text-stone-800">Your drives</h3>
                  <p class="text-xs text-stone-400 mt-0.5">3 drives · 3.6 TB total</p>
                </div>
                <button class="text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 rounded-full px-3 py-1.5 hover:bg-indigo-100 transition-colors">+ Add drive</button>
              </div>
              <div class="space-y-3">
                {drives.map((d) => (
                  <div class="rounded-xl border border-stone-100 bg-stone-50 p-4">
                    <div class="flex items-center gap-3 mb-3">
                      <div class="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-stone-800 truncate">{d.name}</div>
                        <div class="text-xs text-stone-400">{d.size} · {d.users} users</div>
                      </div>
                      <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">{d.status}</span>
                    </div>
                    <div class="h-1 bg-stone-200 rounded-full overflow-hidden">
                      <div class={`h-full bg-indigo-400 rounded-full ${d.bar}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* Capabilities */}
      <section id="product" class="py-20 px-8">
        <div class="mx-auto max-w-6xl">
          <div class="grid md:grid-cols-[220px_1fr] gap-16 mb-16">
            <div>
              <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4">Product</p>
              <h2 class="text-3xl font-light text-stone-900 tracking-tight leading-snug">Why OSDrive is different</h2>
            </div>
            <p class="self-center text-stone-500 leading-relaxed">
              Most cloud storage requires you to adapt your workflow. OSDrive adapts to yours — native mounting, live indexing, and automatic sync mean you never have to think about where your files are.
            </p>
          </div>
          {capabilities.map((c, i) => (
            <div>
              {i > 0 && <Separator class="bg-stone-100" />}
              <div class="grid md:grid-cols-[64px_220px_1fr] gap-8 py-8 items-start">
                <span class="text-stone-300 text-sm">{c.n}</span>
                <h3 class="text-base font-medium text-stone-900">{c.title}</h3>
                <p class="text-stone-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* Numbers */}
      <section class="py-20 px-8 bg-indigo-600 text-white">
        <div class="mx-auto max-w-6xl">
          <p class="text-xs text-indigo-300 uppercase tracking-[0.2em] mb-12">Scale</p>
          <div class="grid md:grid-cols-4 gap-10">
            {[["10B+", "files indexed"], ["500K+", "drives mounted"], ["2,000+", "enterprise teams"], ["99.99%", "uptime SLA"]].map(([v, l]) => (
              <div>
                <div class="text-4xl font-light mb-1">{v}</div>
                <div class="text-indigo-300 text-sm">{l}</div>
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
              The controls your<br />IT team requires
            </h2>
            <p class="text-stone-500 leading-relaxed mb-8 text-sm">
              SSO, SCIM, audit logs, data residency, and a dedicated SLA — everything your security team needs, without changing how your people work.
            </p>
            <div class="flex gap-3">
              <a href="/contact">
                <Button size="lg" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8">Talk to sales</Button>
              </a>
              <a href="/download">
                <Button variant="outline" size="lg" class="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-8">Start free</Button>
              </a>
            </div>
          </div>
          <div>
            {["SSO (SAML 2.0, OIDC)", "SCIM provisioning & deprovisioning", "Role-based access control", "Immutable audit trail", "Custom data residency", "On-premise deployment", "Dedicated SLA & priority support", "Volume licensing & invoice billing"].map((item, i) => (
              <div>
                {i > 0 && <Separator class="bg-stone-100" />}
                <div class="flex items-center justify-between py-3.5">
                  <span class="text-stone-700 text-sm">{item}</span>
                  <div class="h-1.5 w-1.5 rounded-full bg-indigo-300 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* CTA */}
      <section class="py-28 px-8 text-center">
        <h2 class="text-5xl font-light tracking-tight mb-5 leading-tight">
          One download.<br />
          <em class="not-italic text-indigo-600">Every file, everywhere.</em>
        </h2>
        <p class="text-stone-500 mb-10 max-w-sm mx-auto">Mount your first cloud drive in Finder in under two minutes. Free to start.</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/download">
            <Button size="lg" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-12 text-base">Download OSDrive</Button>
          </a>
          <a href="/dashboard">
            <Button variant="outline" size="lg" class="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-10 h-12 text-base">Open Dashboard</Button>
          </a>
        </div>
      </section>

      <footer class="border-t border-stone-200 py-8 px-8">
        <div class="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-stone-400">
          <div class="flex items-center gap-2">
            <div class="h-4 w-4 rounded bg-indigo-600" />
            <span class="font-medium text-stone-900">OSDrive</span>
            <span>© 2025</span>
          </div>
          <div class="flex flex-wrap justify-center gap-6">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([l, h]) => (
              <a href={h} class="hover:text-stone-900 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
