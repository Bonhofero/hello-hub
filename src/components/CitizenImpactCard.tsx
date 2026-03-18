import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ResponsiveContainer, AreaChart, Area, XAxis } from "recharts";
import { useCitizenImpactScore, useCitizenImpactHistory, useKnowledgeExperiments } from "@/hooks/useDatabase";

const subDimensions = [
  { key: "accessibility", label: "Access" },
  { key: "timeSavings", label: "Time Savings" },
  { key: "engagement", label: "Engagement" },
  { key: "trust", label: "Trust" },
  { key: "equity", label: "Equity" },
] as const;

interface Props {
  variant: "compact" | "full";
  orgId: string;
}

export default function CitizenImpactCard({ variant, orgId }: Props) {
  const cisLive = useCitizenImpactScore(orgId);
  const { data: history, isLoading: histLoading } = useCitizenImpactHistory(orgId);
  const { data: rawExperiments } = useKnowledgeExperiments();

  // For the public (full) variant, use latest history row so unauthenticated
  // users see the same data as internal dashboards.
  const latestHist = (history || []).length > 0 ? history![history!.length - 1] : null;

  const useHistory = variant === "full" && latestHist;

  function getBand(score: number): { band: "At Risk" | "Developing" | "Delivering"; bandColor: string } {
    if (score <= 40) return { band: "At Risk", bandColor: "hsl(0, 72%, 51%)" };
    if (score <= 70) return { band: "Developing", bandColor: "hsl(38, 92%, 50%)" };
    return { band: "Delivering", bandColor: "hsl(152, 60%, 40%)" };
  }

  const cis = useHistory
    ? {
        score: latestHist.score,
        accessibility: latestHist.accessibility,
        timeSavings: latestHist.time_savings,
        engagement: latestHist.engagement,
        trust: latestHist.trust,
        equity: latestHist.equity,
        ...getBand(latestHist.score),
        isLoading: false,
      }
    : cisLive;

  const chartData = (history || []).map((h: any) => ({
    month: new Date(h.recorded_month).toLocaleDateString("en", { month: "short" }),
    score: h.score,
  }));

  const isCompact = variant === "compact";
  const scoreSize = isCompact ? "text-3xl" : "text-5xl";
  const barH = isCompact ? "h-1.5" : "h-2.5";
  const chartH = isCompact ? 64 : 100;

  // Top 3 scaled experiments for full variant
  const wins = variant === "full"
    ? (rawExperiments || [])
        .filter((e: any) => e.completed && e.recommendation === "scale")
        .slice(0, 3)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border p-5 card-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">Citizen Impact Score</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              Composite index measuring the positive value digitalization delivers to residents. Combines service access, time savings, engagement, transparency and digital equity.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className={`${scoreSize} font-bold`} style={{ color: cis.bandColor }}>{cis.score}</span>
        <span className="text-muted-foreground text-sm">/100</span>
      </div>
      <Badge className="text-[10px] mb-4" style={{ backgroundColor: `${cis.bandColor}20`, color: cis.bandColor, border: `1px solid ${cis.bandColor}30` }}>
        {cis.band}
      </Badge>

      {/* Sub-dimensions */}
      <div className="space-y-2 mb-4">
        {subDimensions.map(({ key, label }) => {
          const val = cis[key];
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground w-20 shrink-0">{label}</span>
              <div className={`flex-1 ${barH} rounded-full bg-muted overflow-hidden`}>
                <div
                  className={`${barH} rounded-full transition-all`}
                  style={{ width: `${val}%`, backgroundColor: cis.bandColor }}
                />
              </div>
              <span className="text-[11px] font-medium w-8 text-right">{val}%</span>
              {val === 0 && <span className="text-[9px] text-muted-foreground italic">Insufficient data</span>}
            </div>
          );
        })}
      </div>

      {/* Sparkline */}
      {chartData.length > 0 && (
        <div className="mb-1">
          <ResponsiveContainer width="100%" height={chartH}>
            <AreaChart data={chartData}>
              {!isCompact && (
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              )}
              <Area
                type="monotone"
                dataKey="score"
                stroke={cis.bandColor}
                fill={cis.bandColor}
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-muted-foreground text-center">6-month trend</p>
        </div>
      )}

      {/* Full variant: Recent wins */}
      {variant === "full" && wins.length > 0 && (
        <div className="mt-5 pt-4 border-t">
          <h4 className="text-xs font-medium text-foreground mb-3">Recent digitalization wins</h4>
          <div className="space-y-2">
            {wins.map((exp: any) => (
              <div key={exp.id} className="p-3 rounded-lg border bg-secondary/30">
                <p className="text-sm font-medium text-foreground">{exp.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {exp.department && (
                    <Badge variant="outline" className="text-[10px]">{exp.department}</Badge>
                  )}
                </div>
                {exp.result && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {exp.result.length > 120 ? exp.result.slice(0, 120) + "…" : exp.result}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
