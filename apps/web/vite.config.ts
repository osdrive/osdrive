import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    solidStart(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
  ]
});
