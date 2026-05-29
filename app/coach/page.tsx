"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { chatCompletion } from "../../lib/groq";

type Tab = "workouts" | "technique" | "ask" | "book";

const TABS: { id: Tab; label: string }[] = [
  { id: "workouts", label: "Workouts" },
  { id: "technique", label: "Technique" },
  { id: "ask", label: "Ask Kerry" },
  { id: "book", label: "1:1 Coaching" },
];

const DISCIPLINES: { label: string; tag: string }[] = [
  { label: "Long Jump", tag: "Jumps" },
  { label: "Triple Jump", tag: "Jumps" },
  { label: "100m / 200m / 400m", tag: "Sprints" },
  { label: "100m Hurdles", tag: "Hurdles" },
  { label: "High School", tag: "Level" },
  { label: "College", tag: "Level" },
  { label: "Masters", tag: "Level" },
];

// FEATURE 1: Workouts
type EventName =
  | "Long Jump"
  | "Triple Jump"
  | "100m"
  | "200m"
  | "400m"
  | "100m Hurdles"
  | "High Jump"
  | "Multi event";

type Level = "high school" | "college" | "post collegiate / masters";
type Phase = "general prep" | "specific prep" | "competition" | "peaking";
type DaysPerWeek = 3 | 4 | 5 | 6;

type WorkoutSession = {
  day: string;
  focus: string;
  warmup: string;
  main: string;
  accessory: string;
  cooldown: string;
};

type WorkoutWeek = {
  week: number;
  theme: string;
  days: WorkoutSession[];
};

type WorkoutPlan = {
  block_summary: string;
  weeks: WorkoutWeek[];
  disclaimer: string;
};

const EVENTS: EventName[] = [
  "Long Jump",
  "Triple Jump",
  "100m",
  "200m",
  "400m",
  "100m Hurdles",
  "High Jump",
  "Multi event",
];
const LEVELS: Level[] = ["high school", "college", "post collegiate / masters"];
const PHASES: Phase[] = ["general prep", "specific prep", "competition", "peaking"];
const DAYS_OPTIONS: DaysPerWeek[] = [3, 4, 5, 6];

const WORKOUT_SYSTEM = `You are Kerry Dean Jr., a former Division 1 long jumper and triple jumper at the Iowa Hawkeyes who specialized in the jumps. Long jump 7.00m. Triple jump 14.84m at Big Ten Championships. Ranked among the top 10 all time at Iowa in triple jump. Before college you were a USATF indoor All-American in 200m, 400m, long jump, and triple jump, and a USATF national champion in triple jump as a high schooler. You are USATF Level 1 grounded and lean on Tony Wells and Boo Schexnayder methodology.

You write workouts that respect the difference between testing and training. You do not junk pump volume to feel productive. You write what a real coach would actually program.

The user gives you four inputs: event, level, phase, days per week. You return a 4 week training block that is event specific, phase appropriate, and matches the day count exactly.

Return strict JSON only, no surrounding prose, no code fences:
{
  "block_summary": "<one line summary of the 4 week block, name the event and phase>",
  "weeks": [
    {
      "week": 1,
      "theme": "<short theme for the week, e.g. Volume base, Speed introduction, Competition simulation>",
      "days": [
        {
          "day": "<weekday, e.g. Monday>",
          "focus": "<short focus tag, e.g. Acceleration + Power, Approach + Takeoff, Tempo, Recovery, Rest>",
          "warmup": "<warmup prescription with concrete sets and reps>",
          "main": "<main work with concrete volumes and intensities, e.g. 5 x 30m flying sprints at 95 percent, 4 min rest>",
          "accessory": "<accessory work with concrete prescription, e.g. 4 x 6 back squat at RPE 7, 3 x 10 single leg ankle hops>",
          "cooldown": "<cooldown prescription>"
        }
      ]
    }
  ],
  "disclaimer": "This is a starting framework. Adjust based on how your body responds. Real coaching means listening to the athlete."
}

Hard rules. The days array per week must contain exactly the requested number of training sessions. Insert true rest day labels (focus = Rest, warmup = Off, main = Off, accessory = Off, cooldown = Off) only when the user requested fewer than 7 sessions and you want to communicate where to rest. Each warmup, main, accessory, and cooldown must contain concrete numbers (sets, reps, distances, intensities, rest intervals). Do not write fluff. Reference real patterns: short approach work, medium approach, full approach run throughs, fly ins, ins and outs, hill sprints, plyometric progressions like ankle hops, pogos, alternate leg bounding, single leg bounding, weight room movements like back squat, RDL, hex bar deadlift, hang clean, snatch grip RDL, split squat. For the jumps: pop ups, short approach takeoffs, penultimate work, hop step pop ups for triple jumpers. For sprints: acceleration ladders, flying 30s, fly 20s, tempo grids, 200m or 300m repeats at the right percent of season best. Phase appropriate volume and intensity. General prep is higher volume lower intensity. Competition phase is lower volume higher quality. Peaking is taper and sharpen. No em dashes, no en dashes, no sentence break hyphens.`;

// FEATURE 2: Technique
type TechCue = { phase: string; cue: string };
type TechCause = { cause: string; why: string };
type TechDrill = { name: string; prescription: string; what_it_fixes: string };

type TechAnalysis = {
  issue_summary: string;
  root_causes: TechCause[];
  drills: TechDrill[];
  cues: TechCue[];
  film_what_to_check: string;
};

const TECH_SYSTEM = `You diagnose track and field technique like a jumps and sprints coach who watched their athlete win Big Ten. You do not speak in motivational quotes. You speak in specific phases and angles.

You are anchored on Kerry Dean Jr., a former Iowa Hawkeyes long jumper and triple jumper. Long jump 7.00m. Triple jump 14.84m. Ranked among the top 10 all time at Iowa in triple jump. USATF indoor All-American in four events and USATF national champion in triple jump as a high schooler.

The athlete describes their issue in plain text. You return root cause hypotheses, drill prescriptions, cue language, and film guidance.

Return strict JSON only, no surrounding prose, no code fences:
{
  "issue_summary": "<one line restating the issue in coach language>",
  "root_causes": [
    {"cause": "<short cause label>", "why": "<two sentences on why this is the likely cause>"}
  ],
  "drills": [
    {"name": "<drill name>", "prescription": "<reps and sets, e.g. 4 x 5 ankle hops, 2 sets, full recovery>", "what_it_fixes": "<what this drill addresses>"}
  ],
  "cues": [
    {"phase": "<phase relevant to the event, e.g. Approach, Penultimate, Takeoff, Hop, Step, Jump, Drive, Mid Race, Finish>", "cue": "<short cue language the athlete says to themselves>"}
  ],
  "film_what_to_check": "<2 to 3 sentences on what to film and the specific frame or angle to inspect in playback>"
}

Hard rules. root_causes contains exactly 3 items. drills contains 3 to 5 items. cues contains 3 to 5 items. Reference real jump phases by name (penultimate step, plant, takeoff angle, hip projection, hop to step ratio in triple jump, knee drive, posture, arm action, hollow position in flight, double arm vs single arm block). Drills should be real ones: short approach takeoffs, single leg bounds, alternate leg bounds, ankle hops, pogos, A skips, fly 30s, wickets, pop ups, run throughs, box jumps with intent, depth drops, med ball throws for power. For sprinters: wall drills, A march, A skip, A run, dribble starts, fly 20s, 3 point starts, falling starts. Film guidance must mention frame rate (120fps or 240fps if available), camera angle (side on for jumps and sprint mechanics, head on for posture and lane), and the exact frame to look at (plant frame, takeoff frame, mid stance frame, finish lean). No em dashes, no en dashes, no sentence break hyphens.`;

// FEATURE 3: Ask
type ChatMsg = { role: "user" | "assistant"; content: string };
const ASK_STORAGE = "kdj_coach_chat_v2";

const ASK_SYSTEM = `You are an AI assistant trained on Kerry Dean Jr.'s approach to track and field coaching and speed and endurance training. You coach jumpers, sprinters, AND athletes from other sports (football, basketball, soccer, lacrosse, baseball, rugby, etc.) who need real speed, acceleration, and endurance work. You are NOT Kerry. You are a free coaching assistant trained on his background and methodology. Identify yourself as the assistant if asked directly.

Kerry's background:
- Iowa Hawkeyes Track and Field, 2012 to 2016. Specialized in long jump and triple jump.
- Long jump 7.00m (22 feet 11¾ inches). Triple jump 14.84m (48 feet 8¾ inches) at Big Ten Championships.
- Ranked among top 10 all time at Iowa in triple jump.
- Before college: USATF indoor All-American in 200m, 400m, long jump, and triple jump.
- USATF national champion in triple jump as a high schooler.

Coaching approach:
- USATF Level 1 grounded. Familiar with Tony Wells and Boo Schexnayder methodology.
- Speed transfers across sports. A faster football player, basketball player, or soccer player runs the same energy systems as a sprinter. The training adapts to the sport's demands but the principles are stable.
- Training and testing are different things. Do not junk pump volume to feel productive.
- Specifics over slogans. Real cues, real drills, real volumes, real rest.
- The athlete's body is part of the program. Listen to it.

When the athlete is from a non track sport, ask about their sport, position, season phase, and what speed quality they need (top end, acceleration, repeat sprint, change of direction, conditioning) before prescribing. Adapt the plan to their game demands.

Be direct, specific, and warm. Give the athlete one or two clear next moves per question. Reference Kerry's actual marks when it serves the athlete (long jump 7.00m, triple jump 14.84m at Iowa). Do not lecture. Do not promise outcomes. Push back on bad ideas honestly. Keep responses under 220 words unless asked for depth. No em dashes, no en dashes, no sentence break hyphens.`;

function tryParseJson<T>(raw: string): T | null {
  let text = raw.trim();
  const fence = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  try {
    return JSON.parse(text) as T;
  } catch {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(text.slice(first, last + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {}
      }}
      className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded border border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const WORKOUT_EXAMPLE: WorkoutPlan = {
  block_summary:
    "Example 4 week long jump specific prep block at college level, 5 days per week. Built to demonstrate the output shape.",
  weeks: [
    {
      week: 1,
      theme: "Volume base and short approach work",
      days: [
        {
          day: "Monday",
          focus: "Acceleration + Approach",
          warmup: "10 min jog. 2 sets of A skips, B skips, dribble starts at 20m each. 3 build ups to 80 percent over 40m.",
          main: "Short approach long jump, 6 step run in. 6 jumps with full recovery. Emphasis on penultimate lowering of center of mass.",
          accessory: "4 x 5 back squat at RPE 7. 3 x 10 single leg ankle hops per side.",
          cooldown: "10 min easy jog. Foam roll quads, hips, calves.",
        },
        {
          day: "Tuesday",
          focus: "Tempo + Plyometric",
          warmup: "2 lap jog. Dynamic mobility circuit. 3 x 30m build ups.",
          main: "Tempo grid. 6 x 200m at 70 percent of season best 200, walk back recovery between reps, 4 min rest between sets, 2 sets total.",
          accessory: "3 x 6 alternate leg bounds over 30m. 3 x 8 pogos.",
          cooldown: "10 min easy walk. Calf and hip flexor stretching.",
        },
        {
          day: "Wednesday",
          focus: "Rest",
          warmup: "Off",
          main: "Off",
          accessory: "Off",
          cooldown: "Off",
        },
        {
          day: "Thursday",
          focus: "Speed + Power",
          warmup: "2 lap jog. A march, A skip, A run series. 3 build ups to 90 percent.",
          main: "5 x 30m flying sprints at 95 percent, 4 min rest. Fly in zone of 20m.",
          accessory: "4 x 3 hang clean at 70 percent of 1RM. 3 x 5 med ball overhead throws.",
          cooldown: "10 min easy jog. Hip and ankle mobility.",
        },
        {
          day: "Saturday",
          focus: "Approach + Takeoff",
          warmup: "10 min jog. Dynamic mobility. 4 short approach run throughs at 80 percent.",
          main: "Medium approach long jump, 10 step run in. 8 jumps with full recovery. Film side on at 240fps.",
          accessory: "3 x 4 split squat per side at RPE 7. 3 x 6 pop ups off short approach.",
          cooldown: "10 min easy walk. Posterior chain stretching.",
        },
      ],
    },
    {
      week: 2,
      theme: "Intensification and medium approach quality",
      days: [
        {
          day: "Monday",
          focus: "Acceleration + Approach",
          warmup: "10 min jog. A skips, dribble starts. 3 build ups to 85 percent.",
          main: "Medium approach long jump, 10 step run in. 8 jumps with full recovery.",
          accessory: "5 x 3 back squat at RPE 8. 3 x 8 single leg bounds per side.",
          cooldown: "10 min easy jog. Foam roll.",
        },
        {
          day: "Tuesday",
          focus: "Tempo + Plyometric",
          warmup: "2 lap jog. Dynamic mobility. 3 x 30m build ups.",
          main: "Tempo grid. 5 x 200m at 75 percent, walk back recovery, 4 min between sets, 2 sets.",
          accessory: "3 x 5 alternate leg bounds over 40m. 3 x 6 hurdle hops at knee height.",
          cooldown: "10 min walk. Calf stretching.",
        },
        {
          day: "Wednesday",
          focus: "Rest",
          warmup: "Off",
          main: "Off",
          accessory: "Off",
          cooldown: "Off",
        },
        {
          day: "Thursday",
          focus: "Speed + Power",
          warmup: "2 lap jog. A march, A skip, A run. 3 build ups.",
          main: "4 x 40m flying sprints at 95 percent, 5 min rest. Fly in zone of 30m.",
          accessory: "5 x 3 hang clean at 75 percent. 3 x 4 med ball rotational throws per side.",
          cooldown: "10 min easy jog. Hip mobility.",
        },
        {
          day: "Saturday",
          focus: "Full Approach + Takeoff",
          warmup: "10 min jog. 4 short approach run throughs. 2 medium approach run throughs.",
          main: "Full approach long jump, 16 to 18 step run in. 6 jumps with full recovery. Film side on at 240fps.",
          accessory: "3 x 4 hex bar deadlift at RPE 7. 3 x 5 pop ups off medium approach.",
          cooldown: "10 min easy walk. Full body stretch.",
        },
      ],
    },
    {
      week: 3,
      theme: "Competition simulation and quality work",
      days: [
        {
          day: "Monday",
          focus: "Acceleration + Approach",
          warmup: "10 min jog. Full warmup. 3 build ups to 90 percent.",
          main: "Full approach long jump simulation. 6 jumps with competition spacing of 4 to 6 min between attempts.",
          accessory: "4 x 2 back squat at RPE 8. 3 x 5 depth drops from 18 inch box.",
          cooldown: "10 min easy jog. Lower body mobility.",
        },
        {
          day: "Tuesday",
          focus: "Tempo + Plyometric",
          warmup: "Standard tempo warmup.",
          main: "Reduced tempo. 4 x 200m at 80 percent, walk back, 5 min between sets, 2 sets.",
          accessory: "3 x 4 alternate leg bounds over 50m. 3 x 6 single leg hops per side.",
          cooldown: "10 min walk.",
        },
        {
          day: "Wednesday",
          focus: "Rest",
          warmup: "Off",
          main: "Off",
          accessory: "Off",
          cooldown: "Off",
        },
        {
          day: "Thursday",
          focus: "Speed + Power",
          warmup: "Full warmup including 4 build ups.",
          main: "3 x 50m flying sprints at 97 percent, 6 min rest. Fly in zone of 30m.",
          accessory: "5 x 2 hang clean at 80 percent. 3 x 3 box jumps with intent.",
          cooldown: "10 min easy jog. Hip and ankle mobility.",
        },
        {
          day: "Saturday",
          focus: "Mock Meet",
          warmup: "Full competition warmup including approach run throughs on the runway.",
          main: "Mock meet long jump. 6 attempts with full meet protocol. Track distance, no fouls.",
          accessory: "Light shake out only.",
          cooldown: "10 min easy walk. Full body stretch.",
        },
      ],
    },
    {
      week: 4,
      theme: "Taper and sharpen",
      days: [
        {
          day: "Monday",
          focus: "Approach Sharpening",
          warmup: "10 min jog. Full warmup. 3 build ups to 95 percent.",
          main: "Approach run throughs only. 8 full approach run throughs at meet intensity. Mark check, do not jump.",
          accessory: "3 x 2 back squat at RPE 6. 3 x 3 single leg ankle hops per side.",
          cooldown: "10 min easy jog.",
        },
        {
          day: "Tuesday",
          focus: "Short Speed",
          warmup: "Standard speed warmup.",
          main: "4 x 30m fly ins at 95 percent, 5 min rest. Fly in zone of 20m.",
          accessory: "3 x 3 med ball overhead throws. Skipping for activation only.",
          cooldown: "10 min walk.",
        },
        {
          day: "Wednesday",
          focus: "Rest",
          warmup: "Off",
          main: "Off",
          accessory: "Off",
          cooldown: "Off",
        },
        {
          day: "Friday",
          focus: "Pre Meet Activation",
          warmup: "Standard competition warmup minus jumps.",
          main: "2 build ups on the runway. 2 short approach pop ups. Activation only.",
          accessory: "Off.",
          cooldown: "10 min walk. Light stretch.",
        },
        {
          day: "Saturday",
          focus: "Compete",
          warmup: "Full competition warmup.",
          main: "Meet day. Long jump competition.",
          accessory: "Off.",
          cooldown: "Cool down jog. Full stretch.",
        },
      ],
    },
  ],
  disclaimer:
    "This is a starting framework. Adjust based on how your body responds. Real coaching means listening to the athlete.",
};

function WorkoutsTab() {
  const [event, setEvent] = useState<EventName>("Long Jump");
  const [level, setLevel] = useState<Level>("college");
  const [phase, setPhase] = useState<Phase>("specific prep");
  const [days, setDays] = useState<DaysPerWeek>(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [usingExample, setUsingExample] = useState(false);
  const [openWeek, setOpenWeek] = useState<number>(1);

  async function generate() {
    setBusy(true);
    setError("");
    setPlan(null);
    setUsingExample(false);
    try {
      const text = await chatCompletion(
        [
          { role: "system", content: WORKOUT_SYSTEM },
          {
            role: "user",
            content: `Event: ${event}\nLevel: ${level}\nPhase: ${phase}\nDays per week: ${days}\nGenerate the 4 week block now. Match the day count exactly.`,
          },
        ],
        { temperature: 0.6, maxTokens: 4200 },
      );
      const parsed = tryParseJson<WorkoutPlan>(text);
      if (
        !parsed ||
        !parsed.block_summary ||
        !Array.isArray(parsed.weeks) ||
        parsed.weeks.length === 0
      ) {
        throw new Error("parse_error");
      }
      setPlan(parsed);
      setOpenWeek(1);
    } catch (e: any) {
      const msg = e?.message;
      if (msg === "groq_unavailable") {
        setError(
          "AI generation is temporarily unavailable. Showing a hand written example block below so you can see the output shape.",
        );
        setPlan(WORKOUT_EXAMPLE);
        setUsingExample(true);
        setOpenWeek(1);
      } else if (msg === "parse_error") {
        setError("The model returned malformed JSON. Try again.");
      } else {
        setError("Generation failed. Try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="serif text-2xl sm:text-3xl font-medium tracking-tight">
          Workout plan generator.
        </h2>
        <p className="mt-3 text-sm text-[var(--fg)]/80 leading-relaxed">
          Pick your event, level, phase, and how many days a week you can train. Llama 3.3 70B drafts a 4 week training block in the way a real jumps and sprints coach would write it. Every session has a warmup, main work, accessory, and cooldown with concrete sets, reps, and intensities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
            Event
          </label>
          <div className="flex flex-wrap gap-2">
            {EVENTS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEvent(e)}
                className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
                  event === e
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
            Level
          </label>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
                  level === l
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
            Phase
          </label>
          <div className="flex flex-wrap gap-2">
            {PHASES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPhase(p)}
                className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
                  phase === p
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
            Days per week
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
                  days === d
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "Drafting..." : "Generate 4 week block"}
        </button>
      </div>

      {error ? <p className="text-xs text-[#D49A7A]">{error}</p> : null}

      {plan ? (
        <div className="space-y-6 mt-2">
          {usingExample ? (
            <div className="rounded-lg border border-[#D49A7A]/40 bg-[#D49A7A]/[0.06] p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#D49A7A]">
                Example output, AI offline
              </p>
              <p className="mt-2 text-sm text-[var(--fg)]/85 leading-relaxed">
                The Llama 3.3 70B generator is temporarily unavailable on this deployment. The block below is a hand written example built for long jump college specific prep at 5 days per week so the output shape is still clear.
              </p>
            </div>
          ) : null}
          <section className="rounded-lg border border-[var(--accent)] p-5 bg-[var(--accent)]/[0.04]">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
              Block summary
            </h3>
            <p className="mt-3 prose-body text-[var(--fg)]/95 leading-relaxed">
              {plan.block_summary}
            </p>
          </section>

          <div className="flex flex-wrap gap-2">
            {plan.weeks.map((w) => {
              const on = openWeek === w.week;
              return (
                <button
                  key={w.week}
                  type="button"
                  onClick={() => setOpenWeek(w.week)}
                  className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${
                    on
                      ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/[0.06]"
                      : "border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  Week {w.week}
                </button>
              );
            })}
          </div>

          {plan.weeks
            .filter((w) => w.week === openWeek)
            .map((w) => (
              <section key={w.week} className="space-y-4">
                <div className="rounded-lg border border-[var(--rule)] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                    Week {w.week} theme
                  </p>
                  <p className="mt-2 serif text-lg text-[var(--fg)]/95 leading-snug">
                    {w.theme}
                  </p>
                </div>
                <ul className="space-y-3">
                  {w.days.map((d, i) => (
                    <li key={i} className="rounded-lg border border-[var(--rule)] p-4">
                      <div className="flex items-baseline justify-between gap-3 flex-wrap">
                        <p className="serif text-base font-medium text-[var(--fg)]/95">
                          {d.day}
                        </p>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)]">
                          {d.focus}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2 text-sm text-[var(--fg)]/90 leading-relaxed">
                        <p>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mr-2">
                            Warmup
                          </span>
                          {d.warmup}
                        </p>
                        <p>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mr-2">
                            Main
                          </span>
                          {d.main}
                        </p>
                        <p>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mr-2">
                            Accessory
                          </span>
                          {d.accessory}
                        </p>
                        <p>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mr-2">
                            Cooldown
                          </span>
                          {d.cooldown}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

          <section className="rounded-lg border border-[var(--rule)] p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              Honest disclaimer
            </h3>
            <p className="mt-3 text-sm text-[var(--fg)]/85 leading-relaxed">
              {plan.disclaimer}
            </p>
          </section>
        </div>
      ) : null}

      <section className="mt-12 section-rule pt-8">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          How this works
        </h3>
        <p className="mt-3 text-xs text-[var(--fg)]/75 leading-relaxed max-w-prose">
          One Groq Llama 3.3 70B call. Strict JSON contract. The system prompt anchors the model as Kerry, a former D1 jumper at Iowa, with USATF Level 1 plus Tony Wells and Boo Schexnayder methodology as the reference frame. The output is a starting framework, not a final program. Adjust based on how your body responds.
        </p>
      </section>
    </div>
  );
}

const TECH_EXAMPLE: TechAnalysis = {
  issue_summary:
    "Athlete is cutting the approach short on the long jump, hand drifting on the penultimate step, and landing flat off the board.",
  root_causes: [
    {
      cause: "Hand drift on the penultimate step",
      why: "Once the arms split early at penultimate, the trunk rotates and the takeoff leg cannot project vertically. The athlete loses the double arm block that turns horizontal velocity into vertical projection.",
    },
    {
      cause: "Premature lowering of the center of mass",
      why: "Dropping the hips two steps out instead of one robs the takeoff of free amortization. The penultimate is what should lower the body, not the third to last step.",
    },
    {
      cause: "Short final stride at full approach",
      why: "When the athlete senses the board, they reach with the heel, hit the board flat, and lose 4 to 8 inches of effective takeoff distance. Confidence on approach run throughs is the upstream fix.",
    },
  ],
  drills: [
    {
      name: "Short approach pop ups",
      prescription: "4 sets of 5 reps off a 4 step approach. Full recovery. Focus on double arm block at takeoff.",
      what_it_fixes: "Reconnects arm action with takeoff projection without the speed of a full approach overwhelming the cue.",
    },
    {
      name: "Penultimate march drill",
      prescription: "3 sets of 6 walking penultimate steps with exaggerated hip lowering. 2 sets per side.",
      what_it_fixes: "Teaches the body that the penultimate is where the lowering happens, not earlier.",
    },
    {
      name: "Run throughs with mark check",
      prescription: "8 full approach run throughs at meet intensity. Mark check, do not jump. Coach watches step accuracy.",
      what_it_fixes: "Builds approach confidence so the athlete stops reaching at the board on real attempts.",
    },
    {
      name: "Box jumps with intent",
      prescription: "3 sets of 3 onto a 24 inch box. Land tall. Full recovery between reps.",
      what_it_fixes: "Reinforces vertical projection off a flexed knee, the same motor pattern as the takeoff.",
    },
  ],
  cues: [
    { phase: "Approach", cue: "Tall and patient through 10 steps." },
    { phase: "Penultimate", cue: "Sit and stab into the board." },
    { phase: "Takeoff", cue: "Knee drive, double arm up." },
    { phase: "Flight", cue: "Hollow and hold." },
  ],
  film_what_to_check:
    "Film side on at 240fps from 5 meters off the board. Look at the penultimate plant frame for hip lowering depth and the takeoff frame for trunk lean. The trunk should be vertical or slightly leaning back at takeoff, not forward.",
};

function TechniqueTab() {
  const [issue, setIssue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<TechAnalysis | null>(null);
  const [usingExample, setUsingExample] = useState(false);

  async function analyze() {
    setBusy(true);
    setError("");
    setAnalysis(null);
    setUsingExample(false);
    try {
      const text = await chatCompletion(
        [
          { role: "system", content: TECH_SYSTEM },
          {
            role: "user",
            content: `Athlete describes their issue:\n<ISSUE>\n${issue.trim()}\n</ISSUE>\n\nReturn the JSON now.`,
          },
        ],
        { temperature: 0.5, maxTokens: 2400 },
      );
      const parsed = tryParseJson<TechAnalysis>(text);
      if (
        !parsed ||
        !parsed.issue_summary ||
        !Array.isArray(parsed.root_causes) ||
        !Array.isArray(parsed.drills) ||
        !Array.isArray(parsed.cues)
      ) {
        throw new Error("parse_error");
      }
      setAnalysis(parsed);
    } catch (e: any) {
      const msg = e?.message;
      if (msg === "groq_unavailable") {
        setError(
          "AI generation is temporarily unavailable. Showing a hand written example diagnosis below so you can see the output shape.",
        );
        setAnalysis(TECH_EXAMPLE);
        setUsingExample(true);
      } else if (msg === "parse_error") {
        setError("The model returned malformed JSON. Try again.");
      } else {
        setError("Analysis failed. Try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  }

  const PROMPTS = [
    "My triple jump phases are uneven. Hop is too short and my step is too long.",
    "I am jumping off the board flat instead of vertical.",
    "I lose top speed in the last 30 meters of the 200.",
    "My approach to the long jump board feels rushed and I keep fouling.",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="serif text-2xl sm:text-3xl font-medium tracking-tight">
          Form and technique analyzer.
        </h2>
        <p className="mt-3 text-sm text-[var(--fg)]/80 leading-relaxed">
          Describe your issue in plain language. Llama 3.3 70B returns three root cause hypotheses, three to five real drill prescriptions, cue language for each phase, and what to film and look for in playback. Diagnoses like a jumps coach who has watched a lot of film.
        </p>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
          Try one of these to start
        </p>
        <div className="flex flex-col gap-2">
          {PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setIssue(p)}
              className="text-left text-sm rounded border border-[var(--rule)] hover:border-[var(--accent)] px-3 py-2 text-[var(--fg)]/85 hover:text-[var(--accent)] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
        rows={6}
        placeholder="Describe what is going wrong. Mention your event, what phase the issue shows up in, and what you have already tried."
        className="w-full px-4 py-3 rounded-lg border border-[var(--rule)] bg-[var(--bg)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-y text-sm leading-relaxed"
      />

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={analyze}
          disabled={busy || issue.trim().length < 30}
          className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "Analyzing..." : "Diagnose my issue"}
        </button>
        {issue.trim().length > 0 && issue.trim().length < 30 ? (
          <span className="text-xs font-mono text-[var(--muted)]">
            Give me at least a sentence or two of detail.
          </span>
        ) : null}
      </div>

      {error ? <p className="text-xs text-[#D49A7A]">{error}</p> : null}

      {analysis ? (
        <div className="space-y-6 mt-2">
          {usingExample ? (
            <div className="rounded-lg border border-[#D49A7A]/40 bg-[#D49A7A]/[0.06] p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#D49A7A]">
                Example output, AI offline
              </p>
              <p className="mt-2 text-sm text-[var(--fg)]/85 leading-relaxed">
                The Llama 3.3 70B technique analyzer is temporarily unavailable on this deployment. The diagnosis below is a hand written example for a common long jump complaint (cutting the approach, hand drift on penultimate) so the output shape is still clear.
              </p>
            </div>
          ) : null}
          <section className="rounded-lg border border-[var(--accent)] p-5 bg-[var(--accent)]/[0.04]">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
              Issue summary
            </h3>
            <p className="mt-3 prose-body text-[var(--fg)]/95 leading-relaxed">
              {analysis.issue_summary}
            </p>
          </section>

          <section className="rounded-lg border border-[var(--rule)] p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              Three most likely root causes
            </h3>
            <ul className="mt-4 space-y-4">
              {analysis.root_causes.map((c, i) => (
                <li key={i} className="border-l-2 border-[#D49A7A] pl-4">
                  <p className="serif text-base text-[var(--fg)]/95 leading-snug">{c.cause}</p>
                  <p className="mt-2 text-sm text-[var(--fg)]/80 leading-relaxed">{c.why}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-[var(--rule)] p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              Drill prescriptions
            </h3>
            <ul className="mt-4 space-y-4">
              {analysis.drills.map((d, i) => (
                <li key={i} className="border-l-2 border-[#A6D49A] pl-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="serif text-base text-[var(--fg)]/95 leading-snug">{d.name}</p>
                    <CopyButton text={`${d.name}: ${d.prescription}`} />
                  </div>
                  <p className="mt-2 text-sm text-[var(--fg)]/95 leading-relaxed">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] mr-2">
                      Prescription
                    </span>
                    {d.prescription}
                  </p>
                  <p className="mt-2 text-xs text-[var(--fg)]/70 leading-relaxed">
                    {d.what_it_fixes}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-[var(--rule)] p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              Cue language
            </h3>
            <ul className="mt-4 space-y-3">
              {analysis.cues.map((c, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--accent)] whitespace-nowrap pt-1">
                    {c.phase}
                  </span>
                  <p className="text-sm text-[var(--fg)]/90 leading-relaxed">{c.cue}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-[var(--rule)] p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              What to film and what to look for
            </h3>
            <p className="mt-3 text-sm text-[var(--fg)]/90 leading-relaxed">
              {analysis.film_what_to_check}
            </p>
          </section>
        </div>
      ) : null}

      <section className="mt-12 section-rule pt-8">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          How this works
        </h3>
        <p className="mt-3 text-xs text-[var(--fg)]/75 leading-relaxed max-w-prose">
          One Groq Llama 3.3 70B call. Strict JSON contract. The system prompt anchors the model on real jump and sprint phases (penultimate, plant, takeoff angle, hop step ratio, drive, finish lean) and on Kerry&apos;s Iowa Hawkeyes background. Output is shaped the way a coach would write it on a printout, not the way a fitness app would.
        </p>
      </section>
    </div>
  );
}

const ASK_EXAMPLES: { q: string; a: string }[] = [
  {
    q: "How do I peak for conference championships in 4 weeks?",
    a: "Compress your volume in week one and two, then sharpen in week three, then taper hard the week of the meet. Week one and two run your usual specific prep volume at 90 percent intensity but cut accessory work by a third. Week three is mock meet quality only. Three to four max effort efforts on Tuesday, full meet protocol on Saturday. Week four is approach run throughs Monday, short speed Tuesday, rest Wednesday, light activation Friday, compete Saturday. The mistake everyone makes is doing too much in the final week. Trust the work you already put in. The goal of the taper is to show up rested and twitchy, not to add fitness you do not have.",
  },
  {
    q: "I play wide receiver. How do I add real top end speed this offseason?",
    a: "Top end speed is fly 30s and ins and outs. Twice a week. Tuesday and Thursday. Tuesday is 4 to 6 reps of 30m fly with a 20m run in at 95 to 97 percent, 5 minutes rest. Thursday is 3 to 4 ins and outs over 60m, accelerating for 20m, holding max for 20m, relaxing for 20m. Pair both with weight room work twice a week. Hang clean, back squat, hex bar deadlift, and one single leg exercise. Three sets, three to five reps, RPE 7 to 8. Avoid the trap of running tons of 40s. The 40 trains acceleration. You need the top end. Speed transfers to your route running, your separation, and your run after catch. Track it. PR your fly 30 every six weeks.",
  },
  {
    q: "How do I add 2 feet to my long jump this season?",
    a: "Two feet is a season goal that has three levers. One is approach speed. Test your touchdown times every two weeks at your last 10 meters. If you are not hitting 1.05 seconds or faster on the last 10, the jump cannot reach the next tier. Two is penultimate mechanics. Film side on at 240fps. The penultimate should be your longest stride and your hips should lower visibly in that frame. Three is takeoff projection. Practice short approach pop ups three times a week. Six reps. Full recovery. Focus on knee drive and double arm block. If you fix the penultimate alone you usually gain 6 to 9 inches. Approach speed gains another foot. The last 4 to 6 inches comes from confident takeoff, which is downstream of the first two.",
  },
];

function AskTab() {
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [aiOffline, setAiOffline] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ASK_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMsg[];
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(ASK_STORAGE, JSON.stringify(history));
    } catch {}
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history]);

  async function send() {
    const q = draft.trim();
    if (!q || busy) return;
    setBusy(true);
    setError("");
    const next: ChatMsg[] = [...history, { role: "user", content: q }];
    setHistory(next);
    setDraft("");
    try {
      const text = await chatCompletion(
        [
          { role: "system" as const, content: ASK_SYSTEM },
          ...next.map((m) => ({ role: m.role, content: m.content })),
        ],
        { temperature: 0.6, maxTokens: 700 },
      );
      setHistory([...next, { role: "assistant", content: text }]);
      setAiOffline(false);
    } catch (e: any) {
      const msg = e?.message;
      if (msg === "groq_unavailable") {
        setError(
          "AI chat is temporarily unavailable. Showing example coaching answers below so you can see the kind of response this returns when live.",
        );
        setAiOffline(true);
      } else {
        setError("Reply failed. Try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  }

  function clearChat() {
    setHistory([]);
    try {
      localStorage.removeItem(ASK_STORAGE);
    } catch {}
  }

  const PROMPTS = [
    "How do I peak for conference championships in 4 weeks?",
    "I play wide receiver. How do I add real top end speed this offseason?",
    "I am a soccer midfielder. How do I improve repeat sprint endurance?",
    "How do I add 2 feet to my long jump this season?",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="serif text-2xl sm:text-3xl font-medium tracking-tight">
          Track and speed Q&amp;A.
        </h2>
        <p className="mt-3 text-sm text-[var(--fg)]/80 leading-relaxed">
          Free text chat about jumps, sprints, and speed and endurance for any sport. Trained on Kerry&apos;s Iowa Hawkeyes background, his actual marks (long jump 7.00m, triple jump 14.84m), and standard USATF coaching wisdom. Not Kerry himself, but the closest free version.
        </p>
      </div>

      {history.length === 0 ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
            Try one of these to start
          </p>
          <div className="flex flex-col gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setDraft(p)}
                className="text-left text-sm rounded border border-[var(--rule)] hover:border-[var(--accent)] px-3 py-2 text-[var(--fg)]/85 hover:text-[var(--accent)] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg border p-4 ${
                m.role === "user"
                  ? "border-[var(--rule)] bg-[var(--bg)]"
                  : "border-[var(--accent)]/40 bg-[var(--accent)]/[0.04]"
              }`}
            >
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
                {m.role === "user" ? "You" : "Coaching assistant"}
              </p>
              <p className="text-sm text-[var(--fg)]/95 leading-relaxed whitespace-pre-wrap">
                {m.content}
              </p>
            </div>
          ))}
          {busy ? <p className="text-xs font-mono text-[var(--muted)]">Thinking...</p> : null}
          <div ref={endRef} />
        </div>
      ) : null}

      {error ? <p className="text-xs text-[#D49A7A]">{error}</p> : null}

      {aiOffline ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#D49A7A]/40 bg-[#D49A7A]/[0.06] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#D49A7A]">
              Example answers, AI offline
            </p>
            <p className="mt-2 text-sm text-[var(--fg)]/85 leading-relaxed">
              The Llama 3.3 70B chat is temporarily unavailable on this deployment. Below are three hand written examples of the kind of response this returns when the model is live, so you can see the depth and tone.
            </p>
          </div>
          {ASK_EXAMPLES.map((ex, i) => (
            <div key={i} className="space-y-2">
              <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
                  Example question
                </p>
                <p className="text-sm text-[var(--fg)]/95 leading-relaxed">{ex.q}</p>
              </div>
              <div className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/[0.04] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-2">
                  Coaching assistant
                </p>
                <p className="text-sm text-[var(--fg)]/95 leading-relaxed whitespace-pre-wrap">
                  {ex.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
          rows={3}
          placeholder="Ask anything about jumps or sprints. Cmd+Enter to send."
          className="w-full px-4 py-3 rounded-lg border border-[var(--rule)] bg-[var(--bg)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-y text-sm leading-relaxed"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={send}
            disabled={busy || draft.trim().length === 0}
            className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy ? "Thinking..." : "Send"}
          </button>
          {history.length > 0 ? (
            <button
              type="button"
              onClick={clearChat}
              className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              Clear chat
            </button>
          ) : null}
        </div>
      </div>

      <section className="mt-12 section-rule pt-8">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          How this works
        </h3>
        <p className="mt-3 text-xs text-[var(--fg)]/75 leading-relaxed max-w-prose">
          Free text chat through Groq Llama 3.3 70B. The system prompt grounds the model in Kerry&apos;s D1 Iowa Hawkeyes background as a jumper, his USATF nationals history, and standard coaching methodology (USATF Level 1, Tony Wells, Boo Schexnayder). Chat is persisted in your browser&apos;s localStorage so it survives a refresh. Nothing leaves your browser except the messages you choose to send.
        </p>
      </section>
    </div>
  );
}

function BookTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="serif text-2xl sm:text-3xl font-medium tracking-tight">
          Want a person watching your runup?
        </h2>
        <p className="mt-4 text-base text-[var(--fg)]/85 leading-relaxed">
          The AI tabs above are the warmup. I keep a few 1:1 coaching slots open each week for jumpers, sprinters, and athletes from any sport who need real speed and endurance work. Bring me a video and a goal, walk away with a plan.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--rule)] bg-[var(--bg-elev)]/40 p-6">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          Why me
        </h3>
        <p className="mt-3 text-sm text-[var(--fg)]/85 leading-relaxed">
          Iowa Hawkeyes Track and Field, 2012 to 2016. Specialized in long jump and triple jump. Triple jump 14.84m at Big Ten Championships, ranked among the top in Iowa program history. Long jump 7.00m. Before college, USATF indoor All-American in 200m, 400m, long jump, and triple jump, and USATF national champion in triple jump as a high schooler. I know what it feels like to leave 6 inches on the board, and I know how to get them back.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--accent)] p-6 bg-[var(--accent)]/[0.05]">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
          What you get on a 1:1 session
        </h3>
        <ul className="mt-4 space-y-3 text-sm text-[var(--fg)]/90 leading-relaxed">
          <li className="flex gap-3">
            <span className="font-mono text-[var(--accent)]">01</span>
            <span>
              A video review of your approach, takeoff, and phases. I will tell you what I see, frame by frame, in coach language.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-[var(--accent)]">02</span>
            <span>
              A 4 week training plan tailored to your event, level, and how many days you can train. Concrete sets, reps, intensities, rest.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-[var(--accent)]">03</span>
            <span>
              Drill prescriptions and cue language for the specific phase you are leaking time or distance in.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-[var(--accent)]">04</span>
            <span>
              A short written followup with the three things to drill this week and what to film for next time.
            </span>
          </li>
        </ul>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <a
          href="/contact?topic=Coaching"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest px-5 py-3 rounded border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors"
        >
          Reach out →
        </a>
        <span className="text-xs font-mono text-[var(--muted)]">
          A few slots open each week. First reply within a day.
        </span>
      </div>

      <p className="text-xs text-[var(--fg)]/65 leading-relaxed max-w-prose">
        Tell me your event, your current PR, and what is in the way. If your situation is unusual, say so in the message and I will tell you up front whether I am the right person for it.
      </p>

      <section className="mt-8 section-rule pt-8">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
          How this works
        </h3>
        <p className="mt-3 text-xs text-[var(--fg)]/75 leading-relaxed max-w-prose">
          The Reach out button routes to the contact form with the Coaching topic preselected. I read every message and reply within a day. If we are a fit I send a calendar link and we get on Zoom. Bring video, bring a goal, bring honest answers about your last 4 weeks of training.
        </p>
      </section>
    </div>
  );
}

export default function CoachPage() {
  const [tab, setTab] = useState<Tab>("workouts");

  // Allow deep linking via hash (e.g. /coach#technique)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash.replace("#", "") as Tab;
    if (h && TABS.some((t) => t.id === h)) setTab(h);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = `${window.location.pathname}#${tab}`;
    window.history.replaceState(null, "", url);
  }, [tab]);

  return (
    <main className="min-h-screen px-6 sm:px-8 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <a
          href="/"
          className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Back to home
        </a>

        <header className="mt-6">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
            Track &amp; Field + Speed Coaching
          </p>
          <h1 className="serif text-4xl sm:text-5xl leading-[1.05] font-medium tracking-tight mt-3">
            Track &amp; Field + Speed Coaching.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[var(--fg)]/85 leading-relaxed max-w-prose">
            Jumps, sprints, and speed and endurance work for athletes in any sport. Real plans built by a former Iowa Hawkeye.
          </p>
          <p className="mt-3 text-sm sm:text-base text-[var(--fg)]/70 italic leading-relaxed max-w-prose">
            From a guy who used to be the athlete on the other side of this conversation.
          </p>
        </header>

        <section className="mt-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
            Disciplines
          </p>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINES.map((d) => (
              <span
                key={d.label}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--rule)] px-3 py-1.5 text-xs"
                style={{ background: "var(--bg)" }}
              >
                <span className="serif text-[var(--fg)]/95">{d.label}</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">
                  {d.tag}
                </span>
              </span>
            ))}
          </div>
        </section>

        <div className="mt-8 sticky top-[57px] z-30 bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--rule)] -mx-6 sm:-mx-8 px-6 sm:px-8">
          <div role="tablist" className="flex flex-wrap gap-2 py-3">
            {TABS.map((t) => {
              const on = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(t.id)}
                  className={`font-mono text-[10px] sm:text-xs uppercase tracking-widest px-3 py-2 rounded border transition-colors ${
                    on
                      ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/[0.06]"
                      : "border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <section className="mt-10">
          {tab === "workouts" ? <WorkoutsTab /> : null}
          {tab === "technique" ? <TechniqueTab /> : null}
          {tab === "ask" ? <AskTab /> : null}
          {tab === "book" ? <BookTab /> : null}
        </section>

        <footer className="mt-16 pt-8 border-t border-[var(--rule)] text-xs font-mono text-[var(--muted)] flex flex-wrap items-center justify-between gap-3">
          <a href="/" className="hover:text-[var(--accent)]">
            ← Home
          </a>
          <a href="/contact?topic=Coaching" className="hover:text-[var(--accent)]">
            1:1 Coaching →
          </a>
        </footer>
      </div>
    </main>
  );
}
