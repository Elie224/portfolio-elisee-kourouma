import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export interface MessageRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  readAt: string | null;
  repliedAt: string | null;
  createdFromIp: string | null;
  createdAt: string;
}

interface StoreShape {
  messages: MessageRecord[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "messages.json");

interface D1Like {
  prepare: (sql: string) => {
    bind: (...args: unknown[]) => {
      run: () => Promise<unknown>;
      first: <T>() => Promise<T | null>;
      all: <T>() => Promise<{ results: T[] }>;
    };
  };
}

function resolveD1Binding(): D1Like | null {
  const g = globalThis as unknown as {
    DB?: D1Like;
    env?: { DB?: D1Like };
    __env?: { DB?: D1Like };
  };

  return g.DB ?? g.env?.DB ?? g.__env?.DB ?? null;
}

async function ensureMessagesTableD1(db: D1Like): Promise<void> {
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

function normalizeStoreShape(input: unknown): StoreShape {
  if (!input || typeof input !== "object") return { messages: [] };
  const messages = (input as { messages?: unknown }).messages;
  if (!Array.isArray(messages)) return { messages: [] };
  return { messages: messages as MessageRecord[] };
}

async function ensureStore(): Promise<StoreShape> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    return normalizeStoreShape(JSON.parse(raw));
  } catch {
    const initial: StoreShape = { messages: [] };
    await writeFile(STORE_FILE, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

async function saveStore(store: StoreShape): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function createMessage(payload: {
  name: string;
  email: string;
  subject?: string;
  body: string;
  createdFromIp?: string | null;
}): Promise<MessageRecord> {
  const d1 = resolveD1Binding();
  if (d1) {
    await ensureMessagesTableD1(d1);
    const message: MessageRecord = {
      id: randomUUID(),
      name: payload.name,
      email: payload.email,
      subject: payload.subject || "",
      body: payload.body,
      readAt: null,
      repliedAt: null,
      createdFromIp: payload.createdFromIp ?? null,
      createdAt: new Date().toISOString(),
    };

    const sql = `
      INSERT INTO messages (id, name, email, subject, body, ip_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await d1
      .prepare(sql)
      .bind(
        message.id,
        message.name,
        message.email,
        message.subject,
        message.body,
        message.createdFromIp,
      )
      .run();

    return message;
  }

  const store = await ensureStore();
  const now = new Date().toISOString();

  const message: MessageRecord = {
    id: randomUUID(),
    name: payload.name,
    email: payload.email,
    subject: payload.subject || "",
    body: payload.body,
    readAt: null,
    repliedAt: null,
    createdFromIp: payload.createdFromIp ?? null,
    createdAt: now,
  };

  store.messages.unshift(message);
  await saveStore(store);
  return message;
}

export async function listMessages(limit = 200): Promise<MessageRecord[]> {
  const d1 = resolveD1Binding();
  if (d1) {
    await ensureMessagesTableD1(d1);
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

    const response = await d1.prepare(sql).bind(limit).all<MessageRecord>();
    return response.results ?? [];
  }

  const store = await ensureStore();
  return store.messages.slice(0, limit);
}

export async function getMessageById(id: string): Promise<MessageRecord | null> {
  const d1 = resolveD1Binding();
  if (d1) {
    await ensureMessagesTableD1(d1);
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
    return d1.prepare(sql).bind(id).first<MessageRecord>();
  }

  const store = await ensureStore();
  return store.messages.find((item) => item.id === id) ?? null;
}

export async function markMessageRead(id: string): Promise<MessageRecord | null> {
  return setMessageRead(id, true);
}

export async function setMessageRead(
  id: string,
  read: boolean,
): Promise<MessageRecord | null> {
  const d1 = resolveD1Binding();
  if (d1) {
    await ensureMessagesTableD1(d1);

    if (read) {
      const updateSql = `
        UPDATE messages
        SET read_at = COALESCE(read_at, datetime('now'))
        WHERE id = ?
      `;
      await d1.prepare(updateSql).bind(id).run();
    } else {
      const updateSql = `
        UPDATE messages
        SET read_at = NULL
        WHERE id = ?
      `;
      await d1.prepare(updateSql).bind(id).run();
    }

    const selectSql = `
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
    return d1.prepare(selectSql).bind(id).first<MessageRecord>();
  }

  const store = await ensureStore();
  const index = store.messages.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const existing = store.messages[index];
  const nextReadAt = read ? existing.readAt || new Date().toISOString() : null;
  if (existing.readAt !== nextReadAt) {
    store.messages[index] = { ...existing, readAt: nextReadAt };
    await saveStore(store);
  }

  return store.messages[index];
}

export async function deleteMessage(id: string): Promise<boolean> {
  const d1 = resolveD1Binding();
  if (d1) {
    await ensureMessagesTableD1(d1);
    await d1.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
    return true;
  }

  const store = await ensureStore();
  const nextMessages = store.messages.filter((item) => item.id !== id);
  if (nextMessages.length === store.messages.length) {
    return false;
  }

  await saveStore({ messages: nextMessages });
  return true;
}
