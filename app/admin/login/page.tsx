import LoginForm from "./LoginForm";

export const metadata = {
  title: "Admin login",
  robots: { index: false, follow: false }
};

export default function AdminLoginPage({
  searchParams
}: {
  searchParams?: { next?: string };
}) {
  const next = searchParams?.next || "/admin/analytics";
  return (
    <main className="min-h-screen px-6 sm:px-8 py-24">
      <div className="mx-auto max-w-sm">
        <h1 className="serif text-3xl font-medium tracking-tight">Admin</h1>
        <p className="mt-3 text-sm text-[var(--fg)]/70">
          Sign in to view the private analytics dashboard.
        </p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
