import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Keep React as a single runtime instance across lazy dashboard chunks.
    // Without this, Vite can pre-bundle a second React copy and hooks crash with
    // errors like: Cannot read properties of null (reading 'useState/useContext').
    dedupe: ["react", "react-dom"],
  },
  server: {
    hmr: false,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router-dom",
      "prop-types",
      "react-transition-group",
      "lodash",
      "lodash/get",
      "lodash/isFunction",
      "lodash/isNumber",
      "lodash/isString",
      "lodash/omit",
      "lodash/isEqual",
      "lodash/isNil",
      "lodash/sortBy",
      "lodash/isObject",
      "lodash/range",
      "lodash/throttle",
      "lodash/max",
      "lodash/min",
      "lodash/isNaN",
      "lodash/some",
      "lodash/last",
      "lodash/maxBy",
      "lodash/minBy",
      "lodash/sumBy",
      "lodash/mapValues",
      "lodash/every",
      "lodash/isPlainObject",
      "lodash/isBoolean",
      "lodash/flatMap",
      "lodash/upperFirst",
      "lodash/uniqBy",
      "lodash/memoize",
      "lodash/find",
    ],
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("react") ||
            id.includes("react-dom") ||
            id.includes("react-router-dom")
          ) {
            return "react-vendor";
          }

          if (id.includes("axios") || id.includes("js-cookie")) {
            return "network-vendor";
          }

          if (
            id.includes("gsap") ||
            id.includes("keen-slider") ||
            id.includes("swiper")
          ) {
            return "motion-vendor";
          }

          if (id.includes("jspdf") || id.includes("jspdf-autotable")) {
            return "pdf-vendor";
          }

          if (id.includes("html2canvas")) {
            return "canvas-vendor";
          }

          if (id.includes("recharts") || id.includes("chart.js")) {
            return "charts-vendor";
          }
        },
      },
    },
  },
});