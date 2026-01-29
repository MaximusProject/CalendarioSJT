import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

const subjectColors = [
  { name: "Química", color: "quimica", hsl: "hsl(280, 70%, 50%)" },
  { name: "Física", color: "fisica", hsl: "hsl(210, 80%, 50%)" },
  { name: "Biología", color: "biology", hsl: "hsl(140, 70%, 40%)" },
  { name: "Matemáticas", color: "matematicas", hsl: "hsl(45, 90%, 45%)" },
  { name: "Castellano", color: "castellano", hsl: "hsl(350, 75%, 50%)" },
  { name: "Inglés", color: "ingles", hsl: "hsl(200, 80%, 45%)" },
  { name: "GHC", color: "ghc", hsl: "hsl(25, 85%, 50%)" },
  { name: "Soberanía", color: "soberania", hsl: "hsl(160, 70%, 40%)" },
  { name: "Robótica", color: "robotica", hsl: "hsl(260, 70%, 55%)" },
  { name: "Educación de la fé", color: "fe", hsl: "hsl(320, 60%, 50%)" },
  { name: "Francés", color: "frances", hsl: "hsl(220, 75%, 55%)" },
];

export function ColorLegend() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Colores</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-3">Leyenda de Materias</h4>
          <div className="grid gap-2">
            {subjectColors.map((subject) => (
              <div key={subject.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `hsl(var(--${subject.color}))` }}
                />
                <span className="text-sm">{subject.name}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
