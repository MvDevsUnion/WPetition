import { useState } from "react";
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

function getPetitionIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  return id;
}

function App() {
  const petitionId = getPetitionIdFromUrl();
  const { petition, loading, error, refetch } = usePetition(petitionId);
  const { language, setLanguage } = useLanguage();
  const [showTweetModal, setShowTweetModal] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    idCard: string;
    signature: string;
    turnstileToken: string;
  }) => {
    if (!petitionId) throw new Error("No petition ID");

    await submitSignature(petitionId, data);

    // Show tweet modal after successful submission
    setShowTweetModal(true);

    // Refresh petition data to update signature count
    setTimeout(() => {
      refetch();
    }, 1000);
  };

  // No petition ID in URL
  if (!petitionId) {
    return (
      <div className="min-h-screen bg-background p-5">
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-10">
          <ErrorState message="No petition ID found in URL. Please provide a valid petition URL." />
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

                <AuthorCard
                  author={petition.authorDetails}
                  language={language}
                />

                <PetitionBody
                  bodyEng={petition.petitionBodyEng}
                  bodyDhiv={petition.petitionBodyDhiv}
                  language={language}
                />

                <SignatureForm language={language} onSubmit={handleSubmit} />

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

export default App;
