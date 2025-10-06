import { useState } from "react";
import { Calendar } from "@/components/Calendar";
import { NextWeekSection } from "@/components/NextWeekSection";
import { DayDetailsDialog } from "@/components/DayDetailsDialog";
import { PinDialog } from "@/components/PinDialog";
import { SubjectsView } from "@/components/SubjectsView"; // ✅ CORREGIDO - con llaves
import { Assignment } from "@/data/assignments";
import { BookOpen, Lock, LogOut, Calendar as CalendarIcon, GraduationCap, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePinAuth } from "@/hooks/usePinAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Componente SubjectLegend
const SubjectLegend = () => {
  const subjects = [
    { name: "Biología", color: "hsl(var(--biology))" },
    { name: "GHC", color: "hsl(var(--ghc))" },
    { name: "Soberanía", color: "hsl(var(--soberania))" },
    { name: "Castellano", color: "hsl(var(--castellano))" },
    { name: "Química", color: "hsl(var(--quimica))" },
    { name: "Matemáticas", color: "hsl(var(--matematicas))" },
    { name: "Finanzas", color: "hsl(var(--finanzas))" },
    { name: "Inglés", color: "hsl(var(--ingles))" },
    { name: "Educación Física", color: "hsl(var(--educacion-fisica))" },
    { name: "Física", color: "hsl(var(--fisica))" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          Colores
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-3">Materias</h4>
          <div className="grid gap-2">
            {subjects.map((subject) => (
              <div key={subject.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-sm shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="text-sm">{subject.name}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const { isAuthenticated, logout } = usePinAuth();

  const handleDayClick = (date: Date, assignments: Assignment[]) => {
    setSelectedDate(date);
    setSelectedAssignments(assignments);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3">
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
            <div className="flex items-center gap-2">
              <SubjectLegend />
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
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="subjects" className="gap-2">
              {/* ✅ QUITADO EL DISABLED */}
              <GraduationCap className="h-4 w-4" />
              Materias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Calendar onDayClick={handleDayClick} />
              </div>
              <div>
                <NextWeekSection />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subjects">
            {/* ✅ HABILITADO */}
            <SubjectsView />
          </TabsContent>
        </Tabs>
      </main>

      <DayDetailsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={selectedDate}
        assignments={selectedAssignments}
      />

      <PinDialog open={pinDialogOpen} onOpenChange={setPinDialogOpen} />
    </div>
  );
};

export default Index;