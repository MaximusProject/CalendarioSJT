import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { assignments as assignmentsSectionB, Assignment } from "@/data/assignments";
import { assignmentsSectionA } from "@/data/assignmentsSectionA";
import { 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  CalendarDays,
  CalendarOff,
  ChevronLeft
} from "lucide-react";
import { AssignmentCard } from "./AssignmentCard";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

interface UnifiedSubjectsViewProps {
  section: "A" | "B";
}

export function UnifiedSubjectsView({ section }: UnifiedSubjectsViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showDated, setShowDated] = useState(true);
  const { isCompleted, isSubjectHidden, getCustomDate, setCustomDate } = useSettings();

  const allAssignments = section === "A" ? assignmentsSectionA : assignmentsSectionB;

  // Separate dated and undated assignments
  const datedAssignments = allAssignments.filter(a => 
    !isSubjectHidden(a.subject) && (a.date || getCustomDate(a.id))
  );
  const undatedAssignments = allAssignments.filter(a => 
    !isSubjectHidden(a.subject) && !a.date && !getCustomDate(a.id)
  );

  const currentAssignments = showDated ? datedAssignments : undatedAssignments;

  // Group assignments by subject
  const subjectGroups = currentAssignments.reduce((acc, assignment) => {
    if (!acc[assignment.subject]) {
      acc[assignment.subject] = [];
    }
    acc[assignment.subject].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  const subjects = Object.keys(subjectGroups).sort();

  const getSubjectProgress = (assignments: Assignment[]) => {
    const completed = assignments.filter(a => isCompleted(a.id)).length;
    return (completed / assignments.length) * 100;
  };

  // Detail view for a selected subject
  if (selectedSubject && subjectGroups[selectedSubject]) {
    const subjectAssignments = subjectGroups[selectedSubject].sort((a, b) => {
      const dateA = getCustomDate(a.id) || a.date || "9999";
      const dateB = getCustomDate(b.id) || b.date || "9999";
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
    
    const totalPoints = subjectAssignments.reduce((sum, a) => sum + a.points, 0);
    const totalPercentage = subjectAssignments.reduce((sum, a) => sum + a.percentage, 0);
    const progress = getSubjectProgress(subjectAssignments);
    const completedCount = subjectAssignments.filter(a => isCompleted(a.id)).length;
    const color = subjectAssignments[0].color;

    return (
      <div className="space-y-4 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedSubject(null)}
          className="gap-2 rounded-full -ml-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a materias
        </Button>
        
        <Card 
          className="p-4 lg:p-6 border-l-4"
          style={{ borderLeftColor: `hsl(var(--${color}))` }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `hsl(var(--${color}) / 0.15)` }}
            >
              <BookOpen 
                className="h-6 w-6 lg:h-7 lg:w-7" 
                style={{ color: `hsl(var(--${color}))` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl lg:text-2xl font-bold truncate">{selectedSubject}</h2>
              <p className="text-sm text-muted-foreground">
                {subjectAssignments.length} evaluaciones • {totalPoints} pts ({totalPercentage}%)
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {completedCount}/{subjectAssignments.length} completadas
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-3">
            {subjectAssignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment}
                showDate={showDated}
              />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
            Materias
          </h2>
          <p className="text-sm text-muted-foreground">
            {showDated 
              ? `${datedAssignments.length} evaluaciones con fecha`
              : `${undatedAssignments.length} evaluaciones sin fecha`
            }
          </p>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
          <CalendarOff className={cn(
            "h-4 w-4 transition-colors",
            !showDated ? "text-primary" : "text-muted-foreground"
          )} />
          <Switch
            id="date-toggle"
            checked={showDated}
            onCheckedChange={setShowDated}
          />
          <CalendarDays className={cn(
            "h-4 w-4 transition-colors",
            showDated ? "text-primary" : "text-muted-foreground"
          )} />
          <Label htmlFor="date-toggle" className="text-sm font-medium cursor-pointer">
            {showDated ? "Con fecha" : "Sin fecha"}
          </Label>
        </div>
      </div>

      {/* Empty State */}
      {subjects.length === 0 ? (
        <Card className="p-8 text-center">
          {showDated ? (
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          ) : (
            <CalendarOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          )}
          <h3 className="text-lg font-semibold mb-2">
            {showDated 
              ? "No hay materias con fecha" 
              : "No hay materias sin fecha"
            }
          </h3>
          <p className="text-muted-foreground text-sm">
            {showDated 
              ? "Todas las evaluaciones tienen fechas asignadas" 
              : "Puedes mostrar materias desde la configuración"
            }
          </p>
        </Card>
      ) : (
        /* Subject Grid - Mobile optimized */
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const subjectAssignments = subjectGroups[subject];
            const totalPoints = subjectAssignments.reduce((sum, a) => sum + a.points, 0);
            const color = subjectAssignments[0].color;
            const progress = getSubjectProgress(subjectAssignments);
            const completedCount = subjectAssignments.filter(a => isCompleted(a.id)).length;

            return (
              <Card
                key={subject}
                className={cn(
                  "p-4 cursor-pointer group border-l-4 transition-all",
                  "hover:shadow-lg active:scale-[0.98]",
                  "lg:hover:scale-[1.02]"
                )}
                style={{ borderLeftColor: `hsl(var(--${color}))` }}
                onClick={() => setSelectedSubject(subject)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div 
                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `hsl(var(--${color}) / 0.15)` }}
                    >
                      {showDated ? (
                        <CalendarDays 
                          className="h-5 w-5 lg:h-6 lg:w-6" 
                          style={{ color: `hsl(var(--${color}))` }}
                        />
                      ) : (
                        <BookOpen 
                          className="h-5 w-5 lg:h-6 lg:w-6" 
                          style={{ color: `hsl(var(--${color}))` }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm lg:text-base mb-1 truncate group-hover:text-primary transition-colors">
                        {subject}
                      </h3>
                      <p className="text-xs lg:text-sm text-muted-foreground">
                        {completedCount}/{subjectAssignments.length} completadas
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {totalPoints} puntos
                      </p>
                      <div className="mt-2">
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
