"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn" type="button" onClick={onLogout} disabled={loading}>
      {loading ? "Deconnexion..." : "Se deconnecter"}
    </button>
  );
}
