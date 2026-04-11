import * as Popover from "@kobalte/core/popover";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export default function Page() {
  return (
    <>
      {/* Hero — centered, no right panel */}
      <section class="pt-24 pb-18 px-8">
        <div class="mx-auto max-w-3xl text-center">
          <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-7">Cloud storage that disappears into your workflow</p>
          <h1 class="text-6xl md:text-7xl font-light tracking-tight text-stone-900 leading-[1.02] mb-7">
            The cloud drive<br />that <em class="italic">feels</em> local.
          </h1>
          <p class="text-lg text-stone-500 leading-relaxed mb-10 max-w-xl mx-auto">
            OSDrive mounts your cloud storage natively in Finder, keeps a live filesystem index for instant access, and syncs across every device — automatically.
          </p>
          <div class="flex flex-wrap justify-center gap-3 mb-12">
            <DownloadButton size="lg" class="px-10 h-12">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download free
            </DownloadButton>
            <a href="/dashboard">
              <Button variant="outline" size="lg" class="border-stone-300 text-stone-600 hover:bg-stone-100 rounded-full px-10 h-12">Open Dashboard →</Button>
            </a>
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      <section id="product" class="py-20 px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-14">
            <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4">Product</p>
            <h2 class="text-4xl font-light text-stone-900 tracking-tight max-w-lg leading-snug">Everything you need, nothing you don't.</h2>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CapabilityCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>}
              title="Native Mounting"
              desc="Your drives appear in Finder and Explorer as local volumes. No abstraction, no extra apps."
            />
            <CapabilityCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
              title="Live Filesystem Index"
              desc="Every search, listing, and move served from an in-memory index. Under 50ms, always."
            />
            <CapabilityCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>}
              title="Cross-Device Sync"
              desc="Block-level delta sync propagates changes instantly. Every device, always current."
            />
            <CapabilityCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>}
              title="Secure Sharing"
              desc="Shareable links with per-user permissions, expiry, passwords, and a full access log."
            />
            <CapabilityCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
              title="Cloud Drive Creation"
              desc="Provision drives in seconds. Set quotas, access policies, and RBAC from day one."
            />
            <CapabilityCard
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>}
              title="File Explorer UI"
              desc="A full browser-based file manager is coming — manage every drive from any device."
              soon
            />
          </div>
        </div>
      </section>

      <section class="py-20 px-8 bg-stone-900">
        <div class="mx-auto max-w-7xl">
          <p class="text-xs text-stone-600 uppercase tracking-[0.2em] mb-12">Scale</p>
          <div class="grid md:grid-cols-3 gap-12">
            <ScaleStat value="10 billion" unit="files indexed" description="across all active installations globally" />
            <ScaleStat value="99.99%" unit="uptime" description="measured continuously for two years" />
            <ScaleStat value="< 50ms" unit="index latency" description="for any filesystem operation on mounted drives" />
          </div>
        </div>
      </section>

      <section id="enterprise" class="py-20 px-8">
        <div class="mx-auto max-w-7xl grid md:grid-cols-2 gap-20 items-start">
          <div>
            <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-6">Enterprise</p>
            <h2 class="text-4xl font-light tracking-tight mb-6 leading-snug">Scales from one person<br />to your entire org</h2>
            <p class="text-stone-500 text-sm leading-relaxed mb-8">Start on the free tier and grow into SSO, SCIM, audit logs, data residency, and a dedicated SLA — same product, same native feel throughout.</p>
            <div class="flex gap-3">
              <a href="/contact"><Button size="lg" class="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full px-8">Talk to sales</Button></a>
              <a href="/dashboard"><Button variant="outline" size="lg" class="border-stone-300 text-stone-600 hover:bg-stone-100 rounded-full px-8">Start free</Button></a>
            </div>
          </div>
          <div>
            <EnterpriseFeatureRow label="SSO (SAML 2.0, OIDC)" />
            <EnterpriseFeatureRow label="SCIM provisioning & deprovisioning" withSeparator />
            <EnterpriseFeatureRow label="Role-based access control" withSeparator />
            <EnterpriseFeatureRow label="Immutable audit trail" withSeparator />
            <EnterpriseFeatureRow label="Custom data residency" withSeparator />
            <EnterpriseFeatureRow label="On-premise deployment" withSeparator />
            <EnterpriseFeatureRow label="Dedicated SLA & priority support" withSeparator />
            <EnterpriseFeatureRow label="Volume licensing & invoice billing" withSeparator />
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      <section id="pricing" class="py-20 px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mb-14">
            <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4">Pricing</p>
            <h2 class="text-4xl font-light text-stone-900 tracking-tight leading-snug">Simple, predictable pricing.</h2>
          </div>
          <div class="grid md:grid-cols-3 gap-5 items-start">
            {/* Free */}
            <div class="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
              <p class="text-sm font-medium text-stone-900 mb-1">Free</p>
              <div class="flex items-baseline gap-1 mb-1">
                <span class="text-4xl font-light text-stone-900">$0</span>
                <span class="text-stone-400 text-sm">/ mo</span>
              </div>
              <p class="text-xs text-stone-400 mb-8">For personal use. No card required.</p>
              <a href="/dashboard">
                <Button variant="outline" class="w-full rounded-full border-stone-300 text-stone-600 hover:bg-stone-100 mb-8">Get started</Button>
              </a>
              <ul class="space-y-3 text-sm text-stone-500">
                <PricingFeatureItem text="50 GB storage" iconClass="text-stone-400" />
                <PricingFeatureItem text="1 drive" iconClass="text-stone-400" />
                <PricingFeatureItem text="2 devices" iconClass="text-stone-400" />
                <PricingFeatureItem text="Basic sharing" iconClass="text-stone-400" />
              </ul>
            </div>

            {/* Pro — featured */}
            <div class="rounded-2xl border border-stone-900 bg-stone-900 p-8 shadow-sm">
              <div class="flex items-center justify-between mb-1">
                <p class="text-sm font-medium text-stone-50">Pro</p>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-stone-700 text-stone-300 font-medium">Most popular</span>
              </div>
              <div class="flex items-baseline gap-1 mb-1">
                <span class="text-4xl font-light text-stone-50">$9</span>
                <span class="text-stone-500 text-sm">/ mo</span>
              </div>
              <p class="text-xs text-stone-500 mb-8">Everything you need as an individual or small team.</p>
              <a href="/dashboard">
                <Button class="w-full rounded-full bg-stone-50 text-stone-900 hover:bg-white mb-8">Get started</Button>
              </a>
              <ul class="space-y-3 text-sm text-stone-400">
                <PricingFeatureItem text="2 TB storage" iconClass="text-stone-500" />
                <PricingFeatureItem text="Unlimited drives" iconClass="text-stone-500" />
                <PricingFeatureItem text="10 devices" iconClass="text-stone-500" />
                <PricingFeatureItem text="Advanced sharing & permissions" iconClass="text-stone-500" />
                <PricingFeatureItem text="Priority sync" iconClass="text-stone-500" />
                <PricingFeatureItem text="Email support" iconClass="text-stone-500" />
              </ul>
            </div>

            {/* Team */}
            <div class="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
              <p class="text-sm font-medium text-stone-900 mb-1">Team</p>
              <div class="flex items-baseline gap-1 mb-1">
                <span class="text-4xl font-light text-stone-900">$25</span>
                <span class="text-stone-400 text-sm">/ user / mo</span>
              </div>
              <p class="text-xs text-stone-400 mb-8">For teams that need shared drives and admin controls.</p>
              <a href="/contact">
                <Button variant="outline" class="w-full rounded-full border-stone-300 text-stone-600 hover:bg-stone-100 mb-8">Talk to sales</Button>
              </a>
              <ul class="space-y-3 text-sm text-stone-500">
                <PricingFeatureItem text="5 TB per user" iconClass="text-stone-400" />
                <PricingFeatureItem text="Shared team drives" iconClass="text-stone-400" />
                <PricingFeatureItem text="Unlimited devices" iconClass="text-stone-400" />
                <PricingFeatureItem text="RBAC & audit log" iconClass="text-stone-400" />
                <PricingFeatureItem text="SSO (SAML, OIDC)" iconClass="text-stone-400" />
                <PricingFeatureItem text="Dedicated support & SLA" iconClass="text-stone-400" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Separator class="bg-stone-200" />

      <section class="py-28 px-8">
        <div class="mx-auto max-w-xl text-center">
          <h2 class="text-5xl font-light tracking-tight mb-5 leading-tight">One download.<br /><span class="italic">Everything connected.</span></h2>
          <p class="text-stone-500 mb-10">Mount your first cloud drive in Finder in under two minutes. Free to start.</p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <DownloadButton size="lg" class="px-10 h-12 text-base">Download OSDrive</DownloadButton>
            <a href="/dashboard"><Button variant="outline" size="lg" class="border-stone-300 text-stone-600 hover:bg-stone-100 rounded-full px-10 h-12 text-base">Open Dashboard</Button></a>
          </div>
        </div>
      </section>
    </>
  );
}

function CapabilityCard(props: { icon: any; title: string; desc: string; soon?: boolean }) {
  return (
    <div class={`rounded-2xl border p-7 ${props.soon ? "border-dashed border-stone-200 bg-transparent" : "border-stone-200 bg-white shadow-sm"}`}>
      <div class="text-stone-400 mb-4">{props.icon}</div>
      <div class="flex items-center gap-2 mb-2">
        <h3 class="text-base font-semibold text-stone-900">{props.title}</h3>
        {props.soon && <span class="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 border border-stone-200">Soon</span>}
      </div>
      <p class="text-stone-500 text-sm leading-relaxed">{props.desc}</p>
    </div>
  );
}

function ScaleStat(props: { value: string; unit: string; description: string }) {
  return (
    <div>
      <div class="text-5xl font-light text-stone-100 mb-2">{props.value}</div>
      <div class="text-stone-400 font-medium mb-2 text-sm">{props.unit}</div>
      <div class="text-xs text-stone-600 leading-relaxed">{props.description}</div>
    </div>
  );
}

function EnterpriseFeatureRow(props: { label: string; withSeparator?: boolean }) {
  return (
    <div>
      {props.withSeparator && <Separator class="bg-stone-100" />}
      <div class="flex items-center justify-between py-3.5">
        <span class="text-stone-600 text-sm">{props.label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-stone-300 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
    </div>
  );
}

function PricingFeatureItem(props: { text: string; iconClass: string }) {
  return (
    <li class="flex items-center gap-2.5">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class={`${props.iconClass} shrink-0`}><polyline points="20 6 9 17 4 12"/></svg>
      {props.text}
    </li>
  );
}

function DownloadButton(props: { size?: "sm" | "lg"; class?: string; children: any }) {
  return (
    <Popover.Root placement="bottom">
      <Popover.Trigger
        as="div"
        class="inline-flex cursor-pointer"
        aria-label="Download — coming soon"
      >
        <Button
          size={props.size}
          class={`bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-full opacity-60 cursor-not-allowed pointer-events-none ${props.class ?? ""}`}
          aria-disabled="true"
        >
          {props.children}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content class="z-50 origin-(--kb-popover-content-transform-origin) animate-in fade-in-0 zoom-in-95 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-lg shadow-stone-900/8 outline-none">
          <Popover.Arrow class="fill-white [&>path:first-of-type]:stroke-stone-200" />
          <p class="text-sm font-medium text-stone-900">Coming soon</p>
          <p class="mt-0.5 text-xs text-stone-500 leading-relaxed max-w-[14rem]">We're putting the finishing touches on the desktop app. Check back shortly.</p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
