import { serverEnv } from "./env";

const encoder = new TextEncoder();

const SES_SERVICE = "ses";
const SES_PATH = "/v2/email/outbound-emails";
const AWS_ALGORITHM = "AWS4-HMAC-SHA256";

type SendEmailOptions = {
  from: string;
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
};

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toHex(digest);
}

async function signHmacSha256(key: string | Uint8Array, value: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? encoder.encode(key) : key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
  return new Uint8Array(signature);
}

async function createAwsSigningKey(secretAccessKey: string, dateStamp: string, region: string) {
  const dateKey = await signHmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const regionKey = await signHmacSha256(dateKey, region);
  const serviceKey = await signHmacSha256(regionKey, SES_SERVICE);
  return signHmacSha256(serviceKey, "aws4_request");
}

function createEmailPayload({ from, to, subject, text, html }: SendEmailOptions) {
  return JSON.stringify({
    FromEmailAddress: from,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Content: {
      Simple: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: text,
          },
          ...(html
            ? {
                Html: {
                  Data: html,
                },
              }
            : {}),
        },
      },
    },
  });
}

async function createSignedHeaders(body: string, region: string, accessKeyId: string, accessKeySecret: string) {
  const url = new URL(`https://email.${region}.amazonaws.com${SES_PATH}`);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = await sha256Hex(body);

  const canonicalHeaders = [
    `content-type:application/json`,
    `host:${url.host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n");

  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "POST",
    url.pathname,
    "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${SES_SERVICE}/aws4_request`;
  const stringToSign = [AWS_ALGORITHM, amzDate, credentialScope, await sha256Hex(canonicalRequest)].join("\n");
  const signingKey = await createAwsSigningKey(accessKeySecret, dateStamp, region);
  const signature = toHex((await signHmacSha256(signingKey, stringToSign)).buffer);

  const headers = new Headers({
    authorization: [
      `${AWS_ALGORITHM} Credential=${accessKeyId}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`,
    ].join(", "),
    "content-type": "application/json",
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  });

  return { headers, url };
}

export async function sendEmail(options: SendEmailOptions) {
  if (!serverEnv.AWS_ACCESS_KEY_ID) {
    console.error("SENT EMAIL", options);
    return;
  }

  const body = createEmailPayload(options);
  const { headers, url } = await createSignedHeaders(body, serverEnv.AWS_REGION, serverEnv.AWS_ACCESS_KEY_ID, serverEnv.AWS_SECRET_ACCESS_KEY);
  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) throw new Error(`SES request failed (${response.status}): ${await response.text()}`);
}
