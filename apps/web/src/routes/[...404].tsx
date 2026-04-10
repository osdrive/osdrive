import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <header class="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
        <div class="mx-auto max-w-7xl px-8 flex h-16 items-center justify-between">
          <a href="/" class="flex items-center gap-2">
            <img src="/assets/icon-dark.svg" alt="OSDrive" class="h-6 w-6 rounded" />
            <span class="font-semibold tracking-tight">OSDrive</span>
          </a>
          <div class="flex items-center gap-3">
            <a href="/dashboard">
              <Button variant="outline" size="sm" class="rounded-full border-stone-300 text-stone-600">
                Dashboard
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main class="flex-1 flex items-center justify-center px-8 py-24">
        <div class="text-center max-w-sm">
          <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-7">404</p>
          <h1 class="text-5xl font-light tracking-tight text-stone-900 leading-tight mb-5">
            Page not found.
          </h1>
          <p class="text-stone-500 text-sm leading-relaxed mb-10">
            This page doesn't exist or was moved. Head back home and we'll get you sorted.
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <a href="/">
              <Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-8 h-11">
                Go home
              </Button>
            </a>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="border-stone-300 text-stone-600 hover:bg-stone-100 rounded-full px-8 h-11">
                Dashboard →
              </Button>
            </a>
          </div>
        </div>
      </main>

      <footer class="border-t border-stone-200 py-8 px-8">
        <div class="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-stone-400">
          <div class="flex items-center gap-2">
            <img src="/assets/icon-dark.svg" alt="OSDrive" class="h-4 w-4 rounded" />
            <span class="font-medium text-stone-900">OSDrive</span>
            <span>© 2025</span>
          </div>
          <div class="flex flex-wrap justify-center gap-6">
            {[["Privacy", "/privacy"], ["Terms", "/terms"], ["Docs", "/docs"], ["Dashboard", "/dashboard"]].map(([l, h]) => (
              <a href={h} class="hover:text-stone-900 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
