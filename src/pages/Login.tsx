import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, ChevronRight, Globe, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import athenaLogo from "@/assets/athena-logo.png";

const demoUsers = [
{ email: "elena@eskilstuna.demo", label: "Elena Vasquez — CTO", desc: "Full platform access, digital strategy & systems" },
{ email: "lars@eskilstuna.demo", label: "Lars Eriksson — CFO", desc: "Cost analysis, budgets, and financial oversight" },
{ email: "arthur@eskilstuna.demo", label: "Arthur Lindberg — COO", desc: "Executive overview, governance, and strategic alignment" }];


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("elena@eskilstuna.demo");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);

    if (error) {
      toast({ title: "Login failed", description: error, variant: "destructive" });
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between p-10" style={{ background: "var(--gradient-primary)" }}>
        <div className="flex items-center gap-3">
          <img src={athenaLogo} alt="Athena Tech" className="h-10 w-10 rounded-xl bg-primary-foreground/20 p-1 object-contain" />
          <div>
            <h1 className="text-lg font-semibold text-primary-foreground">Athena Tech</h1>
            <p className="text-xs text-primary-foreground/70">Municipal Infrastructure Management</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-primary-foreground leading-tight">
            Eskilstuna Municipality<br />Digital Platform
          </h2>
          <p className="text-primary-foreground/80 text-sm leading-relaxed max-w-sm">
            Unified management of IT systems, governance, risk, APIs, and digital innovation for Eskilstuna's 107,000 residents.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs gap-1.5" onClick={() => navigate("/public")}>
              <Globe className="h-3.5 w-3.5" /> Public Portal
            </Button>
          </div>
        </div>

        <p className="text-primary-foreground/40 text-xs">© 2026 Eskilstuna Municipality · Södermanland, Sweden</p>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src={athenaLogo} alt="Athena Tech" className="h-9 w-9 rounded-lg object-contain" />
            <span className="font-semibold text-foreground">Athena Tech</span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Internal municipality access</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@eskilstuna.demo" />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Demo users — click to select</Label>
              <div className="space-y-2">
                {demoUsers.map((u) =>
                <button
                  key={u.email}
                  onClick={() => {setEmail(u.email);setPassword("demo1234");}}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                  email === u.email ?
                  "border-primary bg-primary/5 ring-1 ring-primary/20" :
                  "border-border hover:border-muted-foreground/30"}`
                  }>
                  
                    <p className="text-sm font-medium text-foreground">{u.label}</p>
                    <p className="text-xs text-muted-foreground">{u.desc}</p>
                  </button>
                )}
              </div>
            </div>

            <Button onClick={handleLogin} className="w-full gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Sign In
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
            </div>

            <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/public")}>
              <Globe className="h-4 w-4" />
              Public Access — Open Data & Transparency
            </Button>
          </div>

        </motion.div>
      </div>
    </div>);

}
