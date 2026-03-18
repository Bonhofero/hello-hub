import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Map, BarChart3, Database } from "lucide-react";
import GovernancePortfolio from "./GovernancePortfolio";
import GovernanceMap from "./GovernanceMap";
import GovernanceBoardDashboard from "./GovernanceBoardDashboard";
import GovernanceStandards from "./GovernanceStandards";

export default function Governance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Governance</h1>
        <p className="text-sm text-muted-foreground">Lifecycle management, compliance, and strategic alignment</p>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="portfolio" className="gap-1.5">
            <ScrollText className="h-4 w-4" /> Portfolio
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-1.5">
            <Map className="h-4 w-4" /> Governance Map
          </TabsTrigger>
          <TabsTrigger value="board" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> Board Dashboard
          </TabsTrigger>
          <TabsTrigger value="standards" className="gap-1.5">
            <Database className="h-4 w-4" /> Standards & Systems
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <GovernancePortfolio />
        </TabsContent>
        <TabsContent value="map">
          <GovernanceMap />
        </TabsContent>
        <TabsContent value="board">
          <GovernanceBoardDashboard />
        </TabsContent>
        <TabsContent value="standards">
          <GovernanceStandards />
        </TabsContent>
      </Tabs>
    </div>
  );
}
