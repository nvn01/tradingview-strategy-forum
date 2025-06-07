"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerformanceChart } from "@/components/performance-chart"
import { MetricsCard } from "@/components/metrics-card"
import { TradesTable } from "@/components/trades-table"
import { SymbolPerformanceGrid } from "@/components/symbol-performance-grid"
import { CommentsSection } from "@/components/comments-section"
import { RatingStars } from "@/components/rating-stars"
import { supabase } from "@/lib/supabase"
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Code,
  Copy,
  Download,
  FileText,
  Home,
  LineChart,
  Loader2,
  Share2,
  Target,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default function StrategyDetailPage() {
  const { id } = useParams()
  const [strategy, setStrategy] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeReportId, setActiveReportId] = useState<string | null>(null)

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const { data, error } = await supabase
          .from("strategies")
          .select(
            `
            id,
            name,
            description,
            created_at,
            strategy_reports (
              id,
              symbols (id, name, exchange),
              timeframes (id, name, minutes),
              performance_metrics (
                id,
                net_profit_usdt,
                net_profit_percent,
                net_profit_long_usdt,
                net_profit_long_percent,
                net_profit_short_usdt,
                net_profit_short_percent,
                gross_profit_usdt,
                gross_profit_percent,
                gross_loss_usdt,
                gross_loss_percent,
                buy_hold_return_usdt,
                buy_hold_return_percent,
                max_equity_runup_usdt,
                max_equity_runup_percent,
                max_equity_drawdown_usdt,
                max_equity_drawdown_percent,
                profit_factor,
                sharpe_ratio,
                sortino_ratio
              ),
              trade_metrics (
                id,
                total_trades,
                total_trades_long,
                total_trades_short,
                winning_trades,
                winning_trades_long,
                winning_trades_short,
                losing_trades,
                losing_trades_long,
                losing_trades_short,
                percent_profitable,
                percent_profitable_long,
                percent_profitable_short,
                avg_profit_usdt,
                avg_profit_percent,
                avg_profit_long_usdt,
                avg_profit_short_usdt,
                avg_winning_trade_usdt,
                avg_winning_trade_percent,
                avg_losing_trade_usdt,
                avg_losing_trade_percent,
                largest_winning_trade_usdt,
                largest_winning_trade_percent,
                largest_losing_trade_usdt,
                largest_losing_trade_percent,
                avg_bars_in_trades,
                avg_bars_in_winning_trades,
                avg_bars_in_losing_trades
              ),
              trades (
                id,
                trade_number,
                profit_usdt,
                profit_percent,
                cumulative_profit_usdt,
                cumulative_profit_percent,
                runup_usdt,
                runup_percent,
                drawdown_usdt,
                drawdown_percent
              )
            )
          `,
          )
          .eq("id", id)
          .single()

        if (error) throw error

        // Process the data
        const processedStrategy = {
          ...data,
          reports: data.strategy_reports.map((report: any) => ({
            id: report.id,
            symbol: report.symbols,
            timeframe: report.timeframes,
            performance_metrics: report.performance_metrics[0] || {},
            trade_metrics: report.trade_metrics[0] || {},
            trades: report.trades || [],
          })),
        }

        setStrategy(processedStrategy)
        if (processedStrategy.reports.length > 0) {
          setActiveReportId(processedStrategy.reports[0].id)
        }
      } catch (error) {
        console.error("Error fetching strategy:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStrategy()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
          <p className="text-slate-400">Loading strategy data...</p>
        </div>
      </div>
    )
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-slate-600" />
          <h2 className="text-2xl font-bold text-slate-300 mb-2">Strategy Not Found</h2>
          <p className="text-slate-400 mb-6">The strategy you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const activeReport = strategy.reports.find((report: any) => report.id === activeReportId) || strategy.reports[0]

  // Generate mock equity curve data
  const generateEquityCurveData = () => {
    const data = []
    let equity = 0
    let maxDrawdown = 0
    const startDate = new Date("2023-01-01")

    for (let i = 0; i < 100; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      // Random daily return between -2% and 2%
      const dailyReturn = (Math.random() * 4 - 2) / 100
      equity = equity + equity * dailyReturn

      // Calculate drawdown
      maxDrawdown = Math.min(maxDrawdown, dailyReturn)

      data.push({
        date: date.toISOString(),
        cumulative_profit_percent: equity,
        drawdown_percent: maxDrawdown / 5, // Scale drawdown for visualization
      })
    }

    return data
  }

  const equityCurveData = generateEquityCurveData()

  // Prepare symbol performance grid data
  const symbolPerformanceData = strategy.reports.map((report: any) => ({
    symbol: report.symbol.name,
    timeframe: report.timeframe.name,
    net_profit_percent: report.performance_metrics.net_profit_percent || 0,
    profit_factor: report.performance_metrics.profit_factor || 1,
    win_rate: report.trade_metrics.percent_profitable || 0,
    trades: report.trade_metrics.total_trades || 0,
  }))

  // Calculate aggregated metrics
  const avgNetProfitPercent =
    strategy.reports.reduce(
      (sum: number, report: any) => sum + (report.performance_metrics.net_profit_percent || 0),
      0,
    ) / strategy.reports.length

  const avgProfitFactor =
    strategy.reports.reduce((sum: number, report: any) => sum + (report.performance_metrics.profit_factor || 0), 0) /
    strategy.reports.length

  const avgWinRate =
    strategy.reports.reduce((sum: number, report: any) => sum + (report.trade_metrics.percent_profitable || 0), 0) /
    strategy.reports.length

  const totalTrades = strategy.reports.reduce(
    (sum: number, report: any) => sum + (report.trade_metrics.total_trades || 0),
    0,
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
                <Link href="/" className="hover:text-slate-200 transition-colors">
                  Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/strategies" className="hover:text-slate-200 transition-colors">
                  Strategies
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-300">Details</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-100">{strategy.name}</h1>
              <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(strategy.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{strategy.reports.length} reports</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{totalTrades} trades</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Strategy Description */}
        {strategy.description && (
          <div className="mb-8 bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h2 className="text-lg font-medium text-slate-100 mb-2">Strategy Description</h2>
            <p className="text-slate-300">{strategy.description}</p>
          </div>
        )}

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PerformanceChart data={equityCurveData} />
          </div>
          <div>
            <div className="grid grid-cols-1 gap-6">
              <MetricsCard
                title="Performance Summary"
                icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
                metrics={[
                  {
                    label: "Net Profit",
                    value: (avgNetProfitPercent * 100).toFixed(2),
                    suffix: "%",
                    isPositive: avgNetProfitPercent > 0,
                    progress: Math.min(100, Math.max(0, (avgNetProfitPercent + 0.5) * 100)),
                    progressColor: avgNetProfitPercent > 0 ? "hsl(142.1, 76.2%, 36.3%)" : "hsl(346.8, 77.2%, 49.8%)",
                  },
                  {
                    label: "Profit Factor",
                    value: avgProfitFactor.toFixed(2),
                    info: "Gross profit divided by gross loss",
                    progress: Math.min(100, Math.max(0, avgProfitFactor * 33)),
                    progressColor: "hsl(217.2, 91.2%, 59.8%)",
                  },
                  {
                    label: "Win Rate",
                    value: (avgWinRate * 100).toFixed(1),
                    suffix: "%",
                    progress: avgWinRate * 100,
                    progressColor: "hsl(280.1, 89.1%, 47.8%)",
                  },
                  {
                    label: "Total Trades",
                    value: totalTrades,
                  },
                ]}
              />

              <RatingStars reportId={activeReport.id} averageRating={4.2} totalRatings={12} />
            </div>
          </div>
        </div>

        {/* Symbol Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-slate-100 mb-4">Symbol Reports</h2>
          <div className="flex flex-wrap gap-2">
            {strategy.reports.map((report: any) => (
              <Badge
                key={report.id}
                variant={activeReportId === report.id ? "default" : "outline"}
                className={`cursor-pointer ${
                  activeReportId === report.id
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "border-slate-600 hover:bg-slate-800"
                }`}
                onClick={() => setActiveReportId(report.id)}
              >
                {report.symbol.name}/{report.timeframe.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="performance">Performance Matrix</TabsTrigger>
            <TabsTrigger value="code">Pine Script</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricsCard
                  title="Performance Metrics"
                  icon={<BarChart3 className="h-5 w-5 text-emerald-400" />}
                  metrics={[
                    {
                      label: "Net Profit (USDT)",
                      value: activeReport.performance_metrics.net_profit_usdt?.toFixed(2) || "N/A",
                      prefix: "$",
                      isPositive: (activeReport.performance_metrics.net_profit_usdt || 0) > 0,
                    },
                    {
                      label: "Net Profit (%)",
                      value: ((activeReport.performance_metrics.net_profit_percent || 0) * 100).toFixed(2) || "N/A",
                      suffix: "%",
                      isPositive: (activeReport.performance_metrics.net_profit_percent || 0) > 0,
                    },
                    {
                      label: "Buy & Hold Return",
                      value:
                        ((activeReport.performance_metrics.buy_hold_return_percent || 0) * 100).toFixed(2) || "N/A",
                      suffix: "%",
                      isPositive: (activeReport.performance_metrics.buy_hold_return_percent || 0) > 0,
                    },
                    {
                      label: "Max Drawdown",
                      value:
                        ((activeReport.performance_metrics.max_equity_drawdown_percent || 0) * 100).toFixed(2) || "N/A",
                      suffix: "%",
                      isPositive: false,
                    },
                  ]}
                />

                <MetricsCard
                  title="Trade Statistics"
                  icon={<LineChart className="h-5 w-5 text-emerald-400" />}
                  metrics={[
                    {
                      label: "Total Trades",
                      value: activeReport.trade_metrics.total_trades || "N/A",
                    },
                    {
                      label: "Win Rate",
                      value: ((activeReport.trade_metrics.percent_profitable || 0) * 100).toFixed(1) || "N/A",
                      suffix: "%",
                    },
                    {
                      label: "Avg Winning Trade",
                      value: activeReport.trade_metrics.avg_winning_trade_percent
                        ? (activeReport.trade_metrics.avg_winning_trade_percent * 100).toFixed(2)
                        : "N/A",
                      suffix: "%",
                      isPositive: true,
                    },
                    {
                      label: "Avg Losing Trade",
                      value: activeReport.trade_metrics.avg_losing_trade_percent
                        ? (activeReport.trade_metrics.avg_losing_trade_percent * 100).toFixed(2)
                        : "N/A",
                      suffix: "%",
                      isPositive: false,
                    },
                  ]}
                />

                <MetricsCard
                  title="Risk Metrics"
                  icon={<Target className="h-5 w-5 text-emerald-400" />}
                  metrics={[
                    {
                      label: "Profit Factor",
                      value: activeReport.performance_metrics.profit_factor?.toFixed(2) || "N/A",
                      info: "Gross profit divided by gross loss",
                    },
                    {
                      label: "Sharpe Ratio",
                      value: activeReport.performance_metrics.sharpe_ratio?.toFixed(2) || "N/A",
                      info: "Risk-adjusted return relative to volatility",
                    },
                    {
                      label: "Sortino Ratio",
                      value: activeReport.performance_metrics.sortino_ratio?.toFixed(2) || "N/A",
                      info: "Return relative to downside risk",
                    },
                    {
                      label: "Long/Short Win Rate",
                      value: `${((activeReport.trade_metrics.percent_profitable_long || 0) * 100).toFixed(1)}% / ${(
                        (activeReport.trade_metrics.percent_profitable_short || 0) * 100
                      ).toFixed(1)}%`,
                    },
                  ]}
                />
              </div>
            </TabsContent>

            <TabsContent value="trades">
              <TradesTable
                trades={activeReport.trades.map((trade: any) => ({
                  ...trade,
                  // Mock entry/exit data since we don't have it in the current schema
                  entry_datetime: new Date(
                    new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                  exit_datetime: new Date(
                    new Date().getTime() - Math.random() * 20 * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                  entry_price: 100 + Math.random() * 50,
                  exit_price: 100 + Math.random() * 50,
                  entry_type: Math.random() > 0.5 ? "Entry long" : "Entry short",
                  exit_signal: ["ATR Trail", "ReverseToLong", "ReverseToShort", "Take Profit"][
                    Math.floor(Math.random() * 4)
                  ],
                }))}
              />
            </TabsContent>

            <TabsContent value="performance">
              <SymbolPerformanceGrid data={symbolPerformanceData} />
            </TabsContent>

            <TabsContent value="code">
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-slate-100 flex items-center">
                    <Code className="h-5 w-5 mr-2 text-emerald-400" />
                    Pine Script Source Code
                  </h3>
                  <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-800">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
                <pre className="bg-slate-800 p-4 rounded-md overflow-x-auto text-sm text-slate-300 font-mono">
                  {`// Fisher Transform + QQE + Partial ATR Exit Strategy
//@version=5
strategy("Fisher Transform + QQE + Partial ATR Exit", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=100)

// Fisher Transform
length = input.int(10, title="Fisher Transform Length")
source = input(hl2, title="Source")

// QQE Settings
RSI_Period = input.int(14, title="RSI Period")
SF = input.float(5, title="QQE Smoothing Factor")
QQE = input.float(4.238, title="QQE Factor")

// ATR Settings
atr_length = input.int(14, title="ATR Length")
atr_multiplier = input.float(2.0, title="ATR Multiplier")

// Fisher Transform Calculation
highest_high = ta.highest(source, length)
lowest_low = ta.lowest(source, length)
value1 = 0.66 * ((source - lowest_low) / (highest_high - lowest_low) - 0.5) + 0.67 * nz(value1[1])
value2 = value1 > 0.99 ? 0.999 : value1 < -0.99 ? -0.999 : value1
fisher = 0.5 * math.log((1 + value2) / (1 - value2)) + 0.5 * nz(fisher[1])

// QQE Calculation
RSI_Period2 = RSI_Period
SF2 = SF
QQE2 = QQE

Wilders_Period = RSI_Period2 * 2 - 1
Rsi = ta.rsi(source, RSI_Period2)
RsiMa = ta.ema(Rsi, SF2)
AtrRsi = math.abs(RsiMa[1] - RsiMa)
MaAtrRsi = ta.ema(AtrRsi, Wilders_Period)
dar = ta.ema(MaAtrRsi, Wilders_Period) * QQE2

longband = 0.0
shortband = 0.0
trend = 0

DeltaFastAtrRsi = dar
RSIndex = RsiMa
newshortband = RSIndex + DeltaFastAtrRsi
newlongband = RSIndex - DeltaFastAtrRsi
longband := RSIndex[1] > longband[1] and RSIndex > longband[1] ? math.max(longband[1], newlongband) : newlongband
shortband := RSIndex[1] < shortband[1] and RSIndex < shortband[1] ? math.min(shortband[1], newshortband) : newshortband
cross_1 = ta.cross(longband[1], RSIndex)
trend := ta.cross(RSIndex, shortband[1]) ? 1 : cross_1 ? -1 : nz(trend[1], 1)
FastAtrRsiTL = trend == 1 ? longband : shortband

// Entry Conditions
long_condition = ta.crossover(fisher, 0) and FastAtrRsiTL > 50
short_condition = ta.crossunder(fisher, 0) and FastAtrRsiTL < 50

// ATR for exits
atr = ta.atr(atr_length)

// Strategy Execution
if long_condition
    strategy.entry("Long", strategy.long)

if short_condition
    strategy.entry("Short", strategy.short)

// Partial ATR Exit
if strategy.position_size > 0
    strategy.exit("Long Exit", "Long", stop=strategy.position_avg_price - atr * atr_multiplier)

if strategy.position_size < 0
    strategy.exit("Short Exit", "Short", stop=strategy.position_avg_price + atr * atr_multiplier)

// Plotting
plot(fisher, color=color.blue, title="Fisher Transform")
hline(0, "Zero Line", color=color.gray)
plot(FastAtrRsiTL, color=trend == 1 ? color.green : color.red, title="QQE Line")`}
                </pre>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Comments Section */}
        <CommentsSection
          reportId={activeReport.id}
          comments={[
            {
              id: "1",
              content:
                "Great strategy! The Fisher Transform combined with QQE provides excellent entry signals. The partial ATR exit is a nice touch for risk management.",
              created_at: "2024-01-15T10:30:00Z",
              user: {
                username: "TradingPro",
                avatar_url: "/placeholder.svg",
              },
            },
            {
              id: "2",
              content:
                "I've been testing this on different timeframes. Works particularly well on 4H and daily charts. The win rate is impressive across multiple assets.",
              created_at: "2024-01-14T15:45:00Z",
              user: {
                username: "AlgoTrader",
                avatar_url: "/placeholder.svg",
              },
            },
          ]}
        />
      </main>
    </div>
  )
}
