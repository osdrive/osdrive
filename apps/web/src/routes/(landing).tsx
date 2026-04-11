import { useLocation } from "@solidjs/router";
import { type ParentProps, Show, createSignal, onCleanup, onMount } from "solid-js";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth";


export default function Layout(props: ParentProps) {
  return (
    <div class="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      <TopNavigation />

      {props.children}

      <Footer />
    </div>
  );
}

function NavigationLink(props: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={props.href}
      class={`transition-colors ${props.active ? "text-stone-900 font-medium" : "text-stone-500 hover:text-stone-900"}`}
    >
      {props.label}
    </a>
  );
}

function FooterLink(props: { href: string; label: string }) {
  return (
    <a href={props.href} class="hover:text-stone-900 transition-colors">
      {props.label}
    </a>
  );
}


function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() ?? "?";
}

function TopNavigation() {
  const session = authClient.useSession();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  const isActive = (href: string) =>
    href.startsWith("/") && !href.startsWith("/#") && location.pathname === href;

  const handleOutsideClick = (e: MouseEvent) => {
    if (containerRef && !containerRef.contains(e.target as Node))
      setDropdownOpen(false);
  };

  onMount(() => document.addEventListener("mousedown", handleOutsideClick));
  onCleanup(() => document.removeEventListener("mousedown", handleOutsideClick));

  const handleLogout = async () => {
    setDropdownOpen(false);
    await authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } });
  };

  return (
    <header class="sticky top-0 z-50 bg-stone-50/95 backdrop-blur-sm border-b border-stone-200">
      <div class="mx-auto max-w-7xl px-8 flex h-16 items-center justify-between">
        <a href="/" class="flex items-center gap-2 shrink-0">
          <img src="/assets/icon-dark.svg" alt="OSDrive" class="h-6 w-6 rounded" />
          <span class="font-semibold tracking-tight">OSDrive</span>
        </a>

        <nav class="hidden md:flex items-center gap-8 text-sm">
          <NavigationLink href="/#product" label="Product" active={isActive("/#product")} />
          <NavigationLink href="/#enterprise" label="Enterprise" active={isActive("/#enterprise")} />
          <NavigationLink href="/#pricing" label="Pricing" active={isActive("/#pricing")} />
          <NavigationLink href="/docs" label="Docs" active={isActive("/docs")} />
        </nav>

        <div class="flex items-center gap-3 shrink-0">
          {/* Dashboard button — only visible when authenticated, fades in */}
          <Show when={!session().isPending && session().data?.user}>
            <Button as="a" href="/dashboard" variant="outline" size="sm" class="rounded-full border-stone-300 text-stone-600 hover:bg-stone-100 animate-in fade-in duration-300">
              Dashboard →
            </Button>
          </Show>

          {/* Avatar button + dropdown */}
          <div ref={containerRef} class="relative">
            <Show
              when={!session().isPending}
              fallback={
                /* Pending: greyed-out placeholder */
                <div class="h-8 w-8 rounded-full bg-stone-200 opacity-50 animate-pulse" />
              }
            >
              <Show
                when={session().data?.user}
                fallback={
                  <Button as="a" href="/login" size="sm" class="rounded-full h-52 text-white">
                    Sign in
                  </Button>
                }
              >
                {(user) => (
                  <>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((o) => !o)}
                      class="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-stone-900 text-stone-50 text-xs font-semibold hover:ring-2 hover:ring-stone-300 hover:ring-offset-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
                      aria-label="Account menu"
                      aria-expanded={dropdownOpen()}
                    >
                      <Show
                        when={user().image}
                        fallback={<span>{getInitials(user().name ?? "?")}</span>}
                      >
                        <img
                          src={user().image!}
                          alt={user().name ?? ""}
                          class="h-full w-full object-cover"
                        />
                      </Show>
                    </button>

                    <Show when={dropdownOpen()}>
                      <div class="animate-in fade-in slide-in-from-top-1 duration-150 absolute right-0 top-full mt-2 w-56 rounded-xl border border-stone-200 bg-white shadow-lg z-50 overflow-hidden">
                        <div class="px-4 py-3 border-b border-stone-100">
                          <p class="text-sm font-medium text-stone-900 truncate">{user().name}</p>
                          <p class="text-xs text-stone-500 truncate mt-0.5">{user().email}</p>
                        </div>
                        <div class="p-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            class="w-full text-left rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    </Show>
                  </>
                )}
              </Show>
            </Show>
          </div>
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
          <FooterLink href="/privacy" label="Privacy" />
          <FooterLink href="/terms" label="Terms" />
          <FooterLink href="/docs" label="Docs" />
          <FooterLink href="mailto:oscar@osdrive.app" label="Support" />
        </div>
      </div>
    </footer>
  );
}
