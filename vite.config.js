import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
