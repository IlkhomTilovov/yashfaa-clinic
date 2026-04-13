import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Sahifa topilmadi
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Bosh sahifaga qaytish
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
      { title: "MedClinic — Zamonaviy tibbiy xizmatlar" },
      { name: "description", content: "MedClinic — Toshkentdagi zamonaviy tibbiy klinika. Laboratoriya tahlillari, diagnostika, shifokorlar va onlayn qabulga yozilish." },
      { name: "author", content: "MedClinic" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "MedClinic — Zamonaviy tibbiy xizmatlar" },
      { name: "twitter:title", content: "MedClinic — Zamonaviy tibbiy xizmatlar" },
      { property: "og:description", content: "MedClinic — Toshkentdagi zamonaviy tibbiy klinika. Laboratoriya tahlillari, diagnostika, shifokorlar va onlayn qabulga yozilish." },
      { name: "twitter:description", content: "MedClinic — Toshkentdagi zamonaviy tibbiy klinika. Laboratoriya tahlillari, diagnostika, shifokorlar va onlayn qabulga yozilish." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/QQ1VGtThcIQIz0sGvAimaJVOwWU2/social-images/social-1776079209914-b7dde81d-1b42-4938-ab6f-df6ce4df355e.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/QQ1VGtThcIQIz0sGvAimaJVOwWU2/social-images/social-1776079209914-b7dde81d-1b42-4938-ab6f-df6ce4df355e.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
