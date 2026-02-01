import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Beaker, 
  Dna, 
  Atom,
  ChevronLeft,
  FlaskConical,
  Sigma
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PunnettCalculator } from "./tools/PunnettCalculator";
import { PhysicsCalculator } from "./tools/PhysicsCalculator";
import { ChemistryCalculator } from "./tools/ChemistryCalculator";
import { MathGrapher } from "./tools/MathGrapher";

interface MiniProjectsProps {
  section: "A" | "B";
}

type ToolId = "biology" | "physics" | "chemistry" | "math" | null;

const tools = [
  {
    id: "biology" as const,
    name: "Simulador Genético",
    subject: "Biología",
    description: "Cuadros de Punnett, herencia, probabilidades genéticas",
    icon: Dna,
    color: "biology",
    features: ["Cruces monohíbridos", "Cruces dihíbridos", "Herencia ligada al sexo", "Árbol genealógico"]
  },
  {
    id: "physics" as const,
    name: "Calculadora de Física",
    subject: "Física",
    description: "Lanzamiento vertical, horizontal e inclinado",
    icon: Atom,
    color: "fisica",
    features: ["Lanzamiento vertical", "Lanzamiento horizontal", "Lanzamiento inclinado", "Fórmulas paso a paso"]
  },
  {
    id: "chemistry" as const,
    name: "Laboratorio Químico",
    subject: "Química",
    description: "pH, pOH, disoluciones, electroquímica",
    icon: FlaskConical,
    color: "quimica",
    features: ["Calculadora pH/pOH", "Disoluciones", "Balance de ecuaciones", "Termoquímica"]
  },
  {
    id: "math" as const,
    name: "Graficador Matemático",
    subject: "Matemáticas",
    description: "Gráficas, trigonometría, ecuaciones",
    icon: Sigma,
    color: "matematicas",
    features: ["Funciones trigonométricas", "Resolver ecuaciones", "Identidades", "Paso a paso"]
  }
];

export function MiniProjects({ section }: MiniProjectsProps) {
  const [selectedTool, setSelectedTool] = useState<ToolId>(null);

  if (selectedTool) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedTool(null)}
          className="gap-2 rounded-full"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a herramientas
        </Button>

        {selectedTool === "biology" && <PunnettCalculator />}
        {selectedTool === "physics" && <PhysicsCalculator />}
        {selectedTool === "chemistry" && <ChemistryCalculator />}
        {selectedTool === "math" && <MathGrapher />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Beaker className="h-6 w-6 text-primary" />
          Mini-Proyectos
        </h2>
        <p className="text-muted-foreground text-sm">
          Herramientas especializadas para resolver ejercicios paso a paso
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.id}
              className={cn(
                "p-5 cursor-pointer group rounded-2xl border-l-4 transition-all",
                "hover:shadow-lg active:scale-[0.98]"
              )}
              style={{ borderLeftColor: `hsl(var(--${tool.color}))` }}
              onClick={() => setSelectedTool(tool.id)}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `hsl(var(--${tool.color}) / 0.15)` }}
                >
                  <Icon 
                    className="h-7 w-7" 
                    style={{ color: `hsl(var(--${tool.color}))` }} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="mb-2"
                    style={{ 
                      backgroundColor: `hsl(var(--${tool.color}) / 0.1)`,
                      color: `hsl(var(--${tool.color}))`
                    }}
                  >
                    {tool.subject}
                  </Badge>
                  <p className="text-sm text-muted-foreground mb-3">
                    {tool.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tool.features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}