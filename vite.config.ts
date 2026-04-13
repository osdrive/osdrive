import { defineConfig } from "vite-plus";

const ignorePatterns = ["apps/web/src/worker-configuration.d.ts"];

export default defineConfig({
  lint: {
    ignorePatterns,
  },
  fmt: {
    semi: true,
    ignorePatterns,
  },
});
