export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dividend_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          ex_date: string
          holding_id: string
          id: string
          is_projected: boolean | null
          pay_date: string
          symbol: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          ex_date: string
          holding_id: string
          id?: string
          is_projected?: boolean | null
          pay_date: string
          symbol: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          ex_date?: string
          holding_id?: string
          id?: string
          is_projected?: boolean | null
          pay_date?: string
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "dividend_payments_holding_id_fkey"
            columns: ["holding_id"]
            isOneToOne: false
            referencedRelation: "holdings"
            referencedColumns: ["id"]
          },
        ]
      }
      exchanges: {
        Row: {
          code: string
          country: string
          created_at: string
          currency: string
          id: string
          is_open: boolean | null
          last_status_update: string | null
          market_close: string | null
          market_open: string | null
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          code: string
          country: string
          created_at?: string
          currency?: string
          id?: string
          is_open?: boolean | null
          last_status_update?: string | null
          market_close?: string | null
          market_open?: string | null
          name: string
          timezone: string
          updated_at?: string
        }
        Update: {
          code?: string
          country?: string
          created_at?: string
          currency?: string
          id?: string
          is_open?: boolean | null
          last_status_update?: string | null
          market_close?: string | null
          market_open?: string | null
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      holdings: {
        Row: {
          avg_price: number
          created_at: string
          currency: string
          current_price: number
          dividend_yield: number | null
          id: string
          is_halal: boolean | null
          lot_id: string
          market: string
          name: string
          pnl: number
          pnl_percentage: number
          portfolio_id: string
          quantity: number
          symbol: string
          total_value: number
          updated_at: string
        }
        Insert: {
          avg_price: number
          created_at?: string
          currency?: string
          current_price: number
          dividend_yield?: number | null
          id?: string
          is_halal?: boolean | null
          lot_id?: string
          market: string
          name: string
          pnl: number
          pnl_percentage: number
          portfolio_id: string
          quantity: number
          symbol: string
          total_value: number
          updated_at?: string
        }
        Update: {
          avg_price?: number
          created_at?: string
          currency?: string
          current_price?: number
          dividend_yield?: number | null
          id?: string
          is_halal?: boolean | null
          lot_id?: string
          market?: string
          name?: string
          pnl?: number
          pnl_percentage?: number
          portfolio_id?: string
          quantity?: number
          symbol?: string
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          total_pnl: number | null
          total_pnl_percentage: number | null
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          total_pnl?: number | null
          total_pnl_percentage?: number | null
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          total_pnl?: number | null
          total_pnl_percentage?: number | null
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          currency: string
          id: string
          price: number
          recorded_at: string
          source: string | null
          symbol: string
        }
        Insert: {
          currency?: string
          id?: string
          price: number
          recorded_at?: string
          source?: string | null
          symbol: string
        }
        Update: {
          currency?: string
          id?: string
          price?: number
          recorded_at?: string
          source?: string | null
          symbol?: string
        }
        Relationships: []
      }
      symbol_prices: {
        Row: {
          change_amount: number
          change_percentage: number
          created_at: string
          data_source: string
          dividend_yield: number | null
          fetched_at: string
          high_52_week: number | null
          id: string
          low_52_week: number | null
          market_cap: number | null
          market_session: string | null
          price: number
          symbol_id: string
          updated_at: string
          volume: number | null
        }
        Insert: {
          change_amount?: number
          change_percentage?: number
          created_at?: string
          data_source: string
          dividend_yield?: number | null
          fetched_at?: string
          high_52_week?: number | null
          id?: string
          low_52_week?: number | null
          market_cap?: number | null
          market_session?: string | null
          price: number
          symbol_id: string
          updated_at?: string
          volume?: number | null
        }
        Update: {
          change_amount?: number
          change_percentage?: number
          created_at?: string
          data_source?: string
          dividend_yield?: number | null
          fetched_at?: string
          high_52_week?: number | null
          id?: string
          low_52_week?: number | null
          market_cap?: number | null
          market_session?: string | null
          price?: number
          symbol_id?: string
          updated_at?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "symbol_prices_symbol_id_fkey"
            columns: ["symbol_id"]
            isOneToOne: false
            referencedRelation: "symbols"
            referencedColumns: ["id"]
          },
        ]
      }
      symbols: {
        Row: {
          alternative_name_1: string | null
          alternative_name_2: string | null
          alternative_name_3: string | null
          alternative_name_4: string | null
          created_at: string
          currency: string
          exchange_id: string
          id: string
          industry: string | null
          is_active: boolean
          is_halal: boolean | null
          is_in_portfolio: boolean
          name: string
          sector: string | null
          symbol: string
          updated_at: string
        }
        Insert: {
          alternative_name_1?: string | null
          alternative_name_2?: string | null
          alternative_name_3?: string | null
          alternative_name_4?: string | null
          created_at?: string
          currency?: string
          exchange_id: string
          id?: string
          industry?: string | null
          is_active?: boolean
          is_halal?: boolean | null
          is_in_portfolio?: boolean
          name: string
          sector?: string | null
          symbol: string
          updated_at?: string
        }
        Update: {
          alternative_name_1?: string | null
          alternative_name_2?: string | null
          alternative_name_3?: string | null
          alternative_name_4?: string | null
          created_at?: string
          currency?: string
          exchange_id?: string
          id?: string
          industry?: string | null
          is_active?: boolean
          is_halal?: boolean | null
          is_in_portfolio?: boolean
          name?: string
          sector?: string | null
          symbol?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "symbols_exchange_id_fkey"
            columns: ["exchange_id"]
            isOneToOne: false
            referencedRelation: "exchanges"
            referencedColumns: ["id"]
          },
        ]
      }
      zakat_calculations: {
        Row: {
          calculation_date: string
          created_at: string
          id: string
          portfolio_id: string
          total_value: number
          zakat_due: number
          zakat_rate: number
          zakatable_amount: number
        }
        Insert: {
          calculation_date?: string
          created_at?: string
          id?: string
          portfolio_id: string
          total_value: number
          zakat_due: number
          zakat_rate?: number
          zakatable_amount: number
        }
        Update: {
          calculation_date?: string
          created_at?: string
          id?: string
          portfolio_id?: string
          total_value?: number
          zakat_due?: number
          zakat_rate?: number
          zakatable_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "zakat_calculations_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_symbols_for_price_update: {
        Args: Record<PropertyKey, never>
        Returns: {
          symbol_id: string
          symbol: string
          exchange_code: string
          last_updated: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
