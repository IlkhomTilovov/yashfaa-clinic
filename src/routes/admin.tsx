import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  Stethoscope,
  FlaskConical,
  FolderOpen,
  CalendarCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — MedClinic" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const sidebarLinks = [
  { to: "/admin" as const, label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/doctors" as const, label: "Shifokorlar", icon: Stethoscope },
  { to: "/admin/tests" as const, label: "Tahlillar", icon: FlaskConical },
  { to: "/admin/categories" as const, label: "Kategoriyalar", icon: FolderOpen },
  { to: "/admin/appointments" as const, label: "Uchrashuvlar", icon: CalendarCheck },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    navigate({ to: "/admin/login" });
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              M
            </div>
            <span className="font-bold">Admin Panel</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {sidebarLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              activeOptions={link.exact ? { exact: true } : undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground" }}
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t p-3">
          <div className="mb-2 truncate px-3 text-xs text-muted-foreground">
            {user.email}
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Chiqish
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1">
        <header className="flex h-16 items-center border-b bg-card px-4 lg:px-6">
          <button className="mr-3 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">MedClinic Boshqaruv</h2>
        </header>
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
