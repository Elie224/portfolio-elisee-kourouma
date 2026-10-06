import LoginForm from "./login-form";

export const metadata = {
  title: "Admin Login - Portfolio V2",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/admin";

  return (
    <>
      <section className="hero">
        <h1>Connexion admin</h1>
        <p>
          Acces protege pour gerer les projets, le contenu global et les
          messages.
        </p>
      </section>

      <section className="section">
        <h2>Se connecter</h2>
        <LoginForm nextPath={nextPath} />
      </section>
    </>
  );
}
