import { Link } from "react-router-dom";
import { FileText, PenLine } from "lucide-react";

export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-10 animate-in fade-in duration-500 slide-in-from-bottom-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full">
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Petition.com.mv
          </h1>

          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            A platform for creating and signing petitions. Make your voice
            heard on issues that matter to you and your community.
          </p>

          <div className="bg-slate-50 rounded-lg p-6 mt-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Looking for a petition?
            </h2>
            <p className="text-slate-600">
              Use the direct link shared with you to view and sign a petition.
            </p>
          </div>

          <div className="pt-4">
            <Link
              to="/CreatePetition"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <PenLine className="w-5 h-5" />
              Create a Petition
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-center text-slate-500 text-sm mt-6 pb-4">
        Powered by Mv Devs Union
      </footer>
    </div>
  );
}
