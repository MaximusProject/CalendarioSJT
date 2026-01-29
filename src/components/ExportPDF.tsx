import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportPDFProps {
  section: "A" | "B";
}

export function ExportPDF({ section }: ExportPDFProps) {
  const [isExporting, setIsExporting] = useState(false);
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

      pdf.setFontSize(18);
      pdf.text(`Calendario Académico 2026 - Sección ${section}`, 15, 15);
      
      pdf.addImage(imgData, 'PNG', 10, 25, imgWidth, imgHeight);

      pdf.save(`calendario-seccion-${section}-2026.pdf`);

      toast({
        title: "¡Exportado!",
        description: "El calendario se ha descargado como PDF",
      });
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
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">Exportar PDF</span>
    </Button>
  );
}
