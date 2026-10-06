"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ProjectItem, ProjectType } from "../content";
import SafeProjectImage from "@/app/components/safe-project-image";

type SortMode = "default" | "featured" | "recent" | "name";
type ViewMode = "grid" | "list";

interface ProjectsCatalogProps {
  projects: ProjectItem[];
}

export default function ProjectsCatalog({ projects }: ProjectsCatalogProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProjectType | "">("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeProtectedDoc, setActiveProtectedDoc] = useState<{
    title: string;
    documentUrl?: string;
  } | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [docMessage, setDocMessage] = useState("");
  const [docMessageType, setDocMessageType] = useState<"error" | "success">("success");

  const featuredCount = useMemo(
    () => projects.filter((project) => project.featured).length,
    [projects],
  );

  const availableTypes = useMemo(
    () => Array.from(new Set(projects.map((project) => project.type))),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    const normalizedSearch = search.trim().toLowerCase();
    if (normalizedSearch) {
      result = result.filter((project) => {
        const haystack = [project.title, project.summary, ...project.stack]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      });
    }

    if (typeFilter) {
      result = result.filter((project) => project.type === typeFilter);
    }

    switch (sortMode) {
      case "featured":
        result.sort((a, b) => Number(b.featured) - Number(a.featured));
        break;
      case "recent":
        result.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
        );
        break;
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title, "fr"));
        break;
      default:
        result.sort((a, b) => Number(b.featured) - Number(a.featured));
        break;
    }

    return result;
  }, [projects, search, sortMode, typeFilter]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setSortMode("default");
  };

  useEffect(() => {
    if (!activeProtectedDoc) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveProtectedDoc(null);
        setDocMessage("");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProtectedDoc]);

  async function requestProjectDoc(formData: FormData) {
    if (!activeProtectedDoc) return;
    setSendingRequest(true);
    setDocMessage("");

    const payload = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      reportTitle: activeProtectedDoc.title,
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
        setDocMessageType("error");
        setDocMessage(data.error || "Demande impossible.");
        return;
      }
      setDocMessageType("success");
      setDocMessage("Demande envoyee. Le code vous sera communique par l'auteur.");
    } catch {
      setDocMessageType("error");
      setDocMessage("Erreur reseau, merci de reessayer.");
    } finally {
      setSendingRequest(false);
    }
  }

  async function verifyProjectCode(formData: FormData) {
    if (!activeProtectedDoc) return;
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
        setDocMessageType("error");
        setDocMessage(data.error || "Code invalide.");
        return;
      }

      if (activeProtectedDoc.documentUrl) {
        window.open(activeProtectedDoc.documentUrl, "_blank", "noopener,noreferrer");
        setDocMessageType("success");
        setDocMessage("Code valide. Ouverture du document.");
      } else {
        setDocMessageType("error");
        setDocMessage("Aucun lien document configure sur ce projet.");
      }
    } catch {
      setDocMessageType("error");
      setDocMessage("Erreur reseau, merci de reessayer.");
    } finally {
      setCheckingCode(false);
    }
  }

  return (
    <section className="section">
      <div className="section-heading">
        <h2>Catalogue complet</h2>
        <p>Filtre, trie et ouvre chaque projet en mode detail.</p>
      </div>

      <div className="grid grid-3 section-gap-sm">
        <article className="card stats-card">
          <p>Projets au total</p>
          <strong>{projects.length}</strong>
        </article>
        <article className="card stats-card">
          <p>Projets en vedette</p>
          <strong>{featuredCount}</strong>
        </article>
        <article className="card stats-card">
          <p>Projets visibles</p>
          <strong>{filteredProjects.length}</strong>
        </article>
      </div>

      <div className="project-filters-panel section-gap-sm">
        <div>
          <h3>Recherche et filtres</h3>
          <p className="filters-help">
            Combine recherche, type et tri pour cibler precisement les projets publies.
          </p>
        </div>

        <div className="grid grid-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un projet, une technologie..."
            className="control"
          />

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as ProjectType | "")}
            className="control"
          >
            <option value="">Tous les types</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="control"
          >
            <option value="default">Trier par défaut</option>
            <option value="featured">En vedette</option>
            <option value="recent">Plus récent</option>
            <option value="name">Nom (A-Z)</option>
          </select>
        </div>

        <div className="cta-row section-gap-xs">
          <button type="button" className="btn" onClick={clearFilters}>
            Effacer
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setViewMode((prev) => (prev === "grid" ? "list" : "grid"))}
          >
            {viewMode === "grid" ? "Vue liste" : "Vue grille"}
          </button>
          <p className="filters-counter">
            {filteredProjects.length} projet(s) trouve(s)
          </p>
        </div>

        {(search || typeFilter || sortMode !== "default") && (
          <div className="cta-row section-gap-xs">
            <span className="filter-active-label">Filtres actifs:</span>
            {search ? <span className="btn">Recherche: {search}</span> : null}
            {typeFilter ? <span className="btn">Type: {typeFilter}</span> : null}
            {sortMode !== "default" ? <span className="btn">Tri: {sortMode}</span> : null}
          </div>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <article className="card">
          <h3>Aucun projet trouve</h3>
          <p>
            Aucun projet ne correspond a vos criteres de recherche. Essayez de
            modifier vos filtres.
          </p>
        </article>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-3" : "grid"}>
          {filteredProjects.map((project) => (
            <article className="card" key={project.slug}>
              {project.imageUrl || project.thumbnailUrl ? (
                <div className="section-gap-xs">
                  <SafeProjectImage
                    src={project.thumbnailUrl || project.imageUrl}
                    alt={`Image ${project.title}`}
                    style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "0.7rem" }}
                  />
                </div>
              ) : null}
              <p className="muted">{project.type}</p>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <p className="muted">{project.stack.join(" / ")}</p>
              <div className="cta-row">
                <Link href={`/projects/${project.slug}`} className="btn">
                  Voir le projet
                </Link>
                {project.requiresAccessCode ? (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setDocMessage("");
                      setActiveProtectedDoc({
                        title: project.title,
                        documentUrl: project.documentUrl,
                      });
                    }}
                  >
                    Demander le document
                  </button>
                ) : project.documentUrl ? (
                  <a
                    href={project.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    Ouvrir le document
                  </a>
                ) : null}
                {project.featured ? <span className="btn">En vedette</span> : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {activeProtectedDoc ? (
        <>
          <div
            className="report-modal-overlay"
            onClick={() => {
              setActiveProtectedDoc(null);
              setDocMessage("");
            }}
            aria-hidden="true"
          />
          <div className="report-modal" role="dialog" aria-modal="true" aria-label="Demander le document projet">
            <article className="card report-modal-card">
              <button
                className="report-modal-close"
                type="button"
                onClick={() => {
                  setActiveProtectedDoc(null);
                  setDocMessage("");
                }}
                aria-label="Fermer"
              >
                ×
              </button>
              <h3>Demander le document</h3>
              <p className="muted">Projet: {activeProtectedDoc.title}</p>
              <p>
                1) Demandez le code. 2) Quand vous le recevez de l&apos;auteur,
                saisissez-le pour telecharger.
              </p>

              <form
                className="contact-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  void requestProjectDoc(formData);
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
                  void verifyProjectCode(formData);
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

              {docMessage ? (
                <p className={docMessageType === "error" ? "form-msg error" : "form-msg success"}>
                  {docMessage}
                </p>
              ) : null}
            </article>
          </div>
        </>
      ) : null}
    </section>
  );
}
