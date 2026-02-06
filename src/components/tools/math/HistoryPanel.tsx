import { MathHistoryItem } from "./types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Copy, Trash2, RotateCw } from "lucide-react";

interface HistoryPanelProps {
  history: MathHistoryItem[];
  onClear: () => void;
  onReuse?: (item: MathHistoryItem) => void;
}

export function HistoryPanel({ history, onClear, onReuse }: HistoryPanelProps) {
  if (history.length === 0) return null;

  const copyAll = () => {
    navigator.clipboard.writeText(
      history.map(h => `${h.type}: ${h.input} = ${h.result}`).join('\n')
    );
  };

  return (
    <Card className="p-4 rounded-2xl mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Historial ({history.length})
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs rounded-full" onClick={copyAll}>
            <Copy className="h-3 w-3" /> Copiar
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs rounded-full text-destructive" onClick={onClear}>
            <Trash2 className="h-3 w-3" /> Limpiar
          </Button>
        </div>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-2 rounded-lg border hover:border-primary/30 transition-colors cursor-pointer group"
            onClick={() => onReuse?.(item)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {item.type.substring(0, 4)}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {item.timestamp instanceof Date ? item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="text-xs font-mono truncate">{item.input}</div>
                <div className="text-xs text-primary font-bold truncate">{item.result}</div>
              </div>
              <RotateCw className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
