"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, BarChart3, GitCompare, Plus, TrendingDown, TrendingUp, X } from "lucide-react"
import Link from "next/link"

interface Strategy {
  id: string
  name: string
  reports: Array<{
    performance_metrics: {
      net_profit_percent: number
      profit_factor: number
      max_equity_drawdown_percent: number
    }
    trade_metrics: {
      percent_profitable: number
      total_trades: number
    }
  }>
}

export default function ComparePage() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const { data, error } = await supabase
          .from("strategies")
          .select(
            `
            id,
            name,
            strategy_reports (
              performance_metrics (
                net_profit_percent,
                profit_factor,
                max_equity_drawdown_percent
              ),
              trade_metrics (
                percent_profitable,
                total_trades
              )
            )
          `,
          )
          .limit(20)

        if (error) throw error

        const processedStrategies = data.map((strategy) => ({
          ...strategy,
          reports: strategy.strategy_reports.map((report: any) => ({
            performance_metrics: report.performance_metrics[0] || {},
            trade_metrics: report.trade_metrics[0] || {},
          })),
        }))

        setStrategies(processedStrategies)
      } catch (error) {
        console.error("Error fetching strategies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStrategies()
  }, [])

  const addStrategy = (strategyId: string) => {
    const strategy = strategies.find((s) => s.id === strategyId)
    if (strategy && !selectedStrategies.find((s) => s.id === strategyId) && selectedStrategies.length < 4) {
      setSelectedStrategies([...selectedStrategies, strategy])
    }
  }

  const removeStrategy = (strategyId: string) => {
    setSelectedStrategies(selectedStrategies.filter((s) => s.id !== strategyId))
  }

  const calculateAggregateMetrics = (strategy: Strategy) => {
    const reports = strategy.reports
    if (reports.length === 0) return null

    return {
      avgNetProfitPercent:
        reports.reduce((sum, report) => sum + (report.performance_metrics.net_profit_percent || 0), 0) / reports.length,
      avgProfitFactor:
        reports.reduce((sum, report) => sum + (report.performance_metrics.profit_factor || 0), 0) / reports.length,
      avgWinRate:
        reports.reduce((sum, report) => sum + (report.trade_metrics.percent_profitable || 0), 0) / reports.length,
      totalTrades: reports.reduce((sum, report) => sum + (report.trade_metrics.total_trades || 0), 0),
      avgMaxDrawdown:
        reports.reduce((sum, report) => sum + (report.performance_metrics.max_equity_drawdown_percent || 0), 0) /
        reports.length,
    }
  }

  // Generate mock comparison chart data
  const generateComparisonData = () => {
    const data = []
    const startDate = new Date("2023-01-01")

    for (let i = 0; i < 100; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const dataPoint: any = {
        date: date.toISOString(),
      }

      selectedStrategies.forEach((strategy, index) => {
        const metrics = calculateAggregateMetrics(strategy)
        if (metrics) {
          // Simulate equity curve based on average performance
          const volatility = 0.02 + Math.random() * 0.01
          const trend = metrics.avgNetProfitPercent / 100 / 100
          const randomWalk = (Math.random() - 0.5) * volatility
          const value = trend * i + randomWalk * Math.sqrt(i)
          dataPoint[`strategy_${index}`] = value
        }
      })

      data.push(dataPoint)
    }

    return data
  }

  const comparisonData = generateComparisonData()

  const chartConfig = selectedStrategies.reduce((config, strategy, index) => {
    const colors = [
      "hsl(142.1, 76.2%, 36.3%)",
      "hsl(346.8, 77.2%, 49.8%)",
      "hsl(47.9, 95.8%, 53.1%)",
      "hsl(280.1, 89.1%, 47.8%)",
    ]
    config[`strategy_${index}`] = {
      label: strategy.name,
      color: colors[index % colors.length],
    }
    return config
  }, {} as any)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GitCompare className="h-8 w-8 text-emerald-400" />
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Strategy Comparison</h1>
                <p className="text-sm text-slate-400">Compare up to 4 strategies side by side</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Strategies
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Strategy Selection */}
        <Card className="mb-8 bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-emerald-400" />
              Add Strategies to Compare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select onValueChange={addStrategy}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Select a strategy to add..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {strategies
                      .filter((strategy) => !selectedStrategies.find((s) => s.id === strategy.id))
                      .map((strategy) => (
                        <SelectItem key={strategy.id} value={strategy.id}>
                          {strategy.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-slate-400 flex items-center">
                {selectedStrategies.length}/4 strategies selected
              </div>
            </div>

            {/* Selected Strategies */}
            {selectedStrategies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedStrategies.map((strategy) => (
                  <Badge
                    key={strategy.id}
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 pr-1"
                  >
                    {strategy.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2 hover:bg-red-500/20"
                      onClick={() => removeStrategy(strategy.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedStrategies.length === 0 ? (
          <div className="text-center py-12">
            <GitCompare className="h-16 w-16 mx-auto mb-4 text-slate-600" />
            <h2 className="text-xl font-medium text-slate-300 mb-2">No Strategies Selected</h2>
            <p className="text-slate-400">Select at least 2 strategies to start comparing their performance.</p>
          </div>
        ) : selectedStrategies.length === 1 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-slate-600" />
            <h2 className="text-xl font-medium text-slate-300 mb-2">Add More Strategies</h2>
            <p className="text-slate-400">Add at least one more strategy to enable comparison features.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Performance Chart Comparison */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-emerald-400" />
                  Equity Curve Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {/* Custom comparison chart would go here */}
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Equity curve comparison chart</p>
                      <p className="text-sm">(Chart implementation would show overlaid equity curves)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Comparison Table */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Performance Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-slate-300 font-medium">Metric</th>
                        {selectedStrategies.map((strategy) => (
                          <th key={strategy.id} className="text-center py-3 px-4 text-slate-300 font-medium">
                            {strategy.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4 text-slate-400">Net Profit (%)</td>
                        {selectedStrategies.map((strategy) => {
                          const metrics = calculateAggregateMetrics(strategy)
                          const value = metrics ? (metrics.avgNetProfitPercent * 100).toFixed(2) : "N/A"
                          const isPositive = metrics ? metrics.avgNetProfitPercent > 0 : false
                          return (
                            <td key={strategy.id} className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center">
                                {isPositive ? (
                                  <TrendingUp className="h-4 w-4 mr-1 text-emerald-400" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 mr-1 text-red-400" />
                                )}
                                <span className={isPositive ? "text-emerald-400" : "text-red-400"}>{value}%</span>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4 text-slate-400">Profit Factor</td>
                        {selectedStrategies.map((strategy) => {
                          const metrics = calculateAggregateMetrics(strategy)
                          const value = metrics ? metrics.avgProfitFactor.toFixed(2) : "N/A"
                          return (
                            <td key={strategy.id} className="py-3 px-4 text-center text-blue-400">
                              {value}
                            </td>
                          )
                        })}
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4 text-slate-400">Win Rate (%)</td>
                        {selectedStrategies.map((strategy) => {
                          const metrics = calculateAggregateMetrics(strategy)
                          const value = metrics ? (metrics.avgWinRate * 100).toFixed(1) : "N/A"
                          return (
                            <td key={strategy.id} className="py-3 px-4 text-center text-purple-400">
                              {value}%
                            </td>
                          )
                        })}
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4 text-slate-400">Total Trades</td>
                        {selectedStrategies.map((strategy) => {
                          const metrics = calculateAggregateMetrics(strategy)
                          const value = metrics ? metrics.totalTrades.toLocaleString() : "N/A"
                          return (
                            <td key={strategy.id} className="py-3 px-4 text-center text-slate-300">
                              {value}
                            </td>
                          )
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-400">Max Drawdown (%)</td>
                        {selectedStrategies.map((strategy) => {
                          const metrics = calculateAggregateMetrics(strategy)
                          const value = metrics ? (Math.abs(metrics.avgMaxDrawdown) * 100).toFixed(2) : "N/A"
                          return (
                            <td key={strategy.id} className="py-3 px-4 text-center text-red-400">
                              -{value}%
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Risk-Return Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Risk vs Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedStrategies.map((strategy, index) => {
                      const metrics = calculateAggregateMetrics(strategy)
                      if (!metrics) return null

                      const colors = ["emerald", "red", "yellow", "purple"]
                      const color = colors[index % colors.length]

                      return (
                        <div key={strategy.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full bg-${color}-400`}></div>
                            <span className="text-slate-300">{strategy.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-slate-400">
                              Return: {(metrics.avgNetProfitPercent * 100).toFixed(2)}%
                            </div>
                            <div className="text-sm text-slate-400">
                              Risk: {(Math.abs(metrics.avgMaxDrawdown) * 100).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Strategy Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedStrategies
                      .map((strategy) => ({
                        strategy,
                        metrics: calculateAggregateMetrics(strategy),
                      }))
                      .filter((item) => item.metrics)
                      .sort((a, b) => (b.metrics!.avgNetProfitPercent || 0) - (a.metrics!.avgNetProfitPercent || 0))
                      .map((item, index) => (
                        <div key={item.strategy.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-slate-300">{item.strategy.name}</span>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-medium ${
                                (item.metrics!.avgNetProfitPercent || 0) > 0 ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {(item.metrics!.avgNetProfitPercent * 100).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
