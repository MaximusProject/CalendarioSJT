import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePinAuth } from "@/hooks/usePinAuth";
import { Lock, Shield, CheckCircle } from "lucide-react";

interface PinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PinDialog({ open, onOpenChange }: PinDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const { login, isAuthenticated } = usePinAuth();

  useEffect(() => {
    if (!open) {
      setPin("");
      setError(false);
      setSuccess(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(pin);
    
    if (success) {
      setSuccess(true);
      setError(false);
      
      // Cerrar después de 1 segundo
      setTimeout(() => {
        setPin("");
        setSuccess(false);
        onOpenChange(false);
        window.dispatchEvent(new CustomEvent('pin-authenticated'));
      }, 1000);
    } else {
      setError(true);
      setSuccess(false);
      setPin("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Shield className="h-5 w-5 text-primary" />
            )}
            {success ? "¡Acceso concedido!" : "Autenticación requerida"}
          </DialogTitle>
          <DialogDescription>
            {success 
              ? "Redirigiendo a la aplicación..." 
              : "Ingresa el PIN para acceder a funciones de moderador"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                error ? 'text-red-500' : success ? 'text-green-500' : 'text-muted-foreground'
              }`} />
              <Input
                type="password"
                placeholder="PIN de 8 dígitos"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setPin(value);
                  setError(false);
                }}
                maxLength={8}
                className={`pl-10 ${error ? 'border-red-500' : success ? 'border-green-500' : ''}`}
                disabled={success}
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                PIN incorrecto. Intenta nuevamente.
              </p>
            )}
            
            {success && (
              <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                ¡Autenticación exitosa!
              </p>
            )}
          </div>
          
          {!success && (
            <>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-2">🔓 Funciones desbloqueadas:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Añadir comentarios en cualquier día
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Acceso completo a configuraciones
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    Funciones de moderación avanzada
                  </li>
                </ul>
              </div>
              
              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={pin.length !== 8}
              >
                <Lock className="h-4 w-4" />
                Desbloquear funciones
              </Button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}