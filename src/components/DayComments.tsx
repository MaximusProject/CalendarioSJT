import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/types";

type Comment = Tables<'day_comments'>;

interface DayCommentsProps {
  date: Date;
}

export function DayComments({ date }: DayCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const currentDay = date.toISOString().split('T')[0];

  // Cargar comentarios de Supabase
  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('day_comments')
        .select('*')
        .eq('day', currentDay)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  useEffect(() => {
    loadComments();
  }, [currentDay]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('day_comments')
        .insert([
          {
            text: newComment.trim(),
            day: currentDay,
            user_name: 'Usuario'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setComments(prev => [data, ...prev]);
      setNewComment('');
      
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Suscripción en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('day_comments_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'day_comments',
          filter: `day=eq.${currentDay}`
        },
        (payload) => {
          setComments(prev => [payload.new as Comment, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDay]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Comentarios del día</h3>
      </div>

      <div className="space-y-3">
        <Textarea
          placeholder="Añade un comentario sobre este día..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          disabled={isLoading}
        />
        <Button 
          onClick={handleAddComment} 
          className="gap-2"
          disabled={isLoading || !newComment.trim()}
        >
          <Send className="h-4 w-4" />
          {isLoading ? "Enviando..." : "Añadir comentario"}
        </Button>
      </div>

      {comments.length > 0 && (
        <div className="space-y-3 mt-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {comment.user_name || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <p className="text-sm">{comment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}