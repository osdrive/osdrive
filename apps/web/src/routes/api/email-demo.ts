import type { APIEvent } from "@solidjs/start/server";
import { env } from "cloudflare:workers";

const demoRecipient = "oscar@otbeaumont.me";
const demoSender = "hello@osdrive.app";
const sesService = "ses";
const sesPath = "/v2/email/outbound-emails";
const textEncoder = new TextEncoder();

type SesConfigName = "AWS_ACCESS_KEY_ID" | "AWS_SECRET_ACCESS_KEY" | "AWS_REGION";

function readRequiredValue(name: SesConfigName) {
  const value = env[name] ?? process.env[name];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required SES config: ${name}`);
  }

  return value;
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
  return toHex(await crypto.subtle.digest("SHA-256", textEncoder.encode(value)));
}

async function hmacSha256(key: string | Uint8Array, value: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? textEncoder.encode(key) : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, textEncoder.encode(value)));
}

async function createSigningKey(secretAccessKey: string, dateStamp: string, region: string) {
  const dateKey = await hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = await hmacSha256(dateKey, region);
  const serviceKey = await hmacSha256(regionKey, sesService);
  return hmacSha256(serviceKey, "aws4_request");
}

async function createSesHeaders(body: string, region: string) {
  const accessKeyId = readRequiredValue("AWS_ACCESS_KEY_ID");
  const secretAccessKey = readRequiredValue("AWS_SECRET_ACCESS_KEY");
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const host = `email.${region}.amazonaws.com`;
  const payloadHash = await sha256Hex(body);
  const canonicalHeaders = [
    "content-type:application/json",
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n");
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "POST",
    sesPath,
    "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/${region}/${sesService}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");
  const signingKey = await createSigningKey(secretAccessKey, dateStamp, region);
  const signature = toHex((await hmacSha256(signingKey, stringToSign)).buffer);

  return {
    authorization: [
      `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(", "),
    host,
    payloadHash,
    amzDate,
  };
}

export async function POST({ request }: APIEvent) {
  try {
    const now = new Date().toISOString();
    const region = readRequiredValue("AWS_REGION");
    const body = JSON.stringify({
      FromEmailAddress: demoSender,
      Destination: {
        ToAddresses: [demoRecipient],
      },
      Content: {
        Simple: {
          Subject: {
            Data: "OSDrive email demo",
          },
          Body: {
            Text: {
              Data: [
                "This is a hardcoded test email from /api/email-demo.",
                "",
                `Sent at: ${now}`,
                `Triggered by: ${request.url}`,
              ].join("\n"),
            },
            Html: {
              Data: [
                "<p>This is a hardcoded test email from <code>/api/email-demo</code>.</p>",
                `<p><strong>Sent at:</strong> ${now}</p>`,
                `<p><strong>Triggered by:</strong> ${request.url}</p>`,
              ].join(""),
            },
          },
        },
      },
    });
    const signedHeaders = await createSesHeaders(body, region);
    const response = await fetch(`https://${signedHeaders.host}${sesPath}`, {
      method: "POST",
      headers: {
        authorization: signedHeaders.authorization,
        "content-type": "application/json",
        "x-amz-content-sha256": signedHeaders.payloadHash,
        "x-amz-date": signedHeaders.amzDate,
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`SES request failed (${response.status}): ${await response.text()}`);
    }

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
