import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { to: "/" as const, label: "Bosh sahifa" },
  { to: "/services" as const, label: "Xizmatlar" },
  { to: "/doctors" as const, label: "Shifokorlar" },
  { to: "/tests" as const, label: "Tahlillar" },
  { to: "/appointment" as const, label: "Qabulga yozilish" },
  { to: "/contact" as const, label: "Aloqa" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Top bar */}
      <div className="hidden border-b bg-primary px-4 py-1.5 text-primary-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> +998 71 123 45 67
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Dush–Shan: 8:00–20:00
            </span>
          </div>
          <span>Toshkent, O'zbekiston</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
            M
          </div>
          <span className="text-xl font-bold text-foreground">MedClinic</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button asChild>
            <Link to="/appointment">Qabulga yozilish</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menyu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-accent text-foreground" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="mt-2">
              <Link to="/appointment" onClick={() => setMobileOpen(false)}>
                Qabulga yozilish
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
