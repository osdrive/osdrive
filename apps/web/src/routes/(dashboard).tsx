import { useLocation, useNavigate } from "@solidjs/router";
import { useQueryClient } from "@tanstack/solid-query";
import { Cloud, Laptop, LogOut, Plus, Settings, Share2, Smartphone, User } from "lucide-solid";
import { createEffect, For, type ParentProps, Show, Switch, Match } from "solid-js";
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
  DialogTrigger,
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
import { DashboardUserContext } from "~/lib/dashboard-user";
import { api } from "~/lib/tanstack";

const specialDrives = [
  {
    id: "oscars-laptop",
    name: "Oscar's Laptop",
    type: "computer" as const,
  },
  {
    id: "oscars-phone",
    name: "Oscar's Phone",
    type: "phone" as const,
  },
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

function NewDriveDialog(props: {
  pending: boolean;
  onCreate: (name: string) => Promise<void>;
  children: any;
}) {
  let inputRef: HTMLInputElement | undefined;

  const inputClass =
    "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-colors";

  return (
    <Dialog>
      <DialogTrigger as="div">{props.children}</DialogTrigger>
      <DialogContent showCloseButton class="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create Cloud Drive</DialogTitle>
          <DialogDescription>
            Cloud drives are owned by your account for now. Team ownership can be added later.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await props.onCreate(inputRef?.value ?? "");
          }}
          class="space-y-3 mt-2"
        >
          <div class="space-y-1.5">
            <label class="text-xs font-medium text-stone-700">Drive name</label>
            <input
              ref={inputRef}
              type="text"
              required
              class={inputClass}
              placeholder="e.g. Company Files"
              autofocus
            />
          </div>
          <button
            type="submit"
            disabled={props.pending}
            class="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {props.pending ? "Creating..." : "Create Drive"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export default function DashboardLayout(props: ParentProps) {
  const session = authClient.useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const user = () => session().data?.user;

  createEffect(() => {
    if (!session().isPending && !user()) {
      navigate(`/login?returnTo=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  });

  const drivesQuery = api.Drive.getDrives.useQuery(() => ({
    enabled: !session().isPending && !!user(),
  }));

  const createDriveMutation = api.Drive.createDrive.useMutation(() => ({
    onSuccess: async (drive: { id: string }) => {
      await queryClient.invalidateQueries({ queryKey: api.Drive.getDrives.key() });
      navigate(`/drive/${drive.id}`);
    },
  }));

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
    <DashboardUserContext.Provider value={user}>
      <SidebarProvider>
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
                  <For each={drivesQuery.data ?? []}>
                    {(drive) => (
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          as="a"
                          href={`/drive/${drive.id}`}
                          isActive={location.pathname === `/drive/${drive.id}`}
                          tooltip={drive.name}
                        >
                          <DriveIcon type="cloud" />
                          <span>{drive.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </For>

                  <For each={specialDrives}>
                    {(drive) => (
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip={`${drive.name} (coming soon)`} disabled>
                          <DriveIcon type={drive.type} />
                          <span>{drive.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </For>

                  {/* New Drive button */}
                  <NewDriveDialog
                    pending={createDriveMutation.isPending}
                    onCreate={async (name) => {
                      await createDriveMutation.mutateAsync({ payload: { name } });
                    }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip="Add a Drive"
                        class="text-muted-foreground hover:text-foreground"
                      >
                        <Plus />
                        <span>Add a Drive</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </NewDriveDialog>
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
    </DashboardUserContext.Provider>
  );
}
