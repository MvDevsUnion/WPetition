import { useState, useEffect, useCallback } from "react";
import type { Language } from "@/types/petition";

function getLangFromUrl(): Language {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get("lang");
  return lang === "dv" ? "dv" : "en";
}

function updateUrlWithLang(lang: Language): void {
  const urlParams = new URLSearchParams(window.location.search);
  if (lang === "en") {
    urlParams.delete("lang");
  } else {
    urlParams.set("lang", lang);
  }
  const newUrl =
    window.location.pathname +
    (urlParams.toString() ? "?" + urlParams.toString() : "");
  window.history.pushState({}, "", newUrl);
}

interface UseLanguageResult {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: <T>(en: T, dv: T) => T;
}

export function useLanguage(): UseLanguageResult {
  const [language, setLanguageState] = useState<Language>(() =>
    getLangFromUrl(),
  );

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    updateUrlWithLang(lang);

    // Set document direction for RTL languages (Dhivehi uses RTL script)
    document.documentElement.dir = lang === "dv" ? "rtl" : "ltr";
  }, []);

  // Set initial direction on mount
  useEffect(() => {
    document.documentElement.dir = language === "dv" ? "rtl" : "ltr";
  }, [language]);

  // Helper function to get text based on current language
  const t = useCallback(
    <T>(en: T, dv: T): T => {
      return language === "dv" ? dv : en;
    },
    [language],
  );

  return {
    language,
    setLanguage,
    t,
  };
}
