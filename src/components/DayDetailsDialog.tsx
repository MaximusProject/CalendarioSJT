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
import { Calendar, Sparkles } from "lucide-react";
import { usePinAuth } from "@/hooks/usePinAuth";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
  
  if (!date) return null;

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
            {assignments.length > 0 && (
              <Badge className="ml-auto" variant="secondary">
                {assignments.length} {assignments.length === 1 ? 'tarea' : 'tareas'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} showDate={false} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">
                ¡Día libre!
              </p>
              <p className="text-sm text-muted-foreground">
                No hay tareas programadas para este día
              </p>
            </div>
          )}

          {isAuthenticated && (
            <>
              <Separator className="my-4" />
              <DayComments date={date} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
