import { defineConfig, loadEnv } from "vite";
import { solidStart } from "@solidjs/start/config";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    solidStart(),
    cloudflare({
      viteEnvironment: { name: "ssr" },
      // This is a hack to load `.env` from the root of the monorepo.
      config:
        mode === "development"
          ? { vars: { ...process.env, ...loadEnv("development", "../../", "") } as any }
          : undefined,
    }),
    // TODO: Remove this once Vite is updated to the latest as I think it has this built in?
    tsconfigPaths(),
  ],
}));
