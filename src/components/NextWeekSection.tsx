import { assignments } from "@/data/assignments";
import { AssignmentCard } from "./AssignmentCard";
import { Card } from "@/components/ui/card";
import { CalendarDays, Sparkles } from "lucide-react";
import { addDays, isWithinInterval, startOfDay } from "date-fns";
import { useSettings } from "@/hooks/useSettings";

export function NextWeekSection() {
  const { isSubjectHidden, getCustomDate } = useSettings();
  const today = startOfDay(new Date());
  const nextWeek = addDays(today, 7);

  const upcomingAssignments = assignments
    .filter(assignment => {
      if (isSubjectHidden(assignment.subject)) return false;
      
      const dateStr = getCustomDate(assignment.id) || assignment.date;
      const [year, month, day] = dateStr.split('-').map(Number);
      const assignmentDate = new Date(year, month - 1, day);
      return isWithinInterval(assignmentDate, { start: today, end: nextWeek });
    })
    .sort((a, b) => {
      const dateA = getCustomDate(a.id) || a.date;
      const dateB = getCustomDate(b.id) || b.date;
      const [yearA, monthA, dayA] = dateA.split('-').map(Number);
      const [yearB, monthB, dayB] = dateB.split('-').map(Number);
      return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
    });

  if (upcomingAssignments.length === 0) {
    return (
      <Card className="p-6 border-none shadow-lg bg-gradient-to-br from-card to-accent/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Próxima semana</h2>
        </div>
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            ¡No hay tareas para la próxima semana!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-none shadow-lg bg-gradient-to-br from-card to-accent/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Próxima semana</h2>
        <span className="ml-auto text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
          {upcomingAssignments.length} {upcomingAssignments.length === 1 ? 'tarea' : 'tareas'}
        </span>
      </div>
      <div className="space-y-3">
        {upcomingAssignments.map(assignment => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </Card>
  );
}
