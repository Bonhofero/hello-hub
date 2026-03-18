import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import athenaLogo from "@/assets/athena-logo.png";
import {
  useGovernanceDocs, useRisks, useContracts,
  dbGovDocToPlatform, dbRiskToPlatform,
  getReviewStatus, getDaysUntilReview,
} from "@/hooks/useDatabase";

interface Notification {
  id: string;
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
}

function useNotifications(role: string | null, profileName: string | null): Notification[] {
  const { data: rawDocs } = useGovernanceDocs();
  const { data: rawRisks } = useRisks();
  const { data: rawContracts } = useContracts();

  return useMemo(() => {
    const notifs: Notification[] = [];

    // Role-based notification ownership mapping
    // CTO (elena) sees: IT & Digitalisation docs, all risks on systems she owns, board-visible items
    // CFO (lars) sees: HR docs (Per Johansson), contracts, cost-related
    // COO (arthur) sees: operational docs, social services, education, urban planning

    const isRelevantDoc = (doc: ReturnType<typeof dbGovDocToPlatform>) => {
      if (!role) return true;
      if (role === "cto") {
        return doc.owner === "Elena Vasquez" || doc.owner === "Anna Lindström" || doc.domain === "IT & Digitalization" || doc.escalatedToBoard;
      }
      if (role === "cfo") {
        return doc.owner === "Per Johansson" || doc.domain === "HR & Organization" || doc.category === "Procurement";
      }
      if (role === "coo") {
        return doc.owner === "Maria Ekberg" || doc.owner === "Lena Berggren" || doc.owner === "Jonas Kraft" || doc.owner === "Karin Nilsson" || doc.domain === "Social Services" || doc.domain === "Education" || doc.domain === "Urban Planning" || doc.domain === "Administration & Governance";
      }
      return true;
    };

    const isRelevantRisk = (risk: ReturnType<typeof dbRiskToPlatform>) => {
      if (!role) return true;
      if (role === "cto") {
        return risk.owner === "Elena Vasquez" || risk.owner === "Anna Lindström" || risk.boardVisibility;
      }
      if (role === "cfo") {
        return risk.owner === "Per Johansson" || risk.boardVisibility;
      }
      if (role === "coo") {
        return risk.owner === "Maria Ekberg" || risk.owner === "Lena Berggren" || risk.owner === "Jonas Kraft" || risk.boardVisibility;
      }
      return true;
    };

    // Overdue governance docs
    (rawDocs || []).forEach(d => {
      const doc = dbGovDocToPlatform(d);
      if (!isRelevantDoc(doc)) return;
      if (doc.reviewDate && getReviewStatus(doc.reviewDate) === "overdue") {
        notifs.push({
          id: `gov-${doc.id}`,
          type: "danger",
          title: `Review overdue: ${doc.title}`,
          description: `${Math.abs(getDaysUntilReview(doc.reviewDate))} days overdue · Owner: ${doc.owner || "Unassigned"}`,
        });
      } else if (doc.reviewDate && getReviewStatus(doc.reviewDate) === "urgent") {
        notifs.push({
          id: `gov-urgent-${doc.id}`,
          type: "warning",
          title: `Review due soon: ${doc.title}`,
          description: `${getDaysUntilReview(doc.reviewDate)} days remaining`,
        });
      }
    });

    // Critical/high risks
    (rawRisks || []).forEach(r => {
      const risk = dbRiskToPlatform(r);
      if (!isRelevantRisk(risk)) return;
      const score = risk.likelihood * risk.impact;
      if (score >= 16) {
        notifs.push({
          id: `risk-${risk.id}`,
          type: "danger",
          title: `Critical risk: ${risk.title}`,
          description: `Score ${score} · ${risk.type} · Owner: ${risk.owner}`,
        });
      }
    });

    // Expiring contracts — only for CFO and CTO
    if (!role || role === "cfo" || role === "cto") {
      (rawContracts || []).forEach(c => {
        if (c.end_date) {
          const daysLeft = Math.ceil((new Date(c.end_date).getTime() - Date.now()) / 86400000);
          if (daysLeft > 0 && daysLeft <= 90) {
            notifs.push({
              id: `contract-${c.id}`,
              type: "warning",
              title: `Contract expiring: ${c.title}`,
              description: `${daysLeft} days remaining`,
            });
          }
        }
      });
    }

    return notifs.slice(0, 20);
  }, [rawDocs, rawRisks, rawContracts, role]);
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, () => setDark(d => !d)] as const;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const notifications = useNotifications(profile?.persona || null, profile?.displayName || null);
  const [dark, toggleDark] = useDarkMode();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  const dangerCount = notifications.filter(n => n.type === "danger").length;
  const totalCount = notifications.length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 card-shadow">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="hidden sm:flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search systems, resources..."
                  className="bg-transparent text-sm outline-none w-64 placeholder:text-muted-foreground text-foreground"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden md:block">
                Eskilstuna Municipality
              </span>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDark}>
                {dark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative p-1.5 rounded-md hover:bg-secondary transition-colors">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {totalCount > 0 && (
                      <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-destructive-foreground ${dangerCount > 0 ? "bg-destructive" : "bg-warning"}`}>
                        {totalCount > 9 ? "9+" : totalCount}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0" align="end">
                  <div className="border-b px-4 py-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                    <Badge variant="secondary" className="text-[10px]">{totalCount}</Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y">
                    {notifications.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
                    )}
                    {notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-2">
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === "danger" ? "bg-destructive" : n.type === "warning" ? "bg-warning" : "bg-info"}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground leading-tight">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <img src={athenaLogo} alt="Athena Tech" className="h-7 w-7 rounded-md object-contain ml-1" />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
