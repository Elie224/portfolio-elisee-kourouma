"use client";

import { useMemo, useState } from "react";
import { PROJECT_TYPES, type ProjectItem, type ProjectType } from "@/app/content";
import SafeProjectImage from "@/app/components/safe-project-image";

type FormState = {
  title: string;
  type: ProjectType;
  summary: string;
  imageUrl: string;
  thumbnailUrl: string;
  documentUrl: string;
  liveUrl: string;
  githubUrl: string;
  requiresAccessCode: boolean;
  stack: string;
  status: "published" | "draft";
  featured: boolean;
  publishedAt: string;
};

const defaultFormState: FormState = {
  title: "",
  type: PROJECT_TYPES[0],
  summary: "",
  imageUrl: "",
  thumbnailUrl: "",
  documentUrl: "",
  liveUrl: "",
  githubUrl: "",
  requiresAccessCode: false,
  stack: "",
  status: "draft",
  featured: false,
  publishedAt: new Date().toISOString().slice(0, 10),
};

export default function ProjectsAdminClient({
  initialProjects,
}: {
  initialProjects: ProjectItem[];
}) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [message, setMessage] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDropActive, setIsDropActive] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(initialProjects.length);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  async function compressImageForUpload(file: File): Promise<File> {
    const compressibleTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!compressibleTypes.has(file.type)) return file;

    const imageUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("invalid image"));
        image.src = imageUrl;
      });

      const maxWidth = 1600;
      const maxHeight = 1600;
      const widthRatio = maxWidth / img.width;
      const heightRatio = maxHeight / img.height;
      const ratio = Math.min(1, widthRatio, heightRatio);

      const targetWidth = Math.max(1, Math.round(img.width * ratio));
      const targetHeight = Math.max(1, Math.round(img.height * ratio));

      if (ratio === 1 && file.size < 450 * 1024) {
        return file;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const quality = outputType === "image/jpeg" ? 0.82 : 0.9;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), outputType, quality);
      });

      if (!blob || blob.size >= file.size) {
        return file;
      }

      const ext = outputType === "image/png" ? "png" : "jpg";
      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.${ext}`, {
        type: outputType,
        lastModified: Date.now(),
      });
    } catch {
      return file;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        const featuredDelta = Number(b.featured) - Number(a.featured);
        if (featuredDelta !== 0) return featuredDelta;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }),
    [projects],
  );

  async function loadProjects(nextPage = page) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        status: statusFilter,
        page: String(nextPage),
        pageSize: String(pageSize),
      });

      const response = await fetch(`/api/admin/projects?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        projects?: ProjectItem[];
        total?: number;
        page?: number;
        pageCount?: number;
      };

      if (!response.ok) {
        setMessage("Chargement impossible");
        return;
      }

      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setTotal(Number.isFinite(data.total) ? Number(data.total) : 0);
      setPage(Number.isFinite(data.page) ? Number(data.page) : nextPage);
      setPageCount(Number.isFinite(data.pageCount) ? Number(data.pageCount) : 1);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingSlug(null);
    setForm(defaultFormState);
  }

  function toggleProjectSelection(slug: string, checked: boolean) {
    setSelectedSlugs((prev) => {
      if (checked) {
        if (prev.includes(slug)) return prev;
        return [...prev, slug];
      }
      return prev.filter((item) => item !== slug);
    });
  }

  function toggleSelectAllVisible(checked: boolean) {
    if (!checked) {
      setSelectedSlugs([]);
      return;
    }
    setSelectedSlugs(sortedProjects.map((project) => project.slug));
  }

  function startEdit(project: ProjectItem) {
    setEditingSlug(project.slug);
    setForm({
      title: project.title,
      type: project.type,
      summary: project.summary,
      imageUrl: project.imageUrl || "",
      thumbnailUrl: project.thumbnailUrl || "",
      documentUrl: project.documentUrl || "",
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      requiresAccessCode: Boolean(project.requiresAccessCode),
      stack: project.stack.join(", "),
      status: project.status,
      featured: project.featured,
      publishedAt: project.publishedAt,
    });
    setMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const payload = {
      title: form.title,
      type: form.type,
      summary: form.summary,
      imageUrl: form.imageUrl,
      thumbnailUrl: form.thumbnailUrl,
      documentUrl: form.documentUrl,
      liveUrl: form.liveUrl,
      githubUrl: form.githubUrl,
      requiresAccessCode: form.requiresAccessCode,
      stack: form.stack,
      status: form.status,
      featured: form.featured,
      publishedAt: form.publishedAt,
    };

    const url = editingSlug
      ? `/api/admin/projects/${encodeURIComponent(editingSlug)}`
      : "/api/admin/projects";
    const method = editingSlug ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setMessage(data.error || "Operation impossible");
      return;
    }

    setMessage(editingSlug ? "Projet mis a jour" : "Projet cree");
    resetForm();
    await loadProjects(1);
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    await uploadProjectImage(selected);
    event.target.value = "";
  }

  async function uploadWithProgress(file: File): Promise<{ url?: string; error?: string }> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/uploads/project-image");
      xhr.responseType = "json";

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(Math.max(0, Math.min(100, percent)));
      };

      xhr.onload = () => {
        const data = (xhr.response || {}) as { url?: string; error?: string };
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
          return;
        }
        resolve({ error: data.error || "Upload image impossible" });
      };

      xhr.onerror = () => {
        resolve({ error: "Upload image impossible" });
      };

      const formData = new FormData();
      formData.append("file", file);
      xhr.send(formData);
    });
  }

  async function buildThumbnailFile(file: File): Promise<File | null> {
    const supported = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!supported.has(file.type)) return null;

    const imageUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("invalid image"));
        image.src = imageUrl;
      });

      const targetWidth = 540;
      const targetHeight = 320;
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const srcRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;

      let sx = 0;
      let sy = 0;
      let sw = img.width;
      let sh = img.height;

      if (srcRatio > targetRatio) {
        sw = Math.round(img.height * targetRatio);
        sx = Math.round((img.width - sw) / 2);
      } else {
        sh = Math.round(img.width / targetRatio);
        sy = Math.round((img.height - sh) / 2);
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), "image/jpeg", 0.76);
      });

      if (!blob) return null;
      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-thumb.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } catch {
      return null;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  async function uploadProjectImage(selected: File) {
    if (uploadingImage) return;

    setUploadingImage(true);
    setUploadProgress(0);
    setMessage("");

    try {
      const fileToUpload = await compressImageForUpload(selected);
      const previousImage = form.imageUrl;
      const previousThumbnail = form.thumbnailUrl;
      const data = await uploadWithProgress(fileToUpload);

      if (!data.url) {
        setMessage(data.error || "Upload image impossible");
        return;
      }

      if (previousImage && previousImage !== data.url) {
        await fetch("/api/admin/uploads/project-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: previousImage }),
        }).catch(() => null);
      }

      const thumbnailCandidate = await buildThumbnailFile(fileToUpload);
      let nextThumbnailUrl = form.thumbnailUrl;
      if (thumbnailCandidate) {
        const thumbUpload = await uploadWithProgress(thumbnailCandidate);
        if (thumbUpload.url) {
          nextThumbnailUrl = thumbUpload.url;
          if (previousThumbnail && previousThumbnail !== nextThumbnailUrl) {
            await fetch("/api/admin/uploads/project-image", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: previousThumbnail }),
            }).catch(() => null);
          }
        }
      }

      setForm((prev) => ({
        ...prev,
        imageUrl: data.url || prev.imageUrl,
        thumbnailUrl: nextThumbnailUrl,
      }));
      if (fileToUpload.size < selected.size) {
        const savedKb = Math.round((selected.size - fileToUpload.size) / 1024);
        setMessage(`Image telechargee (compressee, gain ${savedKb} KB)`);
      } else {
        setMessage("Image telechargee");
      }
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  }

  async function handleDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDropActive(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await uploadProjectImage(file);
  }

  async function handleRemoveImage() {
    if (!form.imageUrl) return;

    const current = form.imageUrl;
    const ok = window.confirm("Supprimer cette image ?");
    if (!ok) return;

    await fetch("/api/admin/uploads/project-image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: current }),
    }).catch(() => null);

    if (form.thumbnailUrl) {
      await fetch("/api/admin/uploads/project-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.thumbnailUrl }),
      }).catch(() => null);
    }

    setForm((prev) => ({ ...prev, imageUrl: "", thumbnailUrl: "" }));
    setMessage("Image retiree");
  }

  async function handleDelete(slug: string) {
    const ok = window.confirm(`Supprimer le projet ${slug} ?`);
    if (!ok) return;

    const response = await fetch(`/api/admin/projects/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setMessage("Projet supprime");
      if (editingSlug === slug) resetForm();
      await loadProjects(page);
      return;
    }

    setMessage("Suppression impossible");
  }

  async function bulkDeleteSelected() {
    if (selectedSlugs.length === 0) return;
    const ok = window.confirm(`Supprimer ${selectedSlugs.length} projet(s) ?`);
    if (!ok) return;

    let deleted = 0;
    for (const slug of selectedSlugs) {
      const response = await fetch(`/api/admin/projects/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (response.ok) {
        deleted += 1;
      }
    }

    setSelectedSlugs([]);
    setMessage(`${deleted} projet(s) supprime(s)`);
    await loadProjects(page);
  }

  async function bulkSetStatus(status: "published" | "draft") {
    if (selectedSlugs.length === 0) return;
    let updated = 0;

    for (const slug of selectedSlugs) {
      const response = await fetch(`/api/admin/projects/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        updated += 1;
      }
    }

    setMessage(`${updated} projet(s) passes en ${status}`);
    await loadProjects(page);
  }

  return (
    <div className="grid" style={{ gap: "1rem" }}>
      <section className="card">
        <h2>{editingSlug ? `Modifier ${editingSlug}` : "Nouveau projet"}</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            <span>Titre</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>Type</span>
            <select
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, type: event.target.value as ProjectType }))
              }
            >
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Resume</span>
            <textarea
              rows={4}
              value={form.summary}
              onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>Image URL</span>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, imageUrl: event.target.value }))
              }
              placeholder="/uploads/projects/mon-image.jpg"
            />
          </label>

          <label>
            <span>Upload image</span>
            <input
              id="project-image-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
          </label>

          <section
            className="card"
            role="button"
            tabIndex={0}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDropActive(true);
            }}
            onDragLeave={() => setIsDropActive(false)}
            onDrop={(event) => {
              void handleDrop(event);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                const input = document.getElementById(
                  "project-image-file-input",
                ) as HTMLInputElement | null;
                input?.click();
              }
            }}
            style={{
              border: `1px dashed ${isDropActive ? "var(--accent)" : "var(--line)"}`,
              background: isDropActive ? "rgba(17, 24, 39, 0.03)" : "transparent",
              cursor: "pointer",
            }}
            onClick={() => {
              const input = document.getElementById(
                "project-image-file-input",
              ) as HTMLInputElement | null;
              input?.click();
            }}
          >
            <p>
              {uploadingImage
                ? "Upload en cours..."
                : "Glisse une image ici ou clique pour selectionner"}
            </p>
            {uploadingImage ? (
              <div>
                <progress value={uploadProgress} max={100} style={{ width: "100%" }} />
                <p>{uploadProgress}%</p>
              </div>
            ) : null}
          </section>

          {form.imageUrl ? (
            <div>
              <span style={{ display: "block", marginBottom: "0.4rem" }}>Apercu image</span>
              <SafeProjectImage
                src={form.imageUrl}
                alt="Apercu projet"
                style={{ maxWidth: "260px", borderRadius: "0.6rem", border: "1px solid var(--line)" }}
              />
              <div className="cta-row" style={{ marginTop: "0.5rem" }}>
                <button className="btn" type="button" onClick={() => void handleRemoveImage()}>
                  Supprimer image
                </button>
              </div>
            </div>
          ) : null}

          <label>
            <span>Stack (comma-separated)</span>
            <input
              type="text"
              value={form.stack}
              onChange={(event) => setForm((prev) => ({ ...prev, stack: event.target.value }))}
            />
          </label>

          <label>
            <span>Lien document protege (optionnel)</span>
            <input
              type="text"
              value={form.documentUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, documentUrl: event.target.value }))
              }
              placeholder="https://.../rapport.pdf"
            />
          </label>

          <label>
            <span>Lien live/demo (optionnel)</span>
            <input
              type="text"
              value={form.liveUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, liveUrl: event.target.value }))}
              placeholder="https://..."
            />
          </label>

          <label>
            <span>Lien code source (optionnel)</span>
            <input
              type="text"
              value={form.githubUrl}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, githubUrl: event.target.value }))
              }
              placeholder="https://github.com/..."
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={form.requiresAccessCode}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, requiresAccessCode: event.target.checked }))
              }
            />
            <span>Exiger un code pour acceder au document</span>
          </label>

          <div className="field-grid">
            <label>
              <span>Statut</span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as "published" | "draft",
                  }))
                }
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </label>

            <label>
              <span>Date publication</span>
              <input
                type="date"
                value={form.publishedAt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, publishedAt: event.target.value }))
                }
              />
            </label>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, featured: event.target.checked }))
              }
            />
            <span>En vedette</span>
          </label>

          <div className="cta-row">
            <button className="btn primary" type="submit">
              {editingSlug ? "Mettre a jour" : "Creer"}
            </button>
            <button className="btn" type="button" onClick={resetForm}>
              Reinitialiser
            </button>
          </div>
        </form>
        {message ? <p className="form-msg success">{message}</p> : null}
      </section>

      <section className="card">
        <h2>Catalogue admin ({projects.length})</h2>
        <div className="cta-row" style={{ marginBottom: "0.8rem" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <input
              type="checkbox"
              checked={
                sortedProjects.length > 0 && selectedSlugs.length === sortedProjects.length
              }
              onChange={(event) => toggleSelectAllVisible(event.target.checked)}
            />
            <span>Tout selectionner</span>
          </label>
          <span style={{ alignSelf: "center" }}>{selectedSlugs.length} selectionne(s)</span>
          <button
            className="btn"
            type="button"
            disabled={selectedSlugs.length === 0}
            onClick={() => void bulkSetStatus("published")}
          >
            Publier selection
          </button>
          <button
            className="btn"
            type="button"
            disabled={selectedSlugs.length === 0}
            onClick={() => void bulkSetStatus("draft")}
          >
            Mettre en brouillon
          </button>
          <button
            className="btn"
            type="button"
            disabled={selectedSlugs.length === 0}
            onClick={() => void bulkDeleteSelected()}
          >
            Supprimer selection
          </button>
        </div>
        <div className="grid grid-3" style={{ marginBottom: "0.8rem" }}>
          <input
            type="text"
            placeholder="Recherche titre, resume, stack..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | "published" | "draft")
            }
          >
            <option value="all">Tous statuts</option>
            <option value="published">published</option>
            <option value="draft">draft</option>
          </select>
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value) || 6)}
          >
            <option value={6}>6 / page</option>
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
          </select>
        </div>
        <div className="cta-row" style={{ marginBottom: "0.8rem" }}>
          <button className="btn" type="button" onClick={() => void loadProjects(1)}>
            Rechercher
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
              setPage(1);
              void loadProjects(1);
            }}
          >
            Effacer filtres
          </button>
          <span style={{ alignSelf: "center" }}>Resultats: {total}</span>
        </div>
        {loading ? <p>Chargement...</p> : null}
        {!loading && sortedProjects.length === 0 ? <p>Aucun projet.</p> : null}

        <div className="grid">
          {sortedProjects.map((project) => (
            <article className="card" key={project.slug}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <input
                  type="checkbox"
                  checked={selectedSlugs.includes(project.slug)}
                  onChange={(event) => toggleProjectSelection(project.slug, event.target.checked)}
                />
                <span>Selectionner</span>
              </label>
              <div className="cta-row" style={{ justifyContent: "space-between" }}>
                <strong>{project.title}</strong>
                <span>{project.status}</span>
              </div>
              <p>{project.type}</p>
              <p>{project.summary}</p>
              {project.documentUrl ? (
                <p>
                  Document: {project.requiresAccessCode ? "protégé" : "public"}
                </p>
              ) : null}
              {project.liveUrl ? <p>Live: disponible</p> : null}
              {project.githubUrl ? <p>Code: disponible</p> : null}
              {project.imageUrl || project.thumbnailUrl ? (
                <div>
                  <SafeProjectImage
                    src={project.thumbnailUrl || project.imageUrl}
                    alt={`Image ${project.title}`}
                    style={{ width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "0.6rem" }}
                  />
                </div>
              ) : null}
              <p>{project.stack.join(" · ")}</p>
              <div className="cta-row">
                <button className="btn" type="button" onClick={() => startEdit(project)}>
                  Modifier
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={() => handleDelete(project.slug)}
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="cta-row" style={{ marginTop: "1rem" }}>
          <button
            className="btn"
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => void loadProjects(page - 1)}
          >
            Precedent
          </button>
          <span style={{ alignSelf: "center" }}>
            Page {page} / {pageCount}
          </span>
          <button
            className="btn"
            type="button"
            disabled={page >= pageCount || loading}
            onClick={() => void loadProjects(page + 1)}
          >
            Suivant
          </button>
        </div>
      </section>
    </div>
  );
}
