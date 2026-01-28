import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { assignments, Assignment } from "@/data/assignments";
import { usePinAuth } from "@/hooks/usePinAuth";
import { useSettings } from "@/hooks/useSettings";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface CalendarProps {
  onDayClick: (date: Date, assignments: Assignment[]) => void;
}

export function Calendar({ onDayClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysWithComments, setDaysWithComments] = useState<Set<string>>(new Set());
  const { isAuthenticated } = usePinAuth();
  const { isSubjectHidden, getCustomDate, isCompleted } = useSettings();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchComments = async () => {
      const startDate = format(monthStart, "yyyy-MM-dd");
      const endDate = format(monthEnd, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("day_comments")
        .select("date")
        .gte("date", startDate)
        .lte("date", endDate);

      if (!error && data) {
        const dates = new Set(data.map((item) => item.date));
        setDaysWithComments(dates);
      }
    };

    fetchComments();
  }, [currentDate, isAuthenticated, monthStart, monthEnd]);

  const firstDayOfWeek = getDay(monthStart);
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const getAssignmentsForDay = (date: Date): Assignment[] => {
    return assignments.filter(assignment => {
      if (isSubjectHidden(assignment.subject)) return false;
      
      const dateStr = getCustomDate(assignment.id) || assignment.date;
      const [year, month, day] = dateStr.split('-').map(Number);
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

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <Card className="p-4 md:p-6 border-none shadow-lg">
      <div className="mb-6 flex items-center justify-between gap-2">
        <h2 className="text-xl md:text-2xl font-bold capitalize">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex gap-1 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="hidden sm:flex"
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            className="h-8 w-8 md:h-9 md:w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8 md:h-9 md:w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs md:text-sm font-semibold text-muted-foreground py-2"
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
          const dateString = format(day, "yyyy-MM-dd");
          const hasComments = daysWithComments.has(dateString);
          const hasCompletedAll = dayAssignments.length > 0 && dayAssignments.every(a => isCompleted(a.id));
          const hasSomeCompleted = dayAssignments.some(a => isCompleted(a.id));

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day, dayAssignments)}
              className={cn(
                "aspect-square rounded-xl p-1 md:p-2 text-xs md:text-sm transition-all hover:scale-105",
                "flex flex-col items-center justify-start gap-0.5 md:gap-1 relative",
                "border bg-card hover:bg-accent hover:shadow-md",
                isCurrentDay && "ring-2 ring-primary bg-primary/5",
                isPast && !isCurrentDay && "opacity-50",
                dayAssignments.length > 0 && "font-semibold",
                hasCompletedAll && "bg-primary/10"
              )}
            >
              <span className={cn(
                "text-xs md:text-sm",
                isCurrentDay && "text-primary font-bold"
              )}>
                {format(day, "d")}
              </span>
              {dayAssignments.length > 0 && (
                <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                  {dayAssignments.slice(0, 3).map((assignment) => (
                    <div
                      key={assignment.id}
                      className={cn(
                        "h-1.5 w-1.5 md:h-2 md:w-2 rounded-full transition-all",
                        isCompleted(assignment.id) && "opacity-50"
                      )}
                      style={{
                        backgroundColor: `hsl(var(--${assignment.color}))`
                      }}
                    />
                  ))}
                  {dayAssignments.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">+{dayAssignments.length - 3}</span>
                  )}
                </div>
              )}
              {hasComments && isAuthenticated && (
                <Tag className="h-2.5 w-2.5 md:h-3 md:w-3 text-primary absolute top-0.5 right-0.5 md:top-1 md:right-1" />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
