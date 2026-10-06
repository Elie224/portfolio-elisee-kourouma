import Link from "next/link";
import { notFound } from "next/navigation";
import { getMessageById } from "@/lib/messages-store";
import MessageAdminActions from "../message-admin-actions";

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = await getMessageById(id);

  if (!message) {
    notFound();
  }

  return (
    <>
      <section className="hero">
        <h1>Message de {message.name}</h1>
        <p>
          Recu le {new Date(message.createdAt).toLocaleString("fr-FR")} · {message.readAt ? "Lu" : "Non lu"}
        </p>
      </section>

      <section className="section">
        <h2>Detail</h2>
        <div className="card">
          <p>
            <strong>Email:</strong> {message.email}
          </p>
          <p>
            <strong>Objet:</strong> {message.subject || "(sans objet)"}
          </p>
          <p>
            <strong>Message:</strong>
          </p>
          <p style={{ whiteSpace: "pre-wrap" }}>{message.body}</p>
          <MessageAdminActions
            id={message.id}
            email={message.email}
            subject={message.subject}
            initiallyRead={Boolean(message.readAt)}
          />
          <div className="cta-row">
            <Link href="/admin/messages" className="btn">
              Retour a la liste
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
