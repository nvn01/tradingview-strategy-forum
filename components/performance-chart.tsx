"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { TrendingUp } from "lucide-react"

interface PerformanceChartProps {
  data: Array<{
    date: string
    cumulative_profit_percent: number
    drawdown_percent: number
  }>
  title?: string
}

export function PerformanceChart({ data, title = "Equity Curve" }: PerformanceChartProps) {
  const [chartType, setChartType] = useState<"equity" | "drawdown" | "combined">("combined")

  const chartConfig = {
    cumulative_profit_percent: {
      label: "Equity Curve",
      color: "hsl(var(--chart-1))",
    },
    drawdown_percent: {
      label: "Drawdown",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
            {title}
          </CardTitle>
          <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
            <SelectTrigger className="w-[180px] h-8 text-xs bg-slate-800 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="combined">Equity & Drawdown</SelectItem>
              <SelectItem value="equity">Equity Only</SelectItem>
              <SelectItem value="drawdown">Drawdown Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                stroke="rgba(255,255,255,0.5)"
                fontSize={10}
              />
              <YAxis
                tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                stroke="rgba(255,255,255,0.5)"
                fontSize={10}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
              {(chartType === "equity" || chartType === "combined") && (
                <Line
                  type="monotone"
                  dataKey="cumulative_profit_percent"
                  stroke="var(--color-cumulative_profit_percent)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
              {(chartType === "drawdown" || chartType === "combined") && (
                <Line
                  type="monotone"
                  dataKey="drawdown_percent"
                  stroke="var(--color-drawdown_percent)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
