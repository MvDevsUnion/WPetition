import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitPetition, type PetitionFormData } from "@/lib/api";
import {
  FileText,
  Send,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

function GuidelinesModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Before You Create a Petition
            </h2>
          </div>

          <div className="space-y-4 text-slate-700">
            <p>
              Please familiarize yourself with the laws and regulations for
              drafting a petition:
            </p>

            <a
              href="https://majlis.gov.mv/en/pes/petitions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              majlis.gov.mv/en/pes/petitions
            </a>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">
                If you skip this step, there is a 100% chance we will reject
                hosting your petition.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <p className="font-semibold text-slate-800">Important Rules (TLDR):</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">1.</span>
                  <span>
                    You <strong>cannot</strong> mention people or businesses
                    directly in your petition.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">2.</span>
                  <span>
                    You <strong>cannot</strong> petition for something that only
                    benefits yourself.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">3.</span>
                  <span>
                    <strong>No anonymous petitions.</strong> Your Name and NID
                    will appear publicly on the petition. The submitter's
                    identity is always visible.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={onAccept}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              I Understand, Continue
            </button>
            <a
              href="https://majlis.gov.mv/en/pes/petitions"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-lg transition-colors text-center"
            >
              Read Full Guidelines First
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreatePetitionPage() {
  const navigate = useNavigate();
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slug: string } | null>(null);

  const [formData, setFormData] = useState<PetitionFormData>({
    slug: "",
    nameDhiv: "",
    nameEng: "",
    startDate: formatDateForInput(new Date()),
    authorName: "",
    authorNid: "",
    petitionBodyDhiv: "",
    petitionBodyEng: "",
  });

  function formatDateForInput(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateSlug = () => {
    const slug = formData.nameEng
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitPetition(formData);
      setSuccess({ slug: result.slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit petition");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-10">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Petition Created Successfully!
            </h1>
            <p className="text-slate-600">
              Your petition has been submitted and is now live.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <button
                onClick={() => navigate(`/Petition/${success.slug}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                View Petition
              </button>
              <button
                onClick={() => {
                  setSuccess(null);
                  setFormData({
                    slug: "",
                    nameDhiv: "",
                    nameEng: "",
                    startDate: formatDateForInput(new Date()),
                    authorName: "",
                    authorNid: "",
                    petitionBodyDhiv: "",
                    petitionBodyEng: "",
                  });
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      {showGuidelines && (
        <GuidelinesModal onAccept={() => setShowGuidelines(false)} />
      )}

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-10 animate-in fade-in duration-500 slide-in-from-bottom-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-100 p-3 rounded-full">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Create a New Petition
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Petition Names */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Petition Name (English) *
              </label>
              <input
                type="text"
                name="nameEng"
                value={formData.nameEng}
                onChange={handleChange}
                onBlur={() => !formData.slug && generateSlug()}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter petition title in English"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Petition Name (Dhivehi) *
              </label>
              <input
                type="text"
                name="nameDhiv"
                value={formData.nameDhiv}
                onChange={handleChange}
                required
                dir="rtl"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-dhivehi"
                placeholder="ދިވެހި ނަން ލިޔުއްވާ"
              />
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              URL Slug *
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                pattern="[a-z0-9-]+"
                className="flex-1 min-w-0 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="my-petition-name"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1 break-all">
              URL: /Petition/{formData.slug || "your-slug"}
            </p>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Date *
            </label>
            <input
              type="text"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              pattern="\d{2}-\d{2}-\d{4}"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="dd-MM-yyyy"
            />
          </div>

          {/* Author Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Author Name *
              </label>
              <input
                type="text"
                name="authorName"
                value={formData.authorName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter author name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Author National ID *
              </label>
              <input
                type="text"
                name="authorNid"
                value={formData.authorNid}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="A123456"
              />
            </div>
          </div>

          {/* Petition Bodies */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Petition Body (English) *
            </label>
            <textarea
              name="petitionBodyEng"
              value={formData.petitionBodyEng}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
              placeholder="Enter the full petition text in English..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Petition Body (Dhivehi) *
            </label>
            <textarea
              name="petitionBodyDhiv"
              value={formData.petitionBodyDhiv}
              onChange={handleChange}
              required
              rows={6}
              dir="rtl"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y font-dhivehi"
              placeholder="ޕެޓިޝަންގެ ތަފްސީލް ދިވެހި ބަހުން ލިޔުއްވާ..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Create Petition
              </>
            )}
          </button>
        </form>
      </div>

      <footer className="text-center text-slate-500 text-sm mt-6 pb-4">
        Powered by Mv Devs Union
      </footer>
    </div>
  );
}
