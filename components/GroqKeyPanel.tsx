// Deprecated. The portfolio no longer asks visitors for a Groq key.
// All Groq calls go through the server side proxy at /api/groq/chat
// which uses the GROQ_API_KEY env var on Vercel.

interface Props {
  label?: string;
  onChange?: (hasKey: boolean) => void;
}

export default function GroqKeyPanel(_props: Props) {
  return null;
}
