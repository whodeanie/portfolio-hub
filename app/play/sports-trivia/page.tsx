"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chatCompletion } from "../../../lib/groq";
import {
  TriviaQuestion,
  getFallbackQuestions,
  hasFallback,
} from "../../../lib/triviaFallback";

type SportId =
  | "nba"
  | "nfl"
  | "mlb"
  | "nhl"
  | "ncaa-football"
  | "ncaa-basketball"
  | "soccer-epl"
  | "soccer-ucl"
  | "soccer-mls"
  | "tennis"
  | "golf"
  | "boxing"
  | "mma"
  | "f1"
  | "nascar"
  | "olympics";

type Sport = {
  id: SportId;
  label: string;
  groqLabel: string;
  glyph: string;
  fallbackKey: string;
};

const SPORTS: Sport[] = [
  { id: "nba", label: "NBA", groqLabel: "NBA basketball", glyph: "🏀", fallbackKey: "nba" },
  { id: "nfl", label: "NFL", groqLabel: "NFL football", glyph: "🏈", fallbackKey: "nfl" },
  { id: "mlb", label: "MLB", groqLabel: "Major League Baseball", glyph: "⚾", fallbackKey: "mlb" },
  { id: "nhl", label: "NHL", groqLabel: "NHL hockey", glyph: "🏒", fallbackKey: "nhl" },
  {
    id: "ncaa-football",
    label: "NCAA Football",
    groqLabel: "college football",
    glyph: "🏟️",
    fallbackKey: "ncaa-football",
  },
  {
    id: "ncaa-basketball",
    label: "NCAA Hoops",
    groqLabel: "NCAA mens college basketball",
    glyph: "🎓",
    fallbackKey: "ncaa-basketball",
  },
  {
    id: "soccer-epl",
    label: "Premier League",
    groqLabel: "English Premier League soccer",
    glyph: "⚽",
    fallbackKey: "soccer",
  },
  {
    id: "soccer-ucl",
    label: "Champions League",
    groqLabel: "UEFA Champions League soccer",
    glyph: "🏆",
    fallbackKey: "soccer",
  },
  {
    id: "soccer-mls",
    label: "MLS",
    groqLabel: "Major League Soccer",
    glyph: "🥅",
    fallbackKey: "soccer",
  },
  { id: "tennis", label: "Tennis", groqLabel: "professional tennis", glyph: "🎾", fallbackKey: "tennis" },
  { id: "golf", label: "Golf", groqLabel: "PGA and LPGA golf", glyph: "⛳", fallbackKey: "golf" },
  { id: "boxing", label: "Boxing", groqLabel: "professional boxing", glyph: "🥊", fallbackKey: "boxing" },
  { id: "mma", label: "MMA", groqLabel: "mixed martial arts and the UFC", glyph: "🥋", fallbackKey: "mma" },
  { id: "f1", label: "F1", groqLabel: "Formula 1 racing", glyph: "🏎️", fallbackKey: "f1" },
  { id: "nascar", label: "NASCAR", groqLabel: "NASCAR stock car racing", glyph: "🏁", fallbackKey: "nascar" },
  {
    id: "olympics",
    label: "Olympics",
    groqLabel: "Olympic Games summer and winter",
    glyph: "🥇",
    fallbackKey: "olympics",
  },
];

type Difficulty = "easy" | "medium" | "hard" | "mixed";

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "mixed", label: "Mixed" },
];

type Phase =
  | "picker"
  | "loading"
  | "playing"
  | "answered"
  | "ended";

type AnswerLog = {
  picked: number | null;
  correct: number;
  msTaken: number;
  awarded: number;
};

const QUESTION_SECONDS = 6;
const TIMER_MS = QUESTION_SECONDS * 1000;
const REVEAL_MS = 1500;
const HIGH_SCORE_PREFIX = "kdj_trivia_high_v1_";
const MUTE_KEY = "kdj_trivia_mute_v1";

const SYSTEM_PROMPT_TEMPLATE = (sport: string, difficulty: string) =>
  `You generate sports trivia. Output STRICT JSON with no commentary or wrapping. Format:
{
  "questions": [
    {
      "q": "Who was named NBA Finals MVP in 2023?",
      "choices": ["Nikola Jokic", "Jamal Murray", "LeBron James", "Jimmy Butler"],
      "correct": 0,
      "fact": "Jokic was the first center to win Finals MVP since Shaq in 2002."
    }
  ]
}
Rules:
- Output exactly 10 questions.
- Every question must have exactly 4 choices.
- Exactly one correct answer per question. The "correct" field is the index 0 to 3.
- Mix question types: history, records, players, teams, championships, rules.
- Difficulty: ${difficulty}.
- Sport: ${sport}.
- Use facts that were verifiable as of 2024 to keep accuracy. Avoid 2025 or 2026 outcomes since they may not be in training data.
- Optional "fact" field: a 1 sentence interesting fact to display after the answer is revealed.
- Output JSON only. No markdown. No prose. No surrounding code fences.`;

function parseGroqQuestions(raw: string): TriviaQuestion[] | null {
  let text = raw.trim();
  const fence = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  try {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.questions)) return null;
    if (parsed.questions.length < 10) return null;
    const out: TriviaQuestion[] = [];
    for (let i = 0; i < 10; i += 1) {
      const q = parsed.questions[i];
      if (!q || typeof q.q !== "string") return null;
      if (!Array.isArray(q.choices) || q.choices.length !== 4) return null;
      const choices = q.choices.map((c: any) => String(c));
      const correct = Number(q.correct);
      if (!Number.isInteger(correct) || correct < 0 || correct > 3) return null;
      out.push({
        q: q.q,
        choices: [choices[0], choices[1], choices[2], choices[3]],
        correct: correct as 0 | 1 | 2 | 3,
        fact: typeof q.fact === "string" ? q.fact : undefined,
      });
    }
    return out;
  } catch {
    return null;
  }
}

// Procedural sound effects via the Web Audio API.
function makeSound(ctx: AudioContext, freq: number, durationMs: number, type: OscillatorType, gain: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000);
}

function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const muteRef = useRef<boolean>(false);

  const ensure = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      try {
        const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (Ctor) ctxRef.current = new Ctor();
      } catch {}
    }
    return ctxRef.current;
  }, []);

  const setMuted = useCallback((m: boolean) => {
    muteRef.current = m;
  }, []);

  const tick = useCallback(() => {
    if (muteRef.current) return;
    const c = ensure();
    if (!c) return;
    makeSound(c, 880, 60, "square", 0.05);
  }, [ensure]);

  const ding = useCallback(() => {
    if (muteRef.current) return;
    const c = ensure();
    if (!c) return;
    makeSound(c, 880, 120, "triangle", 0.12);
    setTimeout(() => {
      const cc = ensure();
      if (cc) makeSound(cc, 1320, 180, "triangle", 0.1);
    }, 90);
  }, [ensure]);

  const buzz = useCallback(() => {
    if (muteRef.current) return;
    const c = ensure();
    if (!c) return;
    makeSound(c, 160, 260, "sawtooth", 0.12);
  }, [ensure]);

  return { tick, ding, buzz, setMuted };
}

export default function SportsTriviaPage() {
  const [phase, setPhase] = useState<Phase>("picker");
  const [sport, setSport] = useState<Sport | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("mixed");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<AnswerLog[]>([]);
  const [remaining, setRemaining] = useState<number>(TIMER_MS);
  const [error, setError] = useState<string>("");
  const [usedFallback, setUsedFallback] = useState<boolean>(false);
  const [muted, setMutedState] = useState<boolean>(false);
  const [shareNote, setShareNote] = useState<string>("");
  const [highScore, setHighScore] = useState<number>(0);
  const [animKey, setAnimKey] = useState<number>(0);

  const audio = useAudio();
  const tickedSecondsRef = useRef<Set<number>>(new Set());
  const startTsRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const advanceTimerRef = useRef<number | null>(null);

  // Hydrate mute setting.
  useEffect(() => {
    try {
      const m = localStorage.getItem(MUTE_KEY);
      if (m === "1") {
        setMutedState(true);
        audio.setMuted(true);
      }
    } catch {}
  }, [audio]);

  useEffect(() => {
    audio.setMuted(muted);
    try {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {}
  }, [muted, audio]);

  // Keep high score updated when sport changes.
  useEffect(() => {
    if (!sport) return;
    try {
      const v = Number(localStorage.getItem(HIGH_SCORE_PREFIX + sport.id) || 0);
      setHighScore(Number.isFinite(v) ? v : 0);
    } catch {
      setHighScore(0);
    }
  }, [sport]);

  // Disable scrolling while playing.
  useEffect(() => {
    if (phase === "playing" || phase === "answered") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  // Timer loop.
  useEffect(() => {
    if (phase !== "playing") {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    startTsRef.current = performance.now();
    tickedSecondsRef.current = new Set();
    setRemaining(TIMER_MS);

    const loop = () => {
      const elapsed = performance.now() - startTsRef.current;
      const left = Math.max(0, TIMER_MS - elapsed);
      setRemaining(left);

      const secondsElapsed = Math.floor(elapsed / 1000);
      if (secondsElapsed > 0 && secondsElapsed <= QUESTION_SECONDS && !tickedSecondsRef.current.has(secondsElapsed)) {
        tickedSecondsRef.current.add(secondsElapsed);
        audio.tick();
      }

      if (left <= 0) {
        handleTimeout();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIdx]);

  // Cleanup advance timer on unmount.
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    };
  }, []);

  async function startGame(s: Sport) {
    setSport(s);
    setPhase("loading");
    setError("");
    setUsedFallback(false);
    setScore(0);
    setQIdx(0);
    setPicked(null);
    setAnswers([]);
    setShareNote("");

    const generated = await generateQuestions(s, difficulty);
    if (generated.questions) {
      setQuestions(generated.questions);
      setUsedFallback(generated.fromFallback);
      setPhase("playing");
      setAnimKey((k) => k + 1);
    } else {
      // Could not even fall back. Either unsupported sport with Groq down,
      // or AI offline and no baked pack for this sport.
      setError(
        "AI question generator is temporarily unavailable and this sport has no baked fallback pack. Try one of the popular sports (NBA, NFL, MLB, NHL, soccer) which ship with a hand written pack so the game still plays.",
      );
      setPhase("picker");
    }
  }

  function quitGame() {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setPhase("picker");
    setQuestions([]);
    setQIdx(0);
    setScore(0);
    setPicked(null);
    setAnswers([]);
    setError("");
  }

  function handleTimeout() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    audio.buzz();
    const q = questions[qIdx];
    const log: AnswerLog = {
      picked: null,
      correct: q.correct,
      msTaken: TIMER_MS,
      awarded: 0,
    };
    setAnswers((prev) => [...prev, log]);
    setPicked(null);
    setPhase("answered");
    advanceTimerRef.current = window.setTimeout(advanceQuestion, REVEAL_MS);
  }

  function pickAnswer(idx: number) {
    if (phase !== "playing") return;
    const q = questions[qIdx];
    const elapsed = performance.now() - startTsRef.current;
    const timeLeftMs = Math.max(0, TIMER_MS - elapsed);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    const isCorrect = idx === q.correct;
    let awarded = 0;
    if (isCorrect) {
      const speedBonus = Math.round(50 * (timeLeftMs / TIMER_MS));
      awarded = 100 + speedBonus;
      audio.ding();
    } else {
      audio.buzz();
    }

    const log: AnswerLog = {
      picked: idx,
      correct: q.correct,
      msTaken: TIMER_MS - timeLeftMs,
      awarded,
    };
    setAnswers((prev) => [...prev, log]);
    setScore((s) => s + awarded);
    setPicked(idx);
    setPhase("answered");
    advanceTimerRef.current = window.setTimeout(advanceQuestion, REVEAL_MS);
  }

  function advanceQuestion() {
    advanceTimerRef.current = null;
    if (qIdx + 1 >= questions.length) {
      finishGame();
      return;
    }
    setPicked(null);
    setQIdx((i) => i + 1);
    setPhase("playing");
    setAnimKey((k) => k + 1);
  }

  function finishGame() {
    setPhase("ended");
    if (sport) {
      try {
        const prev = Number(localStorage.getItem(HIGH_SCORE_PREFIX + sport.id) || 0);
        if (score > prev) {
          localStorage.setItem(HIGH_SCORE_PREFIX + sport.id, String(score));
          setHighScore(score);
        } else {
          setHighScore(prev);
        }
      } catch {}
    }
  }

  async function shareScore() {
    if (!sport) return;
    const text = `I scored ${score} on Sports Trivia at kerrydean-hub.vercel.app/play/sports-trivia`;
    try {
      await navigator.clipboard.writeText(text);
      setShareNote("Copied to clipboard.");
      setTimeout(() => setShareNote(""), 1800);
    } catch {
      setShareNote("Copy failed. Select and copy manually.");
    }
  }

  const currentQ = questions[qIdx];
  const correctCount = answers.filter((a) => a.picked === a.correct).length;
  const avgTimeSec = answers.length
    ? (answers.reduce((acc, a) => acc + a.msTaken, 0) / answers.length / 1000).toFixed(2)
    : "0.00";
  const ringPct = remaining / TIMER_MS;
  const lastTwoSec = remaining <= 2000 && phase === "playing";

  return (
    <main className="min-h-screen px-6 sm:px-8 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <a
            href="/play/"
            className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)]"
          >
            ← Back to play
          </a>
          <button
            type="button"
            onClick={() => setMutedState((m) => !m)}
            className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            aria-label="Toggle sound"
          >
            {muted ? "Sound off" : "Sound on"}
          </button>
        </div>

        {phase === "picker" && (
          <PickerView
            sports={SPORTS}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onPick={startGame}
            error={error}
          />
        )}

        {phase === "loading" && (
          <LoadingView sport={sport} />
        )}

        {(phase === "playing" || phase === "answered") && currentQ && sport && (
          <PlayingView
            sport={sport}
            questionNum={qIdx + 1}
            totalQuestions={questions.length}
            score={score}
            ringPct={ringPct}
            remaining={remaining}
            lastTwoSec={lastTwoSec}
            question={currentQ}
            picked={picked}
            phase={phase}
            onPick={pickAnswer}
            onQuit={quitGame}
            animKey={animKey}
            usedFallback={usedFallback}
          />
        )}

        {phase === "ended" && sport && (
          <EndView
            sport={sport}
            score={score}
            correctCount={correctCount}
            avgTimeSec={avgTimeSec}
            highScore={highScore}
            usedFallback={usedFallback}
            onShare={shareScore}
            shareNote={shareNote}
            onPlayAgain={() => startGame(sport)}
            onChangeSport={quitGame}
          />
        )}
      </div>
    </main>
  );
}

async function generateQuestions(
  sport: Sport,
  difficulty: Difficulty,
): Promise<{ questions: TriviaQuestion[] | null; fromFallback: boolean }> {
  const groqDifficulty =
    difficulty === "mixed"
      ? "a balanced mix of easy, medium, and hard"
      : difficulty;
  const sys = SYSTEM_PROMPT_TEMPLATE(sport.groqLabel, groqDifficulty);
  const userMsg = `Generate 10 trivia questions for ${sport.groqLabel}. Difficulty: ${groqDifficulty}.`;

  // Two attempts at Groq. If the first error is groq_unavailable (503 from
  // the server route, meaning GROQ_API_KEY is missing) skip the retry and
  // fall straight to the baked pack, otherwise the loading view hangs while
  // the second attempt also returns 503.
  let groqUnavailable = false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const text = await chatCompletion(
        [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
        { temperature: 0.85, maxTokens: 2200 },
      );
      const parsed = parseGroqQuestions(text);
      if (parsed) return { questions: parsed, fromFallback: false };
    } catch (e: any) {
      if (e?.message === "groq_unavailable") {
        groqUnavailable = true;
        break;
      }
    }
  }

  // Fall back to baked pack if available.
  if (hasFallback(sport.fallbackKey)) {
    const f = getFallbackQuestions(sport.fallbackKey);
    if (f) return { questions: f, fromFallback: true };
  }
  // No fallback pack for this sport. Surface the cause so the picker error
  // message can mention AI offline rather than a generic try again.
  if (groqUnavailable) return { questions: null, fromFallback: false };
  return { questions: null, fromFallback: false };
}

// ============== sub views =================

function PickerView(props: {
  sports: Sport[];
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  onPick: (s: Sport) => void;
  error: string;
}) {
  const { sports, difficulty, setDifficulty, onPick, error } = props;
  return (
    <>
      <header className="mt-8">
        <h1 className="serif text-4xl sm:text-5xl leading-[1.05] font-medium tracking-tight">
          Sports Trivia.
        </h1>
        <p className="mt-4 serif italic text-lg text-[var(--fg)]/80">
          10 questions. 6 seconds each. Pick your sport.
        </p>
        <p className="mt-3 text-sm text-[var(--fg)]/65 leading-relaxed">
          Each round Groq Llama 3.3 70B writes a fresh batch of 10 questions
          tuned to the sport and difficulty you choose. Speed bonuses reward
          fast clean answers. Local high score saved per sport.
        </p>
      </header>

      <section className="mt-10">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Difficulty
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDifficulty(d.id)}
              className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 rounded border ${
                difficulty === d.id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Pick a sport
        </h3>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sports.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPick(s)}
              className="group rounded-lg border border-[var(--rule)] hover:border-[var(--accent)] hover:shadow-[0_4px_12px_rgba(166,115,64,0.12)] hover:-translate-y-0.5 transition-all px-3 py-4 flex flex-col items-center justify-center text-center gap-2 min-h-[96px]"
            >
              <span className="text-2xl" aria-hidden="true">{s.glyph}</span>
              <span className="serif text-base font-medium leading-tight group-hover:text-[var(--accent)]">
                {s.label}
              </span>
              {!hasFallback(s.fallbackKey) ? (
                <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--muted)]/80">
                  Live AI only
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p className="mt-6 text-sm text-[#D49A7A] font-mono">{error}</p>
      )}

      <section className="mt-16 section-rule pt-10">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          How this works
        </h2>
        <div className="mt-4 prose-body text-sm text-[var(--fg)]/80 leading-relaxed space-y-3">
          <p>
            One Groq call per game generates all 10 questions in a strict JSON
            envelope. The page validates the response and retries once on a
            parse failure. If Groq is down or the schema breaks twice in a row,
            popular sports fall back to a baked question pack so the game still
            plays.
          </p>
          <p>
            Each correct answer scores 100 points plus a time bonus up to 50.
            The faster you click, the bigger the bonus. High score saved per
            sport in localStorage.
          </p>
        </div>
      </section>
    </>
  );
}

function LoadingView({ sport }: { sport: Sport | null }) {
  return (
    <div className="mt-24 flex flex-col items-center justify-center gap-4">
      <div className="text-3xl" aria-hidden="true">{sport?.glyph || "🎯"}</div>
      <p className="serif text-2xl font-medium tracking-tight">
        Generating {sport?.label || "trivia"} questions...
      </p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
        Llama 3.3 70B via Groq
      </p>
      <div className="mt-4 h-1 w-40 rounded-full bg-[var(--rule)] overflow-hidden">
        <div
          className="h-full bg-[var(--accent)]"
          style={{ animation: "kdj_loadbar 1.4s ease-in-out infinite" }}
        />
      </div>
      <style>{`
        @keyframes kdj_loadbar {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(180%); width: 30%; }
        }
      `}</style>
    </div>
  );
}

function PlayingView(props: {
  sport: Sport;
  questionNum: number;
  totalQuestions: number;
  score: number;
  ringPct: number;
  remaining: number;
  lastTwoSec: boolean;
  question: TriviaQuestion;
  picked: number | null;
  phase: Phase;
  onPick: (i: number) => void;
  onQuit: () => void;
  animKey: number;
  usedFallback: boolean;
}) {
  const {
    sport,
    questionNum,
    totalQuestions,
    score,
    ringPct,
    remaining,
    lastTwoSec,
    question,
    picked,
    phase,
    onPick,
    onQuit,
    animKey,
    usedFallback,
  } = props;
  const seconds = Math.ceil(remaining / 1000);
  const ringStrokeColor = lastTwoSec ? "#D04040" : "var(--accent)";
  const ringDash = 2 * Math.PI * 36;
  const ringOffset = ringDash * (1 - ringPct);

  return (
    <div className="mt-6">
      {usedFallback ? (
        <div className="mb-4 rounded-md border border-[#D49A7A]/40 bg-[#D49A7A]/[0.06] px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#D49A7A]">
            AI offline. Playing the baked question pack.
          </p>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
            {sport.label} · Question {questionNum} of {totalQuestions}
          </div>
          <div className="serif text-lg font-medium mt-1">
            Score: <span className="text-[var(--accent)]">{score}</span>
          </div>
        </div>
        <div className="relative">
          <svg width="84" height="84" viewBox="0 0 84 84" className={lastTwoSec ? "kdj_pulse" : ""}>
            <circle
              cx="42"
              cy="42"
              r="36"
              fill="none"
              stroke="var(--rule)"
              strokeWidth="6"
            />
            <circle
              cx="42"
              cy="42"
              r="36"
              fill="none"
              stroke={ringStrokeColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={ringDash}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 42 42)"
              style={{ transition: "stroke-dashoffset 80ms linear, stroke 200ms ease" }}
            />
            <text
              x="42"
              y="48"
              textAnchor="middle"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize="22"
              fill={lastTwoSec ? "#D04040" : "var(--fg)"}
              fontWeight="500"
            >
              {seconds}
            </text>
          </svg>
        </div>
      </div>

      <div
        key={animKey}
        className="mt-6 rounded-lg border border-[var(--rule)] p-5 sm:p-6 kdj_fadein"
      >
        <h2 className="serif text-xl sm:text-2xl font-medium leading-snug">
          {question.q}
        </h2>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.choices.map((c, i) => {
            const isCorrect = i === question.correct;
            const isPicked = picked === i;
            const revealed = phase === "answered";
            let bg = "transparent";
            let border = "var(--rule)";
            let fg = "var(--fg)";
            if (revealed) {
              if (isCorrect) {
                bg = "rgba(91, 167, 118, 0.18)";
                border = "#5BA776";
              } else if (isPicked) {
                bg = "rgba(208, 64, 64, 0.18)";
                border = "#D04040";
              } else {
                fg = "var(--muted)";
              }
            }
            return (
              <button
                key={i}
                type="button"
                disabled={phase !== "playing"}
                onClick={() => onPick(i)}
                className="rounded-md border px-4 py-3 text-left font-mono text-sm leading-snug hover:border-[var(--accent)] disabled:cursor-default transition-colors"
                style={{
                  background: bg,
                  borderColor: border,
                  color: fg,
                }}
              >
                <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mr-2">
                  {String.fromCharCode(65 + i)}
                </span>
                {c}
              </button>
            );
          })}
        </div>

        {phase === "answered" && (
          <div className="mt-4 text-sm text-[var(--fg)]/80">
            <span
              className="font-mono text-[10px] uppercase tracking-widest mr-2"
              style={{ color: picked === question.correct ? "#5BA776" : "#D04040" }}
            >
              {picked === null ? "Time up" : picked === question.correct ? "Correct" : "Wrong"}
            </span>
            {question.fact ? (
              <span className="serif italic">{question.fact}</span>
            ) : (
              <span className="serif italic">
                Answer: {question.choices[question.correct]}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onQuit}
          className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Quit
        </button>
      </div>

      <style>{`
        .kdj_fadein {
          animation: kdj_fadein 280ms ease both;
        }
        @keyframes kdj_fadein {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .kdj_pulse {
          animation: kdj_pulse 700ms ease-in-out infinite alternate;
        }
        @keyframes kdj_pulse {
          from { transform: scale(1); }
          to { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}

function EndView(props: {
  sport: Sport;
  score: number;
  correctCount: number;
  avgTimeSec: string;
  highScore: number;
  usedFallback: boolean;
  onShare: () => void;
  shareNote: string;
  onPlayAgain: () => void;
  onChangeSport: () => void;
}) {
  const {
    sport,
    score,
    correctCount,
    avgTimeSec,
    highScore,
    usedFallback,
    onShare,
    shareNote,
    onPlayAgain,
    onChangeSport,
  } = props;
  const isNewHigh = score >= highScore && score > 0;

  return (
    <div className="mt-12">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
        {sport.label} · Final score
      </div>
      <h1 className="mt-2 serif text-5xl sm:text-6xl font-medium tracking-tight text-[var(--accent)]">
        {score}
      </h1>
      <p className="mt-3 serif italic text-lg text-[var(--fg)]/80">
        {correctCount} of 10 correct. Average answer time {avgTimeSec} seconds.
      </p>

      {isNewHigh && (
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
          New high score for {sport.label}
        </p>
      )}
      {!isNewHigh && highScore > 0 && (
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          High score for {sport.label}: {highScore}
        </p>
      )}
      {usedFallback && (
        <p className="mt-3 text-xs text-[var(--muted)]">
          Note: Groq was unavailable so this round used the baked question pack.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors"
        >
          Play again
        </button>
        <button
          type="button"
          onClick={onChangeSport}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded border border-[var(--rule)] text-[var(--fg)]/80 hover:border-[var(--fg)]"
        >
          Change sport
        </button>
        <button
          type="button"
          onClick={onShare}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded border border-[var(--rule)] text-[var(--fg)]/80 hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Share score
        </button>
      </div>
      {shareNote && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
          {shareNote}
        </p>
      )}

      <footer className="mt-16 pt-8 border-t border-[var(--rule)] text-xs font-mono text-[var(--muted)] flex flex-wrap items-center justify-between gap-3">
        <a href="/play/" className="hover:text-[var(--accent)]">
          ← Play index
        </a>
        <a href="/" className="hover:text-[var(--accent)]">
          Home →
        </a>
      </footer>
    </div>
  );
}
