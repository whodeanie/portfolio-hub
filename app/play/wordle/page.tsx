"use client";

import { useEffect, useMemo, useState } from "react";
import { ANSWERS, wordleAnswerForDate } from "../../../lib/wordle-words";
import { chatCompletion, getStoredKey } from "../../../lib/groq";
import GroqKeyPanel from "../../../components/GroqKeyPanel";

type Letter = { ch: string; state: "empty" | "absent" | "present" | "correct" };
type Row = Letter[];

const ROWS = 6;
const COLS = 5;

function emptyGrid(): Row[] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ ch: "", state: "empty" as const })),
  );
}

function scoreGuess(guess: string, answer: string): Row {
  const g = guess.toUpperCase().split("");
  const a = answer.toUpperCase().split("");
  const result: Row = g.map((ch) => ({ ch, state: "absent" }));
  // First pass: correct
  const taken = Array(COLS).fill(false);
  for (let i = 0; i < COLS; i += 1) {
    if (g[i] === a[i]) {
      result[i].state = "correct";
      taken[i] = true;
    }
  }
  // Second pass: present
  for (let i = 0; i < COLS; i += 1) {
    if (result[i].state === "correct") continue;
    for (let j = 0; j < COLS; j += 1) {
      if (!taken[j] && g[i] === a[j]) {
        result[i].state = "present";
        taken[j] = true;
        break;
      }
    }
  }
  return result;
}

const STATE_KEY = "kdj_wordle_state_v1";
const STATS_KEY = "kdj_wordle_stats_v1";

type SavedState = {
  date: string;
  guesses: string[];
  done: boolean;
  won: boolean;
};

type Stats = {
  played: number;
  wins: number;
  streak: number;
  bestStreak: number;
  lastWonDate: string | null;
  distribution: number[];
};

const EMPTY_STATS: Stats = {
  played: 0,
  wins: 0,
  streak: 0,
  bestStreak: 0,
  lastWonDate: null,
  distribution: [0, 0, 0, 0, 0, 0],
};

function todayUTC(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function colorFor(state: Letter["state"]): string {
  if (state === "correct") return "#5BA776";
  if (state === "present") return "#D4A574";
  if (state === "absent") return "#6E6A63";
  return "transparent";
}

function fgFor(state: Letter["state"]): string {
  return state === "empty" ? "var(--fg)" : "#fff";
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

function keyState(guesses: string[], answer: string): Record<string, Letter["state"]> {
  const map: Record<string, Letter["state"]> = {};
  for (const guess of guesses) {
    const row = scoreGuess(guess, answer);
    for (const cell of row) {
      const cur = map[cell.ch];
      if (cur === "correct") continue;
      if (cur === "present" && cell.state !== "correct") continue;
      map[cell.ch] = cell.state;
    }
  }
  return map;
}

export default function WordlePage() {
  const answer = useMemo(() => wordleAnswerForDate(), []);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setHasKey(!!getStoredKey());
    const today = todayUTC();
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedState;
        if (saved.date === today) {
          setGuesses(saved.guesses);
          setDone(saved.done);
          setWon(saved.won);
        }
      }
      const sraw = localStorage.getItem(STATS_KEY);
      if (sraw) setStats({ ...EMPTY_STATS, ...(JSON.parse(sraw) as Stats) });
    } catch {}
  }, []);

  useEffect(() => {
    const today = todayUTC();
    const saved: SavedState = { date: today, guesses, done, won };
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(saved));
    } catch {}
  }, [guesses, done, won]);

  function commitStats(winRow: number | null) {
    setStats((prev) => {
      const today = todayUTC();
      const dist = [...prev.distribution];
      let streak = prev.streak;
      let bestStreak = prev.bestStreak;
      if (winRow !== null) {
        dist[winRow] = (dist[winRow] || 0) + 1;
        const yesterday = (() => {
          const d = new Date();
          d.setUTCDate(d.getUTCDate() - 1);
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
        })();
        streak = prev.lastWonDate === yesterday ? prev.streak + 1 : 1;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        streak = 0;
      }
      const next: Stats = {
        played: prev.played + 1,
        wins: prev.wins + (winRow !== null ? 1 : 0),
        streak,
        bestStreak,
        lastWonDate: winRow !== null ? today : prev.lastWonDate,
        distribution: dist,
      };
      try {
        localStorage.setItem(STATS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function submitGuess() {
    if (current.length !== COLS) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    const upper = current.toUpperCase();
    const next = [...guesses, upper];
    setGuesses(next);
    setCurrent("");
    if (upper === answer) {
      setDone(true);
      setWon(true);
      commitStats(next.length - 1);
    } else if (next.length >= ROWS) {
      setDone(true);
      commitStats(null);
    }
  }

  function pressKey(k: string) {
    if (done) return;
    if (k === "ENTER") return submitGuess();
    if (k === "BACK") return setCurrent((c) => c.slice(0, -1));
    if (/^[A-Z]$/.test(k) && current.length < COLS) {
      setCurrent((c) => (c + k).toUpperCase());
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (done) return;
      if (e.key === "Enter") {
        e.preventDefault();
        submitGuess();
      } else if (e.key === "Backspace") {
        setCurrent((c) => c.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key) && current.length < COLS) {
        setCurrent((c) => (c + e.key).toUpperCase());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, done]);

  const grid: Row[] = useMemo(() => {
    const g = emptyGrid();
    guesses.forEach((guess, r) => {
      g[r] = scoreGuess(guess, answer);
    });
    if (!done && guesses.length < ROWS) {
      const padded = current.padEnd(COLS, " ").slice(0, COLS);
      g[guesses.length] = padded.split("").map((ch) => ({
        ch: ch === " " ? "" : ch.toUpperCase(),
        state: "empty",
      }));
    }
    return g;
  }, [guesses, current, done, answer]);

  const kbState = useMemo(() => keyState(guesses, answer), [guesses, answer]);

  async function askHint() {
    setHint("");
    setHintError("");
    if (guesses.length === 0) {
      setHintError("Make at least one guess first so I have something to reason about.");
      return;
    }
    if (!getStoredKey()) {
      setHintError("Connect a Groq key first to enable hints.");
      return;
    }
    setHintLoading(true);
    try {
      const scored = guesses.map((g) => {
        const row = scoreGuess(g, answer);
        const annotated = row
          .map((c) => `${c.ch}=${c.state[0]}`)
          .join(" ");
        return `${g}  [${annotated}]`;
      });
      const reply = await chatCompletion(
        [
          {
            role: "system",
            content:
              "You are a Wordle hint coach. The user knows the rules. Give one short sentence (max 30 words) hinting at letter patterns, vowel placement, or common letter combinations that fit their feedback. NEVER reveal the answer or any letter the user has not already locked. Do not write the answer word, partial spelling, or rhymes. No em dashes or en dashes.",
          },
          {
            role: "user",
            content: `Answer length: 5.\nMy guesses with feedback (c=correct, p=present, a=absent):\n${scored.join("\n")}\n\nGive me a small nudge that respects the constraints I have already locked in.`,
          },
        ],
        { temperature: 0.4, maxTokens: 120 },
      );
      setHint(reply);
    } catch (e: any) {
      setHintError(
        e?.message?.startsWith("missing_groq_key")
          ? "Connect a Groq key first."
          : "Hint failed. Try again, or check your Groq key.",
      );
    } finally {
      setHintLoading(false);
    }
  }

  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <main className="min-h-screen px-6 sm:px-8 py-12 sm:py-16">
      <div className="mx-auto max-w-prose">
        <a
          href="/play/"
          className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Back to play
        </a>

        <header className="mt-6">
          <h1 className="serif text-3xl sm:text-4xl leading-[1.05] font-medium tracking-tight">
            Wordle, with an AI hint button.
          </h1>
          <p className="mt-3 text-sm text-[var(--fg)]/75 leading-relaxed">
            Five letters, six tries. The hint button sends your scored guesses to
            Groq Llama 3.3 70B and asks for a nudge that does not reveal the
            answer.
          </p>
        </header>

        <div className="mt-6">
          <GroqKeyPanel label="AI hint" onChange={setHasKey} />
        </div>

        <div className="mt-8 flex flex-col items-center">
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {grid.map((row, ri) =>
              row.map((cell, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded font-mono uppercase text-xl sm:text-2xl font-medium border ${ri === guesses.length && shake ? "animate-pulse" : ""}`}
                  style={{
                    background: colorFor(cell.state),
                    color: fgFor(cell.state),
                    borderColor:
                      cell.state === "empty" ? "var(--rule)" : "transparent",
                  }}
                >
                  {cell.ch}
                </div>
              )),
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1.5">
              {row.map((k) => {
                const wide = k === "ENTER" || k === "BACK";
                const s = kbState[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => pressKey(k)}
                    aria-label={k}
                    className={`rounded font-mono text-xs uppercase tracking-wider border px-2 py-3 ${wide ? "px-3" : "min-w-[2.1rem]"}`}
                    style={{
                      background: s ? colorFor(s) : "transparent",
                      color: s ? "#fff" : "var(--fg)",
                      borderColor: s ? "transparent" : "var(--rule)",
                    }}
                  >
                    {k === "BACK" ? "⌫" : k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={askHint}
            disabled={hintLoading || !hasKey}
            className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded border border-[var(--accent)] text-[var(--accent)] disabled:opacity-40"
          >
            {hintLoading ? "Thinking..." : "Need a hint?"}
          </button>
          <button
            type="button"
            onClick={() => {
              setGuesses([]);
              setCurrent("");
              setDone(false);
              setWon(false);
              setHint("");
              setHintError("");
            }}
            className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded border border-[var(--rule)] text-[var(--muted)]"
          >
            Reset today
          </button>
        </div>

        {(hint || hintError) && (
          <div className="mt-4 rounded-lg border border-[var(--rule)] p-4 text-sm leading-relaxed">
            {hintError ? (
              <span className="text-[#D49A7A]">{hintError}</span>
            ) : (
              <>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mr-2">
                  Hint
                </span>
                {hint}
              </>
            )}
          </div>
        )}

        {done && (
          <div className="mt-6 rounded-lg border border-[var(--accent)] p-4">
            <p className="serif text-lg">
              {won ? "Solved." : "Out of tries."} Today&apos;s answer was{" "}
              <span className="font-mono text-[var(--accent)]">{answer}</span>.
            </p>
            <p className="mt-2 text-sm text-[var(--fg)]/75">
              Played {stats.played} · Win rate {winRate}% · Streak {stats.streak}
              {stats.bestStreak > 0 ? ` · Best ${stats.bestStreak}` : ""}
            </p>
          </div>
        )}

        <section className="mt-16 section-rule pt-10">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            How this works
          </h2>
          <div className="mt-4 prose-body text-sm text-[var(--fg)]/80 leading-relaxed space-y-3">
            <p>
              The answer is selected deterministically per UTC date by indexing
              into a curated pool of {ANSWERS.length} common five letter words.
              Scoring runs the standard two pass algorithm. Greens first, then
              yellows, with each yellow consuming a remaining instance of the
              letter so doubled letters are not over credited.
            </p>
            <p>
              The hint button forwards your guesses with their per letter
              feedback to Groq Llama 3.3 70B and asks for a nudge that does not
              reveal the answer. The system prompt explicitly forbids spelling,
              partial spelling, or rhymes. The response is capped at 30 words
              so it stays a hint and not a giveaway.
            </p>
            <p>
              State and stats persist in localStorage. No backend, no cookies,
              no server side game state. The Groq key is stored in your browser
              only and is sent on each call.
            </p>
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-[var(--rule)] text-xs font-mono text-[var(--muted)] flex flex-wrap items-center justify-between gap-3">
          <a href="/play/" className="hover:text-[var(--accent)]">
            ← Play index
          </a>
          <a href="/" className="hover:text-[var(--accent)]">
            Home →
          </a>
        </footer>
      </div>
    </main>
  );
}
