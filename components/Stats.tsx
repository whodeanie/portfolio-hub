const STATS = [
  { value: "291", label: "n8n workflows shipped" },
  { value: "8+", label: "books published on KDP" },
  { value: "31+", label: "public GitHub repos" },
  { value: "9+", label: "years shipping production" },
];

export default function Stats() {
  return (
    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-y-6 sm:gap-y-0 sm:divide-x sm:divide-[var(--rule)]">
      {STATS.map((s, i) => (
        <div key={s.label} className={i === 0 ? "sm:pr-6" : "sm:px-6"}>
          <div className="serif text-3xl sm:text-4xl font-medium leading-none">{s.value}</div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
