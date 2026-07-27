import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "edge-runtime",
    exclude: ["e2e/**", "node_modules/**"],
    server: {
      deps: {
        inline: ["convex-test"],
      },
    },
  },
});
