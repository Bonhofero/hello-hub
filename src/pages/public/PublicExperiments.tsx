import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Beaker, CheckCircle2, Clock } from "lucide-react";

const publicExperiments = [
  { title: "Digital Building Permit Submission", dept: "Urban Planning", status: "scaled", statusColor: "bg-success text-success-foreground", result: "Processing time reduced by 41%", duration: "12 weeks", apis: ["Castor", "BankID", "Eskilstuna Open Data"] },
  { title: "Automatic Meeting Minutes", dept: "IT & Digitalisation", status: "experiment", statusColor: "bg-warning text-warning-foreground", result: "In progress — 30% complete", duration: "10 weeks", apis: ["Azure Speech", "Microsoft Graph"] },
  { title: "AI-assisted Case Triage", dept: "Social Services", status: "evaluating", statusColor: "bg-info text-info-foreground", result: "Pilot underway with 3 case workers", duration: "8 weeks", apis: ["Azure Cognitive Services"] },
];

export default function PublicExperiments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Open Experiments</h1>
        <p className="text-sm text-muted-foreground mt-1">What Eskilstuna is testing and learning — shared openly for transparency</p>
      </div>

      <div className="space-y-4">
        {publicExperiments.map((exp, i) => (
          <motion.div
            key={exp.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-6 card-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Beaker className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-foreground">{exp.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{exp.dept}</p>
                <div className="flex items-center gap-2 text-sm">
                  {exp.status === "scaled" ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-foreground">{exp.result}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.apis.map((api) => (
                    <Badge key={api} variant="outline" className="text-[10px]">{api}</Badge>
                  ))}
                </div>
              </div>
              <Badge className={`${exp.statusColor} text-[10px] shrink-0`}>
                {exp.status === "scaled" ? "🟢 Scaled" : exp.status === "experiment" ? "🟠 Active" : "🔵 Evaluating"}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
