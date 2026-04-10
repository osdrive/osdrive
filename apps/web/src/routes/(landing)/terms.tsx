import { Separator } from "~/components/ui/separator";

const LAST_UPDATED = "April 10, 2025";

const sections = [
  {
    title: "Acceptance",
    body: [
      "By creating an account or using any part of the OSDrive service you agree to these Terms of Service. If you are using OSDrive on behalf of an organisation, you represent that you have authority to bind that organisation to these terms.",
    ],
  },
  {
    title: "The service",
    body: [
      "OSDrive provides cloud storage with native filesystem mounting, cross-device sync, and a file management dashboard (the \"Service\"). We may update, extend, or remove features at any time. Where a change materially reduces the Service we will give you at least 30 days' notice by email.",
      "The Service is provided for lawful purposes only. You must not use it to store, transmit, or share content that violates applicable law, infringes third-party intellectual property, or contains malware.",
    ],
  },
  {
    title: "Accounts",
    body: [
      "You are responsible for keeping your credentials secure and for all activity that occurs under your account. Notify us immediately at oscar@osdrive.app if you believe your account has been compromised.",
      "You must be at least 16 years old to create an account. Accounts are non-transferable.",
    ],
  },
  {
    title: "Your data",
    body: [
      "You retain full ownership of the files and data you store with OSDrive. We claim no intellectual property rights over your content.",
      "You grant us a limited, non-exclusive licence to store, replicate, and transmit your data solely for the purpose of providing the Service.",
      "We will not access the contents of your files except to resolve a support request you initiate, or as required by law.",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "You must not: attempt to gain unauthorised access to the Service or another user's data; use the Service to transmit spam or unsolicited bulk communications; engage in any activity that degrades the performance of the Service for other users; reverse-engineer or extract the source code of the Service.",
      "We reserve the right to suspend or terminate accounts that violate this policy without prior notice.",
    ],
  },
  {
    title: "Payment and billing",
    body: [
      "Paid plans are billed in advance on a monthly or annual cycle. Prices are shown exclusive of VAT; applicable taxes will be added at checkout.",
      "Subscriptions renew automatically. You may cancel at any time from your account settings — your access continues until the end of the current billing period. We do not offer prorated refunds for partial periods unless required by law.",
      "If a payment fails we will notify you by email and retry. Access may be suspended after three failed attempts.",
    ],
  },
  {
    title: "Disclaimers and liability",
    body: [
      "The Service is provided \"as is\" without warranty of any kind. We do not warrant that it will be uninterrupted, error-free, or that data will never be lost.",
      "To the maximum extent permitted by law, our total liability to you for any claim arising out of or related to these terms or the Service is limited to the greater of (a) the fees you paid in the 12 months preceding the claim or (b) £100.",
      "We are not liable for indirect, incidental, consequential, or punitive damages, loss of profits, or loss of data.",
    ],
  },
  {
    title: "Termination",
    body: [
      "You may delete your account at any time from account settings. We will delete your data within 90 days of account deletion.",
      "We may suspend or terminate your account for violations of these terms, non-payment, or inactivity exceeding 24 months. Where feasible we will give you advance notice and an opportunity to export your data.",
    ],
  },
  {
    title: "Governing law",
    body: [
      "These terms are governed by the laws of England and Wales. Any dispute shall be subject to the exclusive jurisdiction of the courts of England and Wales, except where local mandatory consumer protection law requires otherwise.",
    ],
  },
  {
    title: "Changes",
    body: [
      "We may update these terms at any time. For material changes we will notify you by email at least 30 days before they take effect. Continued use after that date constitutes acceptance of the revised terms.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions: oscar@osdrive.app",
    ],
  },
];

export default function Page() {
  return (
      <main class="mx-auto max-w-2xl px-8 py-20 w-full">
        <div class="mb-14">
          <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4">Legal</p>
          <h1 class="text-5xl font-light tracking-tight text-stone-900 mb-4">Terms of Service</h1>
          <p class="text-sm text-stone-400">Last updated {LAST_UPDATED}</p>
        </div>

        <div class="space-y-12">
          {sections.map((s, i) => (
            <div>
              {i > 0 && <Separator class="bg-stone-100 mb-12" />}
              <h2 class="text-lg font-semibold text-stone-900 mb-4">{s.title}</h2>
              <ul class="space-y-3">
                {s.body.map((p) => (
                  <li class="text-stone-500 text-sm leading-relaxed">{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
  );
}
