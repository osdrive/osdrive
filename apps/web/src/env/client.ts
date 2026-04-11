import { createEnv } from "@t3-oss/env-core";
import { vite } from "@t3-oss/env-core/presets-valibot";

export const clientEnv = createEnv({
  clientPrefix: "VITE_",
  client: {},
  extends: [vite()],
  runtimeEnv: process.env,
});
