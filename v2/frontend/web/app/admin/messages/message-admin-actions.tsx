"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MessageAdminActions({
  id,
  email,
  subject,
  initiallyRead,
}: {
  id: string;
  email: string;
  subject: string;
  initiallyRead: boolean;
}) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(initiallyRead);
  const [loading, setLoading] = useState(false);

  const toggleRead = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !isRead }),
      });
      if (response.ok) {
        setIsRead((prev) => !prev);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    const ok = window.confirm("Supprimer ce message ?");
    if (!ok) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const subjectSafe = subject || "Votre message";

  return (
    <div className="cta-row">
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${subjectSafe}`)}`}
        className="btn"
      >
        Repondre
      </a>
      <button type="button" className="btn" onClick={toggleRead} disabled={loading}>
        {isRead ? "Marquer non lu" : "Marquer lu"}
      </button>
      <button type="button" className="btn" onClick={remove} disabled={loading}>
        Supprimer
      </button>
    </div>
  );
}
