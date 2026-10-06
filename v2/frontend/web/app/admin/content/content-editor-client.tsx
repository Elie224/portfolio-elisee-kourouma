"use client";

import { useMemo, useState } from "react";
import type { PortfolioContent } from "@/lib/portfolio-content-store";

type ContentSectionKey =
  | "overview"
  | "profile"
  | "links"
  | "services"
  | "reports"
  | "seo"
  | "settings"
  | "account"
  | "skills"
  | "timeline"
  | "faq"
  | "activeSearches"
  | "certifications"
  | "stages"
  | "alternances"
  | "techEvents"
  | "testimonials";

const sectionLabels: Array<{ key: ContentSectionKey; label: string }> = [
  { key: "overview", label: "Vue d'ensemble" },
  { key: "profile", label: "Profil & About" },
  { key: "links", label: "Liens" },
  { key: "services", label: "Services" },
  { key: "reports", label: "Rapports" },
  { key: "seo", label: "SEO" },
  { key: "settings", label: "Settings" },
  { key: "account", label: "Account" },
  { key: "skills", label: "Skills" },
  { key: "timeline", label: "Timeline" },
  { key: "faq", label: "FAQ" },
  { key: "activeSearches", label: "Recherches" },
  { key: "certifications", label: "Certifications" },
  { key: "stages", label: "Stages" },
  { key: "alternances", label: "Alternances" },
  { key: "techEvents", label: "Evenements" },
  { key: "testimonials", label: "Temoignages" },
];

function parseSection(raw: string | undefined): ContentSectionKey {
  const value = String(raw || "overview") as ContentSectionKey;
  return sectionLabels.some((item) => item.key === value) ? value : "overview";
}

export default function ContentEditorClient({
  initialContent,
  initialSection,
  lockedSection,
}: {
  initialContent: PortfolioContent;
  initialSection?: string;
  lockedSection?: string;
}) {
  const parsedLockedSection = parseSection(lockedSection);
  const isLocked = Boolean(lockedSection);
  const [content, setContent] = useState<PortfolioContent>(initialContent);
  const [activeSection, setActiveSection] = useState<ContentSectionKey>(
    isLocked ? parsedLockedSection : parseSection(initialSection),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadingCv, setUploadingCv] = useState(false);

  const stats = useMemo(() => {
    return {
      skills: content.skills.length,
      timeline: content.timeline.length,
      faq: content.faq.length,
      testimonials: content.testimonials.length,
      services:
        content.services.proposed.length +
        content.services.delivered.length +
        content.services.inProgress.length,
    };
  }, [content]);

  function toLines(values: string[]): string {
    return values.join("\n");
  }

  function fromLines(raw: string): string[] {
    return raw
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function updateContent(updater: (prev: PortfolioContent) => PortfolioContent): void {
    setContent((prev) => {
      const next = updater(prev);
      return next;
    });
  }

  function addSkill(): void {
    updateContent((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "", level: "" }],
    }));
  }

  function addTimeline(): void {
    updateContent((prev) => ({
      ...prev,
      timeline: [...prev.timeline, { title: "", date: "", description: "" }],
    }));
  }

  function addFaq(): void {
    updateContent((prev) => ({
      ...prev,
      faq: [...prev.faq, { question: "", answer: "" }],
    }));
  }

  function addActiveSearch(): void {
    updateContent((prev) => ({
      ...prev,
      activeSearches: [...prev.activeSearches, { title: "", status: "" }],
    }));
  }

  function addCertification(): void {
    updateContent((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { name: "", issuer: "", date: "" }],
    }));
  }

  function addStage(): void {
    updateContent((prev) => ({
      ...prev,
      stages: [...prev.stages, { title: "", company: "", period: "", documentUrl: "" }],
    }));
  }

  function addAlternance(): void {
    updateContent((prev) => ({
      ...prev,
      alternances: [
        ...prev.alternances,
        { title: "", company: "", period: "", documentUrl: "" },
      ],
    }));
  }

  function addTechEvent(): void {
    updateContent((prev) => ({
      ...prev,
      techEvents: [...prev.techEvents, { name: "", date: "", location: "" }],
    }));
  }

  function addTestimonial(): void {
    updateContent((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, { name: "", role: "", quote: "" }],
    }));
  }

  async function save() {
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        content?: PortfolioContent;
        error?: string;
      };

      if (!response.ok || !data.content) {
        setMessage(data.error || "Sauvegarde impossible");
        return;
      }

      setContent(data.content);
      setMessage("Contenu sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function handleCvUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setUploadingCv(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", selected);

      const response = await fetch("/api/admin/uploads/cv", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        setMessage(data.error || "Upload CV impossible");
        return;
      }

      const previousCv = content.links.cvUrl;
      updateContent((prev) => ({
        ...prev,
        links: { ...prev.links, cvUrl: data.url || prev.links.cvUrl },
      }));

      if (previousCv.startsWith("/uploads/cv/") && previousCv !== data.url) {
        await fetch("/api/admin/uploads/cv", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: previousCv }),
        }).catch(() => null);
      }

      setMessage("CV telecharge");
    } finally {
      setUploadingCv(false);
      event.target.value = "";
    }
  }

  async function removeCvUpload() {
    const currentCv = content.links.cvUrl;
    if (!currentCv.startsWith("/uploads/cv/")) return;

    const ok = window.confirm("Supprimer ce fichier CV ?");
    if (!ok) return;

    await fetch("/api/admin/uploads/cv", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentCv }),
    }).catch(() => null);

    updateContent((prev) => ({
      ...prev,
      links: { ...prev.links, cvUrl: "" },
    }));
    setMessage("CV supprime");
  }

  function selectSection(key: ContentSectionKey): void {
    if (isLocked) return;
    setActiveSection(key);
    const url = new URL(window.location.href);
    url.searchParams.set("section", key);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <div className="grid" style={{ gap: "1rem" }}>
      {isLocked ? null : (
        <section className="card">
          <h2>Navigation du contenu</h2>
          <p>Choisissez une section pour modifier un bloc precis, sans faire defiler toute la page.</p>
          <div className="cta-row">
            {sectionLabels.map((section) => (
              <button
                key={section.key}
                className={`btn ${activeSection === section.key ? "primary" : ""}`}
                type="button"
                onClick={() => selectSection(section.key)}
              >
                {section.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <div className="cta-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0 }}>
            Section active: <strong>{sectionLabels.find((s) => s.key === activeSection)?.label}</strong>
          </p>
          <button className="btn primary" type="button" onClick={() => void save()} disabled={saving}>
            {saving ? "Sauvegarde..." : "Sauvegarder cette section"}
          </button>
        </div>
        {message ? <p className="form-msg success">{message}</p> : null}
      </section>

      <section className="card" hidden={activeSection !== "overview"}>
        <h2>Edition du contenu global</h2>
        <p>
          Gestion par section (style admin V1): profil, about, liens, services,
          rapports, skills, timeline, FAQ, recherches, certifications, stages,
          alternances et evenements tech.
        </p>
        <div className="grid grid-3" style={{ marginBottom: "0.8rem" }}>
          <article className="card">
            <p>Skills</p>
            <strong>{stats.skills}</strong>
          </article>
          <article className="card">
            <p>Timeline</p>
            <strong>{stats.timeline}</strong>
          </article>
          <article className="card">
            <p>FAQ</p>
            <strong>{stats.faq}</strong>
          </article>
          <article className="card">
            <p>Temoignages</p>
            <strong>{stats.testimonials}</strong>
          </article>
        </div>
      </section>

      <section className="card" hidden={activeSection !== "profile"}>
        <h3>Profil & About</h3>
        <div className="contact-form">
          <label>
            <span>Nom</span>
            <input
              value={content.personal.name}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, name: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Titre</span>
            <input
              value={content.personal.title}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, title: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Sous-titre</span>
            <input
              value={content.personal.subtitle}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, subtitle: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Description about</span>
            <textarea
              rows={5}
              value={content.about.description}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  about: { ...prev.about, description: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Nom complet (V1)</span>
            <input
              value={content.personal.fullName || ""}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, fullName: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Email profil (V1)</span>
            <input
              value={content.personal.email || ""}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, email: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Telephone (V1)</span>
            <input
              value={content.personal.phone || ""}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, phone: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Formation actuelle (V1)</span>
            <input
              value={content.personal.currentEducation || ""}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  personal: {
                    ...prev.personal,
                    currentEducation: event.target.value,
                  },
                }))
              }
            />
          </label>
          <label>
            <span>Formation precedente (V1)</span>
            <input
              value={content.personal.previousEducation || ""}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  personal: {
                    ...prev.personal,
                    previousEducation: event.target.value,
                  },
                }))
              }
            />
          </label>
          <label>
            <span>Photo URL profil (V1)</span>
            <input
              value={content.personal.photo || ""}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, photo: event.target.value },
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="card" hidden={activeSection !== "links"}>
        <h3>Liens</h3>
        <div className="contact-form">
          <label>
            <span>Email</span>
            <input
              value={content.links.email}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  links: { ...prev.links, email: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>CV URL</span>
            <input
              value={content.links.cvUrl}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  links: { ...prev.links, cvUrl: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Upload CV (PDF, DOC, DOCX)</span>
            <input
              type="file"
              accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleCvUpload}
              disabled={uploadingCv}
            />
          </label>
          {content.links.cvUrl.startsWith("/uploads/cv/") ? (
            <div className="cta-row" style={{ marginTop: 0 }}>
              <a href={content.links.cvUrl} className="btn" target="_blank" rel="noopener noreferrer">
                Ouvrir le CV actuel
              </a>
              <button className="btn" type="button" onClick={() => void removeCvUpload()}>
                Supprimer le CV
              </button>
            </div>
          ) : null}
          <label>
            <span>LinkedIn</span>
            <input
              value={content.links.linkedin}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  links: { ...prev.links, linkedin: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>GitHub</span>
            <input
              value={content.links.github}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  links: { ...prev.links, github: event.target.value },
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="card" hidden={activeSection !== "services"}>
        <h3>Services</h3>
        <div className="contact-form">
          <label>
            <span>Services proposes (1 par ligne)</span>
            <textarea
              rows={5}
              value={toLines(content.services.proposed)}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  services: { ...prev.services, proposed: fromLines(event.target.value) },
                }))
              }
            />
          </label>
          <label>
            <span>Services livres (1 par ligne)</span>
            <textarea
              rows={4}
              value={toLines(content.services.delivered)}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  services: { ...prev.services, delivered: fromLines(event.target.value) },
                }))
              }
            />
          </label>
          <label>
            <span>Services en cours (1 par ligne)</span>
            <textarea
              rows={4}
              value={toLines(content.services.inProgress)}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  services: { ...prev.services, inProgress: fromLines(event.target.value) },
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="card" hidden={activeSection !== "reports"}>
        <h3>Rapports</h3>
        <label className="contact-form">
          <span>Rapports (1 par ligne)</span>
          <textarea
            rows={5}
            value={toLines(content.reports)}
            onChange={(event) =>
              updateContent((prev) => ({ ...prev, reports: fromLines(event.target.value) }))
            }
          />
        </label>
      </section>

      <section className="card" id="admin-content-seo" hidden={activeSection !== "seo"}>
        <h3>SEO</h3>
        <div className="contact-form">
          <label>
            <span>Title</span>
            <input
              value={content.seo.title}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, title: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              rows={3}
              value={content.seo.description}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, description: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Keywords</span>
            <input
              value={content.seo.keywords}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, keywords: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Google Analytics ID</span>
            <input
              value={content.seo.gaId}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, gaId: event.target.value },
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="card" id="admin-content-settings" hidden={activeSection !== "settings"}>
        <h3>Settings</h3>
        <div className="contact-form">
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <input
              type="checkbox"
              checked={content.settings.maintenanceMode}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, maintenanceMode: event.target.checked },
                }))
              }
            />
            <span>Maintenance mode</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <input
              type="checkbox"
              checked={content.settings.allowContact}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, allowContact: event.target.checked },
                }))
              }
            />
            <span>Activer formulaire contact</span>
          </label>

          <label>
            <span>Message maintenance</span>
            <textarea
              rows={3}
              value={content.settings.maintenanceMessage}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    maintenanceMessage: event.target.value,
                  },
                }))
              }
              placeholder="Le site est temporairement en maintenance..."
            />
          </label>
        </div>
      </section>

      <section className="card" hidden={activeSection !== "account"}>
        <h3>Account</h3>
        <div className="contact-form">
          <label>
            <span>Email admin</span>
            <input
              value={content.account.adminEmail}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  account: { ...prev.account, adminEmail: event.target.value },
                }))
              }
            />
          </label>
          <label>
            <span>Note interne</span>
            <textarea
              rows={3}
              value={content.account.note}
              onChange={(event) =>
                updateContent((prev) => ({
                  ...prev,
                  account: { ...prev.account, note: event.target.value },
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="card" hidden={activeSection !== "skills"}>
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Skills</h3>
          <button className="btn" type="button" onClick={addSkill}>
            Ajouter skill
          </button>
        </div>
        <div className="grid">
          {content.skills.map((skill, index) => (
            <article className="card" key={`skill-${index}`}>
              <div className="field-grid">
                <label>
                  <span>Nom</span>
                  <input
                    value={skill.name || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        skills: prev.skills.map((item, idx) =>
                          idx === index ? { ...item, name: event.target.value } : item,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Niveau</span>
                  <input
                    value={skill.level || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        skills: prev.skills.map((item, idx) =>
                          idx === index ? { ...item, level: event.target.value } : item,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    skills: prev.skills.filter((_, idx) => idx !== index),
                  }))
                }
              >
                Supprimer
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card" hidden={activeSection !== "timeline"}>
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Timeline</h3>
          <button className="btn" type="button" onClick={addTimeline}>
            Ajouter etape
          </button>
        </div>
        <div className="grid">
          {content.timeline.map((item, index) => (
            <article className="card" key={`timeline-${index}`}>
              <div className="contact-form">
                <label>
                  <span>Titre</span>
                  <input
                    value={item.title || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        timeline: prev.timeline.map((entry, idx) =>
                          idx === index ? { ...entry, title: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Date</span>
                  <input
                    value={item.date || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        timeline: prev.timeline.map((entry, idx) =>
                          idx === index ? { ...entry, date: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={item.description || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        timeline: prev.timeline.map((entry, idx) =>
                          idx === index
                            ? { ...entry, description: event.target.value }
                            : entry,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    timeline: prev.timeline.filter((_, idx) => idx !== index),
                  }))
                }
              >
                Supprimer
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card" hidden={activeSection !== "faq"}>
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>FAQ</h3>
          <button className="btn" type="button" onClick={addFaq}>
            Ajouter question
          </button>
        </div>
        <div className="grid">
          {content.faq.map((item, index) => (
            <article className="card" key={`faq-${index}`}>
              <div className="contact-form">
                <label>
                  <span>Question</span>
                  <input
                    value={item.question || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        faq: prev.faq.map((entry, idx) =>
                          idx === index ? { ...entry, question: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Reponse</span>
                  <textarea
                    rows={3}
                    value={item.answer || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        faq: prev.faq.map((entry, idx) =>
                          idx === index ? { ...entry, answer: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    faq: prev.faq.filter((_, idx) => idx !== index),
                  }))
                }
              >
                Supprimer
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card" hidden={activeSection !== "activeSearches"}>
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Recherches actives</h3>
          <button className="btn" type="button" onClick={addActiveSearch}>
            Ajouter recherche
          </button>
        </div>
        <div className="grid">
          {content.activeSearches.map((item, index) => (
            <article className="card" key={`search-${index}`}>
              <div className="field-grid">
                <label>
                  <span>Titre</span>
                  <input
                    value={item.title || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        activeSearches: prev.activeSearches.map((entry, idx) =>
                          idx === index ? { ...entry, title: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Statut</span>
                  <input
                    value={item.status || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        activeSearches: prev.activeSearches.map((entry, idx) =>
                          idx === index ? { ...entry, status: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    activeSearches: prev.activeSearches.filter((_, idx) => idx !== index),
                  }))
                }
              >
                Supprimer
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card" hidden={activeSection !== "certifications"}>
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Certifications</h3>
          <button className="btn" type="button" onClick={addCertification}>
            Ajouter certification
          </button>
        </div>
        <div className="grid">
          {content.certifications.map((item, index) => (
            <article className="card" key={`cert-${index}`}>
              <div className="contact-form">
                <label>
                  <span>Nom</span>
                  <input
                    value={item.name || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        certifications: prev.certifications.map((entry, idx) =>
                          idx === index ? { ...entry, name: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Emetteur</span>
                  <input
                    value={item.issuer || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        certifications: prev.certifications.map((entry, idx) =>
                          idx === index ? { ...entry, issuer: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Date</span>
                  <input
                    value={item.date || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        certifications: prev.certifications.map((entry, idx) =>
                          idx === index ? { ...entry, date: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    certifications: prev.certifications.filter((_, idx) => idx !== index),
                  }))
                }
              >
                Supprimer
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card" hidden={activeSection !== "stages"}>
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Stages</h3>
          <button className="btn" type="button" onClick={addStage}>
            Ajouter stage
          </button>
        </div>
        <div className="grid">
          {content.stages.map((item, index) => (
            <article className="card" key={`stage-${index}`}>
              <div className="contact-form">
                <label>
                  <span>Titre</span>
                  <input
                    value={item.title || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        stages: prev.stages.map((entry, idx) =>
                          idx === index ? { ...entry, title: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Entreprise</span>
                  <input
                    value={item.company || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        stages: prev.stages.map((entry, idx) =>
                          idx === index ? { ...entry, company: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Periode</span>
                  <input
                    value={item.period || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        stages: prev.stages.map((entry, idx) =>
                          idx === index ? { ...entry, period: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Lien document (URL)</span>
                  <input
                    value={item.documentUrl || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        stages: prev.stages.map((entry, idx) =>
                          idx === index ? { ...entry, documentUrl: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    stages: prev.stages.filter((_, idx) => idx !== index),
                  }))
                }
              >
                Supprimer
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card" hidden={activeSection !== "alternances"}>
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Alternances</h3>
          <button className="btn" type="button" onClick={addAlternance}>
            Ajouter alternance
          </button>
        </div>
        <div className="grid">
          {content.alternances.map((item, index) => (
            <article className="card" key={`alternance-${index}`}>
              <div className="contact-form">
                <label>
                  <span>Titre</span>
                  <input
                    value={item.title || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        alternances: prev.alternances.map((entry, idx) =>
                          idx === index ? { ...entry, title: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Entreprise</span>
                  <input
                    value={item.company || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        alternances: prev.alternances.map((entry, idx) =>
                          idx === index ? { ...entry, company: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Periode</span>
                  <input
                    value={item.period || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        alternances: prev.alternances.map((entry, idx) =>
                          idx === index ? { ...entry, period: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Lien document (URL)</span>
                  <input
                    value={item.documentUrl || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        alternances: prev.alternances.map((entry, idx) =>
                          idx === index ? { ...entry, documentUrl: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    alternances: prev.alternances.filter((_, idx) => idx !== index),
                  }))
                }
              >
                Supprimer
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card" hidden={activeSection !== "techEvents"}>
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Evenements tech</h3>
          <button className="btn" type="button" onClick={addTechEvent}>
            Ajouter evenement
          </button>
        </div>
        <div className="grid">
          {content.techEvents.map((item, index) => (
            <article className="card" key={`event-${index}`}>
              <div className="contact-form">
                <label>
                  <span>Nom</span>
                  <input
                    value={item.name || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        techEvents: prev.techEvents.map((entry, idx) =>
                          idx === index ? { ...entry, name: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Date</span>
                  <input
                    value={item.date || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        techEvents: prev.techEvents.map((entry, idx) =>
                          idx === index ? { ...entry, date: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Lieu</span>
                  <input
                    value={item.location || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        techEvents: prev.techEvents.map((entry, idx) =>
                          idx === index ? { ...entry, location: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    techEvents: prev.techEvents.filter((_, idx) => idx !== index),
                  }))
                }
              >
                Supprimer
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="card" hidden={activeSection !== "testimonials"}>
        <div className="cta-row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Temoignages</h3>
          <button className="btn" type="button" onClick={addTestimonial}>
            Ajouter temoignage
          </button>
        </div>
        <div className="grid">
          {content.testimonials.map((item, index) => (
            <article className="card" key={`testimonial-${index}`}>
              <div className="contact-form">
                <label>
                  <span>Nom</span>
                  <input
                    value={item.name || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        testimonials: prev.testimonials.map((entry, idx) =>
                          idx === index ? { ...entry, name: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Role</span>
                  <input
                    value={item.role || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        testimonials: prev.testimonials.map((entry, idx) =>
                          idx === index ? { ...entry, role: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Temoignage</span>
                  <textarea
                    rows={4}
                    value={item.quote || ""}
                    onChange={(event) =>
                      updateContent((prev) => ({
                        ...prev,
                        testimonials: prev.testimonials.map((entry, idx) =>
                          idx === index ? { ...entry, quote: event.target.value } : entry,
                        ),
                      }))
                    }
                  />
                </label>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    testimonials: prev.testimonials.filter((_, idx) => idx !== index),
                  }))
                }
              >
                Supprimer
              </button>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}
