import { Button } from "@/components/ui/button";
import type { Language } from "@/types/petition";

interface LanguageSwitcherProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageSwitcher({
  language,
  onLanguageChange,
}: LanguageSwitcherProps) {
  return (
    <div className="flex gap-1 justify-end mb-6">
      <div className="bg-slate-100 p-1 rounded-full inline-flex border border-slate-200">
        <Button
          variant={language === "en" ? "default" : "ghost"}
          size="sm"
          onClick={() => onLanguageChange("en")}
          className={`rounded-full px-4 text-sm font-medium transition-all ${
            language === "en"
              ? "shadow-sm bg-white text-slate-900 border border-slate-200"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          English
        </Button>
        <Button
          variant={language === "dv" ? "default" : "ghost"}
          size="sm"
          onClick={() => onLanguageChange("dv")}
          className={`rounded-full px-4 text-sm font-medium transition-all dhivehi ${
            language === "dv"
              ? "shadow-sm bg-white text-slate-900 border border-slate-200"
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          ދިވެހި
        </Button>
      </div>
    </div>
  );
}
