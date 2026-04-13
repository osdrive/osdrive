import { Context, Layer } from "effect";
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http";
import { OtlpLogger, OtlpSerialization, OtlpTracer } from "effect/unstable/observability";
import type { APIEvent } from "@solidjs/start/server";
import { waitUntil } from "cloudflare:workers";
import { serverEnv } from "~/server/lib/env";
import { name, version } from "../../../package.json" with { type: "json" };
import { osDriveApiLayer } from "~/server/backend";

const makeTelemetryParams = (suffix: string) =>
  ({
    url: `${serverEnv.AXIOM_DOMAIN}${suffix}`,
    headers: {
      Authorization: `Bearer ${serverEnv.AXIOM_TOKEN}`,
      "X-Axiom-Dataset": serverEnv.AXIOM_DATASET,
    },
    exportInterval: "1 second",
    shutdownTimeout: "5 seconds",
    resource: {
      serviceName: name,
      serviceVersion: version,
      attributes: {
        "deployment.environment": import.meta.env.MODE,
      },
    },
  }) as const;

const telemetry = serverEnv.AXIOM_DATASET
  ? Layer.merge(
      OtlpTracer.layer(makeTelemetryParams("/v1/traces")),
      OtlpLogger.layer(makeTelemetryParams("/v1/logs")),
    ).pipe(Layer.provide(OtlpSerialization.layerJson), Layer.provide(FetchHttpClient.layer))
  : Layer.empty;

const appLayerLive = Layer.mergeAll(osDriveApiLayer, telemetry).pipe(
  Layer.provide(HttpServer.layerServices),
);

async function handler({ request }: APIEvent) {
  const { handler, dispose } = HttpRouter.toWebHandler(appLayerLive);
  const response = await handler(request, Context.empty());
  waitUntil(dispose().catch((cause) => console.error("OTEL shutdown failed", cause)));
  return response;
}

export async function GET({ request }: APIEvent) {
  const { handler, dispose } = HttpRouter.toWebHandler(appLayerLive);
  const response = await handler(request, Context.empty());
  waitUntil(dispose().catch((cause) => console.error("OTEL shutdown failed", cause)));
  return response;
}

export const POST = handler;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
export const OPTIONS = GET;
