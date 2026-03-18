import { motion } from "framer-motion";
import { Server, Activity, Shield, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOrganizations } from "@/hooks/useDatabase";
import CitizenImpactCard from "@/components/CitizenImpactCard";

const publicKpis = [
  { label: "Total IT Systems", value: "566", icon: Server, desc: "Active systems managed" },
  { label: "Average Uptime", value: "99.4%", icon: Activity, desc: "Last 30 days" },
  { label: "GDPR Compliance", value: "94%", icon: Shield, desc: "Current score" },
  { label: "Public APIs", value: "12", icon: BarChart3, desc: "Available for integration" },
];

export default function PublicOverview() {
  const { data: orgs } = useOrganizations();
  const orgName = orgs?.[0]?.name || "Our municipality";

  return (
    <div className="space-y-10">
      {/* CIS Hero */}
      <div className="max-w-2xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold text-foreground text-center">
          How digitalization is working for you
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-muted-foreground text-sm mt-1 mb-6 text-center">
          This score reflects the real benefits that {orgName}'s digital investments deliver to residents — from faster services to greater transparency.
        </motion.p>
        <CitizenImpactCard variant="full" orgId="org-eskilstuna" />
      </div>

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-foreground">
          Eskilstuna Municipality
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-muted-foreground">
          Digital infrastructure transparency portal — 107,000 residents · Södermanland, Sweden
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {publicKpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-5 card-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 card-shadow space-y-3">
          <h3 className="font-semibold text-foreground">Public APIs</h3>
          <p className="text-sm text-muted-foreground">
            Explore Eskilstuna's open APIs for building civic technology and integrations.
          </p>
          <Link to="/public/apis">
            <Button variant="outline" size="sm" className="gap-1.5">
              Browse APIs <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border bg-card p-6 card-shadow space-y-3">
          <h3 className="font-semibold text-foreground">Open Experiments</h3>
          <p className="text-sm text-muted-foreground">
            See what digital experiments Eskilstuna is running and what we've learned.
          </p>
          <Link to="/public/experiments">
            <Button variant="outline" size="sm" className="gap-1.5">
              View Experiments <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
