"use client";

import { useEffect, useMemo, useState } from "react";
import { chatCompletion } from "../../../lib/groq";

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

const STATIC_FALLBACK_SCENE: Record<Genre, { body: string; choices: Choice[] }> = {
  "sci-fi": {
    body:
      "You stand alone on the bridge of the salvage ship Margery, the distress beacon still pulsing on the ancient console. Eight years of silence answered in a single ping. The viewports show nothing but dark and the faint outline of a hull that should not be drifting this far out. A crew manifest blinks on the secondary screen. Twenty seven names. All marked unknown status. Behind you, the airlock cycles open without authorization. The lights drop to amber. Somewhere in the lower decks, something heavy moves across the floor. You can hear breathing from the comm channel that no one should be using. Your suit's life support reads ninety minutes. The console asks you to confirm boarding before the breach. The pulse of the beacon slows, as if it knows you arrived. You feel the cold of the hull through your gloves. Whatever waits below has been waiting a long time. The choice you make in the next ten seconds will set the rest of this story in motion. Your instinct says one thing. Your training says another. The clock on the airlock counts down.",
    choices: [
      { id: "A", label: "Honor the distress call, board with caution.", alignment: "chivalrous" },
      { id: "B", label: "Scan the manifest before stepping through.", alignment: "pragmatic" },
      { id: "C", label: "Open every channel and shout into the dark.", alignment: "chaotic" },
    ],
  },
  fantasy: {
    body:
      "The forest stops where the road bends, as if cut by a knife. Past the line, the trees lean inward and the air tastes of iron. A barefoot child waits exactly where the road ends, head tilted, eyes too dark for the gray afternoon. She does not speak when you slow your horse. She lifts one small hand and points down the path, toward a hollow you cannot see from here. Your saddlebag carries a sealed letter from the dying baron, two silver coins, and a knife you have not had to use in eleven years. The horse refuses to take another step. Crows sit on the branches above without sound. You realize the wind has died. The child waits. Her mouth opens slowly and she says your name. Not the name you ride under. The name your mother gave you in the back room of an inn long since burned to the ground. The world has narrowed to this clearing, this child, this single moment of being known by something you do not know. You can taste the choice in the air before you make it.",
    choices: [
      { id: "A", label: "Dismount and kneel. Ask her name.", alignment: "chivalrous" },
      { id: "B", label: "Stay mounted. Offer her a coin for the road.", alignment: "pragmatic" },
      { id: "C", label: "Draw the knife and walk past her.", alignment: "chaotic" },
    ],
  },
  noir: {
    body:
      "The diner is empty except for the woman in the green coat, the cook turning his back to the grill, and you. She slides a brass key across the formica without looking up. The tag on the ring is wood, hand carved, with a number burned into it. Forty seven. She lifts her coffee, drinks, and walks out into the rain without saying a word. The door bell rings twice as it settles. You sit with the key in front of you, the steam from your own cup curling around your fingers. The cook still has not turned around. Outside, the streetlight flickers and a black sedan rolls past slow. Forty seven is the number on the locker at the bus station two blocks east. Forty seven is also the number of a room at the Crawford Hotel where a man you used to work for went missing in March. Both are possible. You finger the key. Your retainer is still missing. Your colleague is still dead. The woman in the green coat is already halfway down the block. The rain is picking up. You have maybe ninety seconds before her trail goes cold.",
    choices: [
      { id: "A", label: "Catch up to her in the rain.", alignment: "chivalrous" },
      { id: "B", label: "Pocket the key. Pay your check. Think.", alignment: "pragmatic" },
      { id: "C", label: "Shout the dead man's name across the diner.", alignment: "chaotic" },
    ],
  },
  romance: {
    body:
      "The gate agent calls your row and the man beside you in the boarding area does not move. He has rebooked the entire delayed flight without telling you, paid the difference out of his own card, and asked the airline to keep you seated beside him in seat 14B and 14C. He says he is sorry about the surprise. He says he overheard your call to your sister about the funeral in Dallas, and that he did not want you to fly alone. You do not know him. You met him at the coffee cart by gate B14 ninety minutes ago. He has kind eyes and the careful posture of someone who has lost enough people to know what helping looks like. He hands you the new boarding pass with your name spelled correctly. He waits. The line shortens. You can feel the eyes of the gate agent on you, the hum of the terminal, the heat of a stranger's quiet generosity. Your phone buzzes with your sister's number. The window of choice is small. Whatever you decide here will not just be about the flight. It will be about the kind of stranger you let in.",
    choices: [
      { id: "A", label: "Take the seat. Thank him quietly.", alignment: "chivalrous" },
      { id: "B", label: "Trade seats with the man behind you.", alignment: "pragmatic" },
      { id: "C", label: "Ask him what he really wants.", alignment: "chaotic" },
    ],
  },
  horror: {
    body:
      "You count the doors in your hallway again. Seven last night. Eight tonight. The eighth is at the far end, painted the same flat white as the others, with no number and no peephole. The brass handle looks newer than the rest. The hallway smells faintly of paper and something underneath it you cannot name. Your phone shows no service. The light fixture overhead hums on a frequency you can feel in your teeth. Through the wall to your right, your neighbor's television is still playing the local news from six hours ago, the same anchor saying the same forecast on loop. You have lived in this building eleven months. You have walked past these doors every day. You do not own a key to the eighth one. Yet the key on your ring, the one you have never identified, fits the lock without effort. The door is warm. Whatever is on the other side is breathing in time with you. You realize you have already taken three steps closer than you remember. The hallway behind you has grown one door longer.",
    choices: [
      { id: "A", label: "Knock and announce yourself.", alignment: "chivalrous" },
      { id: "B", label: "Back away. Photograph the door.", alignment: "pragmatic" },
      { id: "C", label: "Turn the key. Step inside.", alignment: "chaotic" },
    ],
  },
};

const STATIC_FALLBACK_ENDING: Record<Genre, { title: string; body: string }> = {
  "sci-fi": {
    title: "The signal you sent",
    body:
      "You finish the manual repair on the beacon and let it broadcast clean for the first time in eight years. The salvage ship Margery groans under you, but holds. Whatever was waiting in the lower decks is no longer there, or no longer cares. You sit in the captain's chair the dead crew left behind. The viewports show stars and the faint glint of a returning fleet, your fleet, drawn by the signal you stabilized. You think of the names on the manifest. Twenty seven people who deserved a better ending than the one this ship gave them. You write the report in your own hand and time stamp it for the record. The kindness you carried into this place did not bring them back. It did make the place safe enough that the people who come next will not be lost the same way. Your suit life support reads twelve minutes. Your fleet is six minutes out. The math finally works in your favor. You close your eyes and the beacon pulses steady, the first thing in eight years to keep a promise.",
  },
  fantasy: {
    title: "The name the forest knew",
    body:
      "You speak the name your mother gave you back to the child at the road's bend, and the forest answers. The hollow opens beneath you and you do not fall but step, as if the path had always been there. The baron's letter dissolves into smoke in your saddlebag. The crows lift in a single black sheet and the wind returns, and the child is no longer a child. She is the keeper of names, and she has been waiting for someone who was willing to be known. You ride out of the hollow at dusk and the road bends back into the world you came from. The kingdom does not remember the baron. The kingdom does not remember the war. You carry the only memory of either, and the small wooden token she pressed into your palm, warm as a heartbeat. You will know what to do with it when the time comes. The horse takes one steady step, and then another, and the road behind you closes.",
  },
  noir: {
    title: "Forty seven",
    body:
      "The locker at the bus station holds a single envelope and your missing retainer in twenties. The envelope has the name of the man who hired you on it, in handwriting you recognize from the case file. He is not dead. He never was. The woman in the green coat is his daughter, and she came to you because she ran out of better options. You pocket the cash because rent is rent. You take the envelope to the Crawford Hotel and you do not knock. You slide it under the door of room forty seven and you walk down the back stairs without looking at the desk clerk. The rain has stopped. The streetlight is steady. You think of all the cases that ended in the right answer for the wrong reasons and you keep walking. Whatever happens to the man in room forty seven now is not yours to carry. You have done the part you took the retainer for. The rest is the city's problem, and the city has never been short on problems.",
  },
  romance: {
    title: "Seat 14B",
    body:
      "You take the seat beside him without saying yes or no out loud. The plane levels off and you tell him about your sister and the funeral and the eight years of phone calls that built to this one. He listens the way you wish you had been listened to in your twenties. By the time the cart comes through he knows your father's full name and the way he laughed and the year he stopped. He does not try to fix any of it. He orders you the same coffee you ordered at gate B14 and pays for it in cash. When you land in Dallas you exchange numbers without making a plan. You walk into the funeral home alone, which is how it should be, and you carry the warmth of a stranger's quiet generosity into the room with you. Months later he will be the one who picks up on the third ring at three in the morning, and you will think back to the gate agent calling row fourteen and the small careful choice you made to let someone in.",
  },
  horror: {
    title: "One door longer",
    body:
      "You photograph the door and you walk back to your apartment without turning the key. You count the doors again. Eight. You sleep with the lights on. In the morning the eighth door is gone. Seven again, exactly the way they always were. You do not tell your neighbor, who is suddenly cheerful, who waves at you in the lobby for the first time in eleven months. You do not tell anyone. The brass key is still on your ring. You cannot bring yourself to remove it. Once a week, on the night your building's halls go quiet, you walk to the end of the hallway and count. Most weeks there are seven doors. Some weeks there are eight. You do not approach the eighth door again. You simply count it, and you go back to bed, and you live the rest of your life knowing that something keeps a door for you in your own building, and that you were given exactly one chance to see what was inside, and that you chose to keep counting instead.",
  },
};

export default function StorytellerPage() {
  const [genre, setGenre] = useState<Genre>("sci-fi");
  const [setup, setSetup] = useState<string>(GENRES[0].setups[0]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [alignment, setAlignment] = useState<Record<Alignment, number>>(newAlignment);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [ending, setEnding] = useState<string>("");
  const [endingTitle, setEndingTitle] = useState<string>("");
  const [targetLength, setTargetLength] = useState<number>(6);

  useEffect(() => {
    setHasKey(true);
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
    setBusy(true);
    setError("");
    setUsingFallback(false);
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
      const msg = e?.message;
      if (msg === "groq_unavailable") {
        const fallback = STATIC_FALLBACK_SCENE[genre];
        setUsingFallback(true);
        setScenes([{ index: 1, body: fallback.body, choices: fallback.choices }]);
        setError(
          "AI generation is temporarily unavailable. Showing a single hand written scene so you can see the output shape. Pick a choice to read the example ending.",
        );
      } else if (msg === "parse_error") {
        setError("The model returned malformed JSON. Try again.");
      } else {
        setError("Story start failed. Try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function pickChoice(choice: Choice) {
    if (busy) return;
    const updated = [...scenes];
    updated[updated.length - 1] = { ...updated[updated.length - 1], picked: choice };
    setScenes(updated);
    setAlignment((a) => ({ ...a, [choice.alignment]: a[choice.alignment] + 1 }));

    if (usingFallback) {
      const fallback = STATIC_FALLBACK_ENDING[genre];
      setEnding(fallback.body);
      setEndingTitle(fallback.title);
      return;
    }

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
      } catch (e: any) {
        if (e?.message === "groq_unavailable") {
          const fallback = STATIC_FALLBACK_ENDING[genre];
          setEnding(fallback.body);
          setEndingTitle(fallback.title);
          setUsingFallback(true);
          setError(
            "AI generation went offline mid story. Showing a hand written ending for this genre so you can see how the closer reads.",
          );
        } else {
          setError("Ending generation failed. Try again.");
        }
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
      const msg = e?.message;
      if (msg === "groq_unavailable") {
        const fallback = STATIC_FALLBACK_ENDING[genre];
        setEnding(fallback.body);
        setEndingTitle(fallback.title);
        setUsingFallback(true);
        setError(
          "AI generation went offline mid story. Jumping to a hand written ending for this genre so you can still see the closer.",
        );
      } else if (msg === "parse_error") {
        setError("The model returned malformed JSON. Try the choice again.");
      } else {
        setError("Next scene failed. Try again.");
      }
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
    setUsingFallback(false);
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

        {usingFallback && scenes.length > 0 && (
          <div className="mt-6 rounded-lg border border-[#D49A7A]/40 bg-[#D49A7A]/[0.06] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#D49A7A]">
              Example output, AI offline
            </p>
            <p className="mt-2 text-sm text-[var(--fg)]/85 leading-relaxed">
              Llama 3.3 70B is temporarily unavailable on this deployment. The scene and ending below are hand written examples for this genre so the page still demonstrates the experience.
            </p>
          </div>
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
              back. No setup needed, the Groq call runs through a server route. JSON parse failures
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
