import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isValidLang } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isValidLang(params.lang)) {
      throw redirect({ to: "/$lang", params: { lang: "uz" } });
    }
  },
  component: LangLayout,
});

function LangLayout() {
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
