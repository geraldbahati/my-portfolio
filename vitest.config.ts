import type { EdgeContext, EdgeVMOptions } from "@edge-runtime/vm";
import { defineConfig } from "vitest/config";

const edgeRuntimeOptions = {} satisfies EdgeVMOptions<EdgeContext>;

export default defineConfig({
  test: {
    environment: "edge-runtime",
    environmentOptions: edgeRuntimeOptions,
    exclude: ["e2e/**", "node_modules/**"],
    server: {
      deps: {
        inline: ["convex-test"],
      },
    },
  },
});
