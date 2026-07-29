"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { adminContact } from "@/lib/api";

type Reply = { id: string; body: string; createdAt: string };
type ContactMsg = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  updatedAt: string;
  replies: Reply[];
};

const STATUS_LABELS: Record<string, string> = { OPEN: "En attente", ANSWERED: "Répondu", CLOSED: "Fermé" };
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#FFF7E6", text: "#B45309" },
  ANSWERED: { bg: "#E1F5EE", text: "#0F6E56" },
  CLOSED: { bg: "#F3F4F6", text: "#6B7280" },
};

export default function AdminContactPage() {
  const [filter, setFilter] = useState<"" | "OPEN" | "ANSWERED" | "CLOSED">("OPEN");
  const [messages, setMessages] = useState<ContactMsg[] | null>(null);
  const [selected, setSelected] = useState<ContactMsg | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    adminContact.listMessages(filter || undefined).then((data: any) => setMessages(data));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function openMessage(m: ContactMsg) {
    const fresh: any = await adminContact.getMessage(m.id);
    setSelected(fresh);
  }

  async function submitReply() {
    if (!selected || !reply.trim()) return;
    setLoading(true);
    try {
      await adminContact.reply(selected.id, reply.trim());
      setReply("");
      const fresh: any = await adminContact.getMessage(selected.id);
      setSelected(fresh);
      load();
    } finally {
      setLoading(false);
    }
  }

  async function closeMessage() {
    if (!selected) return;
    await adminContact.close(selected.id);
    const fresh: any = await adminContact.getMessage(selected.id);
    setSelected(fresh);
    load();
  }

  return (
    <AdminLayout>
      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="text-sm text-teal font-medium mb-4">
            ← Retour à la liste
          </button>
          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <h1 className="font-display text-lg font-semibold">{selected.name}</h1>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[selected.status].bg, color: STATUS_COLORS[selected.status].text }}
              >
                {STATUS_LABELS[selected.status]}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {selected.email}
              {selected.phone ? ` — ${selected.phone}` : ""}
            </p>
          </div>
          <div className="space-y-3 mb-4">
            <div className="max-w-[80%] rounded-xl p-3 text-sm bg-white border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Visiteur</p>
              <p className="whitespace-pre-wrap">{selected.message}</p>
            </div>
            {selected.replies.map((r) => (
              <div key={r.id} className="max-w-[80%] rounded-xl p-3 text-sm bg-teal-light text-teal-dark ml-auto">
                <p className="text-xs text-gray-400 mb-1">Vous (envoyé par email)</p>
                <p className="whitespace-pre-wrap">{r.body}</p>
              </div>
            ))}
          </div>
          {selected.status !== "CLOSED" && (
            <div className="space-y-2">
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal resize-none"
                rows={3}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Votre réponse (envoyée par email au visiteur)…"
              />
              <div className="flex gap-2">
                <button
                  onClick={submitReply}
                  disabled={loading || !reply.trim()}
                  className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
                >
                  Répondre par email
                </button>
                <button onClick={closeMessage} className="text-sm text-gray-500 px-4 py-2">
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold mb-4">Contact</h1>
          <div className="flex gap-2 mb-6">
            {(["", "OPEN", "ANSWERED", "CLOSED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
                  filter === s ? "bg-teal text-white" : "bg-gray-50 border border-gray-200 text-gray-600 hover:border-teal"
                }`}
              >
                {s === "" ? "Tous" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {messages === null ? (
            <p className="text-gray-400 text-center py-16">Chargement…</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 text-center py-16">Aucun message dans cette catégorie.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => openMessage(m)}
                  className="w-full text-left bg-white border border-gray-100 rounded-xl p-4 hover:border-teal transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {m.email} —{" "}
                      {new Date(m.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[m.status].bg, color: STATUS_COLORS[m.status].text }}
                  >
                    {STATUS_LABELS[m.status]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
