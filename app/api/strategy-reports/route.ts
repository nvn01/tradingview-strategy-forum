import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { reports } = await request.json()

    if (!Array.isArray(reports) || reports.length === 0) {
      return NextResponse.json({ error: "Reports array is required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("strategy_reports").insert(reports).select()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Also insert individual trades if they exist
    for (const report of data) {
      const trades = report.raw_data?.trades || []
      if (trades.length > 0) {
        const tradeRecords = trades.map((trade: any) => ({
          report_id: report.id,
          trade_number: trade.trade_number,
          entry_type: trade.entries?.[0]?.signal?.toLowerCase().includes("long") ? "long" : "short",
          entry_signal: trade.entries?.[0]?.signal,
          entry_datetime: trade.entries?.[0]?.date_time,
          entry_price: trade.entries?.[0]?.price_usdt,
          exit_signal: trade.exits?.[0]?.signal,
          exit_datetime: trade.exits?.[0]?.date_time,
          exit_price: trade.exits?.[0]?.price_usdt,
          contracts: trade.entries?.[0]?.contracts,
          profit_usdt: trade.exits?.[0]?.profit_usdt,
          profit_percent: trade.exits?.[0]?.profit_percent,
        }))

        await supabase.from("trades").insert(tradeRecords)
      }
    }

    return NextResponse.json({ success: true, count: data.length })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
