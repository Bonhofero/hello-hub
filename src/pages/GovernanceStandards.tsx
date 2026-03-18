import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Server, FileText, Link2, AlertTriangle, ShieldAlert, ExternalLink } from "lucide-react";
import {
  useGovernanceDocs, useGovernanceStandards, useSystems, useRisks, useApis,
  dbGovDocToPlatform, dbStandardToPlatform, dbSystemToPlatform, dbRiskToPlatform, dbApiToPlatform,
  enrichSystems, type GovStandard
} from "@/hooks/useDatabase";

export default function GovernanceStandards() {
  const { data: rawDocs, isLoading } = useGovernanceDocs();
  const { data: rawStandards } = useGovernanceStandards();
  const { data: rawSystems } = useSystems();
  const { data: rawRisks } = useRisks();
  const { data: rawApis } = useApis();

  const docs = useMemo(() => (rawDocs || []).map(dbGovDocToPlatform), [rawDocs]);
  const standards = useMemo(() => (rawStandards || []).map(dbStandardToPlatform), [rawStandards]);
  const systems = useMemo(() => enrichSystems((rawSystems || []).map(dbSystemToPlatform), (rawRisks || []).map(dbRiskToPlatform), (rawApis || []).map(dbApiToPlatform)), [rawSystems, rawRisks, rawApis]);

  const [selectedStandard, setSelectedStandard] = useState<GovStandard | null>(null);

  const systemsNoStandard = systems.filter(s => s.standardsUsed.length === 0);

  if (isLoading) return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading…</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Infrastructure & Standards</h1>
        <p className="text-muted-foreground">Standard adoption and system compliance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 pb-4 flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" />
          <div><p className="text-2xl font-bold text-foreground">{standards.length}</p><p className="text-xs text-muted-foreground">Active Standards</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 flex items-center gap-3">
          <Server className="h-8 w-8 text-primary" />
          <div><p className="text-2xl font-bold text-foreground">{systems.length}</p><p className="text-xs text-muted-foreground">Total Systems</p></div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4 flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-warning" />
          <div><p className="text-2xl font-bold text-warning">{systemsNoStandard.length}</p><p className="text-xs text-muted-foreground">No Mapped Standard</p></div>
        </CardContent></Card>
      </div>

      {systemsNoStandard.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-warning"><AlertTriangle className="h-4 w-4" /> Systems With No Mapped Standard</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {systemsNoStandard.map(s => (
                <Link key={s.id} to={`/system-map?system=${s.id}`}>
                  <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">{s.name} ({s.vendor})</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Standard</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Linked Docs</TableHead>
                <TableHead>Adoption</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standards.map(std => {
                const adoptionPct = docs.length > 0 ? Math.round(std.linkedDocIds.length / docs.length * 100) : 0;
                return (
                  <TableRow key={std.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedStandard(std)}>
                    <TableCell><p className="font-medium text-foreground text-sm">{std.name}</p><p className="text-xs text-muted-foreground">{std.id}</p></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px]">{std.description}</TableCell>
                    <TableCell><Badge className={`${std.status === "Active" ? "bg-success/10 text-success border-success/20" : std.status === "Deprecated" ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>{std.status}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{std.linkedDocIds.length}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${adoptionPct}%`, backgroundColor: adoptionPct >= 40 ? "hsl(152, 60%, 40%)" : "hsl(38, 92%, 50%)" }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{adoptionPct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {standards.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No standards registered yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedStandard} onOpenChange={() => setSelectedStandard(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedStandard && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedStandard.name}</SheetTitle>
                <SheetDescription>{selectedStandard.id} · {selectedStandard.description}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div><p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1"><Link2 className="h-4 w-4" /> Linked Governance Documents</p>
                  <div className="space-y-2">{selectedStandard.linkedDocIds.map(id => {
                    const doc = docs.find(d => d.id === id);
                    return doc ? (
                      <div key={id} className="flex items-start gap-2 p-2 rounded border bg-card">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div><p className="text-sm font-medium text-foreground">{doc.title}</p><p className="text-xs text-muted-foreground">{doc.id} · {doc.unit} · {doc.owner || "No owner"}</p></div>
                      </div>
                    ) : null;
                  })}</div>
                </div>
                <div><p className="text-sm font-semibold text-foreground mb-2">Systems Using This Standard</p>
                  <div className="space-y-1">{systems.filter(s => s.standardsUsed.includes(selectedStandard.id)).map(s => (
                    <Link key={s.id} to={`/system-map?system=${s.id}`} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-secondary transition-colors">
                      <Server className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="min-w-0"><p className="text-xs font-medium truncate">{s.name}</p><p className="text-[10px] text-muted-foreground">{s.vendor}</p></div>
                    </Link>
                  ))}</div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
