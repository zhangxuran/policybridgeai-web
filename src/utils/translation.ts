/**
 * Translation utilities for auto-translating Chinese to multiple languages
 * Uses DeepSeek API for high-quality translation
 * Supports: English, French, German
 */

/**
 * Check if text contains Chinese characters
 */
export function containsChinese(text: string): boolean {
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(text);
}

/**
 * Extract all Chinese segments from text
 */
export function extractChineseSegments(text: string): Array<{
  original: string;
  start: number;
  end: number;
}> {
  // Match continuous Chinese characters, including punctuation
  const chineseRegex = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]+/g;
  const segments: Array<{ original: string; start: number; end: number }> = [];
  let match;
  
  while ((match = chineseRegex.exec(text)) !== null) {
    segments.push({
      original: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  return segments;
}

/**
 * Get target language name for translation prompt
 */
function getTargetLanguageName(langCode: string): string {
  const languageMap: Record<string, string> = {
    'en': 'English',
    'fr': 'French',
    'de': 'German',
    'zh': 'Chinese'
  };
  return languageMap[langCode] || 'English';
}

/**
 * Translate Chinese text to target language using DeepSeek API
 * @param text - The Chinese text to translate
 * @param targetLang - Target language code ('en', 'fr', 'de')
 */
export async function translateChineseToTargetLanguage(text: string, targetLang: string = 'en'): Promise<string> {
  try {
    const targetLanguageName = getTargetLanguageName(targetLang);
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in legal and business terminology. Translate the following Chinese text to ${targetLanguageName}. Keep the translation concise, professional, and accurate. Only return the translated text without any explanations or additional comments.`
          },
          {
            role: 'user',
            content: `Translate to ${targetLanguageName}: ${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const translation = data.choices[0].message.content.trim();
    
    console.log(`🌐 Translated (${targetLanguageName}): "${text}" → "${translation}"`);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback: return original text with a marker
    return `[${text}]`;
  }
}

/**
 * Translate Chinese text to English using DeepSeek API (backward compatibility)
 */
export async function translateChineseToEnglish(text: string): Promise<string> {
  return translateChineseToTargetLanguage(text, 'en');
}

/**
 * Translate multiple Chinese segments in batch
 * @param segments - Array of Chinese text segments
 * @param targetLang - Target language code ('en', 'fr', 'de')
 */
export async function batchTranslate(segments: string[], targetLang: string = 'en'): Promise<string[]> {
  if (segments.length === 0) return [];
  
  // If only one segment, translate directly
  if (segments.length === 1) {
    const translation = await translateChineseToTargetLanguage(segments[0], targetLang);
    return [translation];
  }

  try {
    const targetLanguageName = getTargetLanguageName(targetLang);
    
    // Combine all segments with separator
    const combined = segments.map((s, i) => `[${i}] ${s}`).join('\n');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate each numbered line from Chinese to ${targetLanguageName}. Keep the same format with numbers. Only return the translations without explanations.`
          },
          {
            role: 'user',
            content: `Translate each line to ${targetLanguageName}:\n${combined}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();
    
    // Parse the numbered translations
    const translations: string[] = [];
    const lines = translatedText.split('\n');
    
    for (let i = 0; i < segments.length; i++) {
      const line = lines.find(l => l.startsWith(`[${i}]`));
      if (line) {
        translations.push(line.replace(`[${i}]`, '').trim());
      } else {
        // Fallback to individual translation
        translations.push(await translateChineseToTargetLanguage(segments[i], targetLang));
      }
    }
    
    return translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    // Fallback: translate individually
    return Promise.all(segments.map(s => translateChineseToTargetLanguage(s, targetLang)));
  }
}

/**
 * Auto-detect and translate Chinese text to target language
 * This is the main function to use in your components
 * @param text - The text that may contain Chinese
 * @param targetLang - Target language code ('en', 'fr', 'de')
 */
export async function autoTranslateChinese(text: string, targetLang: string = 'en'): Promise<string> {
  // 1. Check if text contains Chinese
  if (!containsChinese(text)) {
    return text;
  }

  const targetLanguageName = getTargetLanguageName(targetLang);
  console.log(`🔍 Detected Chinese in text, translating to ${targetLanguageName}...`);

  try {
    // 2. Extract all Chinese segments
    const segments = extractChineseSegments(text);
    
    if (segments.length === 0) {
      return text;
    }

    console.log(`📝 Found ${segments.length} Chinese segment(s)`);

    // 3. Batch translate all segments
    const originalTexts = segments.map(s => s.original);
    const translations = await batchTranslate(originalTexts, targetLang);

    // 4. Replace Chinese with translated text (from end to start to preserve indices)
    let result = text;
    for (let i = segments.length - 1; i >= 0; i--) {
      const segment = segments[i];
      const translation = translations[i];
      result = 
        result.substring(0, segment.start) + 
        translation + 
        result.substring(segment.end);
    }

    console.log('✅ Translation completed');
    return result;
  } catch (error) {
    console.error('Auto-translation failed:', error);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Translation cache to avoid re-translating the same text
 * Key format: `${text}|${targetLang}`
 */
const translationCache = new Map<string, string>();

/**
 * Translate with caching
 * @param text - The text that may contain Chinese
 * @param targetLang - Target language code ('en', 'fr', 'de')
 */
export async function translateWithCache(text: string, targetLang: string = 'en'): Promise<string> {
  const cacheKey = `${text}|${targetLang}`;
  
  if (translationCache.has(cacheKey)) {
    console.log('💾 Using cached translation');
    return translationCache.get(cacheKey)!;
  }
  
  const translation = await autoTranslateChinese(text, targetLang);
  translationCache.set(cacheKey, translation);
  return translation;
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
  console.log('🗑️ Translation cache cleared');
}
