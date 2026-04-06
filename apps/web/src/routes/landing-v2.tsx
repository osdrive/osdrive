import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

const features = [
  {
    title: "Native Drive Mounting",
    desc: "Shares appear directly in Finder and File Explorer over SMB/NFS — zero config, zero extra software.",
  },
  {
    title: "Live Filesystem Index",
    desc: "A continuously updated index means directory listings, searches, and moves complete in milliseconds.",
  },
  {
    title: "Cross-Device Sync",
    desc: "Files propagate instantly between devices with automatic conflict resolution and version history.",
  },
  {
    title: "Granular Sharing",
    desc: "Share files or entire drives with per-user permissions, expiry dates, and password protection.",
  },
  {
    title: "Cloud Drive Management",
    desc: "Provision, resize, and retire cloud drives from the dashboard with quota and policy controls.",
  },
  {
    title: "Audit & Compliance",
    desc: "Full access logs, export reports, and configurable retention policies for regulated industries.",
  },
];

const logos = ["Acme Corp", "Stratford", "Zenith Labs", "Parallax", "Nova Systems", "Horizon"];

export default function LandingV2() {
  return (
    <div class="min-h-screen bg-white text-slate-900 font-sans">
      {/* Nav */}
      <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div class="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <span class="text-white font-bold text-xs">OS</span>
            </div>
            <span class="font-semibold text-lg text-slate-900">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" class="hover:text-slate-900 transition-colors">Features</a>
            <a href="#enterprise" class="hover:text-slate-900 transition-colors">Enterprise</a>
            <a href="/pricing" class="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-slate-900 transition-colors">Documentation</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Sign in
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="border-slate-300">
                Dashboard
              </Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-blue-600 hover:bg-blue-700">
                Download
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section class="py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div class="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge variant="secondary" class="mb-6 text-xs text-blue-700 bg-blue-50 border-blue-200">
              Trusted by 2,000+ enterprises
            </Badge>
            <h1 class="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-6">
              Enterprise file infrastructure that just works
            </h1>
            <p class="text-lg text-slate-600 leading-relaxed mb-8">
              OSDrive gives your organisation a unified layer for syncing, sharing, and mounting filesystems — with the speed and native integration that enterprise workflows demand.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 mb-10">
              <a href="/download">
                <Button size="lg" class="px-8 bg-blue-600 hover:bg-blue-700 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download OSDrive
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="px-8 border-slate-300 text-slate-700">
                  Open Dashboard
                </Button>
              </a>
            </div>
            <div class="flex items-center gap-6 text-sm text-slate-500">
              <div class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                macOS · Windows · Linux
              </div>
              <div class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                Free tier available
              </div>
              <div class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                99.99% SLA
              </div>
            </div>
          </div>
          {/* Mockup panel */}
          <div class="relative">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-xl">
              <div class="flex items-center gap-2 mb-4">
                <div class="h-3 w-3 rounded-full bg-slate-300" />
                <div class="h-3 w-3 rounded-full bg-slate-300" />
                <div class="h-3 w-3 rounded-full bg-slate-300" />
                <div class="ml-3 text-xs text-slate-400 font-mono">OSDrive Dashboard</div>
              </div>
              <div class="space-y-2">
                {[
                  { name: "Engineering Shared Drive", size: "2.4 TB", status: "Mounted", users: 14 },
                  { name: "Design Assets", size: "890 GB", status: "Synced", users: 6 },
                  { name: "Client Deliverables", size: "340 GB", status: "Mounted", users: 23 },
                  { name: "Backup Archive", size: "12.1 TB", status: "Synced", users: 2 },
                ].map((drive) => (
                  <div class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
                    <div class="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-medium text-slate-800 truncate">{drive.name}</div>
                      <div class="text-xs text-slate-400">{drive.size} · {drive.users} users</div>
                    </div>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{drive.status}</span>
                  </div>
                ))}
              </div>
              <div class="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                <span class="text-xs text-slate-400">4 drives · 15.7 TB total</span>
                <a href="/dashboard" class="text-xs text-blue-600 hover:underline">View all →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section class="py-12 px-6 border-y border-slate-100 bg-slate-50">
        <div class="mx-auto max-w-5xl text-center">
          <p class="text-sm text-slate-400 mb-6 uppercase tracking-widest">Trusted by forward-thinking teams</p>
          <div class="flex flex-wrap items-center justify-center gap-8">
            {logos.map((logo) => (
              <span class="text-slate-400 font-semibold text-sm tracking-wide">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" class="py-24 px-6">
        <div class="mx-auto max-w-6xl">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Everything your team needs
            </h2>
            <p class="text-slate-600 text-lg max-w-xl mx-auto">
              A complete platform for file storage, sync, and sharing — all with native OS integration.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card class="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader class="pb-2 p-6">
                  <CardTitle class="text-base font-semibold text-slate-900">{f.title}</CardTitle>
                </CardHeader>
                <CardContent class="px-6 pb-6">
                  <CardDescription class="text-slate-600 text-sm leading-relaxed">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section id="enterprise" class="py-24 px-6 bg-slate-900">
        <div class="mx-auto max-w-5xl grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Badge class="mb-6 bg-blue-600 text-white border-0">Enterprise Plan</Badge>
            <h2 class="text-4xl font-bold text-white tracking-tight mb-5">
              Built for scale and compliance
            </h2>
            <p class="text-slate-400 leading-relaxed mb-8">
              From a 10-person studio to a 10,000-seat enterprise — OSDrive adapts to your security requirements, data residency needs, and operational complexity.
            </p>
            <div class="space-y-3">
              {["SSO (SAML, OIDC) & SCIM provisioning", "Role-based access control", "Full audit trails & compliance exports", "Dedicated SLA with 24/7 support", "Custom data residency & on-premise option", "Volume licensing & invoice billing"].map((item) => (
                <div class="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400 mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  <span class="text-slate-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div class="mt-10 flex gap-3">
              <a href="/contact">
                <Button size="lg" class="px-6 bg-blue-600 hover:bg-blue-700">Contact Sales</Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="px-6 border-slate-600 text-slate-300 hover:bg-slate-800">Start Free Trial</Button>
              </a>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            {[
              { label: "Data Encrypted", value: "AES-256" },
              { label: "Uptime SLA", value: "99.99%" },
              { label: "Enterprises", value: "2,000+" },
              { label: "Files Indexed", value: "10B+" },
            ].map((s) => (
              <div class="rounded-xl border border-slate-700 bg-slate-800 p-6 text-center">
                <div class="text-3xl font-bold text-white mb-1">{s.value}</div>
                <div class="text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-24 px-6 border-t border-slate-100">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-4xl font-bold text-slate-900 tracking-tight mb-5">
            Start connecting your drives today
          </h2>
          <p class="text-slate-600 mb-8">
            Download OSDrive and have your first drive mounted in minutes. No credit card required.
          </p>
          <div class="flex justify-center gap-3">
            <a href="/download">
              <Button size="lg" class="px-8 bg-blue-600 hover:bg-blue-700 text-white">Download Free</Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="px-8 border-slate-300">Open Dashboard</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="border-t border-slate-200 py-10 px-6 bg-slate-50">
        <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <span class="font-semibold text-slate-900">OSDrive</span>
            <span>© 2025. All rights reserved.</span>
          </div>
          <div class="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Security", "/security"], ["Docs", "/docs"], ["Dashboard", "/dashboard"], ["Account", "/account"]].map(([label, href]) => (
              <a href={href} class="hover:text-slate-900 transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
