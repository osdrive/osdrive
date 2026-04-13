import { createEnv } from "@t3-oss/env-core";
import { vite } from "@t3-oss/env-core/presets-valibot";
import { env } from "cloudflare:workers";
import * as v from "valibot";

export const serverEnv = createEnv({
  server: {
    BETTER_AUTH_SECRET: v.pipe(
      v.string(),
      v.minLength(32, "The string must be 32 or more characters long."),
    ),
    BETTER_AUTH_URL: v.pipe(v.string(), v.url("Must be a valid URL")),
  },
  createFinalSchema: (rest) => {
    const awsConfigured = v.object({
      ...rest,
      AWS_REGION: v.string(),
      AWS_ACCESS_KEY_ID: v.string(),
      AWS_SECRET_ACCESS_KEY: v.string(),
    });

    const awsUnset = v.object({
      ...rest,
      AWS_REGION: v.optional(v.undefined()),
      AWS_ACCESS_KEY_ID: v.optional(v.undefined()),
      AWS_SECRET_ACCESS_KEY: v.optional(v.undefined()),
    });

    const axiomConfigured = v.object({
      ...rest,
      AXIOM_DATASET: v.string(),
      AXIOM_DOMAIN: v.string(),
      AXIOM_TOKEN: v.string(),
    });

    const axiomUnset = v.object({
      ...rest,
      AXIOM_DATASET: v.optional(v.undefined()),
      AXIOM_DOMAIN: v.optional(v.undefined()),
      AXIOM_TOKEN: v.optional(v.undefined()),
    });

    if (!import.meta.env.DEV) {
      return v.union([
        v.intersect([awsConfigured, axiomConfigured]),
        v.intersect([awsConfigured, axiomUnset]),
      ]);
    }

    return v.union([
      v.intersect([awsConfigured, axiomConfigured]),
      v.intersect([awsConfigured, axiomUnset]),
      v.intersect([awsUnset, axiomConfigured]),
      v.intersect([awsUnset, axiomUnset]),
    ]);
  },
  // During Cloudflare deployment verification, we get the error without the logs, so this combines them.
  onValidationError: (issues) => {
    throw new Error(
      `Environment validation failed: ${issues.map((i) => `- ${i.message}`).join("\n")}`,
    );
  },
  extends: [vite()],
  runtimeEnv: env as any,
});
