import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/Mugle/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Mugle 2.0",
        short_name: "Mugle",
        description: "모구가 오늘의 점심을 정해주는 캐릭터형 점심 결정 앱",
        start_url: "/Mugle/",
        scope: "/Mugle/",
        display: "standalone",
        background_color: "#fff8ef",
        theme_color: "#ffb14d",
        orientation: "portrait",
        icons: [
          {
            src: "/Mugle/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/Mugle/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      }
    })
  ]
});
