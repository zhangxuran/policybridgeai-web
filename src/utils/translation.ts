/**
 * Translation utilities for auto-translating Chinese to English
 * Uses DeepSeek API for high-quality translation
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
 * Translate Chinese text to English using DeepSeek API
 */
export async function translateChineseToEnglish(text: string): Promise<string> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-662a5ce6198e49ab8d51ff9be78a0757'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator specializing in legal and business terminology. Translate the following Chinese text to English. Keep the translation concise, professional, and accurate. Only return the translated text without any explanations or additional comments.'
          },
          {
            role: 'user',
            content: `Translate to English: ${text}`
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
    
    console.log(`🌐 Translated: "${text}" → "${translation}"`);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback: return original text with a marker
    return `[${text}]`;
  }
}

/**
 * Translate multiple Chinese segments in batch
 */
export async function batchTranslate(segments: string[]): Promise<string[]> {
  if (segments.length === 0) return [];
  
  // If only one segment, translate directly
  if (segments.length === 1) {
    const translation = await translateChineseToEnglish(segments[0]);
    return [translation];
  }

  try {
    // Combine all segments with separator
    const combined = segments.map((s, i) => `[${i}] ${s}`).join('\n');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-662a5ce6198e49ab8d51ff9be78a0757'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional translator. Translate each numbered line from Chinese to English. Keep the same format with numbers. Only return the translations without explanations.'
          },
          {
            role: 'user',
            content: `Translate each line to English:\n${combined}`
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
        translations.push(await translateChineseToEnglish(segments[i]));
      }
    }
    
    return translations;
  } catch (error) {
    console.error('Batch translation error:', error);
    // Fallback: translate individually
    return Promise.all(segments.map(s => translateChineseToEnglish(s)));
  }
}

/**
 * Auto-detect and translate Chinese text to English
 * This is the main function to use in your components
 */
export async function autoTranslateChinese(text: string): Promise<string> {
  // 1. Check if text contains Chinese
  if (!containsChinese(text)) {
    return text;
  }

  console.log('🔍 Detected Chinese in text, translating...');

  try {
    // 2. Extract all Chinese segments
    const segments = extractChineseSegments(text);
    
    if (segments.length === 0) {
      return text;
    }

    console.log(`📝 Found ${segments.length} Chinese segment(s)`);

    // 3. Batch translate all segments
    const originalTexts = segments.map(s => s.original);
    const translations = await batchTranslate(originalTexts);

    // 4. Replace Chinese with English (from end to start to preserve indices)
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
 */
const translationCache = new Map<string, string>();

/**
 * Translate with caching
 */
export async function translateWithCache(text: string): Promise<string> {
  if (translationCache.has(text)) {
    console.log('💾 Using cached translation');
    return translationCache.get(text)!;
  }
  
  const translation = await autoTranslateChinese(text);
  translationCache.set(text, translation);
  return translation;
}

/**
 * Clear translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
  console.log('🗑️ Translation cache cleared');
}
