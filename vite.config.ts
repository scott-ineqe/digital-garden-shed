import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// On Vercel, switch the TanStack Start target and disable the Cloudflare plugin.
// Locally / in Lovable, keep defaults so the preview keeps working.
const isVercel = !!process.env.VERCEL;

export default defineConfig(
  isVercel
    ? {
        cloudflare: false,
        tanstackStart: { target: "vercel" },
      }
    : {}
);
