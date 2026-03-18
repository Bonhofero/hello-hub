import {
  LayoutDashboard,
  Network,
  ShieldAlert,
  DollarSign,
  Plug,
  BookOpen,
  ScrollText,
  LogOut,
  Compass,
  BarChart3,
  Building2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import athenaLogo from "@/assets/athena-logo.png";

const mainNavItems = [
  { title: "System Map", url: "/system-map", icon: Network, partnerVisible: true },
  { title: "Risk Analysis", url: "/risk", icon: ShieldAlert, partnerVisible: false },
  { title: "Cost Analysis", url: "/cost", icon: DollarSign, partnerVisible: false },
  { title: "Governance", url: "/governance", icon: ScrollText, partnerVisible: false },
  { title: "API Management", url: "/api", icon: Plug, partnerVisible: true },
  { title: "Knowledge Hub", url: "/knowledge", icon: BookOpen, partnerVisible: true },
];

const roleConfig: Record<string, { title: string; url: string; icon: typeof Compass }> = {
  cto: { title: "CTO Dashboard", url: "/overview/cdo", icon: Compass },
  cfo: { title: "CFO Dashboard", url: "/overview/finance", icon: BarChart3 },
  coo: { title: "COO Dashboard", url: "/overview/organization", icon: Building2 },
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = profile
    ? profile.displayName.split(" ").map(n => n[0]).join("")
    : "?";

  const myDashboard = role && roleConfig[role] ? roleConfig[role] : null;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-3">
          <img src={athenaLogo} alt="Athena Tech" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
          {!collapsed && (
            <div>
              <h2 className="text-sm font-semibold text-sidebar-accent-foreground">Athena Tech</h2>
              <p className="text-xs text-sidebar-foreground">Eskilstuna Municipality</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {myDashboard && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60 px-3 mb-2">
              {!collapsed && "Dashboard"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={myDashboard.url}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <myDashboard.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{myDashboard.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/60 px-3 mb-2">
            {!collapsed && "Modules"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.filter(item => role !== "partner" || item.partnerVisible).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-muted text-xs font-medium text-sidebar-accent-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{profile?.displayName || "Guest"}</p>
              <p className="text-xs text-sidebar-foreground truncate">{profile?.title || ""}</p>
            </div>
            <button onClick={handleLogout} className="text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors">
              <LogOut className="h-4 w-4 shrink-0" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
