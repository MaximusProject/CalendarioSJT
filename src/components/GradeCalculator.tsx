import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calculator, ChevronRight, RotateCcw, TrendingUp, Plus, Minus, BookOpen, Star } from "lucide-react";
import { assignments as assignmentsSectionB, undatedAssignments as undatedSectionB } from "@/data/assignments";
import { assignmentsSectionA, undatedAssignmentsSectionA } from "@/data/assignmentsSectionA";
import { useSettings } from "@/hooks/useSettings";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

interface GradeCalculatorProps {
  section: "A" | "B";
}

interface GradeEntry {
  [assignmentId: string]: number | null;
}

// Tipos de evaluación que son acumulativos (suman puntos, no restan)
const CUMULATIVE_TYPES = [
  "rasgos", "cuaderno", "participación", "actitud", "personal features", 
  "traits", "cahier", "revisión", "pastoral", "recuperación"
];

// Función para determinar si es una evaluación acumulativa
const isCumulative = (content: string, type?: string): boolean => {
  const lowerContent = content.toLowerCase();
  const lowerType = type?.toLowerCase() || "";
  
  return CUMULATIVE_TYPES.some(t => 
    lowerContent.includes(t) || lowerType.includes(t)
  );
};

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

  const calculateSubjectGrade = (subject: string) => {
    const subjectAssignments = subjectGroups[subject];
    let formalGradeSum = 0;
    let formalWeightSum = 0;
    let cumulativePoints = 0;
    let maxCumulativePoints = 0;

    subjectAssignments.forEach((assignment) => {
      const grade = grades[assignment.id];
      const assignmentIsCumulative = isCumulative(assignment.content, assignment.type);

      if (assignmentIsCumulative) {
        // Componentes acumulativos: suman puntos adicionales
        maxCumulativePoints += assignment.percentage;
        if (grade !== null && grade !== undefined) {
          // Convertir la nota (0-20) a puntos proporcionales
          cumulativePoints += (grade / 20) * assignment.percentage;
        }
      } else {
        // Evaluaciones formales: se promedian ponderadamente
        if (grade !== null && grade !== undefined) {
          formalGradeSum += grade * (assignment.percentage / 100);
          formalWeightSum += assignment.percentage;
        }
      }
    });

    const totalFormalPercentage = subjectAssignments
      .filter(a => !isCumulative(a.content, a.type))
      .reduce((sum, a) => sum + a.percentage, 0);

    if (formalWeightSum === 0 && cumulativePoints === 0) return null;

    // Nota base de evaluaciones formales (sobre 20)
    const formalGrade = formalWeightSum > 0 
      ? (formalGradeSum / (formalWeightSum / 100))
      : 0;

    // Puntos adicionales de componentes acumulativos (convertidos a escala de 20)
    const bonusPoints = maxCumulativePoints > 0 
      ? (cumulativePoints / maxCumulativePoints) * (maxCumulativePoints / 100) * 20
      : 0;

    // Nota final = nota formal + bonificación (max 20)
    const finalGrade = Math.min(20, formalGrade + bonusPoints);

    return {
      formalGrade: formalWeightSum > 0 ? formalGrade : null,
      bonusPoints,
      finalGrade,
      formalWeightSum,
      totalFormalPercentage,
      cumulativePoints,
      maxCumulativePoints
    };
  };

  const calculateGeneralAverage = () => {
    let totalGrades = 0;
    let subjectCount = 0;

    subjects.forEach((subject) => {
      const result = calculateSubjectGrade(subject);
      if (result !== null && result.finalGrade > 0) {
        totalGrades += result.finalGrade;
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

  // Vista de detalle de materia
  if (selectedSubject && subjectGroups[selectedSubject]) {
    const subjectAssignments = subjectGroups[selectedSubject];
    const gradeResult = calculateSubjectGrade(selectedSubject);
    
    const formalAssignments = subjectAssignments.filter(a => !isCumulative(a.content, a.type));
    const cumulativeAssignments = subjectAssignments.filter(a => isCumulative(a.content, a.type));

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

        {/* Resumen de la materia */}
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
                  {formalAssignments.length} formales • {cumulativeAssignments.length} acumulativos
                </p>
              </div>
            </div>
            {gradeResult && gradeResult.finalGrade > 0 && (
              <div className="text-right">
                <div className="text-3xl font-bold" style={{ color: `hsl(var(--${subjectAssignments[0].color}))` }}>
                  {gradeResult.finalGrade.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Nota Final</div>
              </div>
            )}
          </div>

          {/* Desglose */}
          {gradeResult && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-xl mb-4">
              <div className="text-center p-2">
                <div className="text-lg font-bold text-foreground">
                  {gradeResult.formalGrade !== null ? gradeResult.formalGrade.toFixed(2) : "--"}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Minus className="h-3 w-3" /> Nota Base
                </div>
              </div>
              <div className="text-center p-2">
                <div className="text-lg font-bold text-emerald-500">
                  +{gradeResult.bonusPoints.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Plus className="h-3 w-3" /> Bonificación
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Evaluaciones Formales */}
        {formalAssignments.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Evaluaciones Formales
            </h3>
            <div className="space-y-2">
              {formalAssignments.map((assignment) => (
                <Card 
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
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Componentes Acumulativos */}
        {cumulativeAssignments.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Componentes Acumulativos <span className="text-emerald-500">(+puntos)</span>
            </h3>
            <div className="space-y-2">
              {cumulativeAssignments.map((assignment) => (
                <Card 
                  key={assignment.id}
                  className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{assignment.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30">
                          +{assignment.percentage}%
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
                        className="w-20 h-10 text-center text-lg font-bold rounded-xl border-emerald-500/30 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-muted-foreground">/20</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista general de materias
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Calculadora de Notas
          </h2>
          <p className="text-muted-foreground text-sm">
            Incluye evaluaciones formales y componentes acumulativos
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
              {subjects.filter(s => calculateSubjectGrade(s) !== null).length} de {subjects.length} materias
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
          const result = calculateSubjectGrade(subject);
          const totalItems = subjectAssignments.length;
          const gradedItems = subjectAssignments.filter(a => grades[a.id] !== null && grades[a.id] !== undefined).length;
          const hasCumulative = subjectAssignments.some(a => isCumulative(a.content, a.type));

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
                      {gradedItems}/{totalItems} evaluaciones
                      {hasCumulative && <span className="text-emerald-500"> • +bonus</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result !== null && result.finalGrade > 0 && (
                    <span 
                      className="text-xl font-bold"
                      style={{ color: `hsl(var(--${color}))` }}
                    >
                      {result.finalGrade.toFixed(1)}
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
