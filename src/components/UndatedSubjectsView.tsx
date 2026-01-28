import { Card } from "@/components/ui/card";
import { undatedAssignments, UndatedAssignment } from "@/data/assignments";
import { ChevronRight, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

export function UndatedSubjectsView() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const { isCompleted, toggleCompleted, isSubjectHidden } = useSettings();

  // Filter and group assignments by subject
  const filteredAssignments = undatedAssignments.filter(a => !isSubjectHidden(a.subject));
  const subjectGroups = filteredAssignments.reduce((acc, assignment) => {
    if (!acc[assignment.subject]) {
      acc[assignment.subject] = [];
    }
    acc[assignment.subject].push(assignment);
    return acc;
  }, {} as Record<string, UndatedAssignment[]>);

  const subjects = Object.keys(subjectGroups).sort();

  const getSubjectProgress = (assignments: UndatedAssignment[]) => {
    const completed = assignments.filter(a => isCompleted(a.id)).length;
    return (completed / assignments.length) * 100;
  };

  if (selectedSubject && subjectGroups[selectedSubject]) {
    const subjectAssignments = subjectGroups[selectedSubject];
    const totalPercentage = subjectAssignments.reduce((sum, a) => sum + a.percentage, 0);
    const progress = getSubjectProgress(subjectAssignments);

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSubject(null)}
            className="gap-2"
          >
            ← Volver
          </Button>
        </div>
        
        <Card className="p-6 border-l-4" style={{ borderLeftColor: `hsl(var(--${subjectAssignments[0].color}))` }}>
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ 
                backgroundColor: `hsl(var(--${subjectAssignments[0].color}) / 0.15)`,
              }}
            >
              <Clock 
                className="h-6 w-6" 
                style={{ color: `hsl(var(--${subjectAssignments[0].color}))` }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{selectedSubject}</h2>
              <p className="text-sm text-muted-foreground">
                {subjectAssignments.length} evaluaciones • {totalPercentage}%
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-3 mt-6">
            {subjectAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={cn(
                  "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                  isCompleted(assignment.id) && "bg-muted/50 opacity-75"
                )}
                onClick={() => toggleCompleted(assignment.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    isCompleted(assignment.id) 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-muted-foreground/30"
                  )}>
                    {isCompleted(assignment.id) && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "font-medium",
                        isCompleted(assignment.id) && "line-through text-muted-foreground"
                      )}>
                        {assignment.content}
                      </p>
                      <Badge variant="secondary" className="shrink-0">
                        {assignment.percentage}%
                      </Badge>
                    </div>
                    {assignment.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {assignment.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay materias sin fecha</h3>
        <p className="text-muted-foreground">
          Todas las materias tienen fechas asignadas en el calendario
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Materias sin fecha
        </h2>
        <p className="text-muted-foreground">
          Evaluaciones sin fecha estimada en el calendario
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const subjectAssignments = subjectGroups[subject];
          const totalPercentage = subjectAssignments.reduce((sum, a) => sum + a.percentage, 0);
          const color = subjectAssignments[0].color;
          const progress = getSubjectProgress(subjectAssignments);
          const completedCount = subjectAssignments.filter(a => isCompleted(a.id)).length;

          return (
            <Card
              key={subject}
              className="p-4 hover:shadow-lg transition-all cursor-pointer group border-l-4 hover:scale-[1.02]"
              style={{ borderLeftColor: `hsl(var(--${color}))` }}
              onClick={() => setSelectedSubject(subject)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ 
                      backgroundColor: `hsl(var(--${color}) / 0.15)`,
                    }}
                  >
                    <Clock 
                      className="h-5 w-5" 
                      style={{ color: `hsl(var(--${color}))` }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {subject}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {completedCount}/{subjectAssignments.length} completadas
                    </p>
                    <div className="mt-2">
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
