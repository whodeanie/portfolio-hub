"use client";

interface SandboxPillProps {
  kind?: "demo" | "game";
}

export default function SandboxPill({ kind = "demo" }: SandboxPillProps) {
  const text = kind === "game" ? "Play in browser" : "Live demo · No signup";

  return (
    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#F5EFE0] border border-[#B87333] rounded-full px-3 py-1.5 font-mono text-[11px] tracking-widest text-[#B87333]">
      <div className="w-1.5 h-1.5 rounded-full bg-[#3D5A4E]" />
      <span>{text}</span>
    </div>
  );
}
