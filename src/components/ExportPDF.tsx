import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import { es } from "date-fns/locale";

// Importación de datos idéntica a tu Calendar.tsx 
import { assignments as assignmentsSectionB } from "@/data/assignments";
import { assignmentsSectionA } from "@/data/assignmentsSectionA";

interface ExportPDFProps {
  section: "A" | "B";
}

const months = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
];

export function ExportPDF({ section }: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<"all" | "single">("all");
  const [selectedMonth, setSelectedMonth] = useState([1]);
  const { toast } = useToast();

  const assignments = section === "A" ? assignmentsSectionA : assignmentsSectionB; 

  const generateMonthData = (monthIndex: number) => {
    const year = 2026;
    const date = new Date(year, monthIndex - 1, 1);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = eachDayOfInterval({ start, end });
    const firstDay = getDay(start);

    const rows = [];
    let currentRow = Array(7).fill("");
    
    for (let i = 0; i < firstDay; i++) currentRow[i] = "";

    days.forEach((day) => {
      const dayIdx = getDay(day);
      const dayNum = format(day, "d");
      
      const dateStr = format(day, "yyyy-MM-dd");
      // CORRECCIÓN: Filtramos y mapeamos 'subject' en lugar de 'title' 
      const dayAssignments = assignments.filter(a => a.date === dateStr);
      const tasks = dayAssignments.map(a => `• ${a.subject || 'Tarea'}`).join("\n");
      
      currentRow[dayIdx] = `${dayNum}\n${tasks}`;

      if (dayIdx === 6 || day.getTime() === end.getTime()) {
        rows.push(currentRow);
        currentRow = Array(7).fill("");
      }
    });

    return { monthName: format(date, "MMMM yyyy", { locale: es }), rows };
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const monthsToExport = exportType === "all" ? [1, 2, 3, 4] : selectedMonth;

      monthsToExport.forEach((mIdx, index) => {
        if (index > 0) doc.addPage();
        
        const { monthName, rows } = generateMonthData(mIdx);

        // Estética profesional
        doc.setFontSize(22);
        doc.setTextColor(24, 24, 27); // Zinc-900
        doc.text(`Calendario Académico 2026 - Sección ${section}`, 14, 18);
        
        doc.setFontSize(14);
        doc.setTextColor(113, 113, 122); // Zinc-500
        doc.text(monthName.toUpperCase(), 14, 28);

        autoTable(doc, {
          startY: 35,
          head: [["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]],
          body: rows,
          theme: "grid",
          styles: {
            fontSize: 9,
            cellPadding: 5,
            valign: "top",
            minCellHeight: 28,
            overflow: 'linebreak',
            font: "helvetica"
          },
          headStyles: {
            fillColor: [24, 24, 27],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center'
          },
          columnStyles: {
            0: { textColor: [239, 68, 68] }, // Domingos en rojo suave
          },
          margin: { left: 14, right: 14 }
        });
      });

      doc.save(`Calendario_2026_Seccion_${section}.pdf`);
      setDialogOpen(false);
      toast({ title: "¡Exportado!", description: "PDF generado sin errores." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", variant: "destructive", description: "Error al generar el PDF." });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10">
          <Download className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Configurar Exportación
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <RadioGroup value={exportType} onValueChange={(v: any) => setExportType(v)} className="grid gap-3">
            <div 
              className={`flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                exportType === "all" ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-primary/40"
              }`}
              onClick={() => setExportType("all")}
            >
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex-1 cursor-pointer font-bold">Semestre Completo</Label>
            </div>
            
            <div 
              className={`flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                exportType === "single" ? "border-primary bg-primary/5 shadow-sm" : "border-muted hover:border-primary/40"
              }`}
              onClick={() => setExportType("single")}
            >
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="flex-1 cursor-pointer font-bold">Mes específico</Label>
            </div>
          </RadioGroup>

          {exportType === "single" && (
            <div className="space-y-4 p-5 bg-secondary/30 rounded-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center font-bold text-primary">
                <span className="text-sm opacity-70 text-foreground">Seleccionado:</span>
                <span className="text-lg">{months.find(m => m.value === selectedMonth[0])?.label}</span>
              </div>
              <Slider value={selectedMonth} onValueChange={setSelectedMonth} min={1} max={4} step={1} />
            </div>
          )}

          <Button 
            onClick={handleExport} 
            disabled={isExporting} 
            className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            {isExporting ? (
              <><Loader2 className="animate-spin mr-2" /> Generando...</>
            ) : (
              <><Download className="mr-2" /> Descargar PDF con alta calidad</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}