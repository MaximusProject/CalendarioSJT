import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { assignments as assignmentsSectionB, Assignment } from "@/data/assignments";
import { assignmentsSectionA } from "@/data/assignmentsSectionA";
import { usePinAuth } from "@/hooks/usePinAuth";
import { useSettings } from "@/hooks/useSettings";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

interface CalendarProps {
  onDayClick: (date: Date, assignments: Assignment[]) => void;
  section: "A" | "B";
}

export function Calendar({ onDayClick, section }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysWithComments, setDaysWithComments] = useState<Set<string>>(new Set());
  const { isAuthenticated } = usePinAuth();
  const { isSubjectHidden, getCustomDate, isCompleted } = useSettings();

  const assignments = section === "A" ? assignmentsSectionA : assignmentsSectionB;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 🚨 FUNCIÓN CRÍTICA: Carga días con comentarios para TODOS
  useEffect(() => {
    const fetchDaysWithComments = async () => {
      try {
        console.log("🔍 Buscando días con comentarios...");
        
        const { data, error } = await supabase
          .from('day_comments')
          .select('day')
          .gte('day', format(monthStart, 'yyyy-MM-dd'))
          .lte('day', format(monthEnd, 'yyyy-MM-dd'));

        if (error) {
          console.error("❌ Error Supabase:", error);
          return;
        }

        if (data && data.length > 0) {
          const daysSet = new Set(data.map(item => item.day));
          console.log(`✅ ${daysSet.size} días con comentarios encontrados`);
          setDaysWithComments(daysSet);
        } else {
          console.log("ℹ️ No hay comentarios este mes");
          setDaysWithComments(new Set());
        }
      } catch (error) {
        console.error("💥 Error inesperado:", error);
      }
    };

    fetchDaysWithComments();

    // 🔄 Suscripción en tiempo real
    const channel = supabase
      .channel('calendar_comments_tracker')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'day_comments'
        },
        () => {
          fetchDaysWithComments(); // Recargar cuando haya cambios
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [monthStart, monthEnd]);

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

  const dayNames = ["D", "L", "M", "M", "J", "V", "S"];
  const dayNamesFull = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <Card className="p-4 border-none shadow-xl rounded-2xl bg-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={previousMonth} className="h-9 w-9 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-bold capitalize min-w-[140px] text-center">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday} className="rounded-full text-xs h-8 px-3">
          Hoy
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, i) => (
          <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-2">
            <span className="sm:hidden">{day}</span>
            <span className="hidden sm:inline">{dayNamesFull[i]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
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

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day, dayAssignments)}
              className={cn(
                "aspect-square rounded-xl p-1 text-sm transition-all active:scale-95",
                "flex flex-col items-center justify-start gap-0.5 relative",
                "border border-transparent hover:border-primary/30 hover:bg-accent/50",
                isCurrentDay && "ring-2 ring-primary bg-primary/10",
                isPast && !isCurrentDay && "opacity-40",
                dayAssignments.length > 0 && "font-medium",
                hasCompletedAll && "bg-primary/5"
              )}
            >
              <span className={cn("text-sm leading-none mt-1", isCurrentDay && "text-primary font-bold")}>
                {format(day, "d")}
              </span>
              {dayAssignments.length > 0 && (
                <div className="flex flex-wrap gap-0.5 justify-center mt-0.5 max-w-full px-0.5">
                  {dayAssignments.slice(0, 3).map((assignment) => (
                    <div
                      key={assignment.id}
                      className={cn("h-1.5 w-1.5 rounded-full shrink-0", isCompleted(assignment.id) && "opacity-40")}
                      style={{ backgroundColor: `hsl(var(--${assignment.color}))` }}
                    />
                  ))}
                  {dayAssignments.length > 3 && (
                    <span className="text-[8px] text-muted-foreground leading-none">
                      +{dayAssignments.length - 3}
                    </span>
                  )}
                </div>
              )}
              {/* 🚨 CAMBIO CRÍTICO: Mostrar etiqueta a TODOS */}
              {hasComments && (
                <Tag className="h-2.5 w-2.5 text-primary absolute top-0.5 right-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}