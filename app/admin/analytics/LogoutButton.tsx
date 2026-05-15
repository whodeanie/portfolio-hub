"use client";

export default function LogoutButton() {
  async function onLogout() {
    try {
      await fetch("/admin/api/logout", { method: "POST" });
    } catch {
      // ignore, still redirect
    }
    window.location.href = "/admin/login";
  }
  return (
    <button
      type="button"
      onClick={onLogout}
      className="text-[var(--fg)]/70 hover:text-[var(--accent)]"
    >
      Sign out
    </button>
  );
}
