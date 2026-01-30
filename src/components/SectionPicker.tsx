import { Card } from "@/components/ui/card";
import { Sparkles, ChevronRight, Calendar } from "lucide-react";

interface SectionPickerProps {
  onSelectSection: (section: "A" | "B") => void;
}

export function SectionPicker({ onSelectSection }: SectionPickerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Logo y T¨ªtulo */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30">
                <Calendar className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-4 border-background">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
              &iexcl;Bienvenido! &#128075;
            </h1>
            <p className="text-lg font-medium text-primary">
              Calendario Acad&eacute;mico 2026
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Selecciona tu secci&oacute;n para comenzar
            </p>
          </div>
        </div>

        {/* Tarjetas de Secci¨®n */}
        <div className="space-y-3">
          <Card
            className="relative overflow-hidden cursor-pointer group rounded-2xl border-2 border-transparent hover:border-blue-500/50 transition-all duration-300 active:scale-[0.98]"
            onClick={() => onSelectSection("A")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold group-hover:text-blue-500 transition-colors">
                  Secci&oacute;n A
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ver evaluaciones de la Secci&oacute;n A
                </p>
              </div>
              <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>

          <Card
            className="relative overflow-hidden cursor-pointer group rounded-2xl border-2 border-transparent hover:border-emerald-500/50 transition-all duration-300 active:scale-[0.98]"
            onClick={() => onSelectSection("B")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-2xl font-bold text-white">B</span>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold group-hover:text-emerald-500 transition-colors">
                  Secci&oacute;n B
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ver evaluaciones de la Secci&oacute;n B
                </p>
              </div>
              <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </div>

        {/* Nota al pie */}
        <p className="text-center text-xs text-muted-foreground">
          Puedes cambiar de secci&oacute;n desde el men&uacute; principal
        </p>
      </div>
    </div>
  );
}