import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Author, Language } from "@/types/petition";

interface AuthorCardProps {
  author: Author;
  language: Language;
}

export function AuthorCard({ author, language }: AuthorCardProps) {
  const isRtl = language === "dv";

  return (
    <Card className="mb-8 border border-slate-100 shadow-sm bg-slate-50/50">
      <CardHeader className="pb-2">
        <CardTitle
          className={`text-sm font-medium text-slate-500 uppercase tracking-wider ${isRtl ? "dhivehi" : ""}`}
        >
          {language === "en" ? "Author Details" : "ލިޔުންތެރިގެ މައުލޫމާތު"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={`text-lg font-medium text-slate-900 ${isRtl ? "dhivehi" : ""}`}
        >
          {author.name}
        </p>
      </CardContent>
    </Card>
  );
}
