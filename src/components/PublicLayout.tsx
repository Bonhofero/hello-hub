import { Link, Outlet, useLocation } from "react-router-dom";
import { Network, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const publicNavItems = [
  { label: "Overview", path: "/public" },
  { label: "Public APIs", path: "/public/apis" },
  { label: "Experiments", path: "/public/experiments" },
  { label: "Open Data", path: "/public/data" },
];

export function PublicLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Public header */}
      <header className="border-b bg-card card-shadow sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Network className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">Eskilstuna Municipality</span>
                <Badge variant="outline" className="text-[10px] gap-1 font-normal">
                  <Globe className="h-3 w-3" /> Public
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <nav className="hidden md:flex items-center gap-1">
                {publicNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      location.pathname === item.path
                        ? "bg-secondary text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs ml-2">
                  Staff Login <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Read-only banner */}
      <div className="bg-secondary border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Read-only public view — Staff and partners can <Link to="/login" className="text-primary underline">sign in</Link> for full access
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© 2026 Eskilstuna Municipality · Open data & transparency portal</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link to="/public" className="hover:text-foreground">About</Link>
              <Link to="/public/apis" className="hover:text-foreground">APIs</Link>
              <a href="https://eskilstuna.se" target="_blank" rel="noopener" className="hover:text-foreground">eskilstuna.se</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
