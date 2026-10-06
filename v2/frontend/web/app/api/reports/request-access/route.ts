import { NextResponse } from "next/server";
import { createMessage } from "@/lib/messages-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  reportTitle?: string;
  reportType?: "stage" | "alternance" | "project";
  message?: string;
  company?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as Payload | null;

  if (!payload) {
    return NextResponse.json({ error: "payload invalide" }, { status: 400 });
  }

  if ((payload.company || "").trim().length > 0) {
    return NextResponse.json({ requested: true }, { status: 202 });
  }

  const firstName = String(payload.firstName || "").trim();
  const lastName = String(payload.lastName || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const reportTitle = String(payload.reportTitle || "").trim();
  const reportType =
    payload.reportType === "alternance"
      ? "alternance"
      : payload.reportType === "project"
        ? "project"
        : "stage";
  const note = String(payload.message || "").trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "email invalide" }, { status: 400 });
  }

  if (!reportTitle) {
    return NextResponse.json({ error: "rapport introuvable" }, { status: 400 });
  }

  const name = [firstName, lastName].join(" ").trim() || "Demande rapport";
  const subject = `Demande rapport (${reportType}) - ${reportTitle}`;
  const body =
    `Demande de code pour rapport ${reportType}.\n` +
    `Titre: ${reportTitle}\n` +
    `Contact: ${email}\n` +
    (note ? `Message: ${note}` : "Message: (vide)");

  const ipHeader = request.headers.get("x-forwarded-for");
  const ip = ipHeader ? ipHeader.split(",")[0].trim() : null;

  await createMessage({
    name,
    email,
    subject,
    body,
    createdFromIp: ip,
  });

  return NextResponse.json({
    requested: true,
    note: "Demande envoyee a l'administrateur.",
  });
}
