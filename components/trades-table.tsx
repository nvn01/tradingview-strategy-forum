"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowDownUp, Search, TrendingDown, TrendingUp } from "lucide-react"

interface Trade {
  id: string
  trade_number: number
  profit_usdt: number
  profit_percent: number
  entry_datetime?: string
  entry_price?: number
  entry_type?: string
  exit_datetime?: string
  exit_price?: number
  exit_signal?: string
  contracts?: number
}

interface TradesTableProps {
  trades: Trade[]
}

export function TradesTable({ trades }: TradesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"trade_number" | "profit_percent">("trade_number")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterType, setFilterType] = useState<"all" | "winning" | "losing">("all")

  const filteredTrades = trades
    .filter((trade) => {
      if (filterType === "winning") return (trade.profit_percent || 0) > 0
      if (filterType === "losing") return (trade.profit_percent || 0) < 0
      return true
    })
    .filter((trade) => {
      if (!searchTerm) return true
      return (
        trade.trade_number.toString().includes(searchTerm) ||
        (trade.exit_signal && trade.exit_signal.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    })
    .sort((a, b) => {
      const aValue = a[sortBy] || 0
      const bValue = b[sortBy] || 0
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    })

  const toggleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-slate-100 flex items-center">
            <ArrowDownUp className="h-5 w-5 mr-2 text-emerald-400" />
            Trade History
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-800 border-slate-600 text-slate-100 w-full sm:w-[180px]"
              />
            </div>
            <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
              <SelectTrigger className="h-8 text-xs bg-slate-800 border-slate-600 w-full sm:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all">All Trades</SelectItem>
                <SelectItem value="winning">Winning Only</SelectItem>
                <SelectItem value="losing">Losing Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-800/50">
                <TableRow className="hover:bg-slate-800/80">
                  <TableHead
                    className="text-slate-300 cursor-pointer"
                    onClick={() => {
                      setSortBy("trade_number")
                      toggleSort()
                    }}
                  >
                    # {sortBy === "trade_number" && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Entry</TableHead>
                  <TableHead className="text-slate-300">Exit</TableHead>
                  <TableHead className="text-slate-300">Signal</TableHead>
                  <TableHead
                    className="text-slate-300 cursor-pointer text-right"
                    onClick={() => {
                      setSortBy("profit_percent")
                      toggleSort()
                    }}
                  >
                    P/L {sortBy === "profit_percent" && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.length > 0 ? (
                  filteredTrades.map((trade) => (
                    <TableRow key={trade.id} className="hover:bg-slate-800/50 border-slate-700">
                      <TableCell className="font-medium text-slate-300">{trade.trade_number}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            trade.entry_type?.toLowerCase().includes("long")
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : "border-red-500/30 text-red-400 bg-red-500/10"
                          }`}
                        >
                          {trade.entry_type?.toLowerCase().includes("long") ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {trade.entry_type?.replace("Entry ", "") || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="text-xs">{trade.entry_price?.toFixed(2) || "N/A"}</div>
                        <div className="text-xs text-slate-500">
                          {trade.entry_datetime
                            ? new Date(trade.entry_datetime).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="text-xs">{trade.exit_price?.toFixed(2) || "N/A"}</div>
                        <div className="text-xs text-slate-500">
                          {trade.exit_datetime
                            ? new Date(trade.exit_datetime).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-300">{trade.exit_signal || "N/A"}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className={`font-medium ${
                            (trade.profit_percent || 0) >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {(trade.profit_percent || 0) >= 0 ? "+" : ""}
                          {((trade.profit_percent || 0) * 100).toFixed(2)}%
                        </div>
                        <div className="text-xs text-slate-400">
                          {(trade.profit_usdt || 0) >= 0 ? "+" : ""}${trade.profit_usdt?.toFixed(2) || "0.00"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                      No trades found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
