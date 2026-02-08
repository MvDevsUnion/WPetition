import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { usePetition } from "@/hooks/usePetition";
import { useLanguage } from "@/hooks/useLanguage";
import { submitSignature } from "@/lib/api";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LoadingState } from "@/components/layout/LoadingState";
import { ErrorState } from "@/components/layout/ErrorState";
import { PetitionHeader } from "@/components/petition/PetitionHeader";
import { AuthorCard } from "@/components/petition/AuthorCard";
import { PetitionBody } from "@/components/petition/PetitionBody";
import { SignatureForm } from "@/components/signature/SignatureForm";
import { TweetModal } from "@/components/TweetModal";
import { PenLine } from "lucide-react";

export function PetitionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { petition, loading, error, refetch } = usePetition(slug ?? null);
  const { language, setLanguage } = useLanguage();
  const [showTweetModal, setShowTweetModal] = useState(false);
  const signatureFormRef = useRef<HTMLDivElement>(null);

  const scrollToSignForm = () => {
    signatureFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleSubmit = async (data: {
    name: string;
    idCard: string;
    signature: string;
    turnstileToken: string;
  }) => {
    if (!petition?.id) throw new Error("No petition ID");

    await submitSignature(petition.id, data);

    // Show tweet modal after successful submission
    setShowTweetModal(true);

    // Refresh petition data to update signature count
    setTimeout(() => {
      refetch();
    }, 1000);
  };

  // No slug in URL
  if (!slug) {
    return (
      <div className="min-h-screen bg-background p-5">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-10">
          <ErrorState message="No petition found. Please use a valid petition URL." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-10 animate-in fade-in duration-500 slide-in-from-bottom-4">
        {loading ? (
          <div className="min-h-[400px] flex flex-col justify-center">
            <LoadingState language={language} />
          </div>
        ) : (
          <>
            {error && <ErrorState message={error} />}

            {petition && (
              <div className="space-y-8">
                <LanguageSwitcher
                  language={language}
                  onLanguageChange={setLanguage}
                />

                <PetitionHeader petition={petition} language={language} />

                <button
                  onClick={scrollToSignForm}
                  className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors ${language === "dv" ? "flex-row-reverse dhivehi" : ""}`}
                >
                  <PenLine className="w-5 h-5" />
                  {language === "dv" ? "މިހާރު ސޮއި ކުރައްވާ" : "Sign Now"}
                </button>

                <AuthorCard
                  author={petition.authorDetails}
                  language={language}
                />

                <PetitionBody
                  bodyEng={petition.petitionBodyEng}
                  bodyDhiv={petition.petitionBodyDhiv}
                  language={language}
                />

                <div ref={signatureFormRef}>
                  <SignatureForm language={language} onSubmit={handleSubmit} />
                </div>

                <TweetModal
                  open={showTweetModal}
                  onClose={() => setShowTweetModal(false)}
                  petition={petition}
                  language={language}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
