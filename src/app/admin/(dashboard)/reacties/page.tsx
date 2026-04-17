"use client";

import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

interface Comment {
  id: number;
  author_name: string;
  message: string;
  approved: boolean | null;
  created_at: string | null;
}

type FilterTab = "all" | "pending" | "approved";

export default function ReactiesPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [autoApprove, setAutoApprove] = useState(false);
  const [savingAutoApprove, setSavingAutoApprove] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [commentsRes, settingsRes] = await Promise.all([
        fetch("/api/comments?approved=all"),
        fetch("/api/settings"),
      ]);
      const commentsData = await commentsRes.json();
      const settingsData = await settingsRes.json();
      setComments(commentsData);
      setAutoApprove(settingsData.auto_approve_comments === "true");
    } catch {
      toast.error("Kan data niet laden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAutoApproveToggle = async () => {
    setSavingAutoApprove(true);
    const newValue = !autoApprove;
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "auto_approve_comments", value: String(newValue) }),
      });
      if (!res.ok) throw new Error();
      setAutoApprove(newValue);
      toast.success(`Auto-keuren ${newValue ? "ingeschakeld" : "uitgeschakeld"}`);
    } catch {
      toast.error("Instelling opslaan mislukt");
    } finally {
      setSavingAutoApprove(false);
    }
  };

  const handleApprove = async (id: number, approved: boolean) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (!res.ok) throw new Error();
      toast.success(approved ? "Reactie goedgekeurd" : "Reactie afgekeurd");
      fetchData();
    } catch {
      toast.error("Actie mislukt");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Reactie definitief verwijderen?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Reactie verwijderd");
      fetchData();
    } catch {
      toast.error("Verwijderen mislukt");
    }
  };

  const filteredComments = comments.filter((c) => {
    if (activeTab === "pending") return !c.approved;
    if (activeTab === "approved") return c.approved;
    return true;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "Alle", count: comments.length },
    { key: "pending", label: "Wachtrij", count: comments.filter((c) => !c.approved).length },
    { key: "approved", label: "Goedgekeurd", count: comments.filter((c) => c.approved).length },
  ];

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-headline text-secondary">Reacties</h1>
        <p className="text-on-surface-variant mt-1 text-sm">Modereer bezoekersreacties en beheer goedkeuring.</p>
      </div>

      {/* Auto-approve toggle */}
      <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-on-surface">Auto-keuren</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Nieuwe reacties automatisch goedkeuren zonder moderatie.</p>
          </div>
          <button
            onClick={handleAutoApproveToggle}
            disabled={savingAutoApprove}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              autoApprove ? "bg-primary-container" : "bg-outline-variant/30"
            } disabled:opacity-50`}
            role="switch"
            aria-checked={autoApprove}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                autoApprove ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-secondary text-white"
                : "bg-white border border-outline-variant/20 text-on-surface-variant hover:border-secondary/30"
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Comments table */}
      <div className="bg-white rounded-xl border border-outline-variant/15 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-sm text-on-surface-variant text-center py-12">Laden...</p>
        ) : filteredComments.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-12">Geen reacties gevonden.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant/10">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs">Auteur</th>
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs">Bericht</th>
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs">Datum</th>
                <th className="text-left px-6 py-3 font-semibold text-on-surface-variant text-xs">Status</th>
                <th className="text-right px-6 py-3 font-semibold text-on-surface-variant text-xs">Acties</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.map((comment) => (
                <tr key={comment.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50">
                  <td className="px-6 py-3 font-medium text-on-surface whitespace-nowrap">{comment.author_name}</td>
                  <td className="px-6 py-3 text-on-surface-variant max-w-xs">
                    <span className="line-clamp-2">{comment.message}</span>
                  </td>
                  <td className="px-6 py-3 text-on-surface-variant whitespace-nowrap text-xs">{formatDate(comment.created_at)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${comment.approved ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {comment.approved ? "Goedgekeurd" : "Wachtrij"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!comment.approved ? (
                        <button
                          onClick={() => handleApprove(comment.id, true)}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-semibold hover:bg-green-700"
                        >
                          Goedkeuren
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(comment.id, false)}
                          className="text-xs border border-amber-300 text-amber-700 px-3 py-1.5 rounded font-semibold hover:bg-amber-50"
                        >
                          Afkeuren
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded font-semibold hover:bg-red-50"
                      >
                        Verwijder
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
