// src/hooks/useTranslator.ts

import { useState, useCallback, useRef } from "react";
import { AITranslationService } from "@/services/ai-translator";
import { Language, TranslationResult } from "@/types/translator";

export function useTranslator() {
  const [input, setInput] = useState("");
  const [sourceLang, setSourceLang] = useState<Language>("es");
  const [targetLang, setTargetLang] = useState<Language>("en");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"translation" | "analysis" | "conjugations" | "tips">("translation");

  // Para cancelar peticiones pendientes
  const abortControllerRef = useRef<AbortController | null>(null);

  const swapLanguages = useCallback(() => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (result) {
      setInput(result.translation);
      setResult(null);
    }
  }, [sourceLang, targetLang, result]);

  const translate = useCallback(async () => {
    if (!input.trim()) {
      setError("Por favor, ingresa un texto para traducir");
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsTranslating(true);
    setError(null);

    try {
      const service = AITranslationService.getInstance();
      const translationResult = await service.analyzeAndTranslate(
        input,
        sourceLang,
        targetLang
      );

      if (!abortController.signal.aborted) {
        setResult(translationResult);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Traducción cancelada');
      } else {
        setError(err.message || "Error al procesar la traducción");
        console.error("Error en traducción:", err);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsTranslating(false);
        abortControllerRef.current = null;
      }
    }
  }, [input, sourceLang, targetLang]);

  // Debounce automático (opcional)
  const handleInputChange = useCallback((text: string) => {
    setInput(text);
    // Podrías agregar debounce automático aquí si lo deseas
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const speakText = useCallback((text: string, lang: Language) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "es" ? "es-ES" : 
                      lang === "en" ? "en-US" : 
                      "fr-FR";
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Limpiar al desmontar
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    // Estado
    input,
    sourceLang,
    targetLang,
    result,
    isTranslating,
    error,
    activeTab,
    
    // Setters
    setInput: handleInputChange,
    setSourceLang,
    setTargetLang,
    setActiveTab,
    setError,
    
    // Acciones
    swapLanguages,
    translate,
    copyToClipboard,
    speakText,
    cleanup
  };
}