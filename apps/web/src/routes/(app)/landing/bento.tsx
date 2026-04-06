import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

/**
 * Bento - Grid-based layout inspired by Apple/Notion
 * Asymmetric cards with varied content types
 */
export default function LandingBento() {
  return (
    <main class="min-h-screen">
      <Title>OSDrive | The file system for modern teams</Title>

      {/* Hero */}
      <section class="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 class="text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.1] tracking-tight mb-6">
          The file system for
          <br />
          <span class="text-white/40">modern teams</span>
        </h1>
        <p class="text-lg text-white/50 max-w-xl mx-auto mb-8">
          Sync files across devices, share with anyone, and keep everything organized
          with a file manager built for how you work.
        </p>
        <div class="flex items-center justify-center gap-3">
          <A
            href="/login"
            class="px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-white/90 transition-colors"
          >
            Get started free
          </A>
          <a
            href="#features"
            class="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors"
          >
            Learn more
          </a>
        </div>
      </section>

      {/* Bento Grid */}
      <section id="features" class="max-w-6xl mx-auto px-6 pb-24">
        <div class="grid grid-cols-4 grid-rows-[repeat(3,minmax(200px,auto))] gap-4 max-lg:grid-cols-2 max-md:grid-cols-1 max-lg:grid-rows-none">

          {/* Large card - Sync */}
          <div class="col-span-2 row-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-white/10 flex flex-col max-lg:col-span-2 max-md:col-span-1">
            <div class="flex-1">
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-sm mb-6">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Real-time sync
              </div>
              <h3 class="text-2xl font-bold mb-3">Every file, everywhere</h3>
              <p class="text-white/50 leading-relaxed">
                Changes propagate instantly across all your devices. Edit on your
                laptop, see it on your phone. No manual uploads needed.
              </p>
            </div>
            <div class="mt-8 grid grid-cols-3 gap-3">
              {[
                { icon: "💻", label: "Desktop" },
                { icon: "📱", label: "Mobile" },
                { icon: "☁️", label: "Cloud" },
              ].map((device) => (
                <div class="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span class="text-2xl mb-2 block">{device.icon}</span>
                  <span class="text-sm text-white/60">{device.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security card */}
          <div class="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-white/10">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">End-to-end encrypted</h3>
            <p class="text-sm text-white/50">Your files are encrypted before they leave your device.</p>
          </div>

          {/* Speed card */}
          <div class="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-white/10">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">Blazing fast</h3>
            <p class="text-sm text-white/50">Delta sync means only changes are transferred.</p>
          </div>

          {/* Network drives - wide card */}
          <div class="col-span-2 p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-white/10 max-md:col-span-1">
            <div class="flex items-start justify-between gap-6 max-sm:flex-col">
              <div>
                <div class="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
                  <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">Network drives</h3>
                <p class="text-sm text-white/50 max-w-xs">
                  Mount cloud-backed network drives that integrate with your existing infrastructure.
                </p>
              </div>
              <div class="flex items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 max-sm:w-full">
                <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <span class="text-lg">🖥️</span>
                </div>
                <div>
                  <p class="text-sm font-medium">Office NAS</p>
                  <p class="text-xs text-white/40">Connected · 4.2 TB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats card */}
          <div class="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
            <p class="text-4xl font-bold mb-1">50M+</p>
            <p class="text-sm text-white/50">Files synced daily</p>
          </div>

          {/* Sharing card */}
          <div class="p-6 rounded-3xl bg-gradient-to-br from-rose-500/10 to-red-500/5 border border-white/10">
            <div class="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold mb-2">One-click sharing</h3>
            <p class="text-sm text-white/50">Share files with anyone via secure links.</p>
          </div>

          {/* Search card - wide */}
          <div class="col-span-2 p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-white/10 max-md:col-span-1">
            <div class="flex items-start gap-6 max-sm:flex-col">
              <div class="flex-1">
                <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-4">
                  <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">Find anything instantly</h3>
                <p class="text-sm text-white/50">
                  Powerful search across all your files, devices, and connected services.
                </p>
              </div>
              <div class="w-64 max-sm:w-full">
                <div class="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <svg class="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span class="text-sm text-white/30">quarterly report.pdf</span>
                </div>
                <div class="mt-2 space-y-1">
                  {["Q4 Report.pdf", "Quarterly-summary.xlsx"].map((file) => (
                    <div class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                      <span class="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs">📄</span>
                      <span class="text-sm text-white/70">{file}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Uptime card */}
          <div class="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
            <p class="text-4xl font-bold mb-1">99.99%</p>
            <p class="text-sm text-white/50">Uptime SLA</p>
          </div>

          {/* Teams card */}
          <div class="p-6 rounded-3xl bg-white/[0.02] border border-white/10">
            <div class="flex -space-x-2 mb-4">
              {["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-amber-500"].map((color) => (
                <div class={`w-8 h-8 rounded-full ${color} border-2 border-gray-900`} />
              ))}
              <div class="w-8 h-8 rounded-full bg-white/10 border-2 border-gray-900 flex items-center justify-center text-xs">
                +8
              </div>
            </div>
            <h3 class="text-lg font-semibold mb-1">Built for teams</h3>
            <p class="text-sm text-white/50">Collaborate in real-time.</p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section class="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <div class="flex items-center justify-between max-md:flex-col max-md:text-center max-md:gap-6">
          <div>
            <h2 class="text-2xl font-bold mb-2">Ready to get organized?</h2>
            <p class="text-white/50">Start free, upgrade when you need more.</p>
          </div>
          <div class="flex items-center gap-3">
            <A
              href="/login"
              class="px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-white/90 transition-colors"
            >
              Start for free
            </A>
            <a
              href="#"
              class="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors"
            >
              Contact sales
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
