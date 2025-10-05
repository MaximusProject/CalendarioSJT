import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle } from "lucide-react";

interface DayCommentsProps {
  date: Date;
}

interface Comment {
  id: string;
  text: string;
  date: Date;
  day: string; // formato YYYY-MM-DD
}

export function DayComments({ date }: DayCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const currentDay = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD

  // Cargar comentarios del localStorage al iniciar
  useEffect(() => {
    const savedComments = localStorage.getItem('dayComments');
    if (savedComments) {
      try {
        const allComments: Comment[] = JSON.parse(savedComments);
        const dayComments = allComments.filter(comment => comment.day === currentDay);
        setComments(dayComments);
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    }
  }, [currentDay]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment,
        date: new Date(),
        day: currentDay,
      };

      // Guardar en estado local
      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      setNewComment('');

      // Guardar en localStorage
      const savedComments = localStorage.getItem('dayComments');
      const allComments: Comment[] = savedComments ? JSON.parse(savedComments) : [];
      
      // Filtrar comentarios existentes del mismo día y añadir los nuevos
      const filteredComments = allComments.filter(c => c.day !== currentDay);
      const newAllComments = [...filteredComments, ...updatedComments];
      
      try {
        localStorage.setItem('dayComments', JSON.stringify(newAllComments));
      } catch (error) {
        console.error("Error saving comments:", error);
      }
    }
  };

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
        />
        <Button onClick={handleAddComment} className="gap-2">
          <Send className="h-4 w-4" />
          Añadir comentario
        </Button>
      </div>

      {comments.length > 0 && (
        <div className="space-y-3 mt-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">{comment.text}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(comment.date).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}