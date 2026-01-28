import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Moon, Sun, Monitor, Bell, Eye, RotateCcw } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { assignments, undatedAssignments } from "@/data/assignments";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function SettingsDialog() {
  const { settings, updateSettings, toggleHiddenSubject, isSubjectHidden, resetSettings } = useSettings();

  // Get all unique subjects
  const allSubjects = [...new Set([
    ...assignments.map(a => a.subject),
    ...undatedAssignments.map(a => a.subject)
  ])].sort();

  const themes = [
    { value: 'light' as const, label: 'Claro', icon: Sun },
    { value: 'dark' as const, label: 'Oscuro', icon: Moon },
    { value: 'system' as const, label: 'Sistema', icon: Monitor },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Tema
            </Label>
            <div className="flex gap-2">
              {themes.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={settings.theme === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings({ theme: value })}
                  className={cn(
                    "flex-1 gap-2",
                    settings.theme === value && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 cursor-pointer">
              <Bell className="h-4 w-4" />
              Recordatorios de evaluaciones
            </Label>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSettings({ notifications: checked })}
            />
          </div>

          <Separator />

          {/* Hidden Subjects */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Ocultar materias
            </Label>
            <ScrollArea className="h-48 rounded-md border p-3">
              <div className="space-y-2">
                {allSubjects.map((subject) => (
                  <div key={subject} className="flex items-center justify-between py-1">
                    <span className="text-sm">{subject}</span>
                    <Switch
                      checked={!isSubjectHidden(subject)}
                      onCheckedChange={() => toggleHiddenSubject(subject)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Reset */}
          <Button 
            variant="outline" 
            className="w-full gap-2 text-destructive hover:text-destructive"
            onClick={resetSettings}
          >
            <RotateCcw className="h-4 w-4" />
            Restablecer configuración
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
