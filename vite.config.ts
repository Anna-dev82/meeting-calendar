import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
  // Для GitHub Pages в подпапке нужен `./`, в dev пусть будет `/`.
  base: command === "build" ? "./" : "/",
  plugins: [react(), tailwindcss()],
}));

