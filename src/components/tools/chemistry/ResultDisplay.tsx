import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Copy, 
  Check, 
  Beaker, 
  Lightbulb, 
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { ChemResult } from "./types";
import { exportResultToPDF } from "./chemistryUtils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ResultDisplayProps {
  result: ChemResult;
  isMobile: boolean;
}

export function ResultDisplay({ result, isMobile }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  const handleExport = () => {
    const content = exportResultToPDF(result);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calculo_quimico_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const content = exportResultToPDF(result);
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Resultado principal */}
      <Card className="p-4 md:p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--quimica))]/10 to-transparent border-[hsl(var(--quimica))]/20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">{result.title}</h3>
            {result.classification && (
              <Badge variant="secondary" className="mt-1">
                {result.classification}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Valor final destacado */}
        <div className="text-center py-6 bg-background/50 rounded-xl mb-4">
          <div className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-bold text-[hsl(var(--quimica))]`}>
            {result.finalValue}
          </div>
          <div className="text-lg text-muted-foreground">{result.unit}</div>
        </div>

        {/* Resultados adicionales */}
        {result.additionalResults && result.additionalResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {result.additionalResults.map((r, i) => (
              <div key={i} className="p-3 bg-muted/50 rounded-xl text-center">
                <div className="text-xs text-muted-foreground">{r.label}</div>
                <div className="font-semibold">{r.value} <span className="text-xs">{r.unit}</span></div>
              </div>
            ))}
          </div>
        )}

        {/* Warning */}
        {result.warning && (
          <div className="flex items-start gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{result.warning}</p>
          </div>
        )}

        {/* Tip */}
        {result.tip && (
          <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm">{result.tip}</p>
          </div>
        )}
      </Card>

      {/* Procedimiento detallado */}
      <Card className="p-4 md:p-6 rounded-2xl">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Beaker className="h-5 w-5 text-[hsl(var(--quimica))]" />
          Procedimiento Paso a Paso
        </h3>

        <div className="space-y-3">
          {result.steps.map((step, idx) => (
            <Collapsible
              key={idx}
              open={expandedSteps[idx] !== false}
              onOpenChange={() => toggleStep(idx)}
            >
              <div 
                className={`p-4 rounded-xl border transition-all ${
                  step.isHighlight 
                    ? 'bg-[hsl(var(--quimica))]/10 border-[hsl(var(--quimica))]/30' 
                    : 'bg-muted/30 border-border'
                }`}
              >
                <CollapsibleTrigger className="flex items-start gap-3 w-full text-left">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    step.isHighlight 
                      ? 'bg-[hsl(var(--quimica))] text-white' 
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                        {step.label}
                        {step.isHighlight && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Resultado
                          </Badge>
                        )}
                      </div>
                      {expandedSteps[idx] === false ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="ml-10 mt-3 space-y-2">
                    <div className="p-3 bg-background rounded-lg font-mono text-sm space-y-1">
                      <div className="text-muted-foreground">{step.formula}</div>
                      {step.substitution && (
                        <div className="text-foreground/80">{step.substitution}</div>
                      )}
                      <div className={`font-semibold ${step.isHighlight ? 'text-[hsl(var(--quimica))]' : 'text-primary'}`}>
                        = {step.result}
                      </div>
                    </div>
                    {step.explanation && (
                      <p className="text-xs text-muted-foreground italic">
                        📖 {step.explanation}
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </Card>
    </div>
  );
}
