import { Assignment } from "@/data/assignments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignmentCard } from "./AssignmentCard";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "lucide-react";

<<<<<<< HEAD
// Importaciones NUEVAS para comentarios
import { DayComments } from "./DayComments";
import { usePinAuth } from "@/hooks/usePinAuth";
import { Separator } from "@/components/ui/separator";

=======
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
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
<<<<<<< HEAD
  // Hook NUEVO para autenticación
  const { isAuthenticated } = usePinAuth();
  
=======
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6 text-primary" />
            {format(date, "EEEE, dd 'de' MMMM, yyyy", { locale: es })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {assignments.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {assignments.length} {assignments.length === 1 ? 'tarea programada' : 'tareas programadas'} para este día
              </p>
              {assignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No hay tareas programadas para este día
              </p>
            </div>
          )}
<<<<<<< HEAD

          {/* SECCIÓN NUEVA: Comentarios (solo para usuarios autenticados) */}
          {isAuthenticated && (
            <>
              <Separator className="my-4" />
              <DayComments date={date} />
            </>
          )}
=======
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
        </div>
      </DialogContent>
    </Dialog>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 806ce752b2ffd01196fc27e4e10850998b243736
