import { Card } from "@/components/ui/card";
import { assignments, Assignment } from "@/data/assignments";
import { ChevronRight, BookOpen } from "lucide-react";
import { useState } from "react";
import { AssignmentCard } from "./AssignmentCard";
import { Button } from "@/components/ui/button";

export function SubjectsView() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Group assignments by subject
  const subjectGroups = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.subject]) {
      acc[assignment.subject] = [];
    }
    acc[assignment.subject].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  const subjects = Object.keys(subjectGroups).sort();

  if (selectedSubject) {
    const subjectAssignments = subjectGroups[selectedSubject].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const totalPoints = subjectAssignments.reduce((sum, a) => sum + a.points, 0);
    const totalPercentage = subjectAssignments.reduce((sum, a) => sum + a.percentage, 0);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSubject(null)}
          >
            ← Volver a materias
          </Button>
        </div>
        
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ 
                backgroundColor: `hsl(var(--${subjectAssignments[0].color}) / 0.1)`,
              }}
            >
              <BookOpen 
                className="h-6 w-6" 
                style={{ color: `hsl(var(--${subjectAssignments[0].color}))` }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedSubject}</h2>
              <p className="text-sm text-muted-foreground">
                {subjectAssignments.length} evaluaciones • {totalPoints} pts ({totalPercentage}%)
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            {subjectAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Materias</h2>
        <p className="text-muted-foreground">
          Selecciona una materia para ver todas sus evaluaciones
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const subjectAssignments = subjectGroups[subject];
          const totalPoints = subjectAssignments.reduce((sum, a) => sum + a.points, 0);
          const color = subjectAssignments[0].color;

          return (
            <Card
              key={subject}
              className="p-4 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setSelectedSubject(subject)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ 
                      backgroundColor: `hsl(var(--${color}) / 0.1)`,
                    }}
                  >
                    <BookOpen 
                      className="h-5 w-5" 
                      style={{ color: `hsl(var(--${color}))` }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {subject}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {subjectAssignments.length} evaluaciones
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {totalPoints} puntos totales
                    </p>
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
