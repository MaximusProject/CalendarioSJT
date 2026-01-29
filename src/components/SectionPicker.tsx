import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles, Users, ChevronRight } from "lucide-react";

interface SectionPickerProps {
  onSelectSection: (section: "A" | "B") => void;
}

export function SectionPicker({ onSelectSection }: SectionPickerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-xl">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              ¡Bienvenido! 👋
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Calendario Académico 2026
            </p>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Selecciona tu sección para ver el calendario de evaluaciones correspondiente
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] border-2 hover:border-primary/50 group"
            onClick={() => onSelectSection("A")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-3xl font-bold text-white">A</span>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                  Sección A
                </h2>
                <p className="text-sm text-muted-foreground">
                  Plan de evaluaciones para la Sección A
                </p>
              </div>
              <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Users className="h-4 w-4" />
                Entrar
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] border-2 hover:border-primary/50 group"
            onClick={() => onSelectSection("B")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-3xl font-bold text-white">B</span>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                  Sección B
                </h2>
                <p className="text-sm text-muted-foreground">
                  Plan de evaluaciones para la Sección B
                </p>
              </div>
              <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Users className="h-4 w-4" />
                Entrar
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground">
          Puedes cambiar de sección en cualquier momento desde la configuración
        </p>
      </div>
    </div>
  );
}
