/**
 * Utilidades para manejar problemas de encoding en textos
 */

// Mapa de caracteres especiales a escapes Unicode
export const CHAR_MAP: Record<string, string> = {
  'á': '\\u00E1',
  'é': '\\u00E9',
  'í': '\\u00ED',
  'ó': '\\u00F3',
  'ú': '\\u00FA',
  'ñ': '\\u00F1',
  'Á': '\\u00C1',
  'É': '\\u00C9',
  'Í': '\\u00CD',
  'Ó': '\\u00D3',
  'Ú': '\\u00DA',
  'Ñ': '\\u00D1',
  '¿': '\\u00BF',
  '¡': '\\u00A1',
  'ü': '\\u00FC',
  'Ü': '\\u00DC',
};

// Convierte texto con caracteres especiales a safe string
export const toSafeString = (text: string): string => {
  return text.replace(/[áéíóúñÁÉÍÓÚÑ¿¡üÜ]/g, (char) => CHAR_MAP[char] || char);
};

// Decodifica escapes Unicode a caracteres normales
export const fromSafeString = (text: string): string => {
  return text.replace(/\\u[\dA-F]{4}/gi, (match) => {
    try {
      return JSON.parse(`"${match}"`);
    } catch {
      return match;
    }
  });
};

// Helper para asegurar que todos los textos en la app sean UTF-8
export const ensureUTF8 = (text: string): string => {
  // Si el texto ya parece tener problemas, intentamos arreglarlo
  if (text.includes('��')) {
    // Intenta decodificar desde Latin-1
    try {
      const latin1Bytes = new Uint8Array(text.split('').map(c => c.charCodeAt(0)));
      const decoder = new TextDecoder('latin-1');
      return decoder.decode(latin1Bytes);
    } catch {
      // Si falla, devuelve el texto corregido manualmente
      return text
        .replace(/���/g, 'í')
        .replace(/��/g, 'ó')
        .replace(/�/g, 'é')
        .replace(/��/g, 'á')
        .replace(/��/g, 'ñ')
        .replace(/��/g, '¿');
    }
  }
  return text;
};