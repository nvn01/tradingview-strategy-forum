import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          created_at?: string
          updated_at?: string
        }
      }
      strategies: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      symbols: {
        Row: {
          id: string
          name: string
          exchange: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          exchange: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          exchange?: string
          created_at?: string
        }
      }
      timeframes: {
        Row: {
          id: string
          name: string
          minutes: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          minutes: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          minutes?: number
          created_at?: string
        }
      }
      strategy_reports: {
        Row: {
          id: string
          strategy_id: string
          symbol_id: string
          timeframe_id: string
          file_name: string
          test_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          strategy_id: string
          symbol_id: string
          timeframe_id: string
          file_name: string
          test_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          strategy_id?: string
          symbol_id?: string
          timeframe_id?: string
          file_name?: string
          test_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      performance_metrics: {
        Row: {
          id: string
          report_id: string
          net_profit_usdt: number | null
          net_profit_percent: number | null
          net_profit_long_usdt: number | null
          net_profit_long_percent: number | null
          net_profit_short_usdt: number | null
          net_profit_short_percent: number | null
          gross_profit_usdt: number | null
          gross_profit_percent: number | null
          gross_loss_usdt: number | null
          gross_loss_percent: number | null
          buy_hold_return_usdt: number | null
          buy_hold_return_percent: number | null
          max_equity_runup_usdt: number | null
          max_equity_runup_percent: number | null
          max_equity_drawdown_usdt: number | null
          max_equity_drawdown_percent: number | null
          profit_factor: number | null
          sharpe_ratio: number | null
          sortino_ratio: number | null
          created_at: string
          updated_at: string
        }
      }
      trade_metrics: {
        Row: {
          id: string
          report_id: string
          total_trades: number | null
          total_trades_long: number | null
          total_trades_short: number | null
          winning_trades: number | null
          winning_trades_long: number | null
          winning_trades_short: number | null
          losing_trades: number | null
          losing_trades_long: number | null
          losing_trades_short: number | null
          percent_profitable: number | null
          percent_profitable_long: number | null
          percent_profitable_short: number | null
          avg_profit_usdt: number | null
          avg_profit_percent: number | null
          avg_profit_long_usdt: number | null
          avg_profit_short_usdt: number | null
          avg_winning_trade_usdt: number | null
          avg_winning_trade_percent: number | null
          avg_losing_trade_usdt: number | null
          avg_losing_trade_percent: number | null
          largest_winning_trade_usdt: number | null
          largest_winning_trade_percent: number | null
          largest_losing_trade_usdt: number | null
          largest_losing_trade_percent: number | null
          avg_bars_in_trades: number | null
          avg_bars_in_winning_trades: number | null
          avg_bars_in_losing_trades: number | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
