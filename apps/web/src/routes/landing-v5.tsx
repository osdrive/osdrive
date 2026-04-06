import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

const capabilities = [
  {
    number: "01",
    title: "Mount anywhere",
    desc: "Your cloud drives appear natively in Finder and Windows Explorer. No extra software, no abstraction layers — just your files, where you expect them.",
  },
  {
    number: "02",
    title: "Indexed for speed",
    desc: "OSDrive maintains a live index of your entire filesystem. Searches, directory listings, and moves are near-instant, regardless of how large your drives grow.",
  },
  {
    number: "03",
    title: "Sync across devices",
    desc: "Changes made on any device propagate immediately. Whether you're on macOS, Linux, or Windows, your files are always current.",
  },
  {
    number: "04",
    title: "Share with precision",
    desc: "Create shareable links with fine-grained permissions. Set who can view, edit, or manage — with optional expiry and password protection.",
  },
];

const numbers = [
  { value: "10 billion", unit: "files indexed", desc: "across all active OSDrive installations" },
  { value: "99.99%", unit: "uptime", desc: "measured over the past 24 months" },
  { value: "< 50ms", unit: "index latency", desc: "for filesystem operations on mounted drives" },
];

export default function LandingV5() {
  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Nav */}
      <header class="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
        <div class="mx-auto max-w-6xl px-8 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-6 w-6 rounded bg-stone-900" />
            <span class="font-semibold tracking-tight text-stone-900">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm text-stone-500">
            <a href="#product" class="hover:text-stone-900 transition-colors">Product</a>
            <a href="#numbers" class="hover:text-stone-900 transition-colors">Numbers</a>
            <a href="/pricing" class="hover:text-stone-900 transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-stone-900 transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-4">
            <a href="/account" class="hidden sm:block text-sm text-stone-500 hover:text-stone-900 transition-colors">
              Account
            </a>
            <a href="/dashboard" class="hidden sm:block text-sm text-stone-500 hover:text-stone-900 transition-colors">
              Dashboard
            </a>
            <a href="/download">
              <Button size="sm" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-5">
                Download
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section class="py-32 px-8">
        <div class="mx-auto max-w-4xl">
          <p class="text-sm text-stone-400 uppercase tracking-[0.2em] mb-6">Cloud storage for serious work</p>
          <h1 class="text-6xl md:text-8xl font-light tracking-tight text-stone-900 leading-[1.02] mb-8">
            Your files.<br />
            <span class="italic">Everywhere</span><br />
            you work.
          </h1>
          <div class="max-w-lg">
            <p class="text-xl text-stone-500 leading-relaxed mb-12">
              OSDrive mounts, syncs, and shares your filesystems natively across every device — backed by an index that makes everything fast.
            </p>
            <div class="flex items-center gap-4">
              <a href="/download">
                <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-8 h-12 text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-8 h-12 text-base">
                  Dashboard →
                </Button>
              </a>
            </div>
            <p class="mt-5 text-xs text-stone-400">macOS · Windows · Linux · Free tier available</p>
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* Product */}
      <section id="product" class="py-28 px-8">
        <div class="mx-auto max-w-6xl">
          <div class="grid md:grid-cols-3 gap-16 mb-24">
            <div class="md:col-span-1">
              <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4">Product</p>
              <h2 class="text-3xl font-light text-stone-900 tracking-tight leading-snug">
                Designed for how you actually work
              </h2>
            </div>
            <div class="md:col-span-2 text-stone-600 leading-relaxed space-y-4">
              <p>
                Most cloud storage tools were built for consumers. OSDrive was designed for teams and individuals who treat their filesystem as critical infrastructure — where performance, reliability, and native integration matter.
              </p>
              <p>
                We keep a live index of your filesystem so that every operation — listing a directory, running a search, moving a file — returns immediately. And because your drives mount natively in Finder and Explorer, your existing tools and workflows continue to work without modification.
              </p>
            </div>
          </div>

          <div class="space-y-0">
            {capabilities.map((c, i) => (
              <div>
                {i > 0 && <Separator class="bg-stone-200" />}
                <div class="grid md:grid-cols-[80px_1fr_2fr] gap-8 py-10 items-start">
                  <div class="text-stone-300 font-light text-sm tracking-wider">{c.number}</div>
                  <h3 class="text-lg font-medium text-stone-900 tracking-tight">{c.title}</h3>
                  <p class="text-stone-500 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* Numbers */}
      <section id="numbers" class="py-28 px-8 bg-stone-900">
        <div class="mx-auto max-w-6xl">
          <p class="text-xs text-stone-500 uppercase tracking-[0.2em] mb-16">By the numbers</p>
          <div class="grid md:grid-cols-3 gap-12">
            {numbers.map((n) => (
              <div>
                <div class="text-5xl font-light text-stone-100 tracking-tight mb-2">{n.value}</div>
                <div class="text-stone-400 font-medium mb-2">{n.unit}</div>
                <div class="text-sm text-stone-600 leading-relaxed">{n.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section class="py-28 px-8">
        <div class="mx-auto max-w-6xl grid md:grid-cols-2 gap-20 items-start">
          <div>
            <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-6">Enterprise</p>
            <h2 class="text-4xl font-light tracking-tight text-stone-900 mb-6 leading-snug">
              For organisations that need more
            </h2>
            <p class="text-stone-500 leading-relaxed mb-8">
              OSDrive Enterprise adds SSO, SCIM provisioning, audit logs, custom data residency, and a dedicated SLA — managed through the same dashboard your team already uses.
            </p>
            <div class="flex gap-3">
              <a href="/contact">
                <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-8">
                  Talk to sales
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-8">
                  Try free
                </Button>
              </a>
            </div>
          </div>
          <div class="space-y-0">
            {[
              "Single sign-on (SAML 2.0, OIDC)",
              "SCIM provisioning & deprovisioning",
              "Role-based access control",
              "Immutable audit trail",
              "Custom data residency",
              "On-premise deployment option",
              "Dedicated SLA & priority support",
              "Volume licensing & invoice billing",
            ].map((item, i) => (
              <div>
                {i > 0 && <Separator class="bg-stone-100" />}
                <div class="flex items-center justify-between py-4">
                  <span class="text-stone-700 text-sm">{item}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-stone-400 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      {/* CTA */}
      <section class="py-32 px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-5xl font-light tracking-tight text-stone-900 mb-6 leading-tight">
            Begin with one drive.<br />
            <span class="italic">Keep everything.</span>
          </h2>
          <p class="text-stone-500 mb-10 text-lg leading-relaxed">
            Download OSDrive and have your first drive mounted in Finder in under two minutes.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/download">
              <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-10 h-13 text-base">
                Download OSDrive
              </Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-10 h-13 text-base">
                Open Dashboard
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="border-t border-stone-200 py-10 px-8">
        <div class="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-2 text-sm text-stone-400">
            <div class="h-4 w-4 rounded bg-stone-900" />
            <span class="font-medium text-stone-900">OSDrive</span>
            <span>© 2025</span>
          </div>
          <div class="flex flex-wrap justify-center gap-6 text-sm text-stone-400">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "/security"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([label, href]) => (
              <a href={href} class="hover:text-stone-900 transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
