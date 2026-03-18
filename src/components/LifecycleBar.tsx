import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const lifecycleMap: Record<string, { fill: number; color: string }> = {
  active: { fill: 10, color: "hsl(152, 60%, 40%)" },
  encapsulated: { fill: 35, color: "hsl(152, 60%, 40%)" },
  "review-needed": { fill: 55, color: "hsl(38, 92%, 50%)" },
  decommissioning: { fill: 70, color: "hsl(25, 85%, 50%)" },
  legacy: { fill: 85, color: "hsl(0, 72%, 51%)" },
  "end-of-life": { fill: 100, color: "hsl(0, 72%, 35%)" },
};

export default function LifecycleBar({ lifecycle }: { lifecycle: string }) {
  const entry = lifecycleMap[lifecycle] || { fill: 50, color: "hsl(var(--muted-foreground))" };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="h-2 w-24 rounded-full overflow-hidden" style={{ backgroundColor: "hsl(var(--muted))" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${entry.fill}%`, backgroundColor: entry.color }}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Lifecycle: {lifecycle}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
