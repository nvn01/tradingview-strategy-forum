"use client"

import { useEffect, useState } from "react"
import { StrategyCard } from "@/components/strategy-card"
import { UploadStrategyDialog } from "@/components/upload-strategy-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, BarChart3, Users, FileText, Activity, Target, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function HomePage() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const fetchStrategies = async () => {
    try {
      const { data, error } = await supabase
        .from("strategies")
        .select(`
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
        .order("created_at", { ascending: false })

      if (error) throw error

      // Add mock ratings and comments for now
      const strategiesWithStats = data.map((strategy) => ({
        ...strategy,
        reports: strategy.strategy_reports.map((report: any) => ({
          id: report.id,
          symbol: report.symbols,
          timeframe: report.timeframes,
          performance_metrics: report.performance_metrics[0] || {},
          trade_metrics: report.trade_metrics[0] || {},
        })),
        avg_rating: Math.random() * 2 + 3, // Mock rating 3-5
        total_comments: Math.floor(Math.random() * 20), // Mock comments 0-20
      }))

      setStrategies(strategiesWithStats)
    } catch (error) {
      console.error("Error fetching strategies:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStrategies()
  }, [])

  const filteredStrategies = strategies.filter(
    (strategy) =>
      strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (strategy.description && strategy.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const platformStats = {
    totalStrategies: strategies.length,
    totalReports: strategies.reduce((sum, s) => sum + s.reports.length, 0),
    activeTraders: Math.floor(strategies.length * 0.7), // Mock
    avgProfitFactor: 1.23, // Mock
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <BarChart3 className="h-10 w-10 text-emerald-400" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  PineScript Analytics
                </h1>
                <p className="text-xs text-slate-400">Professional Strategy Backtesting Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-slate-300">Live Market Data</span>
                </div>
                <div className="text-slate-400">
                  Last Update: <span className="text-emerald-400">2 min ago</span>
                </div>
              </div>
              <UploadStrategyDialog onUploadComplete={fetchStrategies} />
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-lg font-bold text-blue-400">{platformStats.totalStrategies.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Total Strategies</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-lg font-bold text-purple-400">{platformStats.totalReports.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Backtest Reports</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-emerald-400" />
              <div>
                <div className="text-lg font-bold text-emerald-400">{platformStats.activeTraders.toLocaleString()}</div>
                <div className="text-xs text-slate-400">Active Traders</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-orange-400" />
              <div>
                <div className="text-lg font-bold text-orange-400">{platformStats.avgProfitFactor}</div>
                <div className="text-xs text-slate-400">Avg Profit Factor</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-12 p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl"></div>
          <div className="relative text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Professional Grade Analytics</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Multi-Asset Strategy Backtesting
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload comprehensive multi-symbol, multi-timeframe backtests with detailed trade analysis. Get real
              insights from professional traders. No cherry-picking, just transparent results.
            </p>
            <div className="flex justify-center space-x-4">
              <UploadStrategyDialog onUploadComplete={fetchStrategies} />
              <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                <BarChart3 className="h-4 w-4 mr-2" />
                Explore Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-100">
              <Search className="h-5 w-5 text-emerald-400" />
              <span>Strategy Scanner</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Strategy name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="profit-factor">Highest Profit Factor</SelectItem>
                    <SelectItem value="win-rate">Highest Win Rate</SelectItem>
                    <SelectItem value="reports">Most Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Filter</label>
                <Select>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                    <SelectValue placeholder="All Strategies" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">All Strategies</SelectItem>
                    <SelectItem value="profitable">Profitable Only</SelectItem>
                    <SelectItem value="high-volume">High Volume</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategies Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">Trading Strategies</h3>
              <p className="text-slate-400">{filteredStrategies.length} strategies found</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded mb-4"></div>
                  <div className="h-3 bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredStrategies.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStrategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No strategies found</h3>
              <p className="text-slate-400 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Be the first to upload a strategy!"}
              </p>
              <UploadStrategyDialog onUploadComplete={fetchStrategies} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
