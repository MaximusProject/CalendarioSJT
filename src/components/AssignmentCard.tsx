import { Assignment } from "@/data/assignments";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Target } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AssignmentCardProps {
  assignment: Assignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [year, month, day] = assignment.date.split('-').map(Number);
  const assignmentDate = new Date(year, month - 1, day);
  
  return (
    <Card className="p-4 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge
              className="font-semibold"
              style={{
                backgroundColor: `hsl(var(--${assignment.color}))`,
                color: "white"
              }}
            >
              {assignment.subject}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {assignment.percentage}% ({assignment.points} pts)
            </Badge>
          </div>

          <h3 className="font-semibold text-sm leading-tight">
            {assignment.content}
          </h3>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              <span>{assignment.type}</span>
            </div>
            {assignment.technique && (
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3" />
                <span>{assignment.technique}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>{format(assignmentDate, "dd 'de' MMMM, yyyy", { locale: es })}</span>
            </div>
          </div>

          {assignment.notes && (
            <p className="text-xs text-muted-foreground italic mt-2 pt-2 border-t">
              {assignment.notes}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
