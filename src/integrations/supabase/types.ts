export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      apis: {
        Row: {
          authentication: string | null
          created_at: string
          description: string | null
          developer_contact: string | null
          developer_municipality: string | null
          endpoint: string | null
          id: string
          linked_system_id: string | null
          name: string
          org_id: string | null
          problems_solved: string[] | null
          protocol: string | null
          rate_limit_per_min: number | null
          type: string | null
          version: string | null
          visibility: string | null
        }
        Insert: {
          authentication?: string | null
          created_at?: string
          description?: string | null
          developer_contact?: string | null
          developer_municipality?: string | null
          endpoint?: string | null
          id: string
          linked_system_id?: string | null
          name: string
          org_id?: string | null
          problems_solved?: string[] | null
          protocol?: string | null
          rate_limit_per_min?: number | null
          type?: string | null
          version?: string | null
          visibility?: string | null
        }
        Update: {
          authentication?: string | null
          created_at?: string
          description?: string | null
          developer_contact?: string | null
          developer_municipality?: string | null
          endpoint?: string | null
          id?: string
          linked_system_id?: string | null
          name?: string
          org_id?: string | null
          problems_solved?: string[] | null
          protocol?: string | null
          rate_limit_per_min?: number | null
          type?: string | null
          version?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apis_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_impact_history: {
        Row: {
          accessibility: number
          created_at: string
          engagement: number
          equity: number
          id: string
          org_id: string | null
          recorded_month: string
          score: number
          time_savings: number
          trust: number
        }
        Insert: {
          accessibility: number
          created_at?: string
          engagement: number
          equity: number
          id?: string
          org_id?: string | null
          recorded_month: string
          score: number
          time_savings: number
          trust: number
        }
        Update: {
          accessibility?: number
          created_at?: string
          engagement?: number
          equity?: number
          id?: string
          org_id?: string | null
          recorded_month?: string
          score?: number
          time_savings?: number
          trust?: number
        }
        Relationships: [
          {
            foreignKeyName: "citizen_impact_history_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          annual_cost: number | null
          created_at: string
          end_date: string | null
          id: string
          lock_in_risk: string | null
          org_id: string | null
          renewal_type: string | null
          start_date: string | null
          system_id: string | null
          title: string
          vendor_id: string | null
        }
        Insert: {
          annual_cost?: number | null
          created_at?: string
          end_date?: string | null
          id: string
          lock_in_risk?: string | null
          org_id?: string | null
          renewal_type?: string | null
          start_date?: string | null
          system_id?: string | null
          title: string
          vendor_id?: string | null
        }
        Update: {
          annual_cost?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          lock_in_risk?: string | null
          org_id?: string | null
          renewal_type?: string | null
          start_date?: string | null
          system_id?: string | null
          title?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_contradictions: {
        Row: {
          created_at: string
          description: string | null
          doc_a_id: string | null
          doc_b_id: string | null
          explanation: string | null
          id: string
          org_id: string | null
          resolved: boolean | null
          review_next: string | null
          rule_conflict: string | null
          severity: string | null
          why_matters: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          doc_a_id?: string | null
          doc_b_id?: string | null
          explanation?: string | null
          id: string
          org_id?: string | null
          resolved?: boolean | null
          review_next?: string | null
          rule_conflict?: string | null
          severity?: string | null
          why_matters?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          doc_a_id?: string | null
          doc_b_id?: string | null
          explanation?: string | null
          id?: string
          org_id?: string | null
          resolved?: boolean | null
          review_next?: string | null
          rule_conflict?: string | null
          severity?: string | null
          why_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_contradictions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_documents: {
        Row: {
          category: string | null
          classification: string | null
          created_at: string
          created_date: string | null
          domain: string | null
          escalated_to_board: boolean | null
          has_owner: boolean | null
          id: string
          keywords: string[] | null
          linked_core_systems: string[] | null
          linked_standards: string[] | null
          org_id: string | null
          owner: string | null
          owner_title: string | null
          replaces_doc_id: string | null
          review_date: string | null
          security_checks: Json | null
          status: string | null
          strategic_goals: string[] | null
          title: string
          unit: string | null
        }
        Insert: {
          category?: string | null
          classification?: string | null
          created_at?: string
          created_date?: string | null
          domain?: string | null
          escalated_to_board?: boolean | null
          has_owner?: boolean | null
          id: string
          keywords?: string[] | null
          linked_core_systems?: string[] | null
          linked_standards?: string[] | null
          org_id?: string | null
          owner?: string | null
          owner_title?: string | null
          replaces_doc_id?: string | null
          review_date?: string | null
          security_checks?: Json | null
          status?: string | null
          strategic_goals?: string[] | null
          title: string
          unit?: string | null
        }
        Update: {
          category?: string | null
          classification?: string | null
          created_at?: string
          created_date?: string | null
          domain?: string | null
          escalated_to_board?: boolean | null
          has_owner?: boolean | null
          id?: string
          keywords?: string[] | null
          linked_core_systems?: string[] | null
          linked_standards?: string[] | null
          org_id?: string | null
          owner?: string | null
          owner_title?: string | null
          replaces_doc_id?: string | null
          review_date?: string | null
          security_checks?: Json | null
          status?: string | null
          strategic_goals?: string[] | null
          title?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_standards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          linked_doc_ids: string[] | null
          name: string
          org_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          linked_doc_ids?: string[] | null
          name: string
          org_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          linked_doc_ids?: string[] | null
          name?: string
          org_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_standards_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_experiments: {
        Row: {
          apis_used: string[] | null
          approval_status: string
          approver: string | null
          classification: string | null
          completed: boolean | null
          created_at: string
          department: string | null
          divergence: string | null
          exit_log_approved: boolean
          fast_track: boolean
          hypothesis: string | null
          id: string
          idea_id: string | null
          isolated: boolean | null
          mock_data_only: boolean | null
          no_production_access: boolean | null
          observations: string | null
          org_id: string | null
          outcome_routing: string | null
          owner: string | null
          progress_percent: number | null
          recommendation: string | null
          result: string | null
          sandbox_start_date: string | null
          sandbox_weeks: number
          started_weeks_ago: number | null
          system_impact: string | null
          tags: string[] | null
          timebox_weeks: number | null
          title: string
          visibility: string | null
        }
        Insert: {
          apis_used?: string[] | null
          approval_status?: string
          approver?: string | null
          classification?: string | null
          completed?: boolean | null
          created_at?: string
          department?: string | null
          divergence?: string | null
          exit_log_approved?: boolean
          fast_track?: boolean
          hypothesis?: string | null
          id?: string
          idea_id?: string | null
          isolated?: boolean | null
          mock_data_only?: boolean | null
          no_production_access?: boolean | null
          observations?: string | null
          org_id?: string | null
          outcome_routing?: string | null
          owner?: string | null
          progress_percent?: number | null
          recommendation?: string | null
          result?: string | null
          sandbox_start_date?: string | null
          sandbox_weeks?: number
          started_weeks_ago?: number | null
          system_impact?: string | null
          tags?: string[] | null
          timebox_weeks?: number | null
          title: string
          visibility?: string | null
        }
        Update: {
          apis_used?: string[] | null
          approval_status?: string
          approver?: string | null
          classification?: string | null
          completed?: boolean | null
          created_at?: string
          department?: string | null
          divergence?: string | null
          exit_log_approved?: boolean
          fast_track?: boolean
          hypothesis?: string | null
          id?: string
          idea_id?: string | null
          isolated?: boolean | null
          mock_data_only?: boolean | null
          no_production_access?: boolean | null
          observations?: string | null
          org_id?: string | null
          outcome_routing?: string | null
          owner?: string | null
          progress_percent?: number | null
          recommendation?: string | null
          result?: string | null
          sandbox_start_date?: string | null
          sandbox_weeks?: number
          started_weeks_ago?: number | null
          system_impact?: string | null
          tags?: string[] | null
          timebox_weeks?: number | null
          title?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_experiments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_ideas: {
        Row: {
          approval_comment: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          classification: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          date_submitted: string | null
          department: string | null
          description: string | null
          fast_track: boolean
          fast_track_answers: Json | null
          id: string
          org_id: string | null
          status: string | null
          title: string
        }
        Insert: {
          approval_comment?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          classification?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          date_submitted?: string | null
          department?: string | null
          description?: string | null
          fast_track?: boolean
          fast_track_answers?: Json | null
          id?: string
          org_id?: string | null
          status?: string | null
          title: string
        }
        Update: {
          approval_comment?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          classification?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          date_submitted?: string | null
          department?: string | null
          description?: string | null
          fast_track?: boolean
          fast_track_answers?: Json | null
          id?: string
          org_id?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_ideas_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_published_tools: {
        Row: {
          apis: string[] | null
          classification: string | null
          contact_email: string | null
          created_at: string
          department: string | null
          description: string | null
          id: string
          linked_experiment_id: string | null
          municipality_name: string | null
          name: string
          org_id: string | null
          status: string | null
          visibility: string | null
        }
        Insert: {
          apis?: string[] | null
          classification?: string | null
          contact_email?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          linked_experiment_id?: string | null
          municipality_name?: string | null
          name: string
          org_id?: string | null
          status?: string | null
          visibility?: string | null
        }
        Update: {
          apis?: string[] | null
          classification?: string | null
          contact_email?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          linked_experiment_id?: string | null
          municipality_name?: string | null
          name?: string
          org_id?: string | null
          status?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_published_tools_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_values: {
        Row: {
          created_at: string
          helper: string | null
          id: string
          kpi_id: string
          label: string
          last_updated: string | null
          link_to: string | null
          org_id: string | null
          role: string | null
          source: string | null
          trend: string | null
          trend_label: string | null
          value: string | null
        }
        Insert: {
          created_at?: string
          helper?: string | null
          id?: string
          kpi_id: string
          label: string
          last_updated?: string | null
          link_to?: string | null
          org_id?: string | null
          role?: string | null
          source?: string | null
          trend?: string | null
          trend_label?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string
          helper?: string | null
          id?: string
          kpi_id?: string
          label?: string
          last_updated?: string | null
          link_to?: string | null
          org_id?: string | null
          role?: string | null
          source?: string | null
          trend?: string | null
          trend_label?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_values_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_cost_items: {
        Row: {
          adopted: boolean
          created_at: string
          function_name: string
          id: string
          linked_api_id: string | null
          linked_system_id: string | null
          org_id: string | null
          peer_average_cost: number
          peer_count: number
          peer_details: Json | null
          potential_saving: number | null
          your_cost: number
        }
        Insert: {
          adopted?: boolean
          created_at?: string
          function_name: string
          id: string
          linked_api_id?: string | null
          linked_system_id?: string | null
          org_id?: string | null
          peer_average_cost?: number
          peer_count?: number
          peer_details?: Json | null
          potential_saving?: number | null
          your_cost?: number
        }
        Update: {
          adopted?: boolean
          created_at?: string
          function_name?: string
          id?: string
          linked_api_id?: string | null
          linked_system_id?: string | null
          org_id?: string | null
          peer_average_cost?: number
          peer_count?: number
          peer_details?: Json | null
          potential_saving?: number | null
          your_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_cost_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          last_audit_date: string | null
          name: string
          population: number | null
          region: string | null
          risk_appetite_threshold: number
          type: string | null
        }
        Insert: {
          created_at?: string
          id: string
          last_audit_date?: string | null
          name: string
          population?: number | null
          region?: string | null
          risk_appetite_threshold?: number
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_audit_date?: string | null
          name?: string
          population?: number | null
          region?: string | null
          risk_appetite_threshold?: number
          type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          org_id: string | null
          persona: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          org_id?: string | null
          persona?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          org_id?: string | null
          persona?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_score_history: {
        Row: {
          created_at: string
          id: string
          org_id: string | null
          recorded_at: string
          risk_id: string
          score: number
        }
        Insert: {
          created_at?: string
          id?: string
          org_id?: string | null
          recorded_at?: string
          risk_id: string
          score: number
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string | null
          recorded_at?: string
          risk_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_score_history_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_score_history_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risks"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          affected_services: string[] | null
          board_visibility: boolean | null
          category: string | null
          created_at: string
          due_date: string | null
          escalation_status: string | null
          id: string
          impact: number | null
          impact_override: number | null
          last_updated: string | null
          likelihood: number | null
          likelihood_override: number | null
          linked_dependency: string | null
          linked_risk_ids: string | null
          linked_system_id: string | null
          mitigation: string | null
          org_id: string | null
          owner: string | null
          previous_score: number | null
          source: string | null
          title: string
          type: string | null
        }
        Insert: {
          affected_services?: string[] | null
          board_visibility?: boolean | null
          category?: string | null
          created_at?: string
          due_date?: string | null
          escalation_status?: string | null
          id: string
          impact?: number | null
          impact_override?: number | null
          last_updated?: string | null
          likelihood?: number | null
          likelihood_override?: number | null
          linked_dependency?: string | null
          linked_risk_ids?: string | null
          linked_system_id?: string | null
          mitigation?: string | null
          org_id?: string | null
          owner?: string | null
          previous_score?: number | null
          source?: string | null
          title: string
          type?: string | null
        }
        Update: {
          affected_services?: string[] | null
          board_visibility?: boolean | null
          category?: string | null
          created_at?: string
          due_date?: string | null
          escalation_status?: string | null
          id?: string
          impact?: number | null
          impact_override?: number | null
          last_updated?: string | null
          likelihood?: number | null
          likelihood_override?: number | null
          linked_dependency?: string | null
          linked_risk_ids?: string | null
          linked_system_id?: string | null
          mitigation?: string | null
          org_id?: string | null
          owner?: string | null
          previous_score?: number | null
          source?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      systems: {
        Row: {
          annual_cost: number | null
          api_reuse_potential: string | null
          contract_end: string | null
          created_at: string
          criticality: string | null
          department: string | null
          dependencies: string[] | null
          description: string | null
          development_cost: number | null
          domain: string | null
          downstream_services: string[] | null
          id: string
          internet_facing: boolean
          last_review_date: string | null
          lifecycle: string | null
          linked_gov_docs: string[] | null
          lock_in_risk: string | null
          maintenance_cost: number | null
          name: string
          org_id: string | null
          owner: string | null
          owner_title: string | null
          previous_risk_score: number | null
          replacement_priority: string | null
          standards_used: string[] | null
          type: string | null
          vendor_id: string | null
          vendor_name: string | null
          visibility: string | null
          x: number | null
          y: number | null
        }
        Insert: {
          annual_cost?: number | null
          api_reuse_potential?: string | null
          contract_end?: string | null
          created_at?: string
          criticality?: string | null
          department?: string | null
          dependencies?: string[] | null
          description?: string | null
          development_cost?: number | null
          domain?: string | null
          downstream_services?: string[] | null
          id: string
          internet_facing?: boolean
          last_review_date?: string | null
          lifecycle?: string | null
          linked_gov_docs?: string[] | null
          lock_in_risk?: string | null
          maintenance_cost?: number | null
          name: string
          org_id?: string | null
          owner?: string | null
          owner_title?: string | null
          previous_risk_score?: number | null
          replacement_priority?: string | null
          standards_used?: string[] | null
          type?: string | null
          vendor_id?: string | null
          vendor_name?: string | null
          visibility?: string | null
          x?: number | null
          y?: number | null
        }
        Update: {
          annual_cost?: number | null
          api_reuse_potential?: string | null
          contract_end?: string | null
          created_at?: string
          criticality?: string | null
          department?: string | null
          dependencies?: string[] | null
          description?: string | null
          development_cost?: number | null
          domain?: string | null
          downstream_services?: string[] | null
          id?: string
          internet_facing?: boolean
          last_review_date?: string | null
          lifecycle?: string | null
          linked_gov_docs?: string[] | null
          lock_in_risk?: string | null
          maintenance_cost?: number | null
          name?: string
          org_id?: string | null
          owner?: string | null
          owner_title?: string | null
          previous_risk_score?: number | null
          replacement_priority?: string | null
          standards_used?: string[] | null
          type?: string | null
          vendor_id?: string | null
          vendor_name?: string | null
          visibility?: string | null
          x?: number | null
          y?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "systems_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          contact_email: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          org_id: string | null
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          country?: string | null
          created_at?: string
          id: string
          name: string
          org_id?: string | null
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          org_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "cto" | "cfo" | "coo" | "partner" | "public"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["cto", "cfo", "coo", "partner", "public"],
    },
  },
} as const
