// Design v14: Warm Cream — amber/stone tones throughout, intimate and inviting.
// More personal than v5, warmer palette, feels like a premium prosumer product.
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

const features = [
  {
    number: "01",
    title: "Appears in Finder",
    desc: "Your cloud drives mount as native volumes — no abstraction layers, no friction. Every app on your Mac sees them exactly like a local disk.",
  },
  {
    number: "02",
    title: "Indexed for speed",
    desc: "We keep a live index of your filesystem so every search, listing, and move returns instantly — no waiting on network round-trips.",
  },
  {
    number: "03",
    title: "Syncs automatically",
    desc: "Save on one device and it's there on all of them. OSDrive handles the sync in the background, always, without you noticing.",
  },
  {
    number: "04",
    title: "Share with precision",
    desc: "Create links with view or edit permissions, optional expiry, and password protection — then see exactly who accessed what.",
  },
  {
    number: "05",
    title: "Create cloud drives",
    desc: "Provision drives in seconds from the dashboard. Set quotas, access controls, and sharing policies from day one.",
  },
];

export default function LandingV14() {
  return (
    <div class="min-h-screen font-sans" style="background-color: #faf8f5; color: #1c1917;">
      {/* Nav */}
      <header class="sticky top-0 z-50 backdrop-blur-sm border-b" style="background: rgba(250,248,245,0.95); border-color: #e7e0d8;">
        <div class="mx-auto max-w-6xl px-8 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-7 w-7 rounded-full flex items-center justify-center shrink-0" style="background: #78350f;">
              <span class="text-amber-100 font-bold text-[10px]">OS</span>
            </div>
            <span class="font-semibold tracking-tight" style="color: #1c1917;">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm" style="color: #78716c;">
            <a href="#product" class="transition-colors hover:text-stone-900">Product</a>
            <a href="#enterprise" class="transition-colors hover:text-stone-900">Enterprise</a>
            <a href="/pricing" class="transition-colors hover:text-stone-900">Pricing</a>
            <a href="/docs" class="transition-colors hover:text-stone-900">Docs</a>
          </nav>
          <div class="flex items-center gap-4">
            <a href="/account" class="hidden sm:block text-sm transition-colors" style="color: #78716c;">Account</a>
            <a href="/dashboard" class="hidden sm:block text-sm transition-colors" style="color: #78716c;">Dashboard</a>
            <a href="/download">
              <Button size="sm" class="rounded-full px-5 text-amber-50 hover:opacity-90" style="background: #78350f;">Download</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section class="py-32 px-8">
        <div class="mx-auto max-w-5xl grid md:grid-cols-[3fr_2fr] gap-16 items-end">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] mb-8" style="color: #a8956e;">Cloud storage for thoughtful people</p>
            <h1 class="font-light tracking-tight leading-[1.02] mb-0" style="font-size: clamp(52px, 7vw, 88px); color: #1c1917;">
              Your files<br />
              should feel<br />
              <em style="color: #78350f; font-style: italic;">effortless.</em>
            </h1>
          </div>
          <div class="md:pb-2">
            <p class="leading-relaxed mb-8" style="font-size: 1.1rem; color: #78716c;">
              OSDrive mounts cloud drives natively in Finder, syncs everything automatically, and keeps a live index so nothing is ever slow.
            </p>
            <div class="flex flex-col gap-3 mb-6">
              <a href="/download">
                <Button size="lg" class="rounded-full px-8 h-12 text-base text-amber-50 hover:opacity-90" style="background: #78350f;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download free
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="rounded-full px-8 h-12 text-base" style="border-color: #d6c9b5; color: #57534e;">Dashboard →</Button>
              </a>
            </div>
            <p class="text-xs" style="color: #a8956e;">macOS · Windows · Linux · Free to start</p>
          </div>
        </div>
      </section>

      <div style="border-top: 1px solid #e7e0d8;" />

      {/* Pull quote */}
      <section class="py-16 px-8">
        <div class="mx-auto max-w-3xl text-center">
          <p class="text-2xl md:text-3xl font-light leading-relaxed italic" style="color: #57534e;">
            "We built OSDrive because cloud storage always felt like a compromise — you either got consumer simplicity or enterprise control. We wanted both."
          </p>
          <p class="mt-6 text-sm" style="color: #a8956e;">— The OSDrive team</p>
        </div>
      </section>

      <div style="border-top: 1px solid #e7e0d8;" />

      {/* Features */}
      <section id="product" class="py-20 px-8">
        <div class="mx-auto max-w-6xl">
          <div class="grid md:grid-cols-[200px_1fr] gap-16 mb-16">
            <div>
              <p class="text-xs uppercase tracking-[0.2em] mb-4" style="color: #a8956e;">How it works</p>
              <h2 class="text-3xl font-light tracking-tight leading-snug" style="color: #1c1917;">Five things done exceptionally well</h2>
            </div>
            <p class="self-center leading-relaxed" style="color: #78716c; max-width: 520px;">
              We started from first principles: why does accessing cloud storage always feel slower than local storage? Everything in OSDrive is an answer to that question.
            </p>
          </div>
          {features.map((f, i) => (
            <div>
              {i > 0 && <div style="border-top: 1px solid #ede8e0;" />}
              <div class="grid md:grid-cols-[56px_200px_1fr] gap-8 py-9 items-start">
                <span class="text-sm font-light" style="color: #c4b8a2;">{f.number}</span>
                <h3 class="text-base font-medium" style="color: #1c1917;">{f.title}</h3>
                <p class="text-sm leading-relaxed" style="color: #78716c;">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers — warm dark section */}
      <section class="py-20 px-8" style="background: #292524; color: white;">
        <div class="mx-auto max-w-6xl">
          <p class="text-xs uppercase tracking-[0.2em] mb-12" style="color: #78716c;">By the numbers</p>
          <div class="grid md:grid-cols-3 gap-12">
            {[
              ["10 billion", "files indexed", "across all active installations"],
              ["99.99%", "uptime", "measured continuously for two years"],
              ["< 50ms", "index latency", "for any filesystem operation"],
            ].map(([v, u, d]) => (
              <div>
                <div class="text-5xl font-light mb-2" style="color: #faf8f5;">{v}</div>
                <div class="font-medium mb-2" style="color: #a8956e; font-size: 0.9rem;">{u}</div>
                <div class="text-sm leading-relaxed" style="color: #57534e;">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" class="py-20 px-8">
        <div class="mx-auto max-w-6xl grid md:grid-cols-2 gap-20 items-start">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] mb-6" style="color: #a8956e;">Enterprise</p>
            <h2 class="text-4xl font-light tracking-tight leading-snug mb-6" style="color: #1c1917;">
              Starts personal.<br />Scales to enterprise.
            </h2>
            <p class="leading-relaxed mb-8 text-sm" style="color: #78716c;">
              OSDrive works beautifully for a solo creator and scales to 10,000 seats without changing the experience — SSO, audit logs, data residency, and dedicated support when you need them.
            </p>
            <div class="flex gap-3">
              <a href="/contact">
                <Button size="lg" class="rounded-full px-8 text-amber-50 hover:opacity-90" style="background: #78350f;">Talk to sales</Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="rounded-full px-8" style="border-color: #d6c9b5; color: #57534e;">Start free</Button>
              </a>
            </div>
          </div>
          <div>
            {["SSO (SAML 2.0, OIDC)", "SCIM provisioning", "Role-based access control", "Immutable audit trail", "Custom data residency", "On-premise deployment", "Dedicated SLA & support", "Volume licensing"].map((item, i) => (
              <div>
                {i > 0 && <div style="border-top: 1px solid #ede8e0;" />}
                <div class="flex items-center justify-between py-3.5">
                  <span class="text-sm" style="color: #57534e;">{item}</span>
                  <div class="h-1.5 w-1.5 rounded-full shrink-0" style="background: #a8956e;" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style="border-top: 1px solid #e7e0d8;" />

      {/* CTA */}
      <section class="py-28 px-8 text-center">
        <h2 class="text-5xl font-light tracking-tight leading-tight mb-6" style="color: #1c1917;">
          Your first drive,<br />
          <em style="color: #78350f;">mounted in minutes.</em>
        </h2>
        <p class="mb-10 max-w-sm mx-auto" style="color: #78716c; font-size: 1.1rem; line-height: 1.7;">
          Download OSDrive and experience cloud storage that disappears into your workflow.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/download">
            <Button size="lg" class="rounded-full px-10 h-12 text-base text-amber-50 hover:opacity-90" style="background: #78350f;">Download OSDrive</Button>
          </a>
          <a href="/dashboard">
            <Button variant="outline" size="lg" class="rounded-full px-10 h-12 text-base" style="border-color: #d6c9b5; color: #57534e;">Open Dashboard</Button>
          </a>
        </div>
      </section>

      <footer style="border-top: 1px solid #e7e0d8;" class="py-8 px-8">
        <div class="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm" style="color: #a8956e;">
          <div class="flex items-center gap-2">
            <div class="h-4 w-4 rounded-full" style="background: #78350f;" />
            <span class="font-medium" style="color: #1c1917;">OSDrive</span>
            <span>© 2025</span>
          </div>
          <div class="flex flex-wrap justify-center gap-6">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([l, h]) => (
              <a href={h} class="transition-colors hover:text-stone-800">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
