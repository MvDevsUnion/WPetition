import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminPetitions,
  createPetitionFolder,
  getExportUrl,
  getToken,
  clearToken,
  updatePetitionApproval,
  type AdminPetition,
} from "@/lib/adminApi";
import {
  Loader2,
  LogOut,
  FileDown,
  FolderPlus,
  Users,
  ShieldCheck,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
} from "lucide-react";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [petitions, setPetitions] = useState<AdminPetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderMsg, setFolderMsg] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      navigate("/admin/login");
      return;
    }
    loadPetitions();
  }, [navigate]);

  async function loadPetitions() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPetitions();
      setPetitions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load petitions");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFolder() {
    setFolderMsg(null);
    try {
      const msg = await createPetitionFolder();
      setFolderMsg(msg);
    } catch (err) {
      setFolderMsg(
        err instanceof Error ? err.message : "Failed to create folder",
      );
    }
  }

  async function handleToggleApproval(petition: AdminPetition) {
    setTogglingId(petition.id);
    try {
      await updatePetitionApproval(petition.id, !petition.isApproved);
      await loadPetitions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update approval",
      );
    } finally {
      setTogglingId(null);
    }
  }

  function handleLogout() {
    clearToken();
    navigate("/admin/login");
  }

  function handleExport(petitionId: string) {
    const token = getToken();
    if (!token) return;
    fetch(getExportUrl(petitionId), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          clearToken();
          navigate("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Export failed");
        return res.blob();
      })
      .then((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      })
      .catch(() => {
        setError("Failed to export petition");
      });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-slate-700" />
            <h1 className="text-lg font-semibold text-slate-900">
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateFolder}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-md px-2.5 py-1.5 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Create Folder
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 rounded-md px-2.5 py-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {folderMsg && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-4 py-2.5 mb-4">
            {folderMsg}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            All Petitions
          </h2>
          <span className="text-xs text-slate-400">
            {petitions.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : petitions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500 text-sm">No petitions found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Petition
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">
                    Slug
                  </th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Sigs
                  </th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-center px-4 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {petitions.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 text-sm">
                        {p.nameEng}
                      </div>
                      <div
                        className="text-xs text-slate-400 dhivehi mt-0.5"
                        dir="rtl"
                      >
                        {p.nameDhiv}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded">
                        {p.slug}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-slate-600 text-xs">
                        <Users className="w-3 h-3" />
                        {p.signatureCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-full px-2 py-0.5">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => navigate(`/Petition/${p.slug || p.id}`)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="View petition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleApproval(p)}
                          disabled={togglingId === p.id}
                          className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${
                            p.isApproved
                              ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                              : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
                          }`}
                          title={p.isApproved ? "Disapprove" : "Approve"}
                        >
                          {togglingId === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : p.isApproved ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleExport(p.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Export signatures"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
