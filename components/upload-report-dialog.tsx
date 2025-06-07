"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadReportDialogProps {
  strategyId?: string
  onUploadComplete?: () => void
}

export function UploadReportDialog({ strategyId, onUploadComplete }: UploadReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [pinescriptCode, setPinescriptCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
  }

  const parseJsonFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string)
          resolve(json)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const extractReportData = (jsonData: any) => {
    const fileName = jsonData.file_name || ""
    const symbolMatch = fileName.match(/([A-Z]+USDT?\.?P?)/)
    const symbol = symbolMatch ? symbolMatch[1] : "UNKNOWN"

    return {
      file_name: fileName,
      symbol: symbol,
      timeframe: "1h", // You might want to extract this from filename too
      exchange: fileName.includes("BINANCE") ? "BINANCE" : null,
      net_profit_usdt: jsonData.performance?.net_profit?.all_usdt,
      net_profit_percent: jsonData.performance?.net_profit?.all_percent,
      gross_profit_usdt: jsonData.performance?.gross_profit?.all_usdt,
      gross_profit_percent: jsonData.performance?.gross_profit?.all_percent,
      gross_loss_usdt: jsonData.performance?.gross_loss?.all_usdt,
      gross_loss_percent: jsonData.performance?.gross_loss?.all_percent,
      max_drawdown_usdt: jsonData.performance?.max_equity_drawdown?.all_usdt,
      max_drawdown_percent: jsonData.performance?.max_equity_drawdown?.all_percent,
      total_trades: jsonData.trades_analysis?.total_trades?.all_usdt,
      winning_trades: jsonData.trades_analysis?.winning_trades?.all_usdt,
      losing_trades: jsonData.trades_analysis?.losing_trades?.all_usdt,
      percent_profitable: jsonData.trades_analysis?.percent_profitable?.all_percent,
      avg_winning_trade_usdt: jsonData.trades_analysis?.avg_winning_trade?.all_usdt,
      avg_losing_trade_usdt: jsonData.trades_analysis?.avg_losing_trade?.all_usdt,
      largest_winning_trade_usdt: jsonData.trades_analysis?.largest_winning_trade?.all_usdt,
      largest_losing_trade_usdt: jsonData.trades_analysis?.largest_losing_trade?.all_usdt,
      sharpe_ratio: jsonData.risk_performance_ratios?.sharpe_ratio?.all_usdt,
      sortino_ratio: jsonData.risk_performance_ratios?.sortino_ratio?.all_usdt,
      profit_factor: jsonData.risk_performance_ratios?.profit_factor?.all_usdt,
      raw_data: jsonData,
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

    setLoading(true)
    try {
      // First create or get strategy
      let currentStrategyId = strategyId

      if (!currentStrategyId) {
        const strategyResponse = await fetch("/api/strategies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            pinescript_code: pinescriptCode,
          }),
        })

        if (!strategyResponse.ok) throw new Error("Failed to create strategy")
        const strategy = await strategyResponse.json()
        currentStrategyId = strategy.id
      }

      // Process each JSON file
      const reports = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.type === "application/json" || file.name.endsWith(".json")) {
          const jsonData = await parseJsonFile(file)
          const reportData = extractReportData(jsonData)
          reports.push({ ...reportData, strategy_id: currentStrategyId })
        }
      }

      // Upload all reports
      const reportsResponse = await fetch("/api/strategy-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reports }),
      })

      if (!reportsResponse.ok) throw new Error("Failed to upload reports")

      toast({
        title: "Success",
        description: `Successfully uploaded ${reports.length} reports`,
      })

      setOpen(false)
      onUploadComplete?.()

      // Reset form
      setFiles(null)
      setTitle("")
      setDescription("")
      setPinescriptCode("")
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload reports. Please try again.",
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
          Upload Strategy Reports
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle>Upload Strategy Reports</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!strategyId && (
            <>
              <div>
                <Label htmlFor="title" className="text-slate-300 font-medium">
                  Strategy Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter strategy name"
                  required
                  className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-slate-300 font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your strategy..."
                  rows={3}
                  className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="pinescript" className="text-slate-300 font-medium">
                  Pine Script Code (Optional)
                </Label>
                <Textarea
                  id="pinescript"
                  value={pinescriptCode}
                  onChange={(e) => setPinescriptCode(e.target.value)}
                  placeholder="Paste your Pine Script code here..."
                  rows={6}
                  className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 font-mono text-sm"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="files" className="text-slate-300 font-medium">
              JSON Report Files
            </Label>
            <Input
              id="files"
              type="file"
              multiple
              accept=".json"
              onChange={handleFileChange}
              required
              className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Select multiple JSON files exported from your TradingView strategy reports
            </p>
          </div>

          {files && files.length > 0 && (
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
              <h4 className="font-medium mb-2">Selected Files:</h4>
              <div className="space-y-1">
                {Array.from(files).map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload Reports"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
