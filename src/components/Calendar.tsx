import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { assignments, Assignment } from "@/data/assignments";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface CalendarProps {
  onDayClick: (date: Date, assignments: Assignment[]) => void;
}

export function Calendar({ onDayClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = getDay(monthStart);
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const getAssignmentsForDay = (date: Date): Assignment[] => {
    return assignments.filter(assignment => {
      const [year, month, day] = assignment.date.split('-').map(Number);
      const assignmentDate = new Date(year, month - 1, day);
      return isSameDay(date, assignmentDate);
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold capitalize">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {daysInMonth.map((day) => {
          const dayAssignments = getAssignmentsForDay(day);
          const isPast = isBefore(day, startOfDay(new Date()));
          const isCurrentDay = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day, dayAssignments)}
              className={cn(
                "aspect-square rounded-lg p-2 text-sm transition-all hover:scale-105",
                "flex flex-col items-center justify-start gap-1",
                "border border-border bg-card hover:bg-accent hover:shadow-md",
                isCurrentDay && "border-2 border-primary bg-primary/10",
                isPast && !isCurrentDay && "opacity-50",
                dayAssignments.length > 0 && "font-semibold"
              )}
            >
              <span className={cn(
                isCurrentDay && "text-primary"
              )}>
                {format(day, "d")}
              </span>
              {dayAssignments.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                  {dayAssignments.slice(0, 3).map((assignment) => (
                    <div
                      key={assignment.id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: `hsl(var(--${assignment.color}))`
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
