"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MessageRecord } from "@/lib/messages-store";

function shortText(input: string, max = 120): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max)}...`;
}

export default function MessagesAdminPanel({
  initialMessages,
}: {
  initialMessages: MessageRecord[];
}) {
  const [messages, setMessages] = useState<MessageRecord[]>(initialMessages);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "read" | "unread">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const filteredMessages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return messages.filter((message) => {
      if (statusFilter === "read" && !message.readAt) return false;
      if (statusFilter === "unread" && message.readAt) return false;
      if (!normalized) return true;

      const haystack = [message.name, message.email, message.subject, message.body]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [messages, query, statusFilter]);

  const unread = messages.filter((item) => !item.readAt).length;

  function toggleSelection(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  }

  function selectAllFiltered(checked: boolean) {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredMessages.map((message) => message.id));
  }

  async function patchRead(id: string, read: boolean) {
    const response = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read }),
    });
    return response.ok;
  }

  async function deleteOne(id: string) {
    const response = await fetch(`/api/admin/messages/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  }

  async function bulkMark(read: boolean) {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      const updated = new Set<string>();
      for (const id of selectedIds) {
        const ok = await patchRead(id, read);
        if (ok) updated.add(id);
      }

      if (updated.size > 0) {
        setMessages((prev) =>
          prev.map((item) => {
            if (!updated.has(item.id)) return item;
            return {
              ...item,
              readAt: read ? item.readAt || new Date().toISOString() : null,
            };
          }),
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function bulkDelete() {
    if (selectedIds.length === 0) return;
    const ok = window.confirm(`Supprimer ${selectedIds.length} message(s) ?`);
    if (!ok) return;

    setLoading(true);
    try {
      const deleted = new Set<string>();
      for (const id of selectedIds) {
        const success = await deleteOne(id);
        if (success) deleted.add(id);
      }

      if (deleted.size > 0) {
        setMessages((prev) => prev.filter((item) => !deleted.has(item.id)));
        setSelectedIds((prev) => prev.filter((id) => !deleted.has(id)));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="hero">
        <h1>Admin · Messages</h1>
        <p>
          Boite de reception des formulaires de contact. {messages.length} message(s), {unread} non lu(s).
        </p>
      </section>

      <section className="section">
        <h2>Messages recus</h2>

        <div className="grid grid-3" style={{ marginBottom: "0.8rem" }}>
          <input
            type="text"
            placeholder="Rechercher nom, email, sujet..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | "read" | "unread")
            }
          >
            <option value="all">Tous les messages</option>
            <option value="unread">Non lus</option>
            <option value="read">Lus</option>
          </select>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
            <input
              type="checkbox"
              checked={
                filteredMessages.length > 0 &&
                selectedIds.length === filteredMessages.length
              }
              onChange={(event) => selectAllFiltered(event.target.checked)}
            />
            <span>Tout selectionner</span>
          </label>
        </div>

        <div className="cta-row" style={{ marginBottom: "0.8rem" }}>
          <span style={{ alignSelf: "center" }}>{selectedIds.length} selectionne(s)</span>
          <button
            className="btn"
            type="button"
            disabled={selectedIds.length === 0 || loading}
            onClick={() => void bulkMark(true)}
          >
            Marquer lus
          </button>
          <button
            className="btn"
            type="button"
            disabled={selectedIds.length === 0 || loading}
            onClick={() => void bulkMark(false)}
          >
            Marquer non lus
          </button>
          <button
            className="btn"
            type="button"
            disabled={selectedIds.length === 0 || loading}
            onClick={() => void bulkDelete()}
          >
            Supprimer selection
          </button>
        </div>

        <div className="grid">
          {filteredMessages.length === 0 ? (
            <article className="card">
              <p>Aucun message pour le moment.</p>
            </article>
          ) : (
            filteredMessages.map((message) => (
              <article className="card" key={message.id}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(message.id)}
                    onChange={(event) => toggleSelection(message.id, event.target.checked)}
                  />
                  <span>Selectionner</span>
                </label>
                <div className="cta-row" style={{ justifyContent: "space-between" }}>
                  <strong>{message.name}</strong>
                  <span>{message.readAt ? "Lu" : "Non lu"}</span>
                </div>
                <p>
                  <strong>Email:</strong> {message.email}
                </p>
                <p>
                  <strong>Objet:</strong> {message.subject || "(sans objet)"}
                </p>
                <p>{shortText(message.body)}</p>
                <div className="cta-row">
                  <a
                    href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "Votre message"}`)}`}
                    className="btn"
                  >
                    Repondre
                  </a>
                  <Link href={`/admin/messages/${message.id}`} className="btn">
                    Ouvrir
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}
