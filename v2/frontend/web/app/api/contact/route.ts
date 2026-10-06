import { NextResponse } from "next/server";
import { createMessage } from "@/lib/messages-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  company?: string;
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as ContactPayload | null;

  if (!payload) {
    return NextResponse.json({ error: "payload invalide" }, { status: 400 });
  }

  if ((payload.company || "").trim().length > 0) {
    return NextResponse.json({ received: true }, { status: 202 });
  }

  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim().toLowerCase();
  const subject = (payload.subject || "").trim();
  const message = (payload.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "name, email and message are required" },
      { status: 400 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email invalide" }, { status: 400 });
  }

  if (message.length < 12) {
    return NextResponse.json(
      { error: "message trop court (12 caracteres min)" },
      { status: 400 },
    );
  }

  if (message.length > 4000 || name.length > 120 || subject.length > 180) {
    return NextResponse.json(
      { error: "contenu trop long" },
      { status: 400 },
    );
  }

  const ipHeader = request.headers.get("x-forwarded-for");
  const ip = ipHeader ? ipHeader.split(",")[0].trim() : null;
  const stored = await createMessage({
    name,
    email,
    subject,
    body: message,
    createdFromIp: ip,
  });

  return NextResponse.json({
    received: true,
    note: "Message valide et enregistre.",
    id: stored.id,
    preview: {
      name,
      email,
      subject,
    },
  });
}
