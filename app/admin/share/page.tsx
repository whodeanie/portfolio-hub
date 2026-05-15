import ShareTool from "./ShareTool";

export const metadata = {
  title: "Share helper. Admin only.",
  robots: { index: false, follow: false }
};

export default function AdminSharePage() {
  return (
    <main className="min-h-screen px-6 sm:px-8 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="serif text-4xl font-medium tracking-tight">Share helper</h1>
        <p className="mt-2 text-sm text-[var(--fg)]/70">
          Build a UTM tagged link for a recipient. The list below stays on this device
          (browser localStorage), so you can see who you have sent to.
        </p>
        <ShareTool />
      </div>
    </main>
  );
}
