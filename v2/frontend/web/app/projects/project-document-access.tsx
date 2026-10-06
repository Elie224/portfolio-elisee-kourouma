"use client";

import { useEffect, useState } from "react";

interface ProjectDocumentAccessProps {
  title: string;
  documentUrl?: string;
  requiresAccessCode?: boolean;
}

export default function ProjectDocumentAccess({
  title,
  documentUrl,
  requiresAccessCode,
}: ProjectDocumentAccessProps) {
  const [open, setOpen] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("success");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setMessage("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!documentUrl) return null;

  async function requestAccess(formData: FormData) {
    setSendingRequest(true);
    setMessage("");

    const payload = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      reportTitle: title,
      reportType: "project",
      company: String(formData.get("company") || "").trim(),
    };

    try {
      const response = await fetch("/api/reports/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setMessageType("error");
        setMessage(data.error || "Demande impossible.");
        return;
      }
      setMessageType("success");
      setMessage("Demande envoyee. Le code vous sera communique par l'auteur.");
    } catch {
      setMessageType("error");
      setMessage("Erreur reseau, merci de reessayer.");
    } finally {
      setSendingRequest(false);
    }
  }

  async function verifyCode(formData: FormData) {
    setCheckingCode(true);
    const code = String(formData.get("code") || "").trim();

    try {
      const response = await fetch("/api/reports/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setMessageType("error");
        setMessage(data.error || "Code invalide.");
        return;
      }

      window.open(documentUrl, "_blank", "noopener,noreferrer");
      setMessageType("success");
      setMessage("Code valide. Ouverture du document.");
    } catch {
      setMessageType("error");
      setMessage("Erreur reseau, merci de reessayer.");
    } finally {
      setCheckingCode(false);
    }
  }

  if (!requiresAccessCode) {
    return (
      <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="btn">
        Ouvrir le document
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        className="btn"
        onClick={() => {
          setMessage("");
          setOpen(true);
        }}
      >
        Demander le document
      </button>

      {open ? (
        <>
          <div
            className="report-modal-overlay"
            onClick={() => {
              setOpen(false);
              setMessage("");
            }}
            aria-hidden="true"
          />
          <div className="report-modal" role="dialog" aria-modal="true" aria-label="Demander le document projet">
            <article className="card report-modal-card">
              <button
                className="report-modal-close"
                type="button"
                onClick={() => {
                  setOpen(false);
                  setMessage("");
                }}
                aria-label="Fermer"
              >
                ×
              </button>
              <h3>Demander le document</h3>
              <p className="muted">Projet: {title}</p>
              <p>
                1) Demandez le code. 2) Quand vous le recevez de l&apos;auteur,
                saisissez-le pour telecharger.
              </p>

              <form
                className="contact-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  void requestAccess(formData);
                }}
                noValidate
              >
                <div className="field-grid">
                  <label>
                    <span>Prenom</span>
                    <input name="firstName" type="text" placeholder="Prenom" />
                  </label>
                  <label>
                    <span>Nom</span>
                    <input name="lastName" type="text" placeholder="Nom" />
                  </label>
                </div>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" placeholder="vous@exemple.com" required />
                </label>
                <label>
                  <span>Message</span>
                  <textarea name="message" rows={3} placeholder="Contexte de la demande" />
                </label>
                <label className="hp-field" aria-hidden="true">
                  <span>Entreprise</span>
                  <input name="company" type="text" autoComplete="off" tabIndex={-1} />
                </label>
                <div className="cta-row">
                  <button className="btn" type="submit" disabled={sendingRequest}>
                    {sendingRequest ? "Envoi..." : "Envoyer la demande"}
                  </button>
                </div>
              </form>

              <form
                className="contact-form"
                style={{ marginTop: "1rem" }}
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  void verifyCode(formData);
                }}
                noValidate
              >
                <label>
                  <span>Code de telechargement</span>
                  <input name="code" type="password" placeholder="Code" required />
                </label>
                <div className="cta-row">
                  <button className="btn primary" type="submit" disabled={checkingCode}>
                    {checkingCode ? "Verification..." : "Valider le code"}
                  </button>
                </div>
              </form>

              {message ? (
                <p className={messageType === "error" ? "form-msg error" : "form-msg success"}>
                  {message}
                </p>
              ) : null}
            </article>
          </div>
        </>
      ) : null}
    </>
  );
}
