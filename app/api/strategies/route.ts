import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"

    const offset = (page - 1) * limit

    let query = supabase.from("strategies").select(`
        id,
        name,
        description,
        created_at,
        strategy_reports (
          id,
          symbols (name, exchange),
          timeframes (name, minutes),
          performance_metrics (net_profit_percent, profit_factor),
          trade_metrics (percent_profitable, total_trades)
        )
      `)

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query.order(sortBy, { ascending: false }).range(offset, offset + limit - 1)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
