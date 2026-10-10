// base must match the repo name so the built files load from /profile/assets/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/profile/",
  plugins: [react()],
});