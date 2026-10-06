import { listMessages } from "@/lib/messages-store";
import MessagesAdminPanel from "./messages-admin-panel";

export const metadata = {
  title: "Admin Messages - Portfolio V2",
};

export default async function AdminMessagesPage() {
  const messages = await listMessages(200);

  return <MessagesAdminPanel initialMessages={messages} />;
}
