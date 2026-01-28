import { Assignment } from "@/data/assignments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, MessageSquare, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";

interface AssignmentCardProps {
  assignment: Assignment;
  showDate?: boolean;
}

export function AssignmentCard({ assignment, showDate = true }: AssignmentCardProps) {
  const { isCompleted, toggleCompleted, getAssignmentNote, setAssignmentNote, getCustomDate, setCustomDate } = useSettings();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteValue, setNoteValue] = useState(getAssignmentNote(assignment.id));
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const completed = isCompleted(assignment.id);
  const customDate = getCustomDate(assignment.id);
  const displayDate = customDate || assignment.date;
  const note = getAssignmentNote(assignment.id);

  const [year, month, day] = displayDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const handleSaveNote = () => {
    setAssignmentNote(assignment.id, noteValue);
    setShowNoteInput(false);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      setCustomDate(assignment.id, dateString);
      setDatePickerOpen(false);
    }
  };

  return (
    <div
      className={cn(
        "group p-4 rounded-xl border transition-all hover:shadow-lg",
        "border-l-4",
        completed && "bg-muted/50 opacity-80"
      )}
      style={{
        borderLeftColor: `hsl(var(--${assignment.color}))`
      }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => toggleCompleted(assignment.id)}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
            completed 
              ? "bg-primary border-primary text-primary-foreground" 
              : "border-muted-foreground/30 hover:border-primary/50"
          )}
        >
          {completed && <CheckCircle2 className="h-4 w-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className={cn(
                "font-semibold",
                completed && "line-through text-muted-foreground"
              )}>
                {assignment.content}
              </h4>
              <p className="text-sm text-muted-foreground">{assignment.subject}</p>
            </div>
            <Badge 
              variant="secondary" 
              className="shrink-0"
              style={{ 
                backgroundColor: `hsl(var(--${assignment.color}) / 0.15)`,
                color: `hsl(var(--${assignment.color}))`
              }}
            >
              {assignment.percentage}%
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="gap-1">
              {assignment.type}
            </Badge>
            
            {showDate && (
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-auto py-1 px-2 gap-1 text-muted-foreground hover:text-foreground",
                      customDate && "text-primary"
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    {format(date, "d 'de' MMMM", { locale: es })}
                    <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <CalendarUI
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {(assignment.notes || note) && (
            <p className="text-sm text-muted-foreground mt-2 italic">
              {note || assignment.notes}
            </p>
          )}

          {showNoteInput ? (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Agregar nota personal..."
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNote}>Guardar</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNoteInput(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-auto py-1 px-2 gap-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowNoteInput(true)}
            >
              <MessageSquare className="h-3 w-3" />
              {note ? 'Editar nota' : 'Agregar nota'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
