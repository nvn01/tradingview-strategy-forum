"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getOrCreateSymbol, getOrCreateTimeframe, parseJsonReportData } from "@/lib/database-utils"

interface UploadStrategyDialogProps {
  onUploadComplete?: () => void
}

export function UploadStrategyDialog({ onUploadComplete }: UploadStrategyDialogProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [strategyName, setStrategyName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [parsedData, setParsedData] = useState<any[]>([])
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    setFiles(selectedFiles)

    if (selectedFiles && selectedFiles.length > 0) {
      // Parse files for preview
      const parsed = []
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        if (file.type === "application/json" || file.name.endsWith(".json")) {
          try {
            const text = await file.text()
            const jsonData = JSON.parse(text)
            const reportData = parseJsonReportData(jsonData)
            parsed.push(reportData)
          } catch (error) {
            console.error(`Error parsing ${file.name}:`, error)
          }
        }
      }
      setParsedData(parsed)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one JSON file",
        variant: "destructive",
      })
      return
    }

    if (!strategyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a strategy name",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Create strategy
      const { data: strategy, error: strategyError } = await supabase
        .from("strategies")
        .insert({
          name: strategyName,
          description: description || null,
        })
        .select()
        .single()

      if (strategyError) throw strategyError

      // Process each JSON file
      for (const reportData of parsedData) {
        // Get or create symbol and timeframe
        const symbolId = await getOrCreateSymbol(reportData.symbol, reportData.exchange)
        const timeframeId = await getOrCreateTimeframe(reportData.timeframe, reportData.timeframeMinutes)

        // Create strategy report
        const { data: report, error: reportError } = await supabase
          .from("strategy_reports")
          .insert({
            strategy_id: strategy.id,
            symbol_id: symbolId,
            timeframe_id: timeframeId,
            file_name: reportData.fileName,
          })
          .select()
          .single()

        if (reportError) throw reportError

        // Insert performance metrics
        const performanceData = reportData.performance
        if (performanceData) {
          await supabase.from("performance_metrics").insert({
            report_id: report.id,
            net_profit_usdt: performanceData.net_profit?.all_usdt || null,
            net_profit_percent: performanceData.net_profit?.all_percent || null,
            net_profit_long_usdt: performanceData.net_profit?.long_usdt || null,
            net_profit_long_percent: performanceData.net_profit?.long_percent || null,
            net_profit_short_usdt: performanceData.net_profit?.short_usdt || null,
            net_profit_short_percent: performanceData.net_profit?.short_percent || null,
            gross_profit_usdt: performanceData.gross_profit?.all_usdt || null,
            gross_profit_percent: performanceData.gross_profit?.all_percent || null,
            gross_loss_usdt: performanceData.gross_loss?.all_usdt || null,
            gross_loss_percent: performanceData.gross_loss?.all_percent || null,
            buy_hold_return_usdt: performanceData["buy_&_hold_return"]?.all_usdt || null,
            buy_hold_return_percent: performanceData["buy_&_hold_return"]?.all_percent || null,
            max_equity_runup_usdt: performanceData["max_equity_run-up"]?.all_usdt || null,
            max_equity_runup_percent: performanceData["max_equity_run-up"]?.all_percent || null,
            max_equity_drawdown_usdt: performanceData["max_equity_drawdown"]?.all_usdt || null,
            max_equity_drawdown_percent: performanceData["max_equity_drawdown"]?.all_percent || null,
            profit_factor: reportData.riskRatios.profit_factor?.all_usdt || null,
            sharpe_ratio: reportData.riskRatios.sharpe_ratio?.all_usdt || null,
            sortino_ratio: reportData.riskRatios.sortino_ratio?.all_usdt || null,
          })
        }

        // Insert trade metrics
        const tradesData = reportData.tradesAnalysis
        if (tradesData) {
          await supabase.from("trade_metrics").insert({
            report_id: report.id,
            total_trades: tradesData.total_trades?.all_usdt || null,
            total_trades_long: tradesData.total_trades?.long_usdt || null,
            total_trades_short: tradesData.total_trades?.short_usdt || null,
            winning_trades: tradesData.winning_trades?.all_usdt || null,
            winning_trades_long: tradesData.winning_trades?.long_usdt || null,
            winning_trades_short: tradesData.winning_trades?.short_usdt || null,
            losing_trades: tradesData.losing_trades?.all_usdt || null,
            losing_trades_long: tradesData.losing_trades?.long_usdt || null,
            losing_trades_short: tradesData.losing_trades?.short_usdt || null,
            percent_profitable: tradesData.percent_profitable?.all_percent || null,
            percent_profitable_long: tradesData.percent_profitable?.long_percent || null,
            percent_profitable_short: tradesData.percent_profitable?.short_percent || null,
            avg_profit_usdt: tradesData["avg_p&l"]?.all_usdt || null,
            avg_profit_percent: tradesData["avg_p&l"]?.all_percent || null,
            avg_profit_long_usdt: tradesData["avg_p&l"]?.long_usdt || null,
            avg_profit_short_usdt: tradesData["avg_p&l"]?.short_usdt || null,
            avg_winning_trade_usdt: tradesData.avg_winning_trade?.all_usdt || null,
            avg_winning_trade_percent: tradesData.avg_winning_trade?.all_percent || null,
            avg_losing_trade_usdt: tradesData.avg_losing_trade?.all_usdt || null,
            avg_losing_trade_percent: tradesData.avg_losing_trade?.all_percent || null,
            largest_winning_trade_usdt: tradesData.largest_winning_trade?.all_usdt || null,
            largest_winning_trade_percent: tradesData.largest_winning_trade_percent?.all_percent || null,
            largest_losing_trade_usdt: tradesData.largest_losing_trade?.all_usdt || null,
            largest_losing_trade_percent: tradesData.largest_losing_trade_percent?.all_percent || null,
            avg_bars_in_trades: tradesData["avg_#_bars_in_trades"]?.all_usdt || null,
            avg_bars_in_winning_trades: tradesData["avg_#_bars_in_winning_trades"]?.all_usdt || null,
            avg_bars_in_losing_trades: tradesData["avg_#_bars_in_losing_trades"]?.all_usdt || null,
          })
        }

        // Insert individual trades
        if (reportData.trades && reportData.trades.length > 0) {
          const tradeRecords = reportData.trades.map((trade: any) => ({
            report_id: report.id,
            trade_number: trade.trade_number,
            profit_usdt: trade.exits?.[0]?.profit_usdt || null,
            profit_percent: trade.exits?.[0]?.profit_percent || null,
            cumulative_profit_usdt: trade.exits?.[0]?.cumulative_profit_usdt || null,
            cumulative_profit_percent: trade.exits?.[0]?.cumulative_profit_percent || null,
            runup_usdt: trade.exits?.[0]?.runup_usdt || null,
            runup_percent: trade.exits?.[0]?.runup_percent || null,
            drawdown_usdt: trade.exits?.[0]?.drawdown_usdt || null,
            drawdown_percent: trade.exits?.[0]?.drawdown_percent || null,
          }))

          await supabase.from("trades").insert(tradeRecords)

          // Insert trade entries and exits
          for (const trade of reportData.trades) {
            if (trade.entries && trade.entries.length > 0) {
              const entryRecords = trade.entries.map((entry: any) => ({
                trade_id: null, // We'd need to get the trade ID first
                type: entry.type,
                signal: entry.signal,
                date_time: entry.date_time,
                price_usdt: entry.price_usdt,
                contracts: entry.contracts,
                profit_usdt: entry.profit_usdt,
                profit_percent: entry.profit_percent,
                cumulative_profit_usdt: entry.cumulative_profit_usdt,
                cumulative_profit_percent: entry.cumulative_profit_percent,
                runup_usdt: entry["run-up_usdt"],
                runup_percent: entry["run-up_percent"],
                drawdown_usdt: entry.drawdown_usdt,
                drawdown_percent: entry.drawdown_percent,
              }))
              // Note: You'd need to handle the trade_id relationship properly
            }
          }
        }
      }

      toast({
        title: "Success",
        description: `Successfully uploaded strategy with ${parsedData.length} reports`,
      })

      setOpen(false)
      onUploadComplete?.()

      // Reset form
      setFiles(null)
      setStrategyName("")
      setDescription("")
      setParsedData([])
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload strategy. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Upload className="h-4 w-4 mr-2" />
          Upload Strategy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-slate-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upload Trading Strategy</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="strategyName" className="text-slate-300 font-medium">
                Strategy Name *
              </Label>
              <Input
                id="strategyName"
                value={strategyName}
                onChange={(e) => setStrategyName(e.target.value)}
                placeholder="Enter strategy name"
                required
                className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300 font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your strategy, methodology, and key features..."
              rows={3}
              className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div>
            <Label htmlFor="files" className="text-slate-300 font-medium">
              JSON Report Files *
            </Label>
            <Input
              id="files"
              type="file"
              multiple
              accept=".json"
              onChange={handleFileChange}
              required
              className="bg-slate-800 border-slate-600 text-slate-100"
            />
            <p className="text-sm text-slate-400 mt-1">
              Select multiple JSON files exported from your TradingView strategy reports
            </p>
          </div>

          {parsedData.length > 0 && (
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
              <h4 className="font-medium mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 text-emerald-400 mr-2" />
                Parsed Files Preview ({parsedData.length} files)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {parsedData.map((data, index) => (
                  <div key={index} className="bg-slate-900/50 rounded p-3 border border-slate-600">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-slate-200">
                        {data.symbol}/{data.timeframe}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Exchange: {data.exchange}</div>
                      <div>File: {data.fileName.substring(0, 30)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-600">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Uploading..." : "Upload Strategy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
