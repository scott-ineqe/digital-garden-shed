import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Library, Palette } from "lucide-react";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Asset Haven is a digital asset management application for storing, organizing, and sharing creative assets." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Asset Haven is a digital asset management application for storing, organizing, and sharing creative assets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "Asset Haven is a digital asset management application for storing, organizing, and sharing creative assets." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cd7404ff-bd4a-48c6-beee-89b288059545/id-preview-5f0d1570--c93085da-2784-4e1d-9594-0d97cd98265a.lovable.app-1778059143137.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/cd7404ff-bd4a-48c6-beee-89b288059545/id-preview-5f0d1570--c93085da-2784-4e1d-9594-0d97cd98265a.lovable.app-1778059143137.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-center sm:justify-start gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200 [&.active]:text-primary [&.active]:bg-primary/10 [&.active]:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <Library className="w-4 h-4" />
            Assets Library
          </Link>
          <Link
            to="/colors"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200 [&.active]:text-primary [&.active]:bg-primary/10 [&.active]:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <Palette className="w-4 h-4" />
            Brand Colors
          </Link>
        </div>
      </nav>
      <Outlet />
    </>
  );
}
