import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const calendarElement = document.querySelector('[data-calendar-export]');
      
      if (!calendarElement) {
        toast({
          title: "Error",
          description: "No se encontró el calendario para exportar",
          variant: "destructive",
        });
        return;
      }

      const canvas = await html2canvas(calendarElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const monthLabel = exportType === "all" 
        ? "Enero - Abril" 
        : months.find(m => m.value === selectedMonth[0])?.label || "";

      pdf.setFontSize(18);
      pdf.text(`Calendario Académico 2026 - Sección ${section}`, 15, 15);
      pdf.setFontSize(12);
      pdf.text(monthLabel, 15, 22);
      
      pdf.addImage(imgData, 'PNG', 10, 28, imgWidth, imgHeight);

      const fileName = exportType === "all"
        ? `calendario-seccion-${section}-2026.pdf`
        : `calendario-seccion-${section}-${months.find(m => m.value === selectedMonth[0])?.label.toLowerCase()}-2026.pdf`;

      pdf.save(fileName);

      toast({
        title: "¡Exportado!",
        description: `El calendario se ha descargado como PDF`,
      });

      setDialogOpen(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar el calendario",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
        >
          <Download className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            ¿Qué deseas exportar?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <RadioGroup
            value={exportType}
            onValueChange={(value) => setExportType(value as "all" | "single")}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer hover:border-primary/50 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex-1 cursor-pointer">
                <div className="font-semibold">Exportar todo</div>
                <div className="text-sm text-muted-foreground">
                  Enero hasta Abril completo
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer hover:border-primary/50 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="flex-1 cursor-pointer">
                <div className="font-semibold">Exportar un mes</div>
                <div className="text-sm text-muted-foreground">
                  Selecciona el mes específico
                </div>
              </Label>
            </div>
          </RadioGroup>

          {exportType === "single" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Mes seleccionado:</Label>
                <span className="text-lg font-bold text-primary">
                  {months.find(m => m.value === selectedMonth[0])?.label}
                </span>
              </div>
              <Slider
                value={selectedMonth}
                onValueChange={setSelectedMonth}
                min={1}
                max={4}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {months.map((month) => (
                  <span 
                    key={month.value}
                    className={selectedMonth[0] === month.value ? "text-primary font-medium" : ""}
                  >
                    {month.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full gap-2 h-12 rounded-xl"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Descargar PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
