import { useState } from "react";
import { Calendar } from "@/components/Calendar";
import { NextWeekSection } from "@/components/NextWeekSection";
import { DayDetailsDialog } from "@/components/DayDetailsDialog";
import { PinDialog } from "@/components/PinDialog";
import { UnifiedSubjectsView } from "@/components/UnifiedSubjectsView";
import { GradeCalculator } from "@/components/GradeCalculator";
import { MiniProjects } from "@/components/MiniProjects";
import { SettingsDialog } from "@/components/SettingsDialog";
import { SectionPicker } from "@/components/SectionPicker";
import { ColorLegend } from "@/components/ColorLegend";
import { ExportPDF } from "@/components/ExportPDF";
import { BlogSection } from "@/components/BlogSection";
import { Assignment } from "@/data/assignments";
import { 
  Lock, 
  LogOut, 
  GraduationCap, 
  Newspaper, 
  ArrowLeftRight,
  Calculator,
  Home,
  Beaker
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePinAuth } from "@/hooks/usePinAuth";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

type TabType = "home" | "subjects" | "calculator" | "projects" | "blog";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const { isAuthenticated, logout } = usePinAuth();
  const { settings, setSection, clearSection } = useSettings();

  const handleDayClick = (date: Date, assignments: Assignment[]) => {
    setSelectedDate(date);
    setSelectedAssignments(assignments);
    setDialogOpen(true);
  };

  // If no section is selected, show the section picker
  if (!settings.selectedSection) {
    return <SectionPicker onSelectSection={setSection} />;
  }

  const tabs = [
    { id: "home" as TabType, icon: Home, label: "Inicio" },
    { id: "subjects" as TabType, icon: GraduationCap, label: "Materias" },
    { id: "calculator" as TabType, icon: Calculator, label: "Notas" },
    { id: "projects" as TabType, icon: Beaker, label: "Herramientas" },
    { id: "blog" as TabType, icon: Newspaper, label: "Blog" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-16">
      {/* Header - Mobile optimized */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b safe-area-top">
        <div className="container mx-auto px-3 lg:px-4 h-12 lg:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-bold">
              Mi Calendario
            </h1>
            <span 
              className={cn(
                "text-[10px] lg:text-xs font-semibold px-1.5 lg:px-2 py-0.5 rounded-full",
                settings.selectedSection === 'A' 
                  ? 'bg-blue-500/20 text-blue-600' 
                  : 'bg-emerald-500/20 text-emerald-600'
              )}
            >
              {settings.selectedSection}
            </span>
          </div>
          
          <div className="flex items-center gap-0.5 lg:gap-1">
            {/* Desktop-only buttons */}
            <div className="hidden lg:flex items-center gap-1">
              <ExportPDF section={settings.selectedSection} />
              <ColorLegend />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSection}
              className="h-8 w-8 lg:h-9 lg:w-9 rounded-full"
            >
              <ArrowLeftRight className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <SettingsDialog />
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 lg:h-9 lg:w-9 rounded-full"
              >
                <LogOut className="h-4 w-4 lg:h-5 lg:w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPinDialogOpen(true)}
                className="h-8 w-8 lg:h-9 lg:w-9 rounded-full"
              >
                <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Mobile optimized padding */}
      <main className="container mx-auto px-3 lg:px-4 py-3 lg:py-4">
        {activeTab === "home" && (
          <div className="space-y-4 animate-fade-in">
            {/* Mobile-only quick actions */}
            <div className="flex gap-2 lg:hidden overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              <ExportPDF section={settings.selectedSection} />
              <ColorLegend />
            </div>
            
            <div data-calendar-export>
              <Calendar onDayClick={handleDayClick} section={settings.selectedSection} />
            </div>
            <NextWeekSection section={settings.selectedSection} />
          </div>
        )}

        {activeTab === "subjects" && (
          <div className="animate-fade-in">
            <UnifiedSubjectsView section={settings.selectedSection} />
          </div>
        )}

        {activeTab === "projects" && (
          <div className="animate-fade-in">
            <MiniProjects section={settings.selectedSection} />
          </div>
        )}

        {activeTab === "calculator" && (
          <div className="animate-fade-in">
            <GradeCalculator section={settings.selectedSection} />
          </div>
        )}

        {activeTab === "blog" && (
          <div className="animate-fade-in">
            <BlogSection section={settings.selectedSection} />
          </div>
        )}
      </main>

      {/* Bottom Navigation - Mobile (Instagram-style) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t lg:hidden z-50 pb-safe">
        <div className="flex items-center justify-around h-14 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl transition-all flex-1 active:scale-95",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-110"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Bottom Tabs */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 py-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "gap-2 rounded-full",
                    isActive && "shadow-lg"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

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
