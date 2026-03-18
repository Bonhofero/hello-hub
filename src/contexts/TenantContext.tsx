import React, { createContext, useContext, useState } from "react";

export interface Organization {
  id: string;
  name: string;
  population: number;
  region: string;
  type: "municipality" | "region" | "partner";
}

interface TenantContextType {
  currentOrg: Organization;
  allOrgs: Organization[];
  setCurrentOrg: (org: Organization) => void;
}

export const ORGANIZATIONS: Organization[] = [
  { id: "org-eskilstuna", name: "Eskilstuna Municipality", population: 107000, region: "Södermanland", type: "municipality" },
  { id: "org-strangnas", name: "Strängnäs Municipality", population: 38000, region: "Södermanland", type: "municipality" },
  { id: "org-vasteras", name: "Västerås City", population: 130000, region: "Västmanland", type: "municipality" },
  { id: "org-orebro", name: "Örebro Municipality", population: 160000, region: "Närke", type: "municipality" },
  { id: "org-region-sormland", name: "Region Sörmland", population: 300000, region: "Södermanland", type: "region" },
];

const TenantContext = createContext<TenantContextType>({
  currentOrg: ORGANIZATIONS[0],
  allOrgs: ORGANIZATIONS,
  setCurrentOrg: () => {},
});

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Organization>(ORGANIZATIONS[0]);

  return (
    <TenantContext.Provider value={{ currentOrg, allOrgs: ORGANIZATIONS, setCurrentOrg }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
