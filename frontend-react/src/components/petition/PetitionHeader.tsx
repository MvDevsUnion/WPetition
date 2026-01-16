import { Badge } from "@/components/ui/badge";
import type { PetitionDetails, Language } from "@/types/petition";

interface PetitionHeaderProps {
  petition: PetitionDetails;
  language: Language;
}

export function PetitionHeader({ petition, language }: PetitionHeaderProps) {
  const isRtl = language === "dv";

  return (
    <div className="border-b border-slate-100 pb-6 mb-8">
      {language === "en" ? (
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight leading-tight">
          {petition.nameEng}
        </h1>
      ) : (
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 dhivehi leading-relaxed line-clamp-3">
          {petition.nameDhiv}
        </h1>
      )}

      <div
        className={`flex flex-wrap gap-3 mt-4 ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <Badge
          variant="secondary"
          className={`text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 border-0 ${isRtl ? "dhivehi" : ""}`}
        >
          {language === "en" ? "Start Date:" : "ފެށި ތާރީހު:"}{" "}
          <span className="font-semibold ml-1">{petition.startDate}</span>
        </Badge>
        <Badge
          variant="secondary"
          className={`text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 ${isRtl ? "dhivehi" : ""}`}
        >
          {language === "en" ? "Signatures:" : "ސޮއި:"}{" "}
          <span className="font-bold ml-1">{petition.signatureCount}</span>
        </Badge>
      </div>
    </div>
  );
}
