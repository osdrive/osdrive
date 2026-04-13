import { createAsync, useLocation, useNavigate } from "@solidjs/router";
import { Cloud, Download, Laptop, LogOut, Plus, Settings, Share2, Smartphone, User } from "lucide-solid";
import { createSignal, For, type ParentProps, Show, Switch, Match } from "solid-js";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { UserDropdown } from "~/components/user-dropdown";
import { authClient } from "~/lib/auth";
import { requireCurrentUserQuery } from "~/server/legacy";

// ---------------------------------------------------------------------------
// Drives (hardcoded — replace with real data when the API is wired up)
// ---------------------------------------------------------------------------
const drives = [
  {
    id: "company-files",
    name: "Company Files",
    type: "cloud" as const,
    href: "/drive/company-files",
  },
  {
    id: "oscars-laptop",
    name: "Oscar's Laptop",
    type: "computer" as const,
    href: "/drive/oscars-laptop",
  },
  {
    id: "oscars-phone",
    name: "Oscar's Phone",
    type: "phone" as const,
    href: "/drive/oscars-phone",
  },
];

// Hardcoded teams shown in the "create cloud drive" step
const teams = [
  { id: "personal", name: "My Account" },
  { id: "team-acme", name: "Acme Corp" },
];

// ---------------------------------------------------------------------------
// Route → breadcrumb title mapping
// ---------------------------------------------------------------------------
function breadcrumbForPath(path: string) {
  if (path === "/dashboard") return "Dashboard";
  if (path === "/account") return "Account";
  if (path === "/settings") return "Settings";
  if (path === "/share") return "Share";
  if (path.startsWith("/drive/")) return "Drive";
  return "Dashboard";
}

// ---------------------------------------------------------------------------
// New Drive dialog
// ---------------------------------------------------------------------------
type DialogStep = "select" | "cloud" | "device-laptop" | "device-phone";

function DriveIcon(props: { type: "cloud" | "computer" | "phone"; class?: string }) {
  return (
    <Switch>
      <Match when={props.type === "cloud"}>
        <Cloud class={props.class} />
      </Match>
      <Match when={props.type === "computer"}>
        <Laptop class={props.class} />
      </Match>
      <Match when={props.type === "phone"}>
        <Smartphone class={props.class} />
      </Match>
    </Switch>
  );
}

function NewDriveDialog(props: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = createSignal<DialogStep>("select");
  const [driveName, setDriveName] = createSignal("");
  const [selectedTeam, setSelectedTeam] = createSignal(teams[0].id);

  const reset = () => {
    setStep("select");
    setDriveName("");
    setSelectedTeam(teams[0].id);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) reset();
    props.onOpenChange(v);
  };

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-colors";

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton class="max-w-sm">
        <Switch>
          {/* ── Step 1: choose drive type ── */}
          <Match when={step() === "select"}>
            <DialogHeader>
              <DialogTitle>Add a Drive</DialogTitle>
              <DialogDescription>
                Choose how you'd like to add storage to OSDrive.
              </DialogDescription>
            </DialogHeader>
            <div class="grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={() => setStep("cloud")}
                class="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 p-4 text-center hover:bg-muted hover:border-stone-300 transition-colors cursor-pointer"
              >
                <Cloud class="size-7 text-blue-500" />
                <span class="text-xs font-medium">Cloud Drive</span>
                <span class="text-xs text-muted-foreground leading-snug">
                  Store and share files from any device.
                </span>
              </button>
              <button
                onClick={() => setStep("device-laptop")}
                class="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 p-4 text-center hover:bg-muted hover:border-stone-300 transition-colors cursor-pointer"
              >
                <Laptop class="size-7 text-stone-500" />
                <span class="text-xs font-medium">Laptop</span>
                <span class="text-xs text-muted-foreground leading-snug">
                  Access files on your Mac or PC.
                </span>
              </button>
              <button
                onClick={() => setStep("device-phone")}
                class="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 p-4 text-center hover:bg-muted hover:border-stone-300 transition-colors cursor-pointer"
              >
                <Smartphone class="size-7 text-stone-500" />
                <span class="text-xs font-medium">Phone</span>
                <span class="text-xs text-muted-foreground leading-snug">
                  Access files on your phone.
                </span>
              </button>
            </div>
          </Match>

          {/* ── Step 2a: cloud drive form ── */}
          <Match when={step() === "cloud"}>
            <DialogHeader>
              <DialogTitle>Create Cloud Drive</DialogTitle>
              <DialogDescription>
                Add a cloud storage drive accessible from any device.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleOpenChange(false);
              }}
              class="space-y-3 mt-2"
            >
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-stone-700">Drive name</label>
                <input
                  type="text"
                  required
                  value={driveName()}
                  onInput={(e) => setDriveName(e.currentTarget.value)}
                  class={inputClass}
                  placeholder="e.g. Company Files"
                  autofocus
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-medium text-stone-700">Team</label>
                <select
                  value={selectedTeam()}
                  onChange={(e) => setSelectedTeam(e.currentTarget.value)}
                  class={inputClass}
                >
                  <For each={teams}>{(t) => <option value={t.id}>{t.name}</option>}</For>
                </select>
              </div>
              <div class="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  class="flex-1 rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  class="flex-1 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
                >
                  Create Drive
                </button>
              </div>
            </form>
          </Match>

          {/* ── Step 2b: laptop download prompt ── */}
          <Match when={step() === "device-laptop"}>
            <DialogHeader>
              <DialogTitle>Connect Your Laptop</DialogTitle>
              <DialogDescription>
                To access files on your laptop, download the OSDrive desktop app and sign in with
                your account.
              </DialogDescription>
            </DialogHeader>
            <div class="mt-2 flex flex-col gap-2">
              <a
                href="#"
                class="flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Download class="size-4 shrink-0" />
                Download for Mac
              </a>
              <a
                href="#"
                class="flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Download class="size-4 shrink-0" />
                Download for Windows
              </a>
            </div>
            <button
              type="button"
              onClick={() => setStep("select")}
              class="mt-3 w-full rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Back
            </button>
          </Match>

          {/* ── Step 2c: phone download prompt ── */}
          <Match when={step() === "device-phone"}>
            <DialogHeader>
              <DialogTitle>Connect Your Phone</DialogTitle>
              <DialogDescription>
                To access files on your phone, download the OSDrive mobile app and sign in with your
                account.
              </DialogDescription>
            </DialogHeader>
            <div class="mt-2 flex flex-col gap-2">
              <a
                href="#"
                class="flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Download class="size-4 shrink-0" />
                Download for iOS
              </a>
              <a
                href="#"
                class="flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Download class="size-4 shrink-0" />
                Download for Android
              </a>
            </div>
            <button
              type="button"
              onClick={() => setStep("select")}
              class="mt-3 w-full rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Back
            </button>
          </Match>
        </Switch>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export default function DashboardLayout(props: ParentProps) {
  const user = createAsync(() => requireCurrentUserQuery());
  const navigate = useNavigate();
  const location = useLocation();
  const [showNewDrive, setShowNewDrive] = createSignal(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate("/login", { replace: true });
  };

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.[0]?.toUpperCase() ?? "?";
  }

  return (
    <SidebarProvider>
      <NewDriveDialog open={showNewDrive()} onOpenChange={setShowNewDrive} />

      <Sidebar collapsible="icon">
        {/* ── Logo ── */}
        <SidebarHeader class="border-b border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                as="a"
                href="/dashboard"
                size="lg"
                class="gap-2.5 px-2 hover:bg-sidebar-accent"
                tooltip="OSDrive"
              >
                <img src="/assets/icon-dark.svg" alt="OSDrive" class="size-7 rounded shrink-0" />
                <span class="font-semibold tracking-tight">OSDrive</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ── Drives ── */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel class="text-xs text-muted-foreground px-3 py-1.5">
              Drives
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <For each={drives}>
                  {(drive) => (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        as="a"
                        href={drive.href}
                        isActive={location.pathname === drive.href}
                        tooltip={drive.name}
                      >
                        <DriveIcon type={drive.type} />
                        <span>{drive.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </For>

                {/* New Drive button */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setShowNewDrive(true)}
                    tooltip="Add a Drive"
                    class="text-muted-foreground hover:text-foreground"
                  >
                    <Plus />
                    <span>Add a Drive</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer: Share + Settings + User ── */}
        <SidebarFooter class="border-t border-sidebar-border">
          <SidebarMenu>
            {/* Share */}
            <SidebarMenuItem>
              <SidebarMenuButton
                as="a"
                href="/share"
                isActive={location.pathname === "/share"}
                tooltip="Share"
              >
                <Share2 />
                <span>Share</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Settings */}
            <SidebarMenuItem>
              <SidebarMenuButton
                as="a"
                href="/settings"
                isActive={location.pathname === "/settings"}
                tooltip="Settings"
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* User */}
            <SidebarMenuItem>
              <DropdownMenu placement="top-start">
                <DropdownMenuTrigger
                  as={SidebarMenuButton}
                  size="lg"
                  class="gap-2 data-expanded:bg-sidebar-accent"
                  tooltip={user()?.name ?? "Account"}
                >
                  <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-stone-50 text-xs font-semibold">
                    <Show
                      when={user()?.image}
                      fallback={<span>{getInitials(user()?.name ?? "?")}</span>}
                    >
                      <img
                        src={user()!.image!}
                        alt={user()?.name ?? ""}
                        class="size-full rounded-full object-cover"
                      />
                    </Show>
                  </span>
                  <div class="min-w-0 flex-1 text-left">
                    <p class="truncate text-sm font-medium leading-none">{user()?.name}</p>
                    <p class="truncate text-xs text-muted-foreground mt-0.5">{user()?.email}</p>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent class="w-52 rounded-xl border bg-white p-1 shadow-lg">
                  <div class="px-3 py-2 border-b border-stone-100 mb-1">
                    <p class="text-sm font-medium text-stone-900 truncate">{user()?.name}</p>
                    <p class="text-xs text-stone-500 truncate mt-0.5">{user()?.email}</p>
                  </div>
                  <DropdownMenuItem
                    as="a"
                    href="/account"
                    class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <User class="size-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator class="my-1" />
                  <DropdownMenuItem
                    onSelect={handleSignOut}
                    class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <LogOut class="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header class="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumbForPath(location.pathname)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div class="ml-auto">
            <UserDropdown user={user()} onSignOut={handleSignOut} />
          </div>
        </header>
        {props.children}
      </SidebarInset>
    </SidebarProvider>
  );
}
