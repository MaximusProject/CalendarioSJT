import { CrossResult, DisplayMode } from "./types";
import { getColorForGenotype, getSimplePhenotype, getPhenotypeFromGenotype } from "./geneticsUtils";
import { AlleleConfig } from "./types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PunnettGridProps {
  result: CrossResult;
  displayMode: DisplayMode;
  zoomLevel: number;
  alleleConfigs: AlleleConfig[];
}

export function PunnettGrid({ result, displayMode, zoomLevel, alleleConfigs }: PunnettGridProps) {
  const renderCellContent = (genotype: string) => {
    switch (displayMode) {
      case "genotype":
        return <span className="font-bold font-mono">{genotype}</span>;
      case "phenotype":
        return <span className="text-xs leading-tight">{getPhenotypeFromGenotype(genotype, alleleConfigs)}</span>;
      case "simple":
        return <span className="font-mono">{getSimplePhenotype(genotype)}</span>;
      case "color":
        return <span className="font-bold font-mono">{genotype}</span>;
      case "detailed":
        return (
          <div className="text-xs space-y-0.5">
            <div className="font-bold font-mono">{genotype}</div>
            <div className="text-muted-foreground">{getSimplePhenotype(genotype)}</div>
          </div>
        );
      default:
        return genotype;
    }
  };

  const getCellClasses = (genotype: string) => {
    const baseClasses = "border p-2 text-center transition-all duration-200 hover:ring-2 hover:ring-primary/30";
    
    if (displayMode === "color") {
      return cn(baseClasses, getColorForGenotype(genotype));
    }
    
    return cn(baseClasses, "bg-card");
  };

  const gridScale = 0.6 + (zoomLevel * 0.15);
  const isLargeGrid = result.grid.length > 4;

  return (
    <div className="overflow-x-auto pb-4">
      <div 
        className="inline-block border-2 border-primary/20 rounded-xl overflow-hidden shadow-lg"
        style={{ 
          transform: `scale(${gridScale})`, 
          transformOrigin: 'top left',
          marginBottom: isLargeGrid ? `-${(1 - gridScale) * 100}%` : 0
        }}
      >
        <table className="border-collapse bg-card">
          <thead>
            <tr>
              <th className="border-b-2 border-r-2 border-primary/20 p-3 bg-primary/10 font-semibold text-primary">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">Gametos</span>
                  <span>P₁ ↓ P₂ →</span>
                </div>
              </th>
              {result.gametes.parent2.map((gamete, idx) => (
                <th 
                  key={idx}
                  className="border-b-2 border-primary/20 p-3 bg-secondary/50 font-mono text-sm font-bold"
                >
                  <Badge variant="outline" className="font-mono">
                    {gamete}
                  </Badge>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.grid.map((row, i) => (
              <tr key={i}>
                <td className="border-r-2 border-primary/20 p-3 bg-secondary/50 font-mono text-sm font-bold">
                  <Badge variant="outline" className="font-mono">
                    {result.gametes.parent1[i]}
                  </Badge>
                </td>
                {row.map((cell, j) => (
                  <td 
                    key={j}
                    className={getCellClasses(cell)}
                    style={{ 
                      minWidth: displayMode === "phenotype" ? "100px" : "70px",
                      minHeight: "50px"
                    }}
                  >
                    {renderCellContent(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
