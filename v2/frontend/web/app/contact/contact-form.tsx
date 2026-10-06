"use client";

import { FormEvent, useState } from "react";

type SubmitState =
  | { type: "idle"; message: string }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

const initialState: SubmitState = { type: "idle", message: "" };

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>(initialState);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      company: String(formData.get("company") || "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setSubmitState({
        type: "error",
        message: "Merci de renseigner le nom, l'email et le message.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitState(initialState);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as {
        error?: string;
        received?: boolean;
      };

      if (!response.ok) {
        setSubmitState({
          type: "error",
          message: body.error || "Envoi impossible pour le moment.",
        });
        return;
      }

      if (body.received) {
        form.reset();
        setSubmitState({
          type: "success",
          message: "Message envoyé avec succès. Je vous reponds rapidement.",
        });
      }
    } catch {
      setSubmitState({
        type: "error",
        message: "Erreur réseau, merci de réessayer.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="field-grid">
        <label>
          <span>Nom complet</span>
          <input name="name" type="text" placeholder="Votre nom" required />
        </label>

        <label>
          <span>Email</span>
          <input name="email" type="email" placeholder="vous@exemple.com" required />
        </label>
      </div>

      <label>
        <span>Objet</span>
        <input name="subject" type="text" placeholder="Objet du message" />
      </label>

      <label>
        <span>Message</span>
        <textarea
          name="message"
          rows={6}
          placeholder="écrivez votre besoin, contexte et délais."
          required
        />
      </label>

      <label className="hp-field" aria-hidden="true">
        <span>Entreprise</span>
        <input name="company" type="text" autoComplete="off" tabIndex={-1} />
      </label>

      <div className="cta-row">
        <button className="btn primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Envoi..." : "Envoyer"}
        </button>
      </div>

      {submitState.message ? (
        <p className={submitState.type === "error" ? "form-msg error" : "form-msg success"}>
          {submitState.message}
        </p>
      ) : null}
    </form>
  );
}
