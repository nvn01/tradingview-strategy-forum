"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Grid3X3 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SymbolPerformanceGridProps {
  data: Array<{
    symbol: string
    timeframe: string
    net_profit_percent: number
    profit_factor: number
    win_rate: number
    trades: number
  }>
}

export function SymbolPerformanceGrid({ data }: SymbolPerformanceGridProps) {
  // Get unique symbols and timeframes
  const symbols = Array.from(new Set(data.map((item) => item.symbol)))
  const timeframes = Array.from(new Set(data.map((item) => item.timeframe)))

  // Sort timeframes by duration (assuming common formats like 1h, 4h, 1d)
  const timeframeOrder: Record<string, number> = {
    "1m": 1,
    "5m": 5,
    "15m": 15,
    "30m": 30,
    "1h": 60,
    "2h": 120,
    "4h": 240,
    "1d": 1440,
    "1w": 10080,
  }

  const sortedTimeframes = timeframes.sort((a, b) => (timeframeOrder[a] || 999) - (timeframeOrder[b] || 999))

  // Create a lookup map for quick access
  const dataMap: Record<string, (typeof data)[0]> = {}
  data.forEach((item) => {
    dataMap[`${item.symbol}-${item.timeframe}`] = item
  })

  // Function to get color based on profit percentage
  const getProfitColor = (profit: number) => {
    if (profit > 0.05) return "bg-emerald-500"
    if (profit > 0.02) return "bg-emerald-400"
    if (profit > 0) return "bg-emerald-300"
    if (profit > -0.02) return "bg-red-300"
    if (profit > -0.05) return "bg-red-400"
    return "bg-red-500"
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-100 flex items-center">
          <Grid3X3 className="h-5 w-5 mr-2 text-emerald-400" />
          Symbol Performance Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-medium text-slate-400">Symbol / Timeframe</th>
                {sortedTimeframes.map((tf) => (
                  <th key={tf} className="p-2 text-center text-xs font-medium text-slate-400">
                    {tf}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {symbols.map((symbol) => (
                <tr key={symbol} className="border-t border-slate-800">
                  <td className="p-2 text-left text-xs font-medium text-slate-300">{symbol}</td>
                  {sortedTimeframes.map((tf) => {
                    const item = dataMap[`${symbol}-${tf}`]
                    return (
                      <td key={tf} className="p-2">
                        {item ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-center">
                                  <div
                                    className={`w-12 h-12 rounded-md flex items-center justify-center ${getProfitColor(
                                      item.net_profit_percent,
                                    )}`}
                                  >
                                    <div className="text-slate-900 font-bold">
                                      {(item.net_profit_percent * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-800 border-slate-600">
                                <div className="space-y-1 p-1">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-slate-400">Symbol:</span>
                                    <span className="text-xs font-medium text-slate-200">{symbol}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-slate-400">Timeframe:</span>
                                    <span className="text-xs font-medium text-slate-200">{tf}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-slate-400">Net Profit:</span>
                                    <span
                                      className={`text-xs font-medium ${
                                        item.net_profit_percent >= 0 ? "text-emerald-400" : "text-red-400"
                                      }`}
                                    >
                                      {(item.net_profit_percent * 100).toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-slate-400">Profit Factor:</span>
                                    <span className="text-xs font-medium text-blue-400">
                                      {item.profit_factor.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-slate-400">Win Rate:</span>
                                    <span className="text-xs font-medium text-purple-400">
                                      {(item.win_rate * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs text-slate-400">Trades:</span>
                                    <span className="text-xs font-medium text-slate-200">{item.trades}</span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-slate-800 flex items-center justify-center mx-auto">
                            <span className="text-slate-600">N/A</span>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
