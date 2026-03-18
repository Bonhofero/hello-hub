import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PublicLayout } from "@/components/PublicLayout";
import DashboardOverview from "@/pages/DashboardOverview";
import SystemMap from "@/pages/SystemMap";
import RiskView from "@/pages/RiskView";
import CostAnalysis from "@/pages/CostAnalysis";
import Governance from "@/pages/Governance";
import ApiManagement from "@/pages/ApiManagement";
import KnowledgeHub from "@/pages/KnowledgeHub";
import Login from "@/pages/Login";

import Onboarding from "@/pages/Onboarding";
import CdoOverview from "@/pages/overview/CdoOverview";
import FinanceOverview from "@/pages/overview/FinanceOverview";
import OrganizationOverview from "@/pages/overview/OrganizationOverview";
import PublicOverview from "@/pages/public/PublicOverview";
import PublicApis from "@/pages/public/PublicApis";
import PublicExperiments from "@/pages/public/PublicExperiments";
import PublicData from "@/pages/public/PublicData";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes — no shell */}
              <Route path="/login" element={<Login />} />
              
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Public portal — separate layout */}
              <Route path="/public" element={<PublicLayout />}>
                <Route index element={<PublicOverview />} />
                <Route path="apis" element={<PublicApis />} />
                <Route path="experiments" element={<PublicExperiments />} />
                <Route path="data" element={<PublicData />} />
              </Route>

              {/* Internal app — DashboardLayout */}
              <Route path="/" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
              <Route path="/overview/cdo" element={<DashboardLayout><CdoOverview /></DashboardLayout>} />
              <Route path="/overview/finance" element={<DashboardLayout><FinanceOverview /></DashboardLayout>} />
              <Route path="/overview/organization" element={<DashboardLayout><OrganizationOverview /></DashboardLayout>} />
              <Route path="/system-map" element={<DashboardLayout><SystemMap /></DashboardLayout>} />
              <Route path="/risk" element={<DashboardLayout><RiskView /></DashboardLayout>} />
              <Route path="/cost" element={<DashboardLayout><CostAnalysis /></DashboardLayout>} />
              <Route path="/governance" element={<DashboardLayout><Governance /></DashboardLayout>} />
              <Route path="/api" element={<DashboardLayout><ApiManagement /></DashboardLayout>} />
              <Route path="/knowledge" element={<DashboardLayout><KnowledgeHub /></DashboardLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
