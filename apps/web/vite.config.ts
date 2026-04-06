import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tailwindcss(),
    solidStart(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    // TODO: Remove this once Vite is updated to the latest as I think it has this built in?
    tsconfigPaths(),
  ]
});
