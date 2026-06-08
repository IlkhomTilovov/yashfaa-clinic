import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import appCss from "../styles.css?url";
import "@/lib/i18n";
import { getSiteContent } from "@/lib/server-functions";

interface RouterContext {
  queryClient: QueryClient;
}

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
            to={"/$lang" as any} params={{ lang: "uz" } as any}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      // Base defaults — every shareable route OVERRIDES title/description in its own head()
      { name: "author", content: "Yashfaa Clinic" },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1" },
      { name: "theme-color", content: "#ffffff" },
      { property: "og:site_name", content: "Yashfaa Clinic" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  // SSR prefetch site_content so editable text is hydrated correctly on first paint
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["site_content"],
      queryFn: () => getSiteContent(),
      staleTime: 5 * 60_000,
    });
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="facebook-domain-verification" content="4o32agiwf3qh2pcj14c2jpol7fyojx" />
        <link rel="stylesheet" href={appCss} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" />
        <HeadContent />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1688287229022408');fbq('track','PageView');`,
          }}
        />
        {/* End Meta Pixel Code */}
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18216369244" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'AW-18216369244');`,
          }}
        />
        {/* End Google tag */}
        {/* Event snippet for Контакт conversion page */}
        <script
          dangerouslySetInnerHTML={{
            __html: `function gtag_report_conversion(url) { var callback = function () { if (typeof(url) != 'undefined') { window.location = url; } }; gtag('event', 'conversion', { 'send_to': 'AW-18216369244/MKI3CIr1_7ocENz4nu5D', 'event_callback': callback }); return false; }`,
          }}
        />
        {/* End Event snippet */}
      </head>
      <body>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=1688287229022408&ev=PageView&noscript=1" />`,
          }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // QueryClientProvider is provided by routerWithQueryClient wrapper in router.tsx,
  // which also handles SSR cache dehydration/hydration automatically.
  return <Outlet />;
}
