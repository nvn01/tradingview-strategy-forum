import { supabase } from "./supabase"

export async function getOrCreateSymbol(name: string, exchange: string) {
  // First try to find existing symbol
  const { data: existingSymbol } = await supabase
    .from("symbols")
    .select("id")
    .eq("name", name)
    .eq("exchange", exchange)
    .single()

  if (existingSymbol) {
    return existingSymbol.id
  }

  // Create new symbol if it doesn't exist
  const { data: newSymbol, error } = await supabase.from("symbols").insert({ name, exchange }).select("id").single()

  if (error) throw error
  return newSymbol.id
}

export async function getOrCreateTimeframe(name: string, minutes: number) {
  // First try to find existing timeframe
  const { data: existingTimeframe } = await supabase.from("timeframes").select("id").eq("name", name).single()

  if (existingTimeframe) {
    return existingTimeframe.id
  }

  // Create new timeframe if it doesn't exist
  const { data: newTimeframe, error } = await supabase
    .from("timeframes")
    .insert({ name, minutes })
    .select("id")
    .single()

  if (error) throw error
  return newTimeframe.id
}

export function parseJsonReportData(jsonData: any) {
  const fileName = jsonData.file_name || ""

  // Extract symbol and exchange from filename
  const symbolMatch = fileName.match(/([A-Z]+USDT?\.?P?)/)
  const symbol = symbolMatch ? symbolMatch[1] : "UNKNOWN"
  const exchange = fileName.includes("BINANCE") ? "BINANCE" : "UNKNOWN"

  // Extract timeframe (you might need to adjust this based on your filename format)
  const timeframe = "1h" // Default, you can enhance this parsing
  const timeframeMinutes = 60 // Default for 1h

  return {
    symbol,
    exchange,
    timeframe,
    timeframeMinutes,
    fileName,
    performance: jsonData.performance || {},
    tradesAnalysis: jsonData.trades_analysis || {},
    riskRatios: jsonData.risk_performance_ratios || {},
    trades: jsonData.trades || [],
  }
}
