import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/types";
import { usePinAuth } from "@/hooks/usePinAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

type Comment = Tables<'day_comments'>;

interface DayCommentsProps {
  date: Date;
  section: "A" | "B"; // <- NUEVO PROP PARA LA SECCIÓN
}

export function DayComments({ date, section }: DayCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const currentDay = format(date, 'yyyy-MM-dd');
  const { isAuthenticated } = usePinAuth();

  // 🔄 Cargar comentarios - FILTRADO POR SECCIÓN
  const loadComments = async () => {
    try {
      console.log(`📥 Cargando comentarios para: ${currentDay}, sección: ${section}`);
      setError(null);
      
      const { data, error } = await supabase
        .from('day_comments')
        .select('*')
        .eq('day', currentDay)
        .eq('section', section) // <- FILTRO IMPORTANTE POR SECCIÓN
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Error Supabase:", error);
        setError(`Error: ${error.message}`);
        return;
      }

      console.log(`✅ ${data?.length || 0} comentarios cargados para sección ${section}`);
      setComments(data || []);
      setError(null);

    } catch (err: any) {
      console.error("💥 Error inesperado:", err);
      setError(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    loadComments();

    // 🔔 Suscripción en tiempo real - FILTRADO POR SECCIÓN Y DÍA
    const channel = supabase
      .channel(`comments_${section}_${currentDay}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'day_comments',
          filter: `day=eq.${currentDay}and section=eq.${section}`
        },
        () => {
          console.log("🔄 Cambio detectado, recargando...");
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDay, section, retryCount]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    // 🛡️ Solo usuarios autenticados pueden comentar
    if (!isAuthenticated) {
      setError("🔒 Ingresa el PIN para comentar");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log("📤 Enviando comentario para sección:", section);
      
      const { data, error } = await supabase
        .from('day_comments')
        .insert([
          {
            text: newComment.trim(),
            day: currentDay,
            section: section, // <- INCLUIR LA SECCIÓN AL INSERTAR
            user_name: 'Moderador'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Comentario enviado:", data);
      setNewComment('');
      
    } catch (err: any) {
      console.error("💥 Error:", err);
      setError(`Error al enviar: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleOpenPinDialog = () => {
    window.dispatchEvent(new CustomEvent('open-pin-dialog'));
  };

  return (
    <div className="space-y-4">
      {/* ENCABEZADO - MUESTRA LA SECCIÓN */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Comentarios del día</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {currentDay}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              section === 'A' 
                ? 'bg-blue-500/10 text-blue-600' 
                : 'bg-emerald-500/10 text-emerald-600'
            }`}>
              Sección {section}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Solo lectura</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRetry}
            className="h-8 w-8 p-0"
            title="Recargar"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* MENSAJES DE ERROR */}
      {error && (
        <Alert variant={error.includes('PIN') ? "default" : "destructive"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {error}
            {error.includes('PIN') && (
              <Button 
                variant="link" 
                className="h-auto p-0 ml-2 text-xs"
                onClick={handleOpenPinDialog}
              >
                Ingresar PIN
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* FORMULARIO (SOLO AUTENTICADOS) */}
      {isAuthenticated ? (
        <div className="space-y-3">
          <Textarea
            placeholder="Escribe un comentario sobre este día..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            disabled={isLoading}
            className="resize-none"
          />
          <Button 
            onClick={handleAddComment} 
            className="gap-2 w-full"
            disabled={isLoading || !newComment.trim()}
          >
            <Send className="h-4 w-4" />
            {isLoading ? "Enviando..." : "Publicar comentario"}
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-muted/30 rounded-lg text-center border">
          <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            Ingresa el PIN para poder añadir comentarios
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleOpenPinDialog}
            className="gap-2"
          >
            <Lock className="h-3 w-3" />
            Ingresar PIN
          </Button>
        </div>
      )}

      {/* LISTA DE COMENTARIOS (VISIBLE PARA TODOS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">
            Comentarios públicos ({comments.length})
          </h4>
          <span className="text-xs text-muted-foreground">
            {comments.length > 0 ? `Sección ${section}` : "Sin comentarios"}
          </span>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>No hay comentarios para este día</p>
            <p className="text-xs mt-1">Sé el primero en comentar</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className="p-4 bg-card border rounded-lg hover:border-primary/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <p className="text-sm font-medium">
                      {comment.user_name || 'Usuario'}
                    </p>
                    {comment.user_name === 'Moderador' && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Moderador
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </p>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PANEL DE INFORMACIÓN */}
      <div className="p-3 bg-muted/20 rounded-lg border">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="font-medium">Información</span>
            </div>
            <div>📅 Día: {currentDay}</div>
            <div>💬 Comentarios: {comments.length}</div>
            <div>🏷️ Sección: {section}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span className="font-medium">Estado</span>
            </div>
            <div>🔓 Autenticado: {isAuthenticated ? 'Sí' : 'No'}</div>
            <div>🔄 Última carga: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}