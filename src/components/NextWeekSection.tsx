import { Assignment, assignments } from "@/data/assignments";
import { AssignmentCard } from "./AssignmentCard";
import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { addDays, isWithinInterval, startOfDay } from "date-fns";

export function NextWeekSection() {
  const today = startOfDay(new Date());
  const nextWeek = addDays(today, 7);

  const upcomingAssignments = assignments
    .filter(assignment => {
      const [year, month, day] = assignment.date.split('-').map(Number);
      const assignmentDate = new Date(year, month - 1, day);
      return isWithinInterval(assignmentDate, { start: today, end: nextWeek });
    })
    .sort((a, b) => {
      const [yearA, monthA, dayA] = a.date.split('-').map(Number);
      const [yearB, monthB, dayB] = b.date.split('-').map(Number);
      return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
    });

  if (upcomingAssignments.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Próxima semana</h2>
        </div>
        <p className="text-muted-foreground text-center py-8">
          No hay tareas programadas para la próxima semana
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Próxima semana</h2>
        <span className="ml-auto text-sm text-muted-foreground">
          {upcomingAssignments.length} {upcomingAssignments.length === 1 ? 'tarea' : 'tareas'}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {upcomingAssignments.map(assignment => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </Card>
  );
}
