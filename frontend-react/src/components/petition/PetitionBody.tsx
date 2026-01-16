import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import type { Language } from "@/types/petition";

interface PetitionBodyProps {
  bodyEng: string;
  bodyDhiv: string;
  language: Language;
}

export function PetitionBody({
  bodyEng,
  bodyDhiv,
  language,
}: PetitionBodyProps) {
  const content = language === "dv" ? bodyDhiv : bodyEng;
  const isRtl = language === "dv";

  const htmlContent = useMemo(() => {
    const raw = marked.parse(content) as string;
    return DOMPurify.sanitize(raw);
  }, [content]);

  return (
    <div className="mt-8">
      <div
        className={`leading-loose prose prose-slate max-w-none text-slate-800 md:prose-lg
          prose-p:mb-6 prose-p:mt-0 
          prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mb-6 prose-headings:mt-12
          
          [&_hr]:my-8! [&_hr]:border-slate-300!
          
          [&_ul]:list-disc! [&_ul]:my-6!
          [&_ol]:list-decimal! [&_ol]:my-6!
          [&_li]:my-2!
          [&_li::before]:content-none!
          
          ${isRtl ? "dhivehi dir-rtl text-right [&_ul]:pr-12! [&_ol]:pr-12!" : "text-left [&_ul]:pl-12! [&_ol]:pl-12!"}`}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
