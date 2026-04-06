import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
    ),
    title: "Native Drive Mounting",
    desc: "Mount cloud shares directly in Finder or Windows Explorer. Access your files as if they're local — no third-party tools required.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
    ),
    title: "Cross-Device Sync",
    desc: "Keep files in sync across all your devices automatically. Changes propagate instantly with conflict-free resolution.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    ),
    title: "Indexed Filesystem",
    desc: "We maintain a live index of your filesystem so every search, move, and browse operation is near-instant, regardless of directory size.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
    ),
    title: "Secure File Sharing",
    desc: "Share files and folders with granular permissions. Set expiry dates, password protection, and access logs for full visibility.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    ),
    title: "Cloud Drive Creation",
    desc: "Provision cloud drives in seconds from your dashboard. Define quotas, policies, and access controls per drive.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
    title: "File Explorer UI",
    desc: "A full-featured browser-based file explorer is coming — manage, preview, and organise your drives from any device, anywhere.",
  },
];

const stats = [
  { value: "10B+", label: "Files Indexed" },
  { value: "500K+", label: "Active Mounts" },
  { value: "2,000+", label: "Enterprises" },
  { value: "99.99%", label: "Uptime SLA" },
];

export default function Page() {
  return (
    <div class="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Nav */}
      <header class="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div class="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-white flex items-center justify-center shrink-0">
              <span class="text-zinc-950 font-bold text-xs tracking-tight">OS</span>
            </div>
            <span class="font-semibold text-lg tracking-tight">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" class="hover:text-white transition-colors">Features</a>
            <a href="#enterprise" class="hover:text-white transition-colors">Enterprise</a>
            <a href="/docs" class="hover:text-white transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">Account</a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                Dashboard
              </Button>
            </a>
            <a href="/download">
              <Button size="sm">
                Download
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section class="relative pt-40 pb-28 px-6 overflow-hidden">
        <div
          class="pointer-events-none absolute inset-0 opacity-30"
          style="background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 64px 64px;"
        />
        <div class="relative mx-auto max-w-4xl text-center">
          <Badge variant="outline" class="mb-8 border-emerald-500/40 text-emerald-400 bg-emerald-500/10 px-4 py-1.5 text-xs tracking-wide">
            Enterprise Cloud Storage & Sync
          </Badge>
          <h1 class="text-6xl md:text-8xl font-bold tracking-tight leading-none mb-6 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
            Your Filesystem.<br />Everywhere.
          </h1>
          <p class="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            OSDrive syncs, shares, and mounts your files natively across every device — backed by a live filesystem index that makes every operation instant.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/download">
              <Button size="lg" class="px-8 text-base h-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download OSDrive
              </Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="px-8 text-base h-12 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                Open Dashboard →
              </Button>
            </a>
          </div>
          <p class="mt-5 text-xs text-zinc-600">Available for macOS · Windows · Linux</p>
        </div>
      </section>

      {/* Stats */}
      <section class="border-y border-white/5 bg-white/[0.02] py-12 px-6">
        <div class="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div>
              <div class="text-3xl md:text-4xl font-bold text-white tracking-tight">{s.value}</div>
              <div class="text-sm text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" class="py-28 px-6">
        <div class="mx-auto max-w-6xl">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Built for serious work
            </h2>
            <p class="text-zinc-400 text-lg max-w-2xl mx-auto">
              Every feature is designed around speed, reliability, and native OS integration.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card class="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-200 rounded-xl">
                <CardContent class="p-6">
                  <div class="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mb-4 text-zinc-300">
                    {f.icon}
                  </div>
                  <h3 class="font-semibold text-white mb-2">{f.title}</h3>
                  <p class="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" class="py-24 px-6 border-t border-white/5">
        <div class="mx-auto max-w-5xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Badge variant="secondary" class="mb-6 text-xs">Enterprise Ready</Badge>
            <h2 class="text-4xl font-bold text-white tracking-tight mb-5">
              The infrastructure your team demands
            </h2>
            <p class="text-zinc-400 leading-relaxed mb-8">
              OSDrive is built for organisations that need more than a consumer sync tool. Centralised access control, audit logs, SSO, and dedicated SLAs — all managed from a single dashboard.
            </p>
            <ul class="space-y-3 text-sm text-zinc-300">
              {["SSO & SCIM provisioning", "Role-based access control", "Audit logs & compliance exports", "Dedicated SLA & support", "On-premise deployment option"].map((item) => (
                <li class="flex items-center gap-3">
                  <div class="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div class="mt-10 flex gap-4">
              <a href="/dashboard">
                <Button size="lg" class="px-6">Get Started</Button>
              </a>
              <a href="/contact">
                <Button variant="outline" size="lg" class="px-6 border-zinc-700 text-zinc-300 hover:bg-zinc-800">Contact Sales</Button>
              </a>
            </div>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-8 space-y-4">
            {["Filesystem Index", "Drive Mounting", "Cross-device Sync", "Access Control", "Sharing & Permissions", "File Explorer UI"].map((item, i) => (
              <div class="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <div class={`h-2 w-2 rounded-full shrink-0 ${i < 5 ? "bg-emerald-400" : "bg-zinc-600"}`} />
                <span class="text-sm text-zinc-300">{item}</span>
                <span class="ml-auto text-xs text-zinc-600">{i < 5 ? "Available" : "Coming soon"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-28 px-6">
        <div class="mx-auto max-w-xl text-center">
          <h2 class="text-4xl font-bold text-white tracking-tight mb-5">
            Ready to connect your drives?
          </h2>
          <p class="text-zinc-400 mb-8">Download OSDrive and mount your first drive in under two minutes.</p>
          <a href="/download">
            <Button size="lg" class="px-10 text-base h-12">
              Download for Free
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer class="border-t border-white/10 py-10 px-6">
        <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-2 text-zinc-500 text-sm">
            <span class="font-semibold text-white">OSDrive</span>
            <span>© 2025. All rights reserved.</span>
          </div>
          <div class="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([label, href]) => (
              <a href={href} class="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
