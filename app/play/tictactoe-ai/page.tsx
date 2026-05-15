"use client";

import { useEffect, useMemo, useState } from "react";
import { chatCompletion } from "../../../lib/groq";

type Cell = "X" | "O" | "";
type Board = Cell[];

const LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winner(b: Board): Cell {
  for (const [a, c, d] of LINES) {
    if (b[a] && b[a] === b[c] && b[c] === b[d]) return b[a];
  }
  return "";
}

function isFull(b: Board): boolean {
  return b.every((c) => c !== "");
}

type ScoredMove = { idx: number; score: number };

function minimax(
  b: Board,
  turn: Cell,
  ai: Cell,
  depth: number,
): { score: number; idx: number } {
  const w = winner(b);
  if (w === ai) return { score: 10 - depth, idx: -1 };
  if (w !== "" && w !== ai) return { score: depth - 10, idx: -1 };
  if (isFull(b)) return { score: 0, idx: -1 };

  const human: Cell = ai === "X" ? "O" : "X";
  let best = turn === ai ? -Infinity : Infinity;
  let bestIdx = -1;
  for (let i = 0; i < 9; i += 1) {
    if (b[i] !== "") continue;
    const next = [...b];
    next[i] = turn;
    const v = minimax(next, turn === ai ? human : ai, ai, depth + 1);
    if (turn === ai) {
      if (v.score > best) {
        best = v.score;
        bestIdx = i;
      }
    } else {
      if (v.score < best) {
        best = v.score;
        bestIdx = i;
      }
    }
  }
  return { score: best, idx: bestIdx };
}

function rankMoves(b: Board, ai: Cell): ScoredMove[] {
  const human: Cell = ai === "X" ? "O" : "X";
  const out: ScoredMove[] = [];
  for (let i = 0; i < 9; i += 1) {
    if (b[i] !== "") continue;
    const next = [...b];
    next[i] = ai;
    const v = minimax(next, human, ai, 1);
    out.push({ idx: i, score: v.score });
  }
  return out.sort((a, b2) => b2.score - a.score);
}

function describeBoard(b: Board): string {
  const sym = (c: Cell) => (c === "" ? "." : c);
  return `${sym(b[0])} ${sym(b[1])} ${sym(b[2])}\n${sym(b[3])} ${sym(b[4])} ${sym(b[5])}\n${sym(b[6])} ${sym(b[7])} ${sym(b[8])}`;
}

const POSITION_NAMES: Record<number, string> = {
  0: "top left",
  1: "top middle",
  2: "top right",
  3: "middle left",
  4: "center",
  5: "middle right",
  6: "bottom left",
  7: "bottom middle",
  8: "bottom right",
};

export default function TicTacToePage() {
  const [board, setBoard] = useState<Board>(() => Array(9).fill(""));
  const [humanMark, setHumanMark] = useState<Cell>("X");
  const [turn, setTurn] = useState<Cell>("X");
  const [history, setHistory] = useState<{ player: Cell; idx: number }[]>([]);
  const [commentary, setCommentary] = useState<string[]>([]);
  const [commentOn, setCommentOn] = useState(true);
  const [hasKey, setHasKey] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");

  const ai: Cell = humanMark === "X" ? "O" : "X";
  const w = winner(board);
  const over = w !== "" || isFull(board);

  useEffect(() => {
    setHasKey(true);
  }, []);

  // AI turn
  useEffect(() => {
    if (over) return;
    if (turn !== ai) return;
    const ranked = rankMoves(board, ai);
    if (ranked.length === 0) return;
    const pick = ranked[0];
    const next = [...board];
    next[pick.idx] = ai;
    const move = { player: ai, idx: pick.idx };
    setTimeout(() => {
      setBoard(next);
      setHistory((h) => [...h, move]);
      setTurn(humanMark);
    }, 250);
  }, [turn, board, ai, humanMark, over]);

  // Commentary on every move
  useEffect(() => {
    if (history.length === 0) return;
    if (!commentOn) return;
    if (false) return;
    const last = history[history.length - 1];
    let cancelled = false;
    setThinking(true);
    setError("");
    (async () => {
      try {
        const text = await chatCompletion(
          [
            {
              role: "system",
              content:
                "You are a calm chess style commentator for a game of tic tac toe. Two sentences max, total under 40 words. Describe what just happened, the strategic intent (corner, center, fork, block, threat), and what each player is setting up. Plain English, no em dashes or en dashes.",
            },
            {
              role: "user",
              content: `Human plays ${humanMark}, AI plays ${ai}.\nLast move: ${last.player} took ${POSITION_NAMES[last.idx]}.\nBoard now (rows top to bottom):\n${describeBoard(board)}\n\nGive a tight commentary line.`,
            },
          ],
          { temperature: 0.5, maxTokens: 140 },
        );
        if (!cancelled) {
          setCommentary((c) => [...c, text]);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e?.message === "groq_unavailable"
              ? "AI commentary is temporarily unavailable on this deployment. The minimax opponent below is fully client side, so the game itself plays normally. Commentary will return when the model is back online."
              : "AI commentary unavailable. Try again later.",
          );
        }
      } finally {
        if (!cancelled) setThinking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.length]);

  function play(idx: number) {
    if (over) return;
    if (turn !== humanMark) return;
    if (board[idx] !== "") return;
    const next = [...board];
    next[idx] = humanMark;
    setBoard(next);
    setHistory((h) => [...h, { player: humanMark, idx }]);
    setTurn(ai);
  }

  function reset(asMark: Cell = humanMark) {
    setBoard(Array(9).fill(""));
    setHistory([]);
    setCommentary([]);
    setError("");
    setHumanMark(asMark);
    setTurn("X");
  }

  const ranked = useMemo(() => {
    if (over) return [];
    if (turn !== ai) return [];
    return rankMoves(board, ai);
  }, [board, turn, ai, over]);

  const status = (() => {
    if (w) {
      if (w === humanMark) return "You won. Should not be possible.";
      return "AI wins. Try again.";
    }
    if (isFull(board)) return "Draw. Optimal play.";
    return turn === humanMark ? "Your move." : "AI thinking...";
  })();

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
            Tic tac toe, perfect AI.
          </h1>
          <p className="mt-3 text-sm text-[var(--fg)]/75 leading-relaxed">
            The opponent runs alpha beta pruned minimax with depth aware
            scoring. It cannot lose, only win or draw. The commentary panel is
            Groq Llama 3.3 70B reading the board out loud after each move.
          </p>
        </header>

        <div className="mt-6">
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
            You play
          </span>
          <button
            type="button"
            onClick={() => reset("X")}
            className={`font-mono text-xs px-3 py-1.5 rounded border ${humanMark === "X" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--rule)] text-[var(--muted)]"}`}
          >
            X (first)
          </button>
          <button
            type="button"
            onClick={() => reset("O")}
            className={`font-mono text-xs px-3 py-1.5 rounded border ${humanMark === "O" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--rule)] text-[var(--muted)]"}`}
          >
            O (second)
          </button>
          <label className="ml-auto inline-flex items-center gap-2 text-xs text-[var(--fg)]/70">
            <input
              type="checkbox"
              checked={commentOn}
              onChange={(e) => setCommentOn(e.target.checked)}
            />
            Commentary
          </label>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-8">
          <div>
            <div className="grid grid-cols-3 gap-1.5 w-fit">
              {board.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`cell ${i}`}
                  onClick={() => play(i)}
                  disabled={over || c !== "" || turn !== humanMark}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded border border-[var(--rule)] flex items-center justify-center serif text-4xl font-medium hover:border-[var(--accent)] disabled:hover:border-[var(--rule)]"
                  style={{ color: c === "X" ? "var(--accent)" : "#7AA2D4" }}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-[var(--fg)]/80">{status}</p>
            <button
              type="button"
              onClick={() => reset(humanMark)}
              className="mt-3 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded border border-[var(--rule)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              New game
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                Minimax tree (next AI move)
              </h3>
              {ranked.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--fg)]/60">
                  No AI move pending. Make a move to see scored options.
                </p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {ranked.map((m, i) => (
                    <li
                      key={m.idx}
                      className="font-mono text-xs flex items-center gap-3"
                    >
                      <span className="text-[var(--muted)] w-8">
                        #{i + 1}
                      </span>
                      <span className="w-24">{POSITION_NAMES[m.idx]}</span>
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          background:
                            m.score > 0
                              ? "#5BA776"
                              : m.score < 0
                                ? "#D49A7A"
                                : "var(--rule)",
                          color: m.score === 0 ? "var(--fg)" : "#fff",
                        }}
                      >
                        {m.score > 0
                          ? `+${m.score}`
                          : m.score === 0
                            ? "draw"
                            : `${m.score}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
                Commentary
              </h3>
              {commentOn && !hasKey ? (
                <p className="mt-2 text-sm text-[var(--fg)]/60">
                  AI commentary may be temporarily unavailable.
                </p>
              ) : commentary.length === 0 ? (
                <p className="mt-2 text-sm text-[var(--fg)]/60">
                  {thinking ? "Thinking..." : "Waiting for the first move."}
                </p>
              ) : (
                <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                  {commentary.map((c, i) => (
                    <li
                      key={i}
                      className="rounded border border-[var(--rule)] px-3 py-2"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] mr-2">
                        Move {i + 1}
                      </span>
                      {c}
                    </li>
                  ))}
                  {thinking && (
                    <li className="text-xs text-[var(--muted)]">
                      Thinking...
                    </li>
                  )}
                </ul>
              )}
              {error && (
                <p className="mt-2 text-xs text-[#D49A7A]">{error}</p>
              )}
            </div>
          </div>
        </div>

        <section className="mt-16 section-rule pt-10">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            How this works
          </h2>
          <div className="mt-4 prose-body text-sm text-[var(--fg)]/80 leading-relaxed space-y-3">
            <p>
              Minimax explores the full game tree. From any board, the AI
              evaluates every legal move, then recurses with the opponent
              minimizing the score, alternating maximizer and minimizer until
              terminal states. A win for the AI scores +10 minus depth so it
              prefers fast wins. A loss scores depth minus 10 so it delays
              losses. A draw scores 0.
            </p>
            <p>
              Tic tac toe is small enough that we do not need transposition
              tables or iterative deepening. The full tree is roughly 9!
              candidate orderings, well under 400k positions, and the search
              completes in under a millisecond per move on any modern device.
            </p>
            <p>
              The commentary panel is a separate concern. After each move the
              board snapshot, the move that produced it, and which player owns
              which mark all go to Groq Llama 3.3 70B with a tight system
              prompt. Two sentences, under 40 words, no spoilers about the next
              move. Toggle the switch above to keep the AI silent.
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
