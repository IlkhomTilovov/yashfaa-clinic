import { createFileRoute, Outlet, Link, useNavigate, useMatches } from "@tanstack/react-router";
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
  Briefcase,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Yashfaa Clinic" },
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
  { to: "/admin/services" as const, label: "Xizmatlar", icon: Briefcase },
  { to: "/admin/appointments" as const, label: "Uchrashuvlar", icon: CalendarCheck },
  { to: "/admin/settings" as const, label: "Sozlamalar", icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "";
  const isPublicAdminRoute = currentPath === "/admin/login" || currentPath === "/admin/setup";

  useEffect(() => {
    if (!loading && !isPublicAdminRoute && (!user || !isAdmin)) {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [loading, isPublicAdminRoute, user, isAdmin, navigate]);

  if (loading && !isPublicAdminRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">Y</div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (isPublicAdminRoute) {
    return <Outlet />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
              Y
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Yashfaa Clinic</span>
              <span className="block text-[10px] font-medium text-muted-foreground">Admin Panel</span>
            </div>
          </Link>
          <button className="rounded-md p-1 hover:bg-accent lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Asosiy</p>
          {sidebarLinks.slice(0, 1).map((link) => (
            <SidebarLink key={link.label} link={link} onClick={() => setSidebarOpen(false)} />
          ))}
          <p className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Boshqaruv</p>
          {sidebarLinks.slice(1, 6).map((link) => (
            <SidebarLink key={link.label} link={link} onClick={() => setSidebarOpen(false)} />
          ))}
          <p className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tizim</p>
          {sidebarLinks.slice(6).map((link) => (
            <SidebarLink key={link.label} link={link} onClick={() => setSidebarOpen(false)} />
          ))}
        </nav>

        {/* User */}
        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-medium">{user.email}</p>
              <p className="text-[10px] text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="mt-1 w-full justify-start gap-2 text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Chiqish
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-sm lg:px-6">
          <button className="rounded-md p-1.5 hover:bg-accent lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-muted-foreground">Yashfaa Clinic Boshqaruv</h2>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ link, onClick }: { link: typeof sidebarLinks[number]; onClick: () => void }) {
  return (
    <Link
      to={link.to}
      activeOptions={link.exact ? { exact: true } : undefined}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      activeProps={{ className: "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary" }}
      onClick={onClick}
    >
      <link.icon className="h-4 w-4" />
      {link.label}
    </Link>
  );
}
