import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import es from './locales/es.json';

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'zh', 'fr', 'de', 'it', 'es'];

// Custom language detector
const customLanguageDetector = {
  name: 'customDetector',
  lookup() {
    // First check localStorage (user's manual selection)
    const storedLang = localStorage.getItem('i18nextLng');
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
      return storedLang;
    }

    // Then check browser language
    const browserLangs = navigator.languages || [navigator.language];
    
    for (const lang of browserLangs) {
      // Extract main language code (e.g., 'zh' from 'zh-CN', 'en' from 'en-US')
      const mainLang = lang.split('-')[0].toLowerCase();
      
      if (SUPPORTED_LANGUAGES.includes(mainLang)) {
        return mainLang;
      }
    }

    // Default to English if no supported language found
    return 'en';
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem('i18nextLng', lng);
  }
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(customLanguageDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    detection: {
      order: ['customDetector'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;