import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

/**
 * Minimal - Apple-inspired clean design
 * Typography-focused with generous whitespace
 */
export default function LandingMinimal() {
  return (
    <main class="min-h-screen">
      <Title>OpenDrive | Your files, everywhere</Title>

      {/* Hero */}
      <section class="max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
        <p class="text-primary-strong text-sm font-medium tracking-wide uppercase mb-6">
          File management reimagined
        </p>

        <h1 class="text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.05] tracking-tight mb-8">
          One place for
          <span class="block bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            all your files
          </span>
        </h1>

        <p class="text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
          A modern file system that spans every device. Sync seamlessly,
          share securely, and access your data from anywhere.
        </p>

        <div class="flex items-center justify-center gap-4 flex-wrap">
          <A
            href="/login"
            class="px-8 py-4 rounded-full bg-white text-gray-900 font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start free trial
          </A>
          <a
            href="#features"
            class="px-8 py-4 rounded-full border border-white/20 text-lg hover:bg-white/5 transition-colors"
          >
            See features
          </a>
        </div>
      </section>

      {/* Window mockup */}
      <section class="max-w-5xl mx-auto px-6 pb-32">
        <div class="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
          <div class="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
            <div class="flex gap-2">
              <span class="w-3 h-3 rounded-full bg-red-500/80" />
              <span class="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span class="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div class="flex-1 flex justify-center">
              <div class="px-4 py-1 rounded-md bg-white/5 text-sm text-muted">
                OpenDrive
              </div>
            </div>
          </div>
          <div class="grid grid-cols-[220px_1fr] max-md:grid-cols-1">
            <aside class="border-r border-white/10 p-4 space-y-6 max-md:border-r-0 max-md:border-b">
              <div class="space-y-1">
                <p class="text-xs text-muted uppercase tracking-wider px-3 mb-2">Library</p>
                {["All Files", "Recent", "Favorites", "Trash"].map((item, i) => (
                  <div class={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${i === 0 ? "bg-white/10" : "hover:bg-white/5 text-muted"}`}>
                    <span class="w-4 h-4 rounded bg-white/10" />
                    {item}
                  </div>
                ))}
              </div>
              <div class="space-y-1">
                <p class="text-xs text-muted uppercase tracking-wider px-3 mb-2">Devices</p>
                {["MacBook Pro", "iPhone", "Cloud Storage"].map((item) => (
                  <div class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:bg-white/5 cursor-pointer transition-colors">
                    <span class="w-4 h-4 rounded bg-white/10" />
                    {item}
                  </div>
                ))}
              </div>
            </aside>
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="font-semibold">All Files</h2>
                <div class="flex gap-2">
                  <button class="p-2 rounded-lg hover:bg-white/5 text-muted">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button class="p-2 rounded-lg bg-white/5">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2">
                {[
                  { name: "Documents", color: "from-blue-500/20 to-blue-600/10" },
                  { name: "Images", color: "from-pink-500/20 to-pink-600/10" },
                  { name: "Projects", color: "from-violet-500/20 to-violet-600/10" },
                  { name: "Downloads", color: "from-green-500/20 to-green-600/10" },
                  { name: "Archive.zip", color: "from-amber-500/20 to-amber-600/10" },
                  { name: "Backup", color: "from-cyan-500/20 to-cyan-600/10" },
                  { name: "Shared", color: "from-rose-500/20 to-rose-600/10" },
                  { name: "Notes", color: "from-indigo-500/20 to-indigo-600/10" },
                ].map((item) => (
                  <div class="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    <div class={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} group-hover:scale-105 transition-transform`} />
                    <span class="text-sm text-center truncate w-full">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" class="max-w-5xl mx-auto px-6 py-32 border-t border-white/10">
        <div class="text-center mb-20">
          <h2 class="text-4xl font-bold mb-4">Everything you need</h2>
          <p class="text-xl text-muted">Powerful features for individuals and teams alike.</p>
        </div>

        <div class="grid grid-cols-3 gap-12 max-md:grid-cols-1">
          {[
            {
              title: "Cross-device sync",
              desc: "Your files follow you everywhere. Real-time sync across Mac, Windows, Linux, iOS, and Android.",
              icon: (
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
            },
            {
              title: "Instant sharing",
              desc: "Generate secure share links in one click. Set expiration dates and access permissions.",
              icon: (
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              ),
            },
            {
              title: "Network drives",
              desc: "Mount cloud-backed network drives that work seamlessly with your existing infrastructure.",
              icon: (
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              ),
            },
          ].map((feature) => (
            <article class="text-center">
              <div class="w-12 h-12 mx-auto mb-6 rounded-xl bg-white/5 flex items-center justify-center text-primary-strong">
                {feature.icon}
              </div>
              <h3 class="text-xl font-semibold mb-3">{feature.title}</h3>
              <p class="text-muted leading-relaxed">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section class="max-w-4xl mx-auto px-6 py-32 text-center">
        <h2 class="text-4xl font-bold mb-4">Start organizing today</h2>
        <p class="text-xl text-muted mb-10">Free for personal use. Pro plans for teams.</p>
        <A
          href="/login"
          class="inline-flex px-8 py-4 rounded-full bg-white text-gray-900 font-semibold text-lg hover:bg-gray-100 transition-colors"
        >
          Get started free
        </A>
      </section>
    </main>
  );
}
