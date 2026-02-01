import { Assignment } from "@/data/assignments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignmentCard } from "./AssignmentCard";
import { DayComments } from "./DayComments";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Sparkles, MessageSquare, Lock, Users } from "lucide-react";
import { usePinAuth } from "@/hooks/usePinAuth";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

interface DayDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  assignments: Assignment[];
}

export function DayDetailsDialog({
  open,
  onOpenChange,
  date,
  assignments,
}: DayDetailsDialogProps) {
  const { isAuthenticated } = usePinAuth();
  const [activeTab, setActiveTab] = useState("tareas");
  
  // Reset tab when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab("tareas");
    }
  }, [open]);

  if (!date) return null;

  const handleOpenPinDialog = () => {
    window.dispatchEvent(new CustomEvent('open-pin-dialog'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold capitalize">
                {format(date, "EEEE", { locale: es })}
              </p>
              <p className="text-sm text-muted-foreground font-normal">
                {format(date, "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
            <Badge className="ml-auto" variant="secondary">
              {assignments.length} {assignments.length === 1 ? 'tarea' : 'tareas'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* PESTAÑAS PARA TAREAS Y COMENTARIOS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="tareas" className="gap-2">
              <Calendar className="h-4 w-4" />
              Tareas
            </TabsTrigger>
            <TabsTrigger value="comentarios" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentarios
            </TabsTrigger>
          </TabsList>

          {/* CONTENIDO DE TAREAS */}
          <TabsContent value="tareas" className="space-y-4">
            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id} 
                    assignment={assignment} 
                    showDate={false} 
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border rounded-lg">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-medium">
                  ¡Día libre!
                </p>
                <p className="text-sm text-muted-foreground">
                  No hay tareas programadas para este día
                </p>
              </div>
            )}

            {/* NOTA SOBRE COMENTARIOS VISIBLES */}
            <div className="mt-6 p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Comentarios públicos</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Todos los usuarios pueden ver los comentarios de este día. 
                {!isAuthenticated && (
                  <>
                    {" "}Para añadir comentarios,{" "}
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-xs"
                      onClick={handleOpenPinDialog}
                    >
                      ingresa como moderador
                    </Button>
                    .
                  </>
                )}
              </p>
            </div>
          </TabsContent>

          {/* CONTENIDO DE COMENTARIOS */}
          <TabsContent value="comentarios">
            <div className="space-y-4">
              {/* ENCABEZADO DE COMENTARIOS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Comentarios del día</h3>
                </div>
                {!isAuthenticated && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Solo lectura</span>
                  </div>
                )}
              </div>

              {/* INFO PARA USUARIOS NO AUTENTICADOS */}
              {!isAuthenticated && (
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">Modo lectura</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Puedes ver todos los comentarios públicos de este día. 
                    Para añadir tus propios comentarios, necesitas acceder como moderador.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOpenPinDialog}
                    className="gap-2"
                  >
                    <Lock className="h-3 w-3" />
                    Ingresar como moderador
                  </Button>
                </div>
              )}

              {/* COMPONENTE DE COMENTARIOS - IMPORTANTE: VISIBLE PARA TODOS */}
              <DayComments date={date} />

              {/* INFORMACIÓN ADICIONAL */}
              <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded-lg">
                <p className="font-medium mb-1">📝 Información sobre comentarios:</p>
                <ul className="space-y-1">
                  <li>• Los comentarios son públicos y visibles para todos los usuarios</li>
                  <li>• Solo usuarios autenticados pueden añadir nuevos comentarios</li>
                  <li>• Los comentarios se actualizan en tiempo real</li>
                  <li>• Fecha del día: {format(date, "dd/MM/yyyy")}</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* SEPARADOR Y BOTÓN RÁPIDO PARA AUTENTICACIÓN */}
        <Separator className="my-4" />
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span>Modo moderador activo</span>
              </div>
            ) : (
              <span>Modo lectura</span>
            )}
          </div>
          {!isAuthenticated && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleOpenPinDialog}
              className="gap-2"
            >
              <Lock className="h-3 w-3" />
              Ingresar como moderador
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}