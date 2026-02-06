import { StepDetail } from "./types";
import { BookOpen, ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StepDisplayProps {
  steps: StepDetail[];
  title?: string;
}

export function StepDisplay({ steps, title = "Procedimiento Paso a Paso" }: StepDisplayProps) {
  const [expanded, setExpanded] = useState(true);

  if (steps.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          {title}
        </h4>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="rounded-full">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={cn(
                "p-3 rounded-xl border transition-colors hover:border-primary/20",
                idx === steps.length - 1 ? "" : ""
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-bold text-primary text-xs">{step.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-sm">{step.title}</h5>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  )}
                  
                  {step.formula && (
                    <div className="mt-2 font-mono text-xs bg-muted/50 p-2 rounded-lg border">
                      {step.formula}
                    </div>
                  )}
                  
                  {step.calculation && (
                    <div className="mt-1.5 font-mono text-xs bg-primary/5 p-2 rounded-lg border border-primary/10 whitespace-pre-wrap">
                      {step.calculation}
                    </div>
                  )}
                  
                  {step.result && (
                    <div className={cn(
                      "mt-1.5 font-mono text-xs font-bold p-2 rounded-lg border",
                      step.result.includes('✓') || step.result.includes('VÁLIDO') || step.result.includes('Solución')
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                        : step.result.includes('❌') || step.result.includes('Error') || step.result.includes('INVÁLIDO')
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-muted/50"
                    )}>
                      {step.result}
                    </div>
                  )}

                  {step.explanation && (
                    <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">
                      💡 {step.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
