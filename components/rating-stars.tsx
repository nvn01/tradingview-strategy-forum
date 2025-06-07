"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface RatingStarsProps {
  reportId: string
  initialRating?: number
  averageRating: number
  totalRatings: number
}

export function RatingStars({ reportId, initialRating, averageRating, totalRatings }: RatingStarsProps) {
  const [rating, setRating] = useState<number | undefined>(initialRating)
  const [hoveredRating, setHoveredRating] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleRating = async (value: number) => {
    if (loading) return

    setLoading(true)
    try {
      // In a real app, you'd get the user from auth
      const userId = "00000000-0000-0000-0000-000000000000" // Mock user ID

      const { error } = await supabase.from("ratings").upsert({
        report_id: reportId,
        user_id: userId,
        rating: value,
      })

      if (error) throw error

      setRating(value)
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-100 flex items-center">
          <Star className="h-5 w-5 mr-2 text-emerald-400" />
          Strategy Rating
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(undefined)}
                disabled={loading}
                className="focus:outline-none disabled:opacity-50"
              >
                <Star
                  className={`h-8 w-8 ${
                    (hoveredRating !== undefined ? value <= hoveredRating : value <= (rating || 0))
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-slate-600"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{averageRating.toFixed(1)}</div>
            <div className="text-sm text-slate-400">
              {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
            </div>
          </div>
          {rating ? (
            <div className="text-sm text-slate-300">Your rating: {rating}</div>
          ) : (
            <div className="text-sm text-slate-400">Click to rate this strategy</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
