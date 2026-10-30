import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        }, 
    },
    server: {
        // The UI calls the Kotlin -> Mermaid backend on the same origin (`/api/...`).
        // In production the Ktor server serves both, so dev proxies to a running backend.
        proxy: {
            "/api": {
                target: process.env.KOTLIN_IR_API_URL || "http://localhost:8080",
                changeOrigin: true,
            },
        },
    },
})
