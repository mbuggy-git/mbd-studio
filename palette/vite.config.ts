import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

// The palette apps are their own Vite project, built into the main site's
// output under /palette/ so their design-system CSS never meets the site's.
export default defineConfig({
  base: "/palette/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./client") },
  },
  build: {
    outDir: "../dist/palette",
    emptyOutDir: true,
  },
  server: { port: 5174 },
})
