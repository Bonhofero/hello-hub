import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function PublicApis() {
  const { data: apis, isLoading } = useQuery({
    queryKey: ["public-apis"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("apis")
        .select("*")
        .eq("visibility", "public")
        .order("name");
      if (error) { console.warn("apis query failed:", error.message); return []; }
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Public APIs</h1>
        <p className="text-sm text-muted-foreground mt-1">Open APIs available for civic tech developers and partners</p>
      </div>

      {(!apis || apis.length === 0) && (
        <p className="text-sm text-muted-foreground">No public APIs available yet.</p>
      )}

      <div className="space-y-3">
        {(apis || []).map((api, i) => (
          <motion.div
            key={api.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border bg-card p-5 card-shadow hover:card-shadow-hover transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{api.name}</h3>
                  <Badge variant="outline" className="text-[10px]">{api.version}</Badge>
                  <Badge className="text-[10px] bg-success text-success-foreground">active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{api.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="font-mono bg-secondary px-1.5 py-0.5 rounded">{api.endpoint}</span>
                  <span>{api.protocol}</span>
                  <span>Auth: {api.authentication || "None"}</span>
                </div>
                {api.problems_solved && api.problems_solved.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {api.problems_solved.map((p: string) => (
                      <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <a href="#" className="text-primary text-sm flex items-center gap-1 shrink-0 hover:underline">
                Docs <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
