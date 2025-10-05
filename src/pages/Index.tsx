import { useState } from "react";
import { Calendar } from "@/components/Calendar";
import { NextWeekSection } from "@/components/NextWeekSection";
import { DayDetailsDialog } from "@/components/DayDetailsDialog";
import { PinDialog } from "@/components/PinDialog"; // ✅ NUEVA IMPORTACIÓN
import { Assignment } from "@/data/assignments";
import { BookOpen, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button"; // ✅ NUEVA IMPORTACIÓN
import { usePinAuth } from "@/hooks/usePinAuth"; // ✅ NUEVA IMPORTACIÓN

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false); // ✅ NUEVO ESTADO

  // ✅ NUEVO HOOK DE AUTENTICACIÓN
  const { isAuthenticated, logout } = usePinAuth();

  // ✅ DEBUG TEMPORAL - AÑADE ESTO
  console.log("🔐 Estado de autenticación:", isAuthenticated);

  const handleDayClick = (date: Date, assignments: Assignment[]) => {
    setSelectedDate(date);
    setSelectedAssignments(assignments);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3"> {/* ✅ CAMBIADO: justify-between */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mi Calendario Académico</h1>
                <p className="text-sm text-muted-foreground">
                  Organiza y visualiza todas tus tareas y evaluaciones
                </p>
              </div>
            </div>
            
            {/* ✅ NUEVO: Botón de autenticación */}
            <div>
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPinDialogOpen(true)}
                  className="gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Acceder
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Calendar onDayClick={handleDayClick} />
          </div>
          <div>
            <NextWeekSection />
          </div>
        </div>
      </main>

      <DayDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        assignments={selectedAssignments}
      />

      {/* ✅ NUEVO: Diálogo de PIN */}
      <PinDialog open={pinDialogOpen} onOpenChange={setPinDialogOpen} />
    </div>
  );
};

export default Index;