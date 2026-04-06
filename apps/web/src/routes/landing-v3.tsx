import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

const features = [
  {
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
    iconColor: "text-violet-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
    ),
    title: "Mount in Finder",
    desc: "One click and your cloud drives appear natively in Finder or Windows Explorer, just like a local disk.",
  },
  {
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    iconColor: "text-blue-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    ),
    title: "Instant Operations",
    desc: "Our live filesystem index means searches, moves, and listings complete in milliseconds — not seconds.",
  },
  {
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    iconColor: "text-emerald-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
    ),
    title: "Always in Sync",
    desc: "Edit on your Mac, pick up on Linux, continue on Windows. Every device stays perfectly synchronised.",
  },
  {
    color: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
    iconColor: "text-orange-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
    ),
    title: "One-Link Sharing",
    desc: "Share any file or folder with a link. Set permissions, expiry, and passwords right from the dashboard.",
  },
  {
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    iconColor: "text-pink-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    ),
    title: "Cloud Drive Management",
    desc: "Create, resize, and configure cloud drives from your dashboard. Full quota and policy controls included.",
  },
  {
    color: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
    iconColor: "text-indigo-400",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
    title: "File Explorer UI",
    desc: "A rich browser-based file manager is coming — browse, preview, and manage all your drives from any device.",
  },
];

const testimonials = [
  {
    quote: "OSDrive cut our file-access latency by 10x. The Finder integration alone was worth switching.",
    author: "Sarah K.",
    role: "Head of Engineering, Stratford Inc.",
  },
  {
    quote: "We replaced three legacy tools with OSDrive. Setup took an afternoon — not three weeks.",
    author: "Marcus T.",
    role: "IT Director, Zenith Labs",
  },
  {
    quote: "The indexed filesystem is a game changer. Our 5 TB share browses as fast as a local folder.",
    author: "Priya M.",
    role: "DevOps Lead, Nova Systems",
  },
];

export default function LandingV3() {
  return (
    <div class="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* Nav */}
      <header class="fixed top-0 inset-x-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div class="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
              <span class="text-white font-bold text-xs">OS</span>
            </div>
            <span class="font-semibold text-lg">OSDrive</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" class="hover:text-white transition-colors">Features</a>
            <a href="#testimonials" class="hover:text-white transition-colors">Reviews</a>
            <a href="/pricing" class="hover:text-white transition-colors">Pricing</a>
            <a href="/docs" class="hover:text-white transition-colors">Docs</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors">Account</a>
            <a href="/dashboard">
              <Button variant="ghost" size="sm" class="text-zinc-300 hover:text-white hover:bg-white/10">
                Dashboard
              </Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 text-white shadow-lg shadow-violet-500/25">
                Download
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section class="relative pt-44 pb-32 px-6 overflow-hidden">
        {/* Gradient blobs */}
        <div class="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[800px] bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-cyan-600/20 blur-[120px] rounded-full" />
        <div class="pointer-events-none absolute top-1/2 -left-64 h-[400px] w-[400px] bg-violet-600/10 blur-[100px] rounded-full" />
        <div class="pointer-events-none absolute top-1/2 -right-64 h-[400px] w-[400px] bg-indigo-600/10 blur-[100px] rounded-full" />

        <div class="relative mx-auto max-w-4xl text-center">
          <div class="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 text-violet-300 mb-8">
            <span class="h-1.5 w-1.5 rounded-full bg-violet-400" />
            New: File Explorer UI coming soon
          </div>
          <h1 class="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
            <span class="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Files without
            </span>
            <br />
            <span class="text-white">limits.</span>
          </h1>
          <p class="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Sync, share, and mount your filesystems everywhere — with a live index that makes every operation feel instant.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <a href="/download">
              <Button size="lg" class="px-10 h-14 text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 shadow-2xl shadow-violet-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download Free
              </Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="px-10 h-14 text-base border-white/20 text-white hover:bg-white/10">
                Open Dashboard
              </Button>
            </a>
          </div>
          <p class="text-xs text-zinc-600">macOS · Windows · Linux · Free to start</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" class="py-24 px-6">
        <div class="mx-auto max-w-6xl">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything in one place
            </h2>
            <p class="text-zinc-400 text-lg max-w-xl mx-auto">
              Stop juggling multiple tools. OSDrive is your single layer for all things file storage and sync.
            </p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <Card class={`bg-gradient-to-br ${f.color} border rounded-2xl hover:scale-[1.02] transition-transform duration-200`}>
                <CardContent class="p-6">
                  <div class={`mb-4 ${f.iconColor}`}>{f.icon}</div>
                  <h3 class="font-semibold text-white mb-2 text-base">{f.title}</h3>
                  <p class="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" class="py-24 px-6 border-t border-white/5">
        <div class="mx-auto max-w-6xl">
          <div class="text-center mb-14">
            <h2 class="text-4xl font-bold tracking-tight mb-4">Loved by teams everywhere</h2>
            <p class="text-zinc-400">From solo prosumers to 10,000-seat enterprises.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div class="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div class="flex mb-4">
                  {[...Array(5)].map(() => (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p class="text-zinc-300 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <div class="font-semibold text-white text-sm">{t.author}</div>
                  <div class="text-zinc-500 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section class="py-28 px-6">
        <div class="mx-auto max-w-2xl text-center">
          <div class="relative">
            <div class="pointer-events-none absolute inset-0 -m-12 bg-gradient-to-r from-violet-600/10 via-indigo-600/15 to-cyan-600/10 blur-3xl rounded-full" />
            <div class="relative">
              <h2 class="text-5xl font-black tracking-tight mb-5">
                <span class="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Start for free.
                </span>
                <br />
                Scale forever.
              </h2>
              <p class="text-zinc-400 mb-10 text-lg">
                Download OSDrive and connect your first cloud drive in minutes.
              </p>
              <div class="flex flex-col sm:flex-row justify-center gap-4">
                <a href="/download">
                  <Button size="lg" class="px-10 h-14 text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 shadow-xl shadow-violet-500/25">
                    Download OSDrive
                  </Button>
                </a>
                <a href="/dashboard">
                  <Button variant="outline" size="lg" class="px-10 h-14 text-base border-white/20 text-white hover:bg-white/10">
                    Open Dashboard
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="border-t border-white/5 py-10 px-6">
        <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-2 text-sm text-zinc-500">
            <div class="h-5 w-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600" />
            <span class="font-semibold text-white">OSDrive</span>
            <span>© 2025</span>
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
