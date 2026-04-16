import { Context } from "effect";
import type { APIEvent } from "@solidjs/start/server";
import { HttpRouter } from "effect/unstable/http";
import { waitUntil } from "cloudflare:workers";
import { appLayerLive } from "~/server";

async function handler({ request }: APIEvent) {
  const { handler, dispose } = HttpRouter.toWebHandler(appLayerLive);
  const response = await handler(request, Context.empty() as any);
  waitUntil(dispose().catch((cause) => console.error("OTEL shutdown failed", cause)));
  return response;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
