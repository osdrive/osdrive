import { Separator } from "~/components/ui/separator";

const LAST_UPDATED = "April 10, 2025";

const sections = [
  {
    title: "Information we collect",
    body: [
      "**Account information.** When you create an account we collect your email address and, if you choose to provide it, your name. Passwords are hashed using bcrypt before storage — we never store them in plain text.",
      "**Usage data.** We log the API calls your client makes (method, timestamp, response code) so we can debug issues and monitor reliability. We do not log the names or contents of your files.",
      "**Device metadata.** The desktop client sends your OS version and app version on first launch and on update. This lets us drop support for end-of-life platforms safely.",
      "**Billing information.** Payments are processed by Stripe. We store only the Stripe customer ID and your subscription status — no card numbers ever touch our servers.",
    ],
  },
  {
    title: "How we use your information",
    body: [
      "To provide, maintain, and improve OSDrive.",
      "To send transactional emails — account confirmation, password reset, subscription receipts. We do not send marketing email without your explicit opt-in.",
      "To detect and prevent abuse, fraud, and security incidents.",
      "To comply with legal obligations.",
    ],
  },
  {
    title: "Data storage and security",
    body: [
      "Your file data is stored encrypted at rest (AES-256) in the region you select at drive creation time. In-transit data is protected by TLS 1.3.",
      "Access to production systems is restricted to a small number of engineers, requires MFA, and is logged. We conduct periodic access reviews.",
      "We retain account data for as long as your account is active, plus 90 days after deletion to allow recovery. Anonymised aggregate metrics are retained indefinitely.",
    ],
  },
  {
    title: "Third parties",
    body: [
      "**Stripe** — payment processing. Stripe's privacy policy governs data they collect during checkout.",
      "**Cloudflare** — CDN, DNS, and DDoS mitigation. Traffic passes through Cloudflare's network.",
      "**Resend** — transactional email delivery.",
      "We do not sell your personal data to any third party, ever.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "You may request a copy of the personal data we hold about you, ask us to correct inaccuracies, or ask us to delete your account and associated data. To exercise any of these rights, email us at oscar@osdrive.app.",
      "If you are in the EEA, UK, or Switzerland, you have additional rights under GDPR and equivalent legislation, including the right to lodge a complaint with your local supervisory authority.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "The web dashboard uses a single session cookie to keep you logged in. We do not use third-party tracking cookies or analytics SDKs. There is no cookie banner because there is nothing to consent to beyond the strictly necessary session cookie.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "We will post changes to this page and update the date at the top. For material changes we will notify you by email at least 30 days before they take effect.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions or requests: oscar@osdrive.app. We aim to respond within five business days.",
    ],
  },
];

export default function Page() {
  return (
      <main class="mx-auto max-w-2xl px-8 py-20 w-full">
        <div class="mb-14">
          <p class="text-xs text-stone-400 uppercase tracking-[0.2em] mb-4">Legal</p>
          <h1 class="text-5xl font-light tracking-tight text-stone-900 mb-4">Privacy Policy</h1>
          <p class="text-sm text-stone-400">Last updated {LAST_UPDATED}</p>
        </div>

        <div class="space-y-12">
          {sections.map((s, i) => (
            <div>
              {i > 0 && <Separator class="bg-stone-100 mb-12" />}
              <h2 class="text-lg font-semibold text-stone-900 mb-4">{s.title}</h2>
              <ul class="space-y-3">
                {s.body.map((p) => (
                  <li class="text-stone-500 text-sm leading-relaxed">
                    {p.split(/\*\*(.+?)\*\*/).map((part, j) =>
                      j % 2 === 1 ? <strong class="font-medium text-stone-700">{part}</strong> : part
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
  );
}
