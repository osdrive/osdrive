// TODO: Remove this!

import type { APIEvent } from "@solidjs/start/server";
import { sendEmail } from "~/server/lib/email";

const demoRecipient = "oscar@otbeaumont.me";
const demoSender = "hello@osdrive.app";

export async function POST({ request }: APIEvent) {
  try {
    const now = new Date().toISOString();
    await sendEmail({
      from: demoSender,
      to: demoRecipient,
      subject: "OSDrive email demo",
      text: [
        "This is a hardcoded test email from /api/email-demo.",
        "",
        `Sent at: ${now}`,
        `Triggered by: ${request.url}`,
      ].join("\n"),
      html: [
        "<p>This is a hardcoded test email from <code>/api/email-demo</code>.</p>",
        `<p><strong>Sent at:</strong> ${now}</p>`,
        `<p><strong>Triggered by:</strong> ${request.url}</p>`,
      ].join(""),
    });

    return Response.json(
      {
        ok: true,
        sentTo: demoRecipient,
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("ERROR", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }
}
