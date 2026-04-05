import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

/**
 * Dark - Deep blacks with high contrast accents
 * SpaceDrive-inspired, technical/developer aesthetic
 */
export default function LandingDark() {
  return (
    <main class="min-h-screen bg-black">
      <Title>OpenDrive | Take control of your files</Title>

      {/* Hero */}
      <section class="relative overflow-hidden">
        {/* Grid background */}
        <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_70%)]" />

        <div class="relative max-w-5xl mx-auto px-6 pt-32 pb-24">
          <div class="flex items-center justify-center gap-3 mb-8">
            <span class="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/60 font-mono">
              v2.0.0
            </span>
            <span class="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
              stable
            </span>
          </div>

          <h1 class="text-center text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-[0.95] tracking-tight mb-8">
            <span class="text-white">Take control</span>
            <br />
            <span class="text-white/30">of your files</span>
          </h1>

          <p class="text-center text-lg text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            A cross-platform file manager that combines your devices, cloud services,
            and network drives into one unified virtual filesystem.
          </p>

          <div class="flex items-center justify-center gap-4 flex-wrap">
            <A
              href="/login"
              class="group flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              <span>Get started</span>
              <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </A>
            <a
              href="https://github.com"
              class="flex items-center gap-2 px-6 py-3 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Star on GitHub</span>
            </a>
          </div>

          {/* Platform badges */}
          <div class="flex items-center justify-center gap-6 mt-12 text-white/30">
            {["macOS", "Windows", "Linux", "iOS", "Android"].map((platform) => (
              <span class="text-sm">{platform}</span>
            ))}
          </div>
        </div>
      </section>

      {/* App screenshot */}
      <section class="max-w-6xl mx-auto px-6 pb-24">
        <div class="relative">
          <div class="absolute -inset-px rounded-xl bg-gradient-to-b from-white/10 to-transparent" />
          <div class="relative rounded-xl bg-[#0a0a0a] border border-white/5 overflow-hidden">
            {/* Window chrome */}
            <div class="flex items-center gap-4 px-4 py-3 border-b border-white/5">
              <div class="flex gap-1.5">
                <span class="w-3 h-3 rounded-full bg-white/10" />
                <span class="w-3 h-3 rounded-full bg-white/10" />
                <span class="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div class="flex-1 flex items-center justify-center">
                <div class="flex items-center gap-2 px-3 py-1 rounded bg-white/5 text-sm text-white/40">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  All Files
                </div>
              </div>
            </div>

            {/* App content */}
            <div class="grid grid-cols-[200px_1fr_280px] max-lg:grid-cols-[180px_1fr] max-md:grid-cols-1 min-h-[500px]">
              {/* Sidebar */}
              <aside class="border-r border-white/5 p-3 max-md:border-r-0 max-md:border-b">
                <div class="space-y-4">
                  <div>
                    <p class="text-[10px] uppercase tracking-wider text-white/20 px-2 mb-1">Locations</p>
                    {[
                      { icon: "📁", name: "All Files", active: true },
                      { icon: "🕐", name: "Recent", count: 24 },
                      { icon: "⭐", name: "Favorites" },
                      { icon: "🗑️", name: "Trash" },
                    ].map((item) => (
                      <div class={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${item.active ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70"}`}>
                        <span class="text-xs">{item.icon}</span>
                        <span class="flex-1 truncate">{item.name}</span>
                        {item.count && <span class="text-xs text-white/30">{item.count}</span>}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p class="text-[10px] uppercase tracking-wider text-white/20 px-2 mb-1">Devices</p>
                    {[
                      { icon: "💻", name: "This Mac", status: "local" },
                      { icon: "📱", name: "iPhone", status: "synced" },
                      { icon: "🖥️", name: "Office NAS", status: "network" },
                    ].map((device) => (
                      <div class="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-white/50 hover:text-white/70 cursor-pointer transition-colors">
                        <span class="text-xs">{device.icon}</span>
                        <span class="flex-1 truncate">{device.name}</span>
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p class="text-[10px] uppercase tracking-wider text-white/20 px-2 mb-1">Tags</p>
                    <div class="flex flex-wrap gap-1 px-2">
                      {[
                        { color: "bg-red-500", name: "Work" },
                        { color: "bg-blue-500", name: "Personal" },
                        { color: "bg-emerald-500", name: "Archive" },
                      ].map((tag) => (
                        <span class={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white/60`}>
                          <span class={`w-2 h-2 rounded-full ${tag.color}`} />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <div class="p-4">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <button class="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white/60 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button class="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white/60 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <span class="text-sm text-white/60">All Files</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button class="p-1.5 rounded bg-white/5 text-white/60">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button class="p-1.5 rounded hover:bg-white/5 text-white/40">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-5 gap-3 max-lg:grid-cols-4 max-sm:grid-cols-3">
                  {[
                    { name: "Documents", type: "folder", items: 47 },
                    { name: "Images", type: "folder", items: 1283 },
                    { name: "Projects", type: "folder", items: 8 },
                    { name: "Videos", type: "folder", items: 24 },
                    { name: "Downloads", type: "folder", items: 156 },
                    { name: "report.pdf", type: "pdf", size: "2.4 MB" },
                    { name: "design.fig", type: "figma", size: "48 MB" },
                    { name: "notes.md", type: "markdown", size: "12 KB" },
                    { name: "backup.zip", type: "archive", size: "1.2 GB" },
                    { name: "photo.jpg", type: "image", size: "4.8 MB" },
                  ].map((item) => (
                    <div class="group flex flex-col items-center p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                      <div class={`w-12 h-12 rounded-lg mb-2 flex items-center justify-center ${
                        item.type === "folder" ? "bg-blue-500/20" :
                        item.type === "pdf" ? "bg-red-500/20" :
                        item.type === "figma" ? "bg-purple-500/20" :
                        item.type === "markdown" ? "bg-white/10" :
                        item.type === "archive" ? "bg-amber-500/20" :
                        "bg-emerald-500/20"
                      }`}>
                        <span class="text-lg">
                          {item.type === "folder" ? "📁" :
                           item.type === "pdf" ? "📄" :
                           item.type === "figma" ? "🎨" :
                           item.type === "markdown" ? "📝" :
                           item.type === "archive" ? "📦" : "🖼️"}
                        </span>
                      </div>
                      <p class="text-xs text-center text-white/70 truncate w-full">{item.name}</p>
                      <p class="text-[10px] text-white/30">
                        {item.items ? `${item.items} items` : item.size}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspector */}
              <aside class="border-l border-white/5 p-4 max-lg:hidden">
                <div class="text-center mb-4">
                  <div class="w-20 h-20 rounded-xl bg-blue-500/20 mx-auto mb-3 flex items-center justify-center">
                    <span class="text-3xl">📁</span>
                  </div>
                  <p class="font-medium">Documents</p>
                  <p class="text-xs text-white/40">47 items · 2.4 GB</p>
                </div>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-white/40">Kind</span>
                    <span class="text-white/70">Folder</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/40">Created</span>
                    <span class="text-white/70">Jan 12, 2024</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/40">Modified</span>
                    <span class="text-white/70">Today, 2:34 PM</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-white/40">Location</span>
                    <span class="text-white/70">This Mac</span>
                  </div>
                  <div class="pt-3 border-t border-white/5">
                    <p class="text-white/40 mb-2">Tags</p>
                    <div class="flex gap-1">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-xs">
                        <span class="w-2 h-2 rounded-full bg-blue-500" />
                        Personal
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section class="max-w-5xl mx-auto px-6 py-24 border-t border-white/5">
        <div class="grid grid-cols-3 gap-12 max-md:grid-cols-1">
          {[
            {
              title: "Virtual filesystem",
              desc: "Combine local storage, cloud services, and network drives into one unified view. No more switching between apps.",
              icon: (
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ),
            },
            {
              title: "P2P sync",
              desc: "Sync directly between devices on your local network. Fast, private, and doesn't count against cloud storage limits.",
              icon: (
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              ),
            },
            {
              title: "Smart tagging",
              desc: "Organize files with tags, not folders. Find anything instantly with powerful search and AI-powered suggestions.",
              icon: (
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              ),
            },
          ].map((feature) => (
            <article>
              <div class="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/60">
                {feature.icon}
              </div>
              <h3 class="text-lg font-semibold mb-2">{feature.title}</h3>
              <p class="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section class="max-w-3xl mx-auto px-6 py-24 text-center border-t border-white/5">
        <h2 class="text-3xl font-bold mb-4">Open source. Cross platform.</h2>
        <p class="text-white/40 mb-8">Free for personal use. Enterprise plans available.</p>
        <div class="flex items-center justify-center gap-4 flex-wrap">
          <A
            href="/login"
            class="px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            Download for free
          </A>
          <a
            href="#"
            class="px-6 py-3 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/20 transition-colors"
          >
            View documentation
          </a>
        </div>
      </section>
    </main>
  );
}
