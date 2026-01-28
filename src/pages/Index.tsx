import { useState } from "react";
import { Calendar } from "@/components/Calendar";
import { NextWeekSection } from "@/components/NextWeekSection";
import { DayDetailsDialog } from "@/components/DayDetailsDialog";
import { PinDialog } from "@/components/PinDialog";
import { SubjectsView } from "@/components/SubjectsView";
import { UndatedSubjectsView } from "@/components/UndatedSubjectsView";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Assignment } from "@/data/assignments";
import { BookOpen, Lock, LogOut, Calendar as CalendarIcon, GraduationCap, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePinAuth } from "@/hooks/usePinAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Mi Calendario
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Organiza tus evaluaciones
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDialog />
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPinDialogOpen(true)}
                  className="gap-2"
                >
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Acceder</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 p-1 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="calendar" className="gap-1.5 md:gap-2 text-xs md:text-sm">
              <CalendarIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Calendario</span>
              <span className="sm:hidden">Cal</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="gap-1.5 md:gap-2 text-xs md:text-sm">
              <GraduationCap className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Materias</span>
              <span className="sm:hidden">Mat</span>
            </TabsTrigger>
            <TabsTrigger value="undated" className="gap-1.5 md:gap-2 text-xs md:text-sm">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Sin fecha</span>
              <span className="sm:hidden">S/F</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="animate-fade-in">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Calendar onDayClick={handleDayClick} />
              </div>
              <div>
                <NextWeekSection />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="animate-fade-in">
            <SubjectsView />
          </TabsContent>

          <TabsContent value="undated" className="animate-fade-in">
            <UndatedSubjectsView />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Calendario Académico 2026 • Haz clic en cualquier evaluación para editarla</p>
        </div>
      </footer>

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
