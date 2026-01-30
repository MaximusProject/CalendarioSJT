import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calculator, ChevronRight, RotateCcw, TrendingUp } from "lucide-react";
import { assignments as assignmentsSectionB, undatedAssignments as undatedSectionB } from "@/data/assignments";
import { assignmentsSectionA, undatedAssignmentsSectionA } from "@/data/assignmentsSectionA";
import { useSettings } from "@/hooks/useSettings";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface GradeCalculatorProps {
  section: "A" | "B";
}

interface GradeEntry {
  [assignmentId: string]: number | null;
}

export function GradeCalculator({ section }: GradeCalculatorProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [grades, setGrades] = useLocalStorage<GradeEntry>(`grades-section-${section}`, {});
  const { isSubjectHidden } = useSettings();

  const allAssignments = section === "A" 
    ? [...assignmentsSectionA, ...undatedAssignmentsSectionA.map(u => ({ ...u, date: "", type: u.type || "", points: 0 }))]
    : [...assignmentsSectionB, ...undatedSectionB.map(u => ({ ...u, date: "", type: u.type || "", points: 0 }))];

  const filteredAssignments = allAssignments.filter(a => !isSubjectHidden(a.subject));

  const subjectGroups = useMemo(() => {
    return filteredAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.subject]) {
        acc[assignment.subject] = [];
      }
      acc[assignment.subject].push(assignment);
      return acc;
    }, {} as Record<string, typeof filteredAssignments>);
  }, [filteredAssignments]);

  const subjects = Object.keys(subjectGroups).sort();

  const calculateSubjectAverage = (subject: string) => {
    const subjectAssignments = subjectGroups[subject];
    let totalWeightedGrade = 0;
    let totalWeight = 0;

    subjectAssignments.forEach((assignment) => {
      const grade = grades[assignment.id];
      if (grade !== null && grade !== undefined) {
        totalWeightedGrade += grade * (assignment.percentage / 100);
        totalWeight += assignment.percentage;
      }
    });

    if (totalWeight === 0) return null;
    return (totalWeightedGrade / (totalWeight / 100));
  };

  const calculateGeneralAverage = () => {
    let totalGrades = 0;
    let subjectCount = 0;

    subjects.forEach((subject) => {
      const avg = calculateSubjectAverage(subject);
      if (avg !== null) {
        totalGrades += avg;
        subjectCount++;
      }
    });

    if (subjectCount === 0) return null;
    return totalGrades / subjectCount;
  };

  const handleGradeChange = (assignmentId: string, value: string) => {
    const numValue = value === "" ? null : Math.min(20, Math.max(0, parseFloat(value) || 0));
    setGrades(prev => ({ ...prev, [assignmentId]: numValue }));
  };

  const resetGrades = () => {
    setGrades({});
  };

  const generalAverage = calculateGeneralAverage();

  if (selectedSubject && subjectGroups[selectedSubject]) {
    const subjectAssignments = subjectGroups[selectedSubject];
    const subjectAverage = calculateSubjectAverage(selectedSubject);
    const totalPercentage = subjectAssignments.reduce((sum, a) => sum + a.percentage, 0);
    const completedPercentage = subjectAssignments.reduce((sum, a) => {
      return grades[a.id] !== null && grades[a.id] !== undefined ? sum + a.percentage : sum;
    }, 0);

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSubject(null)}
            className="gap-2 rounded-full"
          >
            ← Volver
          </Button>
        </div>

        <Card className="p-5 border-l-4 rounded-2xl" style={{ borderLeftColor: `hsl(var(--${subjectAssignments[0].color}))` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `hsl(var(--${subjectAssignments[0].color}) / 0.15)` }}
              >
                <Calculator className="h-6 w-6" style={{ color: `hsl(var(--${subjectAssignments[0].color}))` }} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedSubject}</h2>
                <p className="text-sm text-muted-foreground">
                  {completedPercentage}% de {totalPercentage}% evaluado
                </p>
              </div>
            </div>
            {subjectAverage !== null && (
              <div className="text-right">
                <div className="text-3xl font-bold" style={{ color: `hsl(var(--${subjectAssignments[0].color}))` }}>
                  {subjectAverage.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Promedio</div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {subjectAssignments.map((assignment) => (
              <div 
                key={assignment.id}
                className="p-4 rounded-xl border bg-card/50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{assignment.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {assignment.percentage}%
                      </Badge>
                      {assignment.type && (
                        <span className="text-xs text-muted-foreground">{assignment.type}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      placeholder="--"
                      value={grades[assignment.id] ?? ""}
                      onChange={(e) => handleGradeChange(assignment.id, e.target.value)}
                      className="w-20 h-10 text-center text-lg font-bold rounded-xl"
                    />
                    <span className="text-sm text-muted-foreground">/20</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Calculadora de Notas
          </h2>
          <p className="text-muted-foreground text-sm">
            Calcula tu promedio por materia y general
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetGrades} className="gap-2 rounded-full">
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </Button>
      </div>

      {/* General Average Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border-2 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground">Promedio General</h3>
            <p className="text-sm text-muted-foreground">
              {subjects.filter(s => calculateSubjectAverage(s) !== null).length} de {subjects.length} materias
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary">
              {generalAverage !== null ? generalAverage.toFixed(2) : "--"}
            </div>
            <div className="text-sm text-muted-foreground">/20</div>
          </div>
        </div>
        {generalAverage !== null && (
          <Progress 
            value={(generalAverage / 20) * 100} 
            className="h-2 mt-4"
          />
        )}
      </Card>

      {/* Subject Cards */}
      <div className="grid gap-3 md:grid-cols-2">
        {subjects.map((subject) => {
          const subjectAssignments = subjectGroups[subject];
          const color = subjectAssignments[0].color;
          const average = calculateSubjectAverage(subject);
          const totalPercentage = subjectAssignments.reduce((sum, a) => sum + a.percentage, 0);
          const completedCount = subjectAssignments.filter(a => grades[a.id] !== null && grades[a.id] !== undefined).length;

          return (
            <Card
              key={subject}
              className="p-4 hover:shadow-lg transition-all cursor-pointer group rounded-2xl border-l-4 active:scale-[0.98]"
              style={{ borderLeftColor: `hsl(var(--${color}))` }}
              onClick={() => setSelectedSubject(subject)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `hsl(var(--${color}) / 0.15)` }}
                  >
                    <Calculator className="h-5 w-5" style={{ color: `hsl(var(--${color}))` }} />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {subject}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {completedCount}/{subjectAssignments.length} evaluaciones • {totalPercentage}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {average !== null && (
                    <span 
                      className="text-xl font-bold"
                      style={{ color: `hsl(var(--${color}))` }}
                    >
                      {average.toFixed(1)}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
