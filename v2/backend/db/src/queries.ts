import type { D1Like } from "./client";
import type { Message, Project } from "./schema";

export async function getPublishedProjects(db: D1Like): Promise<Project[]> {
  const sql = `
    SELECT
      id,
      slug,
      title,
      short_desc AS shortDesc,
      long_desc_md AS longDescMd,
      featured,
      status,
      order_index AS orderIndex,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM projects
    WHERE status = ?
    ORDER BY featured DESC, order_index ASC, updated_at DESC
  `;

  const response = await db.prepare(sql).bind("published").all<Project>();
  return response.results ?? [];
}

export async function ensureMessagesTable(db: D1Like): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      body TEXT NOT NULL,
      ip_hash TEXT,
      read_at TEXT,
      replied_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `;

  await db.prepare(sql).bind().run();
}

export async function insertMessage(
  db: D1Like,
  payload: {
    id: string;
    name: string;
    email: string;
    subject?: string;
    body: string;
    ipHash?: string | null;
  },
): Promise<void> {
  const sql = `
    INSERT INTO messages (id, name, email, subject, body, ip_hash)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await db
    .prepare(sql)
    .bind(
      payload.id,
      payload.name,
      payload.email,
      payload.subject ?? "",
      payload.body,
      payload.ipHash ?? null,
    )
    .run();
}

export async function listMessages(db: D1Like, limit = 200): Promise<Message[]> {
  const sql = `
    SELECT
      id,
      name,
      email,
      subject,
      body,
      read_at AS readAt,
      replied_at AS repliedAt,
      ip_hash AS createdFromIp,
      created_at AS createdAt
    FROM messages
    ORDER BY datetime(created_at) DESC
    LIMIT ?
  `;

  const response = await db.prepare(sql).bind(limit).all<Message>();
  return response.results ?? [];
}

export async function getMessageById(db: D1Like, id: string): Promise<Message | null> {
  const sql = `
    SELECT
      id,
      name,
      email,
      subject,
      body,
      read_at AS readAt,
      replied_at AS repliedAt,
      ip_hash AS createdFromIp,
      created_at AS createdAt
    FROM messages
    WHERE id = ?
    LIMIT 1
  `;

  return db.prepare(sql).bind(id).first<Message>();
}

export async function markMessageRead(db: D1Like, id: string): Promise<void> {
  const sql = `
    UPDATE messages
    SET read_at = COALESCE(read_at, datetime('now'))
    WHERE id = ?
  `;

  await db.prepare(sql).bind(id).run();
}
