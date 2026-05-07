"use client";

import { useEffect, useMemo, useState } from "react";
import { chatCompletion, getStoredKey } from "../../../lib/groq";
import GroqKeyPanel from "../../../components/GroqKeyPanel";

type Genre = "sci-fi" | "fantasy" | "noir" | "romance" | "horror";

const GENRES: { id: Genre; label: string; setups: string[] }[] = [
  {
    id: "sci-fi",
    label: "Sci-fi",
    setups: [
      "A derelict salvage ship answers your distress call after eight years of silence.",
      "The colony AI requests one final conversation before it shuts itself down.",
      "Your bunk pod opens early. The mission clock reads negative twelve years.",
    ],
  },
  {
    id: "fantasy",
    label: "Fantasy",
    setups: [
      "The forest stops where the road bends. A barefoot child waits at the line.",
      "Your inheritance is a cracked wax seal and a single name written in blood.",
      "The royal cartographer left you a map with one province scribbled out.",
    ],
  },
  {
    id: "noir",
    label: "Noir",
    setups: [
      "A woman in a green coat slides a key across the diner counter and walks out.",
      "The detective who took your case is dead. Your retainer is missing.",
      "Your tenant in 4B has not been seen in nine days. Her cat is still fed.",
    ],
  },
  {
    id: "romance",
    label: "Romance",
    setups: [
      "Your seatmate rebooked the entire delayed flight to keep you next to them.",
      "The bookshop owner remembered your name from a single visit two years ago.",
      "An old letter arrives in your mail with no postmark and a familiar hand.",
    ],
  },
  {
    id: "horror",
    label: "Horror",
    setups: [
      "The hallway in your apartment is one door longer than it was last night.",
      "Your photo memory app keeps returning a face you do not recognize.",
      "The lighthouse beam went out three nights ago. The keeper has not called in.",
    ],
  },
];

type Choice = { id: string; label: string; alignment: Alignment };

type Alignment = "chivalrous" | "pragmatic" | "chaotic";

type Scene = {
  index: number;
  body: string;
  choices: Choice[];
  picked?: Choice;
};

type Saved = {
  genre: Genre;
  setup: string;
  scenes: Scene[];
  ending?: string;
  alignment: Record<Alignment, number>;
};

const STORAGE_KEY = "kdj_storyteller_v1";
const TOTAL_SCENES_MIN = 5;
const TOTAL_SCENES_MAX = 7;

function newAlignment(): Record<Alignment, number> {
  return { chivalrous: 0, pragmatic: 0, chaotic: 0 };
}

function leadingAlignment(a: Record<Alignment, number>): Alignment {
  let best: Alignment = "pragmatic";
  let bestVal = -1;
  (["chivalrous", "pragmatic", "chaotic"] as const).forEach((k) => {
    if (a[k] > bestVal) {
      bestVal = a[k];
      best = k;
    }
  });
  return best;
}

function parseSceneJson(raw: string): { body: string; choices: Choice[] } | null {
  // Try to extract a JSON block.
  let text = raw.trim();
  const fence = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.body !== "string") return null;
    if (!Array.isArray(parsed?.choices) || parsed.choices.length !== 3) return null;
    const choices: Choice[] = parsed.choices.map((c: any, i: number) => ({
      id: String.fromCharCode(65 + i),
      label: String(c.label || c.text || ""),
      alignment:
        c.alignment === "chivalrous" || c.alignment === "pragmatic" || c.alignment === "chaotic"
          ? c.alignment
          : (["chivalrous", "pragmatic", "chaotic"] as Alignment[])[i % 3],
    }));
    return { body: String(parsed.body), choices };
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `You are a tight, evocative interactive fiction writer. You output STRICT JSON only with no surrounding prose.
Respond with: { "body": "<200 word scene in second person>", "choices": [ {"label": "<short imperative>", "alignment": "chivalrous|pragmatic|chaotic"}, ...exactly 3 ] }
Rules. Body is 180 to 220 words, second person, present tense. Choices are short verbs, ten words or less each. Do not number them. Each of the three alignments must appear exactly once across the three choices. No em dashes or en dashes.`;

const ENDING_PROMPT = `You are a tight, evocative interactive fiction writer. Write the ending of a story.
Output STRICT JSON only: { "body": "<closing scene, 180 to 240 words>", "title": "<short title under 8 words>" }
Rules. Reflect the player's leading alignment subtly in the tone and outcome. Resolve the central thread set up in scene one. Second person, present tense. No em dashes or en dashes.`;

export default function StorytellerPage() {
  const [genre, setGenre] = useState<Genre>("sci-fi");
  const [setup, setSetup] = useState<string>(GENRES[0].setups[0]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [alignment, setAlignment] = useState<Record<Alignment, number>>(newAlignment);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [ending, setEnding] = useState<string>("");
  const [endingTitle, setEndingTitle] = useState<string>("");
  const [targetLength, setTargetLength] = useState<number>(6);

  useEffect(() => {
    setHasKey(!!getStoredKey());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        if (s?.scenes?.length) {
          setGenre(s.genre);
          setSetup(s.setup);
          setScenes(s.scenes);
          setAlignment(s.alignment);
          if (s.ending) setEnding(s.ending);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const data: Saved = { genre, setup, scenes, alignment, ending };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [genre, setup, scenes, alignment, ending]);

  const setups = useMemo(() => GENRES.find((g) => g.id === genre)?.setups || [], [genre]);

  async function startStory() {
    if (!getStoredKey()) {
      setError("Connect a Groq key first to start a story.");
      return;
    }
    setBusy(true);
    setError("");
    setEnding("");
    setEndingTitle("");
    setScenes([]);
    setAlignment(newAlignment());
    setTargetLength(Math.floor(Math.random() * (TOTAL_SCENES_MAX - TOTAL_SCENES_MIN + 1)) + TOTAL_SCENES_MIN);
    try {
      const text = await chatCompletion(
        [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Genre: ${genre}.\nOpening setup: ${setup}\nWrite scene 1.`,
          },
        ],
        { temperature: 0.85, maxTokens: 700 },
      );
      const parsed = parseSceneJson(text);
      if (!parsed) throw new Error("parse_error");
      setScenes([{ index: 1, body: parsed.body, choices: parsed.choices }]);
    } catch (e: any) {
      setError(e?.message === "parse_error" ? "The model returned malformed JSON. Try again." : "Story start failed. Check your Groq key.");
    } finally {
      setBusy(false);
    }
  }

  async function pickChoice(choice: Choice) {
    if (busy) return;
    if (!getStoredKey()) {
      setError("Connect a Groq key first.");
      return;
    }
    const updated = [...scenes];
    updated[updated.length - 1] = { ...updated[updated.length - 1], picked: choice };
    setScenes(updated);
    setAlignment((a) => ({ ...a, [choice.alignment]: a[choice.alignment] + 1 }));

    if (updated.length >= targetLength) {
      // Generate ending.
      setBusy(true);
      setError("");
      try {
        const lead = leadingAlignment({ ...alignment, [choice.alignment]: alignment[choice.alignment] + 1 });
        const transcript = updated
          .map((s) => `Scene ${s.index}: ${s.body}\nPicked: ${s.picked?.label} (${s.picked?.alignment})`)
          .join("\n\n");
        const text = await chatCompletion(
          [
            { role: "system", content: ENDING_PROMPT },
            {
              role: "user",
              content: `Genre: ${genre}.\nLeading alignment: ${lead}.\nTranscript so far:\n${transcript}\n\nWrite the closing scene.`,
            },
          ],
          { temperature: 0.85, maxTokens: 700 },
        );
        let raw = text.trim();
        const fence = raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/);
        if (fence) raw = fence[1].trim();
        const parsed = JSON.parse(raw);
        setEnding(String(parsed.body || ""));
        setEndingTitle(String(parsed.title || "Ending"));
      } catch (e) {
        setError("Ending generation failed. Try again.");
      } finally {
        setBusy(false);
      }
      return;
    }

    // Generate next scene.
    setBusy(true);
    setError("");
    try {
      const transcript = updated
        .map((s) => `Scene ${s.index}: ${s.body}\nPicked: ${s.picked?.label} (${s.picked?.alignment})`)
        .join("\n\n");
      const text = await chatCompletion(
        [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Genre: ${genre}.\nTranscript so far:\n${transcript}\n\nWrite scene ${updated.length + 1}. Keep continuity.`,
          },
        ],
        { temperature: 0.85, maxTokens: 700 },
      );
      const parsed = parseSceneJson(text);
      if (!parsed) throw new Error("parse_error");
      setScenes([...updated, { index: updated.length + 1, body: parsed.body, choices: parsed.choices }]);
    } catch (e: any) {
      setError(e?.message === "parse_error" ? "The model returned malformed JSON. Try the choice again." : "Next scene failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function resetStory() {
    setScenes([]);
    setEnding("");
    setEndingTitle("");
    setAlignment(newAlignment());
    setError("");
  }

  const lead = leadingAlignment(alignment);
  const total = alignment.chivalrous + alignment.pragmatic + alignment.chaotic;

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
            Storyteller.
          </h1>
          <p className="mt-3 text-sm text-[var(--fg)]/75 leading-relaxed">
            Pick a genre and a starting setup. Groq Llama 3.3 70B writes a 200
            word scene with three choices, you pick one, the story continues.
            Five to seven scenes plus an ending tuned to your leading alignment.
          </p>
        </header>

        <div className="mt-6">
          <GroqKeyPanel label="Storyteller" onChange={setHasKey} />
        </div>

        {scenes.length === 0 && !ending && (
          <section className="mt-8 space-y-4">
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                Genre
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGenre(g.id);
                      setSetup(g.setups[0]);
                    }}
                    className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 rounded border ${genre === g.id ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--rule)] text-[var(--muted)]"}`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                Opening setup
              </h3>
              <div className="mt-2 space-y-2">
                {setups.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSetup(s)}
                    className={`w-full text-left rounded border px-3 py-2 text-sm leading-relaxed ${setup === s ? "border-[var(--accent)] text-[var(--fg)]" : "border-[var(--rule)] text-[var(--fg)]/75"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={startStory}
              disabled={busy || !hasKey}
              className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded border border-[var(--accent)] text-[var(--accent)] disabled:opacity-40"
            >
              {busy ? "Writing..." : "Begin"}
            </button>
            {error && <p className="text-xs text-[#D49A7A]">{error}</p>}
          </section>
        )}

        {scenes.length > 0 && (
          <section className="mt-8 space-y-8">
            {scenes.map((s) => (
              <article key={s.index} className="">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                  Scene {s.index}
                </h3>
                <div className="mt-3 prose-body text-[var(--fg)]/90 leading-relaxed whitespace-pre-wrap">
                  {s.body}
                </div>
                {s.picked ? (
                  <p className="mt-3 text-xs font-mono text-[var(--accent)]">
                    You chose: {s.picked.label}
                  </p>
                ) : (
                  <div className="mt-4 space-y-2">
                    {s.choices.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => pickChoice(c)}
                        disabled={busy}
                        className="block w-full text-left rounded border border-[var(--rule)] hover:border-[var(--accent)] px-3 py-2 text-sm leading-relaxed disabled:opacity-50"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mr-2">
                          {c.id}
                        </span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
            {busy && !ending && (
              <p className="text-xs font-mono text-[var(--muted)]">
                Writing the next scene...
              </p>
            )}
            {error && <p className="text-xs text-[#D49A7A]">{error}</p>}
          </section>
        )}

        {ending && (
          <section className="mt-8">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              Ending
            </h3>
            <h2 className="serif text-2xl mt-2">{endingTitle}</h2>
            <div className="mt-3 prose-body text-[var(--fg)]/90 leading-relaxed whitespace-pre-wrap">
              {ending}
            </div>
            <div className="mt-4 text-xs text-[var(--fg)]/65">
              Leading alignment: <span className="font-mono text-[var(--accent)]">{lead}</span>
              {total > 0 ? ` (chivalrous ${alignment.chivalrous}, pragmatic ${alignment.pragmatic}, chaotic ${alignment.chaotic})` : ""}
            </div>
          </section>
        )}

        {(scenes.length > 0 || ending) && (
          <div className="mt-8">
            <button
              type="button"
              onClick={resetStory}
              className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Start over
            </button>
          </div>
        )}

        <section className="mt-16 section-rule pt-10">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            How this works
          </h2>
          <div className="mt-4 prose-body text-sm text-[var(--fg)]/80 leading-relaxed space-y-3">
            <p>
              Each scene is one Groq Llama 3.3 70B call with a strict JSON
              contract. The system prompt forces a 200 word body, three
              choices, and exactly one of each alignment label per scene so the
              alignment vector cannot be gamed by giving the same option three
              times.
            </p>
            <p>
              On every choice the alignment counter increments and the full
              transcript so far gets re sent as context. There is no implicit
              memory in the API, so the prompt itself is the memory. The
              ending pulls the leading alignment into a dedicated prompt that
              asks for a closing scene with subtly tuned tone.
            </p>
            <p>
              State persists in localStorage so you can close the tab and come
              back. The Groq key never leaves your browser. JSON parse failures
              are surfaced clearly rather than swallowed because portfolio
              demos should fail loudly.
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
