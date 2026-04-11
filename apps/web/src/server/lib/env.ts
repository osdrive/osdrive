import { createEnv } from "@t3-oss/env-core";
import { vite } from "@t3-oss/env-core/presets-valibot";
import * as v from 'valibot';

export const serverEnv = createEnv({
  server: {
    BETTER_AUTH_SECRET: v.pipe(
      v.string(),
      v.minLength(32, 'The string must be 32 or more characters long.')
    ),
    BETTER_AUTH_URL: v.pipe(
      v.string(),
      v.url('Must be a valid URL'),
    ),
  },
  createFinalSchema: (rest) => {
    const awsConfigured = v.object({
      ...rest,
      AWS_REGION: v.string(),
      AWS_ACCESS_KEY_ID: v.string(),
      AWS_SECRET_ACCESS_KEY: v.string(),
    });

    if (!import.meta.env.DEV) return awsConfigured;

    return v.union([
      awsConfigured,
      v.object({
        ...rest,
        AWS_REGION: v.optional(v.undefined()),
        AWS_ACCESS_KEY_ID: v.optional(v.undefined()),
        AWS_SECRET_ACCESS_KEY: v.optional(v.undefined()),
      }),
    ]);
  },
  // During Cloudflare deployment verification, we get the error without the logs, so this combines them.
  onValidationError: (issues) => {
    throw new Error(`Environment validation failed: ${issues.map(i => `- ${i.message}`).join('\n')}`)
  },
  extends: [vite()],
  runtimeEnv: process.env,
});
