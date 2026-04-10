import { useLocation } from "@solidjs/router";
import { type ParentProps, Show } from "solid-js";
import { authClient } from "~/lib/auth-client";

const NAV_LINKS = [
  { label: "Product", href: "/#product" },
  { label: "Enterprise", href: "/#enterprise" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
];

const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Docs", href: "/docs" },
  { label: "Support", href: "mailto:oscar@osdrive.app" },
];


export default function Layout(props: ParentProps) {
  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <TopNavigation />

      {props.children}

      <Footer />
    </div>
  );
}


function TopNavigation() {
  const session = authClient.useSession();
  const location = useLocation();

  const isActive = (href: string) =>
    href.startsWith("/") && !href.startsWith("/#") && location.pathname === href;

  return (
    <header class="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
      <div class="mx-auto max-w-7xl px-8 flex h-16 items-center justify-between">
        <a href="/" class="flex items-center gap-2 shrink-0">
          <img src="/assets/icon-dark.svg" alt="OSDrive" class="h-6 w-6 rounded" />
          <span class="font-semibold tracking-tight">OSDrive</span>
        </a>

        <nav class="hidden md:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((link) => (
            <a
              href={link.href}
              class={`transition-colors ${isActive(link.href) ? "text-stone-900 font-medium" : "text-stone-500 hover:text-stone-900"}`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div class="flex items-center gap-3 shrink-0">
          <Show
            when={!session.isPending && session().data?.user}
            fallback={
              <a
                href="/dashboard"
                class="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-sm text-stone-600 shadow-sm transition-colors hover:border-stone-400 hover:text-stone-900"
              >
                Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            }
          >
            {(user) => (
              <a
                href="/dashboard"
                class="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white pl-1.5 pr-3.5 py-1 text-sm shadow-sm transition-colors hover:border-stone-300"
              >
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-[11px] font-semibold text-stone-50 shrink-0">
                  {user().name?.[0]?.toUpperCase() ?? "?"}
                </span>
                <span class="font-medium text-stone-700">{user().name?.split(" ")[0]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-stone-400"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
            )}
          </Show>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer class="border-t border-stone-200 py-8 px-8">
      <div class="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-stone-400">
        <div class="flex items-center gap-2">
          <span><a href="https://otbeaumont.me" class="inline hover:underline">Oscar Beaumont</a> © 2025</span>
        </div>
        <div class="flex flex-wrap justify-center gap-6">
          {FOOTER_LINKS.map(({ label, href }) => (
            <a href={href} class="hover:text-stone-900 transition-colors">
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
