/**
 * Configuración global para manejo de encoding UTF-8 en Windows
 */

// Detectar si estamos en Windows
const isWindows = typeof navigator !== 'undefined' && 
  navigator.userAgent && 
  navigator.userAgent.toLowerCase().includes('win');

export const ENCODING_CONFIG = {
  charset: 'UTF-8',
  language: 'es',
  isWindows: isWindows,
  
  // Caracteres específicos de español
  spanishChars: {
    'á': 'a',
    'é': 'e', 
    'í': 'i',
    'ó': 'o',
    'ú': 'u',
    'ñ': 'n',
    'Á': 'A',
    'É': 'E',
    'Í': 'I',
    'Ó': 'O',
    'Ú': 'U',
    'Ñ': 'N',
    '¿': '?',
    '¡': '!',
  } as Record<string, string>,
  
  // Corrección de caracteres mal codificados en Windows
  fixWindowsEncoding: (text: string): string => {
    if (!text || typeof text !== 'string') return text;
    
    // Reemplazar caracteres mal codificados comunes en Windows
    const replacements: Record<string, string> = {
      'Ã¡': 'á',
      'Ã©': 'é',
      'Ã­': 'í',
      'Ã³': 'ó',
      'Ãº': 'ú',
      'Ã±': 'ñ',
      'Ã': 'Á',
      'Ã‰': 'É',
      'Ã': 'Í',
      'Ã“': 'Ó',
      'Ãš': 'Ú',
      'Ã‘': 'Ñ',
      'Â¿': '¿',
      'Â¡': '¡',
      'â€�': '"',
      'â€™': "'",
    };
    
    let fixedText = text;
    Object.entries(replacements).forEach(([bad, good]) => {
      fixedText = fixedText.replace(new RegExp(bad, 'g'), good);
    });
    
    return fixedText;
  },
  
  // Convertir texto a ASCII seguro (para URLs, etc.)
  toAsciiSafe: (text: string): string => {
    return text.replace(/[^a-zA-Z0-9]/g, (char) => {
      return ENCODING_CONFIG.spanishChars[char] || '_';
    });
  },
  
  // Inicializar encoding en la aplicación
  initialize: (): void => {
    if (typeof document === 'undefined') return;
    
    try {
      // 1. Forzar charset en meta tags
      let metaCharset = document.querySelector('meta[charset]');
      if (!metaCharset) {
        metaCharset = document.createElement('meta');
        metaCharset.setAttribute('charset', ENCODING_CONFIG.charset);
        document.head.prepend(metaCharset);
      } else {
        metaCharset.setAttribute('charset', ENCODING_CONFIG.charset);
      }
      
      // 2. Agregar meta http-equiv
      let metaHttpEquiv = document.querySelector('meta[http-equiv="Content-Type"]');
      if (!metaHttpEquiv) {
        metaHttpEquiv = document.createElement('meta');
        metaHttpEquiv.setAttribute('http-equiv', 'Content-Type');
        metaHttpEquiv.setAttribute('content', `text/html; charset=${ENCODING_CONFIG.charset}`);
        document.head.appendChild(metaHttpEquiv);
      }
      
      // 3. Configurar idioma
      document.documentElement.lang = ENCODING_CONFIG.language;
      
      // 4. Agregar clase para Windows si es necesario
      if (ENCODING_CONFIG.isWindows) {
        document.documentElement.classList.add('windows-os');
      }
      
      console.log(`✅ Encoding configurado: ${ENCODING_CONFIG.charset}${ENCODING_CONFIG.isWindows ? ' (Windows)' : ''}`);
      
    } catch (error) {
      console.error('❌ Error configurando encoding:', error);
    }
  },
  
  // Aplicar correcciones a todo el texto de la página
  fixPageText: (): void => {
    if (typeof document === 'undefined' || !ENCODING_CONFIG.isWindows) return;
    
    try {
      // Solo corregir elementos de texto visible
      const textNodes = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li, td, th, a, button, label');
      
      textNodes.forEach(node => {
        if (node.textContent && node.textContent.trim()) {
          const original = node.textContent;
          const fixed = ENCODING_CONFIG.fixWindowsEncoding(original);
          
          if (original !== fixed) {
            node.textContent = fixed;
            
            // También corregir atributos title y alt
            if (node.hasAttribute('title')) {
              const title = node.getAttribute('title') || '';
              node.setAttribute('title', ENCODING_CONFIG.fixWindowsEncoding(title));
            }
            
            if (node.hasAttribute('alt')) {
              const alt = node.getAttribute('alt') || '';
              node.setAttribute('alt', ENCODING_CONFIG.fixWindowsEncoding(alt));
            }
          }
        }
      });
      
    } catch (error) {
      console.warn('⚠️ No se pudieron corregir todos los textos:', error);
    }
  }
};

// Inicializar al cargar la página
if (typeof window !== 'undefined') {
  // Inicializar inmediatamente si el DOM ya está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ENCODING_CONFIG.initialize();
      
      // Aplicar correcciones después de que React renderice
      setTimeout(() => {
        ENCODING_CONFIG.fixPageText();
      }, 100);
    });
  } else {
    ENCODING_CONFIG.initialize();
    setTimeout(() => {
      ENCODING_CONFIG.fixPageText();
    }, 100);
  }
}

export default ENCODING_CONFIG;