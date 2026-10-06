"use client";

import { useEffect, useMemo, useState } from "react";

type ReportItem = {
  title: string;
  company?: string;
  period?: string;
  documentUrl?: string;
};

type SubmitState = {
  type: "idle" | "error" | "success";
  message: string;
};

const defaultState: SubmitState = { type: "idle", message: "" };

export default function ReportsClient({
  stages,
  alternances,
}: {
  stages: ReportItem[];
  alternances: ReportItem[];
}) {
  const [active, setActive] = useState<{
    type: "stage" | "alternance";
    title: string;
    documentUrl?: string;
  } | null>(null);
  const [state, setState] = useState<SubmitState>(defaultState);
  const [sending, setSending] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  const totalCount = useMemo(() => stages.length + alternances.length, [stages.length, alternances.length]);

  useEffect(() => {
    if (!active) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
        setState(defaultState);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  function openModal(input: {
    type: "stage" | "alternance";
    title: string;
    documentUrl?: string;
  }) {
    setState(defaultState);
    setActive(input);
  }

  function closeModal() {
    setActive(null);
    setState(defaultState);
  }

  async function requestAccess(formData: FormData) {
    if (!active) return;
    setSending(true);
    setState(defaultState);

    const payload = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      reportTitle: active.title,
      reportType: active.type,
      company: String(formData.get("company") || "").trim(),
    };

    try {
      const response = await fetch("/api/reports/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setState({ type: "error", message: body.error || "Demande impossible." });
        return;
      }

      setState({
        type: "success",
        message: "Demande envoyee. Le code vous sera communique par l'auteur.",
      });
    } catch {
      setState({ type: "error", message: "Erreur reseau, merci de reessayer." });
    } finally {
      setSending(false);
    }
  }

  async function verifyCode(formData: FormData) {
    if (!active) return;
    setCheckingCode(true);

    const code = String(formData.get("code") || "").trim();
    try {
      const response = await fetch("/api/reports/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setState({ type: "error", message: body.error || "Code invalide." });
        return;
      }

      if (active.documentUrl) {
        window.open(active.documentUrl, "_blank", "noopener,noreferrer");
        setState({ type: "success", message: "Code valide. Ouverture du document." });
      } else {
        setState({
          type: "success",
          message: "Code valide, mais aucun lien de document n'est configure pour ce rapport.",
        });
      }
    } catch {
      setState({ type: "error", message: "Erreur reseau, merci de reessayer." });
    } finally {
      setCheckingCode(false);
    }
  }

  return (
    <>
      <section className="section">
        <div className="grid grid-3">
          <article className="card stats-card">
            <p>Rapports au total</p>
            <strong>{totalCount}</strong>
          </article>
          <article className="card stats-card">
            <p>Rapports de stage</p>
            <strong>{stages.length}</strong>
          </article>
          <article className="card stats-card">
            <p>Rapports d&apos;alternance</p>
            <strong>{alternances.length}</strong>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-title-row">
          <div>
            <h2>Rapports de stage</h2>
            <p>Demandes de code et telechargements pour les stages realises.</p>
          </div>
          <span className="pill-code">Code requis</span>
        </div>
        <div className="grid grid-2">
          {stages.length === 0 ? (
            <article className="card">
              <p>Aucun rapport de stage disponible.</p>
            </article>
          ) : (
            stages.map((item, index) => (
              <article className="card" key={`${item.title}-${index}`}>
                <h3>{item.title}</h3>
                {item.company ? <p>{item.company}</p> : null}
                {item.period ? <p>{item.period}</p> : null}
                <div className="cta-row">
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      openModal({
                        type: "stage",
                        title: item.title,
                        documentUrl: item.documentUrl,
                      })
                    }
                  >
                    Demander le document
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-title-row">
          <div>
            <h2>Rapports d&apos;alternance</h2>
            <p>Demandes de code et telechargements pour les alternances.</p>
          </div>
          <span className="pill-code">Code requis</span>
        </div>
        <div className="grid grid-2">
          {alternances.length === 0 ? (
            <article className="card">
              <p>Aucun rapport d&apos;alternance disponible.</p>
            </article>
          ) : (
            alternances.map((item, index) => (
              <article className="card" key={`${item.title}-${index}`}>
                <h3>{item.title}</h3>
                {item.company ? <p>{item.company}</p> : null}
                {item.period ? <p>{item.period}</p> : null}
                <div className="cta-row">
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      openModal({
                        type: "alternance",
                        title: item.title,
                        documentUrl: item.documentUrl,
                      })
                    }
                  >
                    Demander le document
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {active ? (
        <>
          <div className="report-modal-overlay" onClick={closeModal} aria-hidden="true" />
          <div className="report-modal" role="dialog" aria-modal="true" aria-label="Demander le document">
            <article className="card report-modal-card">
              <button className="report-modal-close" type="button" onClick={closeModal} aria-label="Fermer">
                ×
              </button>

              <h3>Demander le document</h3>
              <p>
                1) Demandez le code. 2) Quand vous le recevez de l&apos;auteur,
                saisissez-le pour telecharger.
              </p>
              <p className="muted">Rapport: {active.title}</p>

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
                  <button className="btn" type="submit" disabled={sending}>
                    {sending ? "Envoi..." : "Envoyer la demande"}
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
                  <button className="btn" type="button" onClick={closeModal}>
                    Fermer
                  </button>
                </div>
              </form>

              {state.message ? (
                <p className={state.type === "error" ? "form-msg error" : "form-msg success"}>
                  {state.message}
                </p>
              ) : null}
            </article>
          </div>
        </>
      ) : null}
    </>
  );
}
