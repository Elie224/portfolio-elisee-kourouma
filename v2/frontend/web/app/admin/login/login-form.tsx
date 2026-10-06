"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Connexion impossible");
        return;
      }

      router.push(nextPath || "/admin");
    } catch {
      setError("Erreur reseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label>
        <span>Email admin</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        <span>Mot de passe</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      <div className="cta-row">
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </div>
      {error ? <p className="form-msg error">{error}</p> : null}
    </form>
  );
}
