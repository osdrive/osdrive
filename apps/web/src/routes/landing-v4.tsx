import { Button } from "~/components/ui/button";

const cliSteps = [
  { prompt: "$", cmd: "osdrive mount engineering-shared", output: "✓ Mounted at /Volumes/engineering-shared" },
  { prompt: "$", cmd: "osdrive sync --watch ./projects", output: "✓ Watching ./projects → cloud:projects (12,847 files indexed)" },
  { prompt: "$", cmd: "osdrive share ./design-assets --expires 7d", output: "✓ https://osdrive.io/s/x9kQp2 (expires in 7 days)" },
];

const specs = [
  { label: "Index Update Latency", value: "< 50ms" },
  { label: "Mount Protocol", value: "SMB 3.1.1 / NFS v4" },
  { label: "Encryption at Rest", value: "AES-256-GCM" },
  { label: "Encryption in Transit", value: "TLS 1.3" },
  { label: "Max File Size", value: "5 TB" },
  { label: "Concurrent Mounts", value: "Unlimited" },
  { label: "Supported OS", value: "macOS · Linux · Windows" },
  { label: "API", value: "REST + WebSocket" },
];

const features = [
  {
    title: "Filesystem Indexing",
    desc: "OSDrive daemon maintains a persistent in-memory + on-disk index of your entire filesystem tree. Every readdir, stat, and search is served from the index — not from cold storage.",
    tag: "CORE",
  },
  {
    title: "Native VFS Mounting",
    desc: "We implement a custom VFS layer that exposes your cloud drives as a native macOS/Windows/Linux filesystem. No FUSE hacks. Fully integrated with Spotlight, Finder Quick Look, and shell completions.",
    tag: "NATIVE",
  },
  {
    title: "Delta Sync Engine",
    desc: "Our sync engine only transfers changed blocks — not entire files. Powered by a rolling hash algorithm similar to rsync but with real-time change propagation via WebSocket streams.",
    tag: "SYNC",
  },
  {
    title: "Conflict-Free Replication",
    desc: "OSDrive uses a CRDT-based metadata model to resolve concurrent edits without data loss. Conflicting writes are preserved as versioned snapshots accessible from the dashboard.",
    tag: "DATA",
  },
];

export default function LandingV4() {
  return (
    <div class="min-h-screen bg-black text-emerald-400 font-mono">
      {/* Scanlines overlay */}
      <div
        class="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style="background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.5) 2px, rgba(0,255,0,0.5) 4px);"
      />

      {/* Nav */}
      <header class="relative z-10 border-b border-emerald-900/50 bg-black">
        <div class="mx-auto max-w-7xl px-6 flex h-14 items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-emerald-500 font-bold text-lg tracking-tight">OSDrive</span>
            <span class="text-emerald-900 text-xs">v2.4.1</span>
          </div>
          <nav class="hidden md:flex items-center gap-8 text-xs text-emerald-700">
            <a href="#features" class="hover:text-emerald-400 transition-colors uppercase tracking-widest">[features]</a>
            <a href="#specs" class="hover:text-emerald-400 transition-colors uppercase tracking-widest">[specs]</a>
            <a href="/docs" class="hover:text-emerald-400 transition-colors uppercase tracking-widest">[docs]</a>
          </nav>
          <div class="flex items-center gap-3">
            <a href="/account" class="hidden sm:block text-xs text-emerald-700 hover:text-emerald-400 transition-colors uppercase tracking-wider">
              [account]
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="border-emerald-900 text-emerald-600 hover:text-emerald-400 hover:bg-emerald-950 hover:border-emerald-700 font-mono text-xs uppercase tracking-widest">
                dashboard
              </Button>
            </a>
            <a href="/download">
              <Button size="sm" class="bg-emerald-600 hover:bg-emerald-500 text-black font-mono text-xs uppercase tracking-widest font-bold">
                download
              </Button>
            </a>
          </div>
        </div>
      </header>

      <div class="relative z-10">
        {/* Hero */}
        <section class="py-24 px-6 border-b border-emerald-900/30">
          <div class="mx-auto max-w-5xl">
            <div class="mb-4 text-xs text-emerald-800 uppercase tracking-widest">// OSDrive — filesystem daemon + cloud sync</div>
            <h1 class="text-5xl md:text-7xl font-bold leading-none tracking-tight text-emerald-300 mb-2">
              osdrive<span class="text-emerald-600">.</span>
            </h1>
            <h2 class="text-2xl md:text-3xl font-bold text-emerald-700 mb-8 leading-tight">
              Your filesystem, indexed &amp; everywhere.
            </h2>
            <div class="rounded-lg border border-emerald-900 bg-zinc-950 p-6 mb-10 max-w-2xl">
              <div class="text-xs text-emerald-800 mb-4 uppercase tracking-widest">// quick start</div>
              {cliSteps.map((step) => (
                <div class="mb-3 last:mb-0">
                  <div class="flex items-start gap-2">
                    <span class="text-emerald-600 select-none">{step.prompt}</span>
                    <span class="text-emerald-300">{step.cmd}</span>
                  </div>
                  <div class="pl-4 text-emerald-700 text-sm">{step.output}</div>
                </div>
              ))}
              <div class="mt-4 pt-4 border-t border-emerald-900/50 flex items-center gap-2">
                <span class="text-emerald-600 animate-pulse">█</span>
                <span class="text-emerald-800 text-xs">ready</span>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <a href="/download">
                <Button size="lg" class="bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold uppercase tracking-widest px-8">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  ./install.sh
                </Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline" size="lg" class="border-emerald-900 text-emerald-600 hover:text-emerald-400 hover:bg-emerald-950 font-mono uppercase tracking-widest px-8">
                  open_dashboard()
                </Button>
              </a>
            </div>
            <p class="mt-4 text-xs text-emerald-800">// compatible with macOS 12+ · Linux 5.15+ · Windows 11</p>
          </div>
        </section>

        {/* Features */}
        <section id="features" class="py-20 px-6 border-b border-emerald-900/30">
          <div class="mx-auto max-w-5xl">
            <div class="text-xs text-emerald-800 uppercase tracking-widest mb-8">// core modules</div>
            <div class="grid md:grid-cols-2 gap-px bg-emerald-900/20">
              {features.map((f) => (
                <div class="bg-black p-6 border border-emerald-900/30">
                  <div class="text-xs text-emerald-700 mb-2 uppercase tracking-widest">[{f.tag}]</div>
                  <h3 class="text-emerald-300 font-bold mb-3">{f.title}</h3>
                  <p class="text-emerald-800 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specs */}
        <section id="specs" class="py-20 px-6 border-b border-emerald-900/30">
          <div class="mx-auto max-w-5xl">
            <div class="text-xs text-emerald-800 uppercase tracking-widest mb-8">// technical specifications</div>
            <div class="rounded-lg border border-emerald-900 bg-zinc-950 overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-emerald-900 bg-emerald-950/50">
                    <th class="text-left px-6 py-3 text-xs uppercase tracking-widest text-emerald-700 font-normal">PARAMETER</th>
                    <th class="text-left px-6 py-3 text-xs uppercase tracking-widest text-emerald-700 font-normal">VALUE</th>
                  </tr>
                </thead>
                <tbody>
                  {specs.map((s, i) => (
                    <tr class={`border-b border-emerald-900/40 last:border-0 ${i % 2 === 0 ? "bg-black" : "bg-emerald-950/10"}`}>
                      <td class="px-6 py-3 text-emerald-700">{s.label}</td>
                      <td class="px-6 py-3 text-emerald-400 font-semibold">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section class="py-20 px-6">
          <div class="mx-auto max-w-3xl">
            <div class="rounded-lg border border-emerald-900 bg-zinc-950 p-8">
              <div class="text-xs text-emerald-800 uppercase tracking-widest mb-4">// deploy osdrive</div>
              <div class="text-emerald-300 font-bold text-xl mb-2">Ready to mount your first drive?</div>
              <p class="text-emerald-800 text-sm mb-6">Download the daemon, create a drive in the dashboard, and mount it — all in under 3 minutes.</p>
              <div class="rounded border border-emerald-900/50 bg-black p-4 mb-6 font-mono text-sm">
                <span class="text-emerald-600">$ </span>
                <span class="text-emerald-300">curl -fsSL https://osdrive.io/install.sh | sh</span>
              </div>
              <div class="flex flex-col sm:flex-row gap-3">
                <a href="/download">
                  <Button size="lg" class="bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold uppercase tracking-widest px-8">
                    Download Binary
                  </Button>
                </a>
                <a href="/dashboard">
                  <Button variant="outline" size="lg" class="border-emerald-900 text-emerald-600 hover:text-emerald-400 hover:bg-emerald-950 font-mono uppercase tracking-widest px-6">
                    Open Dashboard
                  </Button>
                </a>
                <a href="/account" class="flex items-center px-4 text-xs text-emerald-700 hover:text-emerald-400 transition-colors font-mono uppercase tracking-widest">
                  Account →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer class="border-t border-emerald-900/30 py-8 px-6">
          <div class="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-xs text-emerald-800">OSDrive © 2025 // All rights reserved</div>
            <div class="flex gap-6 text-xs text-emerald-800">
              {[["[privacy]", "/privacy"], ["[terms]", "/terms"], ["[docs]", "/docs"], ["[dashboard]", "/dashboard"], ["[account]", "/account"]].map(([label, href]) => (
                <a href={href} class="hover:text-emerald-600 transition-colors">{label}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
