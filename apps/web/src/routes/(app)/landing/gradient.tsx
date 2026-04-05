import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

/**
 * Gradient - Bold, vibrant design like Linear/Vercel
 * Heavy use of gradients, glow effects, modern aesthetic
 */
export default function LandingGradient() {
  return (
    <main class="min-h-screen overflow-hidden">
      <Title>OpenDrive | Files without limits</Title>

      {/* Background effects */}
      <div class="fixed inset-0 -z-10">
        <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[128px]" />
        <div class="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[128px]" />
        <div class="absolute bottom-0 left-1/2 w-[700px] h-[400px] bg-cyan-500/20 rounded-full blur-[128px]" />
      </div>

      {/* Hero */}
      <section class="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center relative">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
          </span>
          <span class="text-sm">Version 2.0 now available</span>
        </div>

        <h1 class="text-[clamp(3rem,10vw,7rem)] font-bold leading-[0.9] tracking-tight mb-8">
          <span class="bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
            Files without
          </span>
          <br />
          <span class="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            limits
          </span>
        </h1>

        <p class="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
          The file system of the future. Blazing fast sync, beautiful UI,
          and enterprise features that just work.
        </p>

        <div class="flex items-center justify-center gap-4 flex-wrap">
          <A
            href="/login"
            class="group relative px-8 py-4 rounded-full font-semibold text-lg overflow-hidden"
          >
            <span class="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
            <span class="absolute inset-[1px] bg-gray-900 rounded-full group-hover:bg-gray-800 transition-colors" />
            <span class="relative bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Start building
            </span>
          </A>
          <a
            href="#features"
            class="px-8 py-4 rounded-full border border-white/20 text-lg hover:bg-white/5 transition-colors backdrop-blur-sm"
          >
            Learn more
          </a>
        </div>

        {/* Floating elements */}
        <div class="absolute top-20 left-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 backdrop-blur-sm rotate-12 max-lg:hidden" />
        <div class="absolute top-40 right-10 w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 backdrop-blur-sm -rotate-12 max-lg:hidden" />
        <div class="absolute bottom-20 left-20 w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-white/10 backdrop-blur-sm rotate-45 max-lg:hidden" />
      </section>

      {/* Showcase */}
      <section class="max-w-6xl mx-auto px-6 pb-32">
        <div class="relative">
          <div class="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
          <div class="relative rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-white/20" />
                <span class="w-3 h-3 rounded-full bg-white/20" />
                <span class="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <div class="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5">
                <svg class="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span class="text-sm text-white/40">Search files...</span>
              </div>
              <div class="w-20" />
            </div>
            <div class="p-8">
              <div class="grid grid-cols-4 gap-6 max-md:grid-cols-2">
                {[
                  { name: "Design System", size: "2.4 GB", icon: "🎨", gradient: "from-pink-500 to-rose-500" },
                  { name: "Client Projects", size: "8.1 GB", icon: "💼", gradient: "from-purple-500 to-indigo-500" },
                  { name: "Media Assets", size: "12.6 GB", icon: "🎬", gradient: "from-cyan-500 to-blue-500" },
                  { name: "Backups", size: "45.2 GB", icon: "💾", gradient: "from-emerald-500 to-teal-500" },
                ].map((item) => (
                  <div class="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 cursor-pointer">
                    <div class={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <h3 class="font-semibold mb-1">{item.name}</h3>
                    <p class="text-sm text-white/50">{item.size}</p>
                  </div>
                ))}
              </div>
              <div class="mt-8 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-white/10">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium">Syncing 847 files...</p>
                      <p class="text-sm text-white/50">2.4 GB remaining</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">68%</p>
                    <p class="text-sm text-white/50">12 MB/s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" class="max-w-5xl mx-auto px-6 py-32">
        <div class="text-center mb-20">
          <h2 class="text-5xl font-bold mb-6">
            <span class="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Superpowers included
            </span>
          </h2>
          <p class="text-xl text-white/50">Everything you need to manage files at any scale.</p>
        </div>

        <div class="grid grid-cols-2 gap-8 max-md:grid-cols-1">
          {[
            {
              title: "Lightning sync",
              desc: "Delta sync technology means only changes are transferred. Sync terabytes in seconds.",
              gradient: "from-yellow-500 to-orange-500",
            },
            {
              title: "End-to-end encryption",
              desc: "Zero-knowledge encryption ensures your files are private. We can't read them, even if we wanted to.",
              gradient: "from-emerald-500 to-cyan-500",
            },
            {
              title: "Smart organization",
              desc: "AI-powered tagging and search. Find any file instantly, no matter where it lives.",
              gradient: "from-purple-500 to-pink-500",
            },
            {
              title: "Team workspaces",
              desc: "Shared spaces with granular permissions. Perfect for agencies, studios, and enterprises.",
              gradient: "from-blue-500 to-indigo-500",
            },
          ].map((feature) => (
            <article class="group p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
              <div class={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`} />
              <h3 class="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p class="text-white/50 leading-relaxed">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section class="max-w-4xl mx-auto px-6 py-32 text-center">
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
          <div class="relative p-12 rounded-3xl border border-white/20 bg-black/40 backdrop-blur-xl">
            <h2 class="text-4xl font-bold mb-4">Ready to level up?</h2>
            <p class="text-xl text-white/50 mb-8">Join 50,000+ teams already using OpenDrive.</p>
            <A
              href="/login"
              class="inline-flex px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Get started free
            </A>
          </div>
        </div>
      </section>
    </main>
  );
}
