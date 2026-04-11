import { createAsync, useNavigate } from "@solidjs/router";
import { Check, ChevronsUpDown, LogOut, Search } from "lucide-solid";
import { createSignal, For, type ParentProps, Show } from "solid-js";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { requireCurrentUserQuery } from "~/server/legacy";
import { authClient } from "~/lib/auth";

// TODO:
//  - Tenant switching and creation
//  - Tenant settings w/ billing, account management
//  - Contact/feedback button
//  - DND for file uploads in layout
//
//  - Add "drives" to sidebar
//  - Search???
//  - Command + K menu

const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Building Your Application",
      url: "#",
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          title: "Data Fetching",
          url: "#",
          isActive: true,
        },
        {
          title: "Rendering",
          url: "#",
        },
        {
          title: "Caching",
          url: "#",
        },
        {
          title: "Styling",
          url: "#",
        },
        {
          title: "Optimizing",
          url: "#",
        },
        {
          title: "Configuring",
          url: "#",
        },
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Authentication",
          url: "#",
        },
        {
          title: "Deploying",
          url: "#",
        },
        {
          title: "Upgrading",
          url: "#",
        },
        {
          title: "Examples",
          url: "#",
        },
      ],
    },
    {
      title: "API Reference",
      url: "#",
      items: [
        {
          title: "Components",
          url: "#",
        },
        {
          title: "File Conventions",
          url: "#",
        },
        {
          title: "Functions",
          url: "#",
        },
        {
          title: "next.config.js Options",
          url: "#",
        },
        {
          title: "CLI",
          url: "#",
        },
        {
          title: "Edge Runtime",
          url: "#",
        },
      ],
    },
    {
      title: "Architecture",
      url: "#",
      items: [
        {
          title: "Accessibility",
          url: "#",
        },
        {
          title: "Fast Refresh",
          url: "#",
        },
        {
          title: "Next.js Compiler",
          url: "#",
        },
        {
          title: "Supported Browsers",
          url: "#",
        },
        {
          title: "Turbopack",
          url: "#",
        },
      ],
    },
  ],
};

export default function DashboardLayout(props: ParentProps) {
  const user = createAsync(() => requireCurrentUserQuery());

  const navigate = useNavigate();
  const [selectedVersion, setSelectedVersion] = createSignal(data.versions[0]);

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  as={SidebarMenuButton}
                  size="lg"
                  class="data-expanded:bg-sidebar-accent data-expanded:text-sidebar-accent-foreground"
                >
                  <div class="flex flex-col gap-0.5 leading-none">
                    <span class="font-medium">Documentation</span>
                    <span class="text-muted-foreground text-xs">v{selectedVersion()}</span>
                  </div>
                  <ChevronsUpDown class="ml-auto" />
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-(--kb-popper-anchor-width)">
                  <For each={data.versions}>
                    {(version) => (
                      <DropdownMenuItem onSelect={() => setSelectedVersion(version)}>
                        v{version}
                        <Show when={version === selectedVersion()}>
                          <Check class="ml-auto" />
                        </Show>
                      </DropdownMenuItem>
                    )}
                  </For>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          <form>
            <SidebarGroup class="py-0">
              <SidebarGroupContent class="relative">
                <Label for="search" class="sr-only">
                  Search
                </Label>
                <SidebarInput id="search" placeholder="Search the docs..." class="pl-8" />
                <Search class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 select-none opacity-50" />
              </SidebarGroupContent>
            </SidebarGroup>
          </form>
        </SidebarHeader>
        <SidebarContent>
          <For each={data.navMain}>
            {(item) => (
              <SidebarGroup>
                <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <For each={item.items}>
                      {(subItem) => (
                        <SidebarMenuItem>
                          <SidebarMenuButton as="a" href={subItem.url} isActive={subItem.isActive}>
                            {subItem.title}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}
                    </For>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </For>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div class="flex items-center gap-2 px-2 py-1.5">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
                  {user()?.name?.[0]?.toUpperCase() ?? "?"}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">{user()?.name}</p>
                  <p class="truncate text-xs text-muted-foreground">{user()?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  class="ml-auto rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  title="Sign out"
                >
                  <LogOut class="size-4" />
                </button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {props.children}
      </SidebarInset>
    </SidebarProvider>
  );
}
