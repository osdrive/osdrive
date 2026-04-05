import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

/**
 * Enterprise - Corporate/professional design
 * Trust indicators, security focus, social proof
 */
export default function LandingEnterprise() {
  return (
    <main class="min-h-screen">
      <Title>OpenDrive | Enterprise File Management</Title>

      {/* Hero */}
      <section class="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div class="grid grid-cols-2 gap-16 items-center max-lg:grid-cols-1">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              SOC 2 Type II Certified
            </div>

            <h1 class="text-5xl font-bold leading-tight mb-6 max-lg:text-4xl">
              Enterprise file infrastructure for the modern workplace
            </h1>

            <p class="text-xl text-muted mb-8 leading-relaxed">
              Secure, scalable file management that integrates with your existing
              identity providers and compliance workflows. Deploy on-premise or in the cloud.
            </p>

            <div class="flex items-center gap-4 flex-wrap mb-12">
              <A
                href="/login"
                class="px-6 py-3.5 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
              >
                Request demo
              </A>
              <a
                href="#pricing"
                class="px-6 py-3.5 rounded-lg border border-white/20 font-semibold hover:bg-white/5 transition-colors"
              >
                View pricing
              </a>
            </div>

            <div class="flex items-center gap-8 text-sm text-muted">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                99.99% uptime SLA
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                24/7 support
              </div>
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                GDPR compliant
              </div>
            </div>
          </div>

          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-3xl" />
            <div class="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-semibold">Storage Overview</h3>
                <span class="text-sm text-muted">Enterprise Plan</span>
              </div>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-sm mb-2">
                    <span class="text-muted">Used storage</span>
                    <span>2.4 TB / 10 TB</span>
                  </div>
                  <div class="h-2 rounded-full bg-white/10">
                    <div class="h-full w-[24%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div class="p-4 rounded-xl bg-white/5">
                    <p class="text-2xl font-bold">847</p>
                    <p class="text-sm text-muted">Active users</p>
                  </div>
                  <div class="p-4 rounded-xl bg-white/5">
                    <p class="text-2xl font-bold">12.4M</p>
                    <p class="text-sm text-muted">Files managed</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-emerald-400">All systems operational</p>
                    <p class="text-xs text-emerald-400/70">Last scan: 2 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section class="border-y border-white/10 py-12">
        <div class="max-w-6xl mx-auto px-6">
          <p class="text-center text-sm text-muted mb-8">Trusted by security-conscious teams worldwide</p>
          <div class="flex items-center justify-center gap-12 flex-wrap opacity-50">
            {["Acme Corp", "Globex", "Initech", "Umbrella", "Cyberdyne", "Tyrell"].map((company) => (
              <div class="text-xl font-bold tracking-tight">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section class="max-w-6xl mx-auto px-6 py-24">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">Built for enterprise scale</h2>
          <p class="text-xl text-muted max-w-2xl mx-auto">
            From startup to Fortune 500, OpenDrive grows with your organization.
          </p>
        </div>

        <div class="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {[
            { icon: "🔐", title: "SSO & SAML", desc: "Integrate with Okta, Azure AD, Google Workspace, and any SAML 2.0 provider." },
            { icon: "🏢", title: "On-premise option", desc: "Deploy in your own infrastructure with full control over data residency." },
            { icon: "📊", title: "Admin analytics", desc: "Detailed usage reports, audit logs, and compliance dashboards." },
            { icon: "🔄", title: "Active Directory sync", desc: "Automatic user provisioning and group management via SCIM." },
            { icon: "🌍", title: "Multi-region", desc: "Choose data centers in US, EU, APAC, or bring your own storage." },
            { icon: "🛡️", title: "DLP policies", desc: "Prevent data leakage with content-aware sharing restrictions." },
          ].map((feature) => (
            <article class="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <span class="text-3xl mb-4 block">{feature.icon}</span>
              <h3 class="text-lg font-semibold mb-2">{feature.title}</h3>
              <p class="text-muted text-sm leading-relaxed">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section class="max-w-4xl mx-auto px-6 py-24">
        <div class="p-8 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
          <svg class="w-10 h-10 mx-auto mb-6 text-white/20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <blockquote class="text-2xl font-medium mb-6 leading-relaxed">
            OpenDrive replaced three separate tools for us. The migration was seamless,
            and our IT team finally has visibility into how files move across the organization.
          </blockquote>
          <div>
            <p class="font-semibold">Sarah Chen</p>
            <p class="text-sm text-muted">VP of Engineering, TechCorp</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" class="max-w-6xl mx-auto px-6 py-24 border-t border-white/10">
        <div class="grid grid-cols-2 gap-12 items-center max-lg:grid-cols-1">
          <div>
            <h2 class="text-4xl font-bold mb-4">Ready to transform your file infrastructure?</h2>
            <p class="text-xl text-muted mb-8">
              Get a personalized demo and see how OpenDrive can work for your team.
            </p>
            <div class="flex items-center gap-4 flex-wrap">
              <A
                href="/login"
                class="px-6 py-3.5 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
              >
                Schedule demo
              </A>
              <a
                href="#"
                class="px-6 py-3.5 rounded-lg border border-white/20 font-semibold hover:bg-white/5 transition-colors"
              >
                Contact sales
              </a>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            {[
              { value: "500+", label: "Enterprise customers" },
              { value: "50M+", label: "Files synced daily" },
              { value: "99.99%", label: "Uptime guaranteed" },
              { value: "<100ms", label: "Average sync latency" },
            ].map((stat) => (
              <div class="p-6 rounded-xl border border-white/10 bg-white/[0.02] text-center">
                <p class="text-3xl font-bold mb-1">{stat.value}</p>
                <p class="text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
