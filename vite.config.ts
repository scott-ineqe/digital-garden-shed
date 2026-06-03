import { defineConfig as defineLovableConfig } from "@lovable.dev/vite-tanstack-config";
import { defineConfig as defineViteConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// On Vercel, build a Nitro/Vercel output bundle.
// Locally / in Lovable, keep the Lovable config so the preview keeps working.
const isVercel = !!process.env.VERCEL;

export default isVercel
  ? defineViteConfig({
      plugins: [
        tailwindcss(),
        tsConfigPaths({ projects: ["./tsconfig.json"] }),
        tanstackStart(),
        nitro({ preset: "vercel" }),
        viteReact(),
      ],
    })
  : defineLovableConfig();
