import { defineConfig } from "vite";
import { solidStart } from "@solidjs/start/config";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    solidStart(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
  ]
});
