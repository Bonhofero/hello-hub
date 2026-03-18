import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Network, Building2, Server, Users, Link2, Shield, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { icon: Building2, label: "Municipality Profile" },
  { icon: Server, label: "Key Systems" },
  { icon: Users, label: "Owners & Contacts" },
  { icon: Link2, label: "Dependencies & APIs" },
  { icon: Shield, label: "Initial Risk Observations" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: "", population: "", region: "", units: "" });
  const [systems, setSystems] = useState([
    { name: "", type: "application", vendor: "", criticality: "medium" },
  ]);
  const [owners, setOwners] = useState([{ name: "", title: "", email: "", unit: "" }]);
  const [apis, setApis] = useState([{ name: "", type: "internal", endpoint: "" }]);
  const [risks, setRisks] = useState([{ title: "", severity: "medium", system: "", description: "" }]);

  const progress = ((step + 1) / STEPS.length) * 100;

  const addSystem = () => setSystems([...systems, { name: "", type: "application", vendor: "", criticality: "medium" }]);
  const addOwner = () => setOwners([...owners, { name: "", title: "", email: "", unit: "" }]);
  const addApi = () => setApis([...apis, { name: "", type: "internal", endpoint: "" }]);
  const addRisk = () => setRisks([...risks, { title: "", severity: "medium", system: "", description: "" }]);

  const handleComplete = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left sidebar */}
      <div className="hidden lg:flex w-72 flex-col border-r bg-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Network className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground text-sm">IMS Setup</span>
        </div>

        <div className="space-y-1">
          {STEPS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setStep(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                i === step ? "bg-primary/10 text-primary font-medium" : i < step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                i < step ? "bg-success text-success-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto">
          <p className="text-xs text-muted-foreground mb-2">Setup Progress</p>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center p-6 pt-12">
        <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-2xl space-y-6">
          <div>
            <Badge variant="outline" className="text-xs mb-2">Step {step + 1} of {STEPS.length}</Badge>
            <h2 className="text-xl font-semibold text-foreground">{STEPS[step].label}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 0 && "Start by providing basic information about your municipality."}
              {step === 1 && "Register your key IT systems and infrastructure assets."}
              {step === 2 && "Add system owners and key contacts across departments."}
              {step === 3 && "Map system dependencies and API integrations."}
              {step === 4 && "Note any known risks or concerns about your current infrastructure."}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 card-shadow space-y-4">
            {step === 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Municipality Name</Label>
                    <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="e.g. Eskilstuna Municipality" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Population</Label>
                    <Input value={profile.population} onChange={e => setProfile({ ...profile, population: e.target.value })} placeholder="e.g. 107000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Region</Label>
                    <Input value={profile.region} onChange={e => setProfile({ ...profile, region: e.target.value })} placeholder="e.g. Södermanland" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Organisational Units (comma-separated)</Label>
                    <Input value={profile.units} onChange={e => setProfile({ ...profile, units: e.target.value })} placeholder="IT, HR, Social Services..." />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                {systems.map((sys, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b last:border-0">
                    <div className="space-y-1.5">
                      <Label>System Name</Label>
                      <Input value={sys.name} onChange={e => { const n = [...systems]; n[i].name = e.target.value; setSystems(n); }} placeholder="e.g. Procapita" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Vendor</Label>
                      <Input value={sys.vendor} onChange={e => { const n = [...systems]; n[i].vendor = e.target.value; setSystems(n); }} placeholder="e.g. TietoEvry" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addSystem}>+ Add System</Button>
              </>
            )}

            {step === 2 && (
              <>
                {owners.map((o, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b last:border-0">
                    <div className="space-y-1.5">
                      <Label>Name</Label>
                      <Input value={o.name} onChange={e => { const n = [...owners]; n[i].name = e.target.value; setOwners(n); }} placeholder="Anna Lindström" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Title</Label>
                      <Input value={o.title} onChange={e => { const n = [...owners]; n[i].title = e.target.value; setOwners(n); }} placeholder="IT Strategist" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input value={o.email} onChange={e => { const n = [...owners]; n[i].email = e.target.value; setOwners(n); }} placeholder="anna@eskilstuna.se" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Unit</Label>
                      <Input value={o.unit} onChange={e => { const n = [...owners]; n[i].unit = e.target.value; setOwners(n); }} placeholder="IT & Digitalisation" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOwner}>+ Add Contact</Button>
              </>
            )}

            {step === 3 && (
              <>
                {apis.map((a, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b last:border-0">
                    <div className="space-y-1.5">
                      <Label>API / Integration Name</Label>
                      <Input value={a.name} onChange={e => { const n = [...apis]; n[i].name = e.target.value; setApis(n); }} placeholder="BankID API" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Type</Label>
                      <Input value={a.type} onChange={e => { const n = [...apis]; n[i].type = e.target.value; setApis(n); }} placeholder="internal / partner / public" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Endpoint</Label>
                      <Input value={a.endpoint} onChange={e => { const n = [...apis]; n[i].endpoint = e.target.value; setApis(n); }} placeholder="/api/v1/..." />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addApi}>+ Add API</Button>
              </>
            )}

            {step === 4 && (
              <>
                {risks.map((r, i) => (
                  <div key={i} className="space-y-3 pb-4 border-b last:border-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Risk Title</Label>
                        <Input value={r.title} onChange={e => { const n = [...risks]; n[i].title = e.target.value; setRisks(n); }} placeholder="End-of-life server" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Related System</Label>
                        <Input value={r.system} onChange={e => { const n = [...risks]; n[i].system = e.target.value; setRisks(n); }} placeholder="E-Services Portal" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea value={r.description} onChange={e => { const n = [...risks]; n[i].description = e.target.value; setRisks(n); }} placeholder="Describe the risk..." rows={2} />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addRisk}>+ Add Risk</Button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="gap-1.5">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="gap-1.5">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground">
                <Check className="h-4 w-4" /> Complete Setup
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
