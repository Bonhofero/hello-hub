import { motion } from "framer-motion";
import { Database, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const datasets = [
  { name: "Municipal Budget 2025–2026", format: "CSV / JSON", updated: "2026-01-15", records: "1,240", category: "Finance" },
  { name: "School Performance Metrics", format: "CSV", updated: "2026-02-28", records: "342", category: "Education" },
  { name: "Building Permits Issued 2025", format: "JSON", updated: "2026-03-01", records: "867", category: "Planning" },
  { name: "Population by District", format: "CSV / GeoJSON", updated: "2026-03-10", records: "48", category: "Demographics" },
  { name: "Air Quality Measurements", format: "JSON", updated: "2026-03-13", records: "12,400", category: "Environment" },
];

export default function PublicData() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Open Datasets</h1>
        <p className="text-sm text-muted-foreground mt-1">Freely available municipal data for research and civic innovation</p>
      </div>

      <div className="space-y-3">
        {datasets.map((ds, i) => (
          <motion.div
            key={ds.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border bg-card p-5 card-shadow flex items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-foreground text-sm">{ds.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-[10px]">{ds.category}</Badge>
                  <span>{ds.format}</span>
                  <span>{ds.records} records</span>
                  <span>Updated: {ds.updated}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0">
              <Download className="h-3 w-3" /> Download
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
