import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, X, Sparkles, User, Rabbit, Bug, Leaf, FlaskConical, ChevronRight
} from "lucide-react";
import { ORGANISM_PRESETS, ORGANISM_CATEGORIES } from "./organismPresets";
import { OrganismPreset, TraitPreset } from "./types";
import { cn } from "@/lib/utils";

interface OrganismSelectorProps {
  onSelectTraits: (traits: TraitPreset[], organism: OrganismPreset) => void;
  selectedCount: number;
  maxTraits: number;
}

export function OrganismSelector({ onSelectTraits, selectedCount, maxTraits }: OrganismSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrganism, setSelectedOrganism] = useState<OrganismPreset | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<TraitPreset[]>([]);

  const filteredOrganisms = ORGANISM_PRESETS.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.scientificName?.toLowerCase().includes(search.toLowerCase()) ||
      org.traits.some(t => t.name.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || org.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "human": return <User className="h-4 w-4" />;
      case "animal": return <Rabbit className="h-4 w-4" />;
      case "plant": return <Leaf className="h-4 w-4" />;
      case "microorganism": return <FlaskConical className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const handleToggleTrait = (trait: TraitPreset) => {
    const isSelected = selectedTraits.some(t => t.id === trait.id);
    
    if (isSelected) {
      setSelectedTraits(prev => prev.filter(t => t.id !== trait.id));
    } else {
      if (selectedTraits.length < maxTraits) {
        setSelectedTraits(prev => [...prev, trait]);
      }
    }
  };

  const handleApplyTraits = () => {
    if (selectedOrganism && selectedTraits.length > 0) {
      onSelectTraits(selectedTraits, selectedOrganism);
    }
  };

  const handleClearSelection = () => {
    setSelectedTraits([]);
    setSelectedOrganism(null);
  };

  if (selectedOrganism) {
    return (
      <Card className="p-4 space-y-4 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        {/* Header del organismo seleccionado */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedOrganism(null)}
            className="gap-2"
          >
            ← Volver a organismos
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearSelection}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Info del organismo */}
        <div className="flex items-center gap-4 p-4 bg-card rounded-xl border">
          <div className="text-4xl">{selectedOrganism.icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{selectedOrganism.name}</h3>
            {selectedOrganism.scientificName && (
              <p className="text-sm text-muted-foreground italic">
                {selectedOrganism.scientificName}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {selectedOrganism.description}
            </p>
          </div>
          <Badge variant="secondary">
            {selectedOrganism.traits.length} rasgos
          </Badge>
        </div>

        {/* Selector de traits */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Selecciona hasta {maxTraits} rasgos</h4>
            <Badge variant={selectedTraits.length === maxTraits ? "default" : "outline"}>
              {selectedTraits.length}/{maxTraits}
            </Badge>
          </div>
          
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-2">
              {selectedOrganism.traits.map((trait) => {
                const isSelected = selectedTraits.some(t => t.id === trait.id);
                const isDisabled = !isSelected && selectedTraits.length >= maxTraits;
                
                return (
                  <div
                    key={trait.id}
                    onClick={() => !isDisabled && handleToggleTrait(trait)}
                    className={cn(
                      "p-3 rounded-xl border-2 cursor-pointer transition-all",
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{trait.name}</span>
                          <Badge variant="outline" className="text-xs font-mono">
                            {trait.dominantAllele}/{trait.recessiveAllele}
                          </Badge>
                          {trait.chromosome === "X-linked" && (
                            <Badge variant="secondary" className="text-xs">
                              Ligado al X
                            </Badge>
                          )}
                          {trait.dominanceType === "incomplete" && (
                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              Incompleta
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-muted-foreground">{trait.dominantTrait}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span className="text-muted-foreground">{trait.recessiveTrait}</span>
                          </div>
                        </div>
                        {trait.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {trait.description}
                          </p>
                        )}
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected 
                          ? "border-primary bg-primary text-primary-foreground" 
                          : "border-muted-foreground/30"
                      )}>
                        {isSelected && <Sparkles className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Botón aplicar */}
        <Button 
          onClick={handleApplyTraits}
          disabled={selectedTraits.length === 0}
          className="w-full gap-2"
          size="lg"
        >
          <Sparkles className="h-4 w-4" />
          Aplicar {selectedTraits.length} rasgo{selectedTraits.length !== 1 ? "s" : ""} al cruce
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4 rounded-2xl">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar organismo o rasgo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      {/* Categorías */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {ORGANISM_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="gap-2 shrink-0 rounded-full"
          >
            <span>{cat.icon}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Lista de organismos */}
      <ScrollArea className="h-[300px]">
        <div className="grid gap-2">
          {filteredOrganisms.map((organism) => (
            <div
              key={organism.id}
              onClick={() => setSelectedOrganism(organism)}
              className={cn(
                "p-4 rounded-xl border-2 cursor-pointer transition-all",
                "hover:border-primary hover:bg-accent/50",
                "active:scale-[0.99]"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{organism.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{organism.name}</h4>
                    {getCategoryIcon(organism.category)}
                  </div>
                  {organism.scientificName && (
                    <p className="text-xs text-muted-foreground italic truncate">
                      {organism.scientificName}
                    </p>
                  )}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {organism.traits.slice(0, 3).map((trait) => (
                      <Badge key={trait.id} variant="secondary" className="text-xs">
                        {trait.name}
                      </Badge>
                    ))}
                    {organism.traits.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{organism.traits.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
