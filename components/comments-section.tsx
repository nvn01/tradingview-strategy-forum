"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface Comment {
  id: string
  content: string
  created_at: string
  user: {
    username: string
    avatar_url?: string
  }
}

interface CommentsProps {
  reportId: string
  comments: Comment[]
}

export function CommentsSection({ reportId, comments: initialComments }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    try {
      // In a real app, you'd get the user from auth
      const userId = "00000000-0000-0000-0000-000000000000" // Mock user ID

      const { data, error } = await supabase
        .from("comments")
        .insert({
          report_id: reportId,
          user_id: userId,
          content: newComment,
        })
        .select(
          `
          id,
          content,
          created_at,
          users (
            username,
            avatar_url
          )
        `,
        )
        .single()

      if (error) throw error

      // Format the comment to match our expected structure
      const formattedComment = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        user: {
          username: data.users.username,
          avatar_url: data.users.avatar_url,
        },
      }

      setComments([formattedComment, ...comments])
      setNewComment("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
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
          <MessageCircle className="h-5 w-5 mr-2 text-emerald-400" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmitComment} className="space-y-2">
          <Textarea
            placeholder="Share your thoughts on this strategy..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-slate-800 border-slate-600 text-slate-100 min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Posting..." : "Post Comment"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3 border-t border-slate-800 pt-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-slate-700 text-slate-300">
                    {comment.user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-200">{comment.user.username}</h4>
                    <span className="text-xs text-slate-500">
                      {new Date(comment.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
