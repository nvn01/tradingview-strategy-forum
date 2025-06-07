import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, BarChart3, Target, Activity, DollarSign, MessageCircle, Star } from "lucide-react"
import Link from "next/link"

interface StrategyCardProps {
  strategy: {
    id: string
    name: string
    description: string | null
    created_at: string
    reports: Array<{
      id: string
      symbol: { name: string; exchange: string }
      timeframe: { name: string; minutes: number }
      performance_metrics: {
        net_profit_percent: number | null
        profit_factor: number | null
      }
      trade_metrics: {
        percent_profitable: number | null
        total_trades: number | null
      }
    }>
    avg_rating: number | null
    total_comments: number
  }
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const reports = strategy.reports || []

  // Calculate aggregated metrics
  const avgProfitPercent =
    reports.length > 0
      ? reports.reduce((sum, report) => sum + (report.performance_metrics?.net_profit_percent || 0), 0) / reports.length
      : 0

  const avgProfitFactor =
    reports.length > 0
      ? reports.reduce((sum, report) => sum + (report.performance_metrics?.profit_factor || 0), 0) / reports.length
      : 0

  const avgWinRate =
    reports.length > 0
      ? reports.reduce((sum, report) => sum + (report.trade_metrics?.percent_profitable || 0), 0) / reports.length
      : 0

  const totalTrades = reports.reduce((sum, report) => sum + (report.trade_metrics?.total_trades || 0), 0)

  const profitabilityScore = Math.min(100, Math.max(0, (avgProfitFactor - 0.5) * 100))
  const riskScore = Math.min(100, Math.max(0, avgWinRate * 100))

  return (
    <Card className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-lg leading-tight mb-1">{strategy.name}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">{new Date(strategy.created_at).toLocaleDateString()}</span>
              <div className="flex items-center space-x-1">
                <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></div>
                <span className="text-xs text-emerald-400">Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {avgProfitPercent > 0 ? (
              <div className="flex items-center space-x-1 bg-emerald-500/20 px-2 py-1 rounded-full">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Profitable</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-full">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span className="text-xs font-medium text-red-400">Loss</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {strategy.description && (
          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{strategy.description}</p>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
            <div className={`text-xl font-bold ${avgProfitPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {(avgProfitPercent * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1">Avg Return</div>
            <div className="flex items-center justify-center mt-1">
              <DollarSign className="h-3 w-3 text-slate-500" />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
            <div className="text-xl font-bold text-blue-400">{avgProfitFactor.toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-1">Profit Factor</div>
            <div className="flex items-center justify-center mt-1">
              <BarChart3 className="h-3 w-3 text-slate-500" />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700">
            <div className="text-xl font-bold text-purple-400">{(avgWinRate * 100).toFixed(1)}%</div>
            <div className="text-xs text-slate-400 mt-1">Win Rate</div>
            <div className="flex items-center justify-center mt-1">
              <Target className="h-3 w-3 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Profitability Score</span>
              <span className="text-xs font-medium text-slate-300">{profitabilityScore.toFixed(0)}/100</span>
            </div>
            <Progress value={profitabilityScore} className="h-2 bg-slate-800" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Risk Management</span>
              <span className="text-xs font-medium text-slate-300">{riskScore.toFixed(0)}/100</span>
            </div>
            <Progress value={riskScore} className="h-2 bg-slate-800" />
          </div>
        </div>

        {/* Asset Coverage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Asset Coverage</span>
            <span className="text-xs text-slate-400">{reports.length} reports</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {reports.slice(0, 8).map((report, index) => (
              <Badge key={index} variant="outline" className="text-xs border-slate-600 text-slate-300 bg-slate-800/30">
                {report.symbol.name.replace("USDT", "")}/{report.timeframe.name}
              </Badge>
            ))}
            {reports.length > 8 && (
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 bg-slate-800/30">
                +{reports.length - 8}
              </Badge>
            )}
          </div>
        </div>

        {/* Social Stats and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4" />
              <span>{strategy.avg_rating?.toFixed(1) || "N/A"}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{strategy.total_comments}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="h-4 w-4" />
              <span>{totalTrades}</span>
            </div>
          </div>

          <Link href={`/strategies/${strategy.id}`}>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analyze
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
