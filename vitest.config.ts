import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // (tsconfig keeps JSX for Next.js; component tests need it compiled)
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
