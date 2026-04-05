import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

/**
 * Glass - Glassmorphism with layered translucent panels
 * Depth through blur and transparency
 */
export default function LandingGlass() {
  return (
    <main class="min-h-screen relative">
      <Title>OpenDrive | Unified file management</Title>

      {/* Background */}
      <div class="fixed inset-0 -z-10">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)]" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.1),transparent_50%)]" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.1),transparent_50%)]" />
      </div>

      {/* Hero */}
      <section class="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl mb-8">
            <div class="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div class={`w-6 h-6 rounded-full border-2 border-gray-900 ${["bg-blue-500", "bg-purple-500", "bg-cyan-500"][i]}`} />
              ))}
            </div>
            <span class="text-sm text-white/70">Trusted by 10,000+ teams</span>
          </div>

          <h1 class="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight mb-6">
            All your files,
            <br />
            <span class="text-white/40">unified in one place</span>
          </h1>

          <p class="text-lg text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            Connect all your devices and cloud services. Access everything
            from a single, beautiful interface.
          </p>

          <div class="flex items-center justify-center gap-3">
            <A
              href="/login"
              class="px-6 py-3 rounded-xl bg-white text-gray-900 font-medium hover:bg-white/90 transition-colors"
            >
              Get started
            </A>
            <a
              href="#how"
              class="px-6 py-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Main glass card */}
        <div class="relative">
          {/* Glow effect */}
          <div class="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/20 to-transparent" />

          <div class="relative rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-2xl overflow-hidden">
            {/* Top bar */}
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div class="flex items-center gap-4">
                <div class="flex gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-white/10 hover:bg-red-500/80 transition-colors cursor-pointer" />
                  <span class="w-3 h-3 rounded-full bg-white/10 hover:bg-yellow-500/80 transition-colors cursor-pointer" />
                  <span class="w-3 h-3 rounded-full bg-white/10 hover:bg-green-500/80 transition-colors cursor-pointer" />
                </div>
                <div class="h-4 w-px bg-white/10" />
                <div class="flex items-center gap-2 text-sm text-white/50">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </div>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <svg class="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span class="text-sm text-white/30">Search everywhere...</span>
                <kbd class="px-2 py-0.5 rounded bg-white/5 text-xs text-white/30">⌘K</kbd>
              </div>
              <div class="flex items-center gap-2">
                <button class="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <svg class="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
              </div>
            </div>

            {/* Content */}
            <div class="grid grid-cols-[240px_1fr] max-md:grid-cols-1">
              {/* Sidebar */}
              <aside class="p-4 border-r border-white/10 space-y-6 max-md:border-r-0 max-md:border-b">
                <div>
                  <p class="text-xs font-medium text-white/30 uppercase tracking-wider px-3 mb-2">Quick access</p>
                  <div class="space-y-0.5">
                    {[
                      { icon: "📁", name: "All Files", active: true },
                      { icon: "🕐", name: "Recent" },
                      { icon: "⭐", name: "Starred" },
                      { icon: "🔗", name: "Shared with me" },
                    ].map((item) => (
                      <div class={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${item.active ? "bg-white/10" : "hover:bg-white/5"}`}>
                        <span>{item.icon}</span>
                        <span class={`text-sm ${item.active ? "text-white" : "text-white/60"}`}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p class="text-xs font-medium text-white/30 uppercase tracking-wider px-3 mb-2">Devices</p>
                  <div class="space-y-0.5">
                    {[
                      { icon: "💻", name: "MacBook Pro", status: "online" },
                      { icon: "📱", name: "iPhone 15", status: "syncing" },
                      { icon: "☁️", name: "Cloud Storage", status: "online" },
                    ].map((device) => (
                      <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                        <span>{device.icon}</span>
                        <span class="text-sm text-white/60 flex-1">{device.name}</span>
                        <span class={`w-2 h-2 rounded-full ${device.status === "online" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
                  <p class="text-sm font-medium mb-1">Storage</p>
                  <p class="text-xs text-white/50 mb-3">24.8 GB of 100 GB used</p>
                  <div class="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div class="h-full w-1/4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-lg font-medium">All Files</h2>
                  <div class="flex items-center gap-2">
                    <button class="p-2 rounded-lg bg-white/5 border border-white/10">
                      <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button class="p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <svg class="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-4 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2">
                  {[
                    { name: "Documents", items: 248, color: "from-blue-500/20 to-blue-600/10" },
                    { name: "Images", items: 1847, color: "from-pink-500/20 to-pink-600/10" },
                    { name: "Videos", items: 64, color: "from-purple-500/20 to-purple-600/10" },
                    { name: "Projects", items: 12, color: "from-amber-500/20 to-amber-600/10" },
                    { name: "Downloads", items: 89, color: "from-emerald-500/20 to-emerald-600/10" },
                    { name: "Archives", items: 34, color: "from-cyan-500/20 to-cyan-600/10" },
                    { name: "Music", items: 512, color: "from-rose-500/20 to-rose-600/10" },
                    { name: "Shared", items: 156, color: "from-indigo-500/20 to-indigo-600/10" },
                  ].map((folder) => (
                    <div class="group p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer">
                      <div class={`w-12 h-12 rounded-xl bg-gradient-to-br ${folder.color} mb-3 group-hover:scale-105 transition-transform`} />
                      <p class="font-medium text-sm mb-0.5">{folder.name}</p>
                      <p class="text-xs text-white/40">{folder.items} items</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how" class="max-w-5xl mx-auto px-6 py-24">
        <div class="grid grid-cols-3 gap-6 max-md:grid-cols-1">
          {[
            {
              icon: (
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              ),
              title: "Seamless sync",
              desc: "Changes sync instantly across all your devices. Work from anywhere without missing a beat.",
            },
            {
              icon: (
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: "Enterprise security",
              desc: "Bank-level encryption, SSO support, and compliance certifications for regulated industries.",
            },
            {
              icon: (
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              title: "Team collaboration",
              desc: "Share folders, set permissions, and work together in real-time with your team.",
            },
          ].map((feature) => (
            <article class="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
              <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/70">
                {feature.icon}
              </div>
              <h3 class="text-lg font-semibold mb-2">{feature.title}</h3>
              <p class="text-sm text-white/50 leading-relaxed">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section class="max-w-3xl mx-auto px-6 py-24 text-center">
        <div class="p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
          <h2 class="text-3xl font-bold mb-3">Start organizing today</h2>
          <p class="text-white/50 mb-8">Free for personal use. No credit card required.</p>
          <A
            href="/login"
            class="inline-flex px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-white/90 transition-colors"
          >
            Create free account
          </A>
        </div>
      </section>
    </main>
  );
}
