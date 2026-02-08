import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchLatestPetitions, type SimplePetition } from "@/lib/api";
import { FileText, PenLine, Users, ChevronRight, Loader2 } from "lucide-react";

export function HomePage() {
  const [petitions, setPetitions] = useState<SimplePetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPetitions() {
      try {
        const data = await fetchLatestPetitions();
        setPetitions(data);
      } catch (err) {
        console.warn("Failed to fetch petitions:", err);
        setError("Could not load petitions");
      } finally {
        setLoading(false);
      }
    }
    loadPetitions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-blue-100 p-4 rounded-full">
                <FileText className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
              Bringing Real Change
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              A platform for creating and signing petitions. With 0 costs to the tax payer and no Efass. Make your voice
              heard on issues that matter to you and your community.
            </p>

            <div className="pt-4">
              <Link
                to="/CreatePetition"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <PenLine className="w-5 h-5" />
                Create a Petition
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Petitions Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Latest Petitions
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">{error}</p>
          </div>
        ) : petitions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No petitions yet. Be the first to create one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {petitions.map((petition) => (
              <Link
                key={petition.id}
                to={`/Petition/${petition.slug}`}
                className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {petition.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 truncate dhivehi" dir="rtl">
                      {petition.title_Dhiv}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{petition.signatureCount}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
