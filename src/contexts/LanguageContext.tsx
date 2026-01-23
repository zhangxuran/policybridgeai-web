import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<string>(() => {
    // Initialize from i18n immediately
    return i18n.language || 'en';
  });

  useEffect(() => {
    // Sync with i18n language changes
    const handleLanguageChanged = (lng: string) => {
      setLanguageState(lng);
      console.log('✅ Language changed to:', lng);
    };

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChanged);

    // Set initial language
    const currentLanguage = i18n.language || 'en';
    setLanguageState(currentLanguage);
    console.log('✅ Language initialized:', currentLanguage);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const setLanguage = (lang: string) => {
    localStorage.setItem('i18nextLng', lang);
    localStorage.setItem('preferred_language', lang);
    i18n.changeLanguage(lang);
    // setLanguageState will be updated via the languageChanged event listener
    console.log('✅ Language change requested:', lang);
  };

  const value = {
    language,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
