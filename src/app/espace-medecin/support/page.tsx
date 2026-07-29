"use client";

import { useEffect, useState } from "react";
import { DoctorLayout } from "@/components/DoctorLayout";
import { support } from "@/lib/api";

type Message = { id: string; authorType: "USER" | "ADMIN"; body: string; createdAt: string };
type Ticket = { id: string; subject: string; status: "OPEN" | "ANSWERED" | "CLOSED"; messages: Message[]; updatedAt: string };

const STATUS_LABELS: Record<string, string> = { OPEN: "En attente", ANSWERED: "Répondu", CLOSED: "Fermé" };
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: "#FFF7E6", text: "#B45309" },
  ANSWERED: { bg: "#E1F5EE", text: "#0F6E56" },
  CLOSED: { bg: "#F3F4F6", text: "#6B7280" },
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    support.listMyTickets().then((data: any) => setTickets(data));
  }

  useEffect(() => {
    load();
  }, []);

  async function submitNew(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!subject.trim() || !message.trim()) {
      setError("Merci de remplir le sujet et le message.");
      return;
    }
    setLoading(true);
    try {
      await support.createTicket({ subject: subject.trim(), message: message.trim() });
      setSubject("");
      setMessage("");
      setCreating(false);
      load();
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function submitReply(ticketId: string) {
    if (!reply.trim()) return;
    setLoading(true);
    try {
      await support.addMessage(ticketId, reply.trim());
      setReply("");
      const updated: any = await support.getTicket(ticketId);
      setSelected(updated);
      load();
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DoctorLayout>
      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="text-sm text-teal font-medium mb-4">
            ← Retour à mes messages
          </button>
          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <h1 className="font-display text-lg font-semibold">{selected.subject}</h1>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[selected.status].bg, color: STATUS_COLORS[selected.status].text }}
              >
                {STATUS_LABELS[selected.status]}
              </span>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            {selected.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-xl p-3 text-sm ${
                  m.authorType === "ADMIN" ? "bg-teal-light text-teal-dark" : "bg-white border border-gray-100 ml-auto"
                }`}
              >
                <p className="text-xs text-gray-400 mb-1">{m.authorType === "ADMIN" ? "SeneDoc" : "Vous"}</p>
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
            ))}
          </div>
          {selected.status !== "CLOSED" && (
            <div className="flex gap-2">
              <textarea
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal resize-none"
                rows={2}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Votre message…"
              />
              <button
                onClick={() => submitReply(selected.id)}
                disabled={loading || !reply.trim()}
                className="bg-teal text-white px-4 rounded-lg font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl font-semibold">Support</h1>
            {!creating && (
              <button
                onClick={() => setCreating(true)}
                className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors"
              >
                + Nouveau message
              </button>
            )}
          </div>

          {creating && (
            <form onSubmit={submitNew} className="bg-white border border-gray-100 rounded-xl p-5 mb-6 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Sujet</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex : Problème pour rejoindre ma téléconsultation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal resize-none"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre problème…"
                />
              </div>
              {error && <p className="text-sm text-coral">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors disabled:opacity-60"
                >
                  {loading ? "Envoi…" : "Envoyer"}
                </button>
                <button type="button" onClick={() => setCreating(false)} className="text-sm text-gray-500">
                  Annuler
                </button>
              </div>
            </form>
          )}

          {tickets === null ? (
            <p className="text-gray-400 text-center py-16">Chargement…</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500 text-center py-16">
              Aucun message pour l&apos;instant. Une question, un problème ? Écrivez-nous.
            </p>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="w-full text-left bg-white border border-gray-100 rounded-xl p-4 hover:border-teal transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{t.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(t.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[t.status].bg, color: STATUS_COLORS[t.status].text }}
                  >
                    {STATUS_LABELS[t.status]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </DoctorLayout>
  );
}
