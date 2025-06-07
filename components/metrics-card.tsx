import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface MetricsCardProps {
  title: string
  icon: React.ReactNode
  metrics: {
    label: string
    value: number | string | null
    suffix?: string
    prefix?: string
    info?: string
    progress?: number
    progressColor?: string
    isPositive?: boolean
  }[]
}

export function MetricsCard({ title, icon, metrics }: MetricsCardProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-100 flex items-center text-base">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-slate-400">{metric.label}</span>
                {metric.info && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-slate-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 border-slate-600 text-slate-200">
                        <p className="text-xs">{metric.info}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  metric.isPositive === true
                    ? "text-emerald-400"
                    : metric.isPositive === false
                      ? "text-red-400"
                      : "text-slate-200"
                }`}
              >
                {metric.prefix}
                {typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value || "N/A"}
                {metric.suffix}
              </span>
            </div>
            {metric.progress !== undefined && (
              <Progress
                value={metric.progress}
                className="h-1.5"
                style={
                  {
                    background: "rgba(255,255,255,0.1)",
                    "--progress-background": metric.progressColor || "hsl(var(--chart-1))",
                  } as React.CSSProperties
                }
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
