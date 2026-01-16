import { Loader2 } from "lucide-react";
import type { Language } from "@/types/petition";

interface LoadingStateProps {
  language?: Language;
}

export function LoadingState({ language = "en" }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center p-10 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      <span className={language === "dv" ? "dhivehi" : ""}>
        {language === "en" ? "Loading petition..." : "ޕެޓިޝަން ލޯޑުވަނީ..."}
      </span>
    </div>
  );
}
