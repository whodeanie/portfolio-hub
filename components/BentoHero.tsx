"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import SandboxPill from './SandboxPill';
import { useAnalytics } from '../lib/analytics';

const FEATURED_PROJECTS = [
  {
    name: 'NBA Playoff Props',
    image: '/screenshots/nba-playoff-props.jpg',
    tech: ['Next.js', 'TypeScript', 'Anthropic'],
    href: 'https://nba-playoff-props.vercel.app',
    hasLiveDemo: true,
  },
  {
    name: 'Quant Signal Engine',
    image: '/screenshots/quant-signal-engine.jpg',
    tech: ['Next.js', 'TypeScript', 'Groq'],
    href: 'https://quant-signal-engine.vercel.app',
    hasLiveDemo: true,
  },
  {
    name: 'MCP RAG Starter',
    image: '/screenshots/mcp-rag-starter.jpg',
    tech: ['MCP', 'RAG', 'Vector'],
    href: 'https://github.com/whodeanie/mcp-rag-starter',
    hasLiveDemo: false,
  },
];

const STACK = [
  'typescript', 'python', 'c#/.net', 'java', 'sql',
  'react', 'next.js', 'redux', 'node.js', 'graphql',
  'postgres', 'dynamodb', 'bigquery', 'redis', 'neo4j',
  'aws', 'azure', 'gcp', 'vercel',
  'docker', 'github actions',
  'anthropic', 'openai', 'gemini', 'langchain', 'pinecone',
  'mcp', 'fhir', 'pytorch', 'n8n'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function BentoHero() {
  const { captureProjectCardClick, captureGithubLinkClicked, captureExternalLinkClicked } = useAnalytics();
  const onFeaturedClick = (project: { name: string; href: string }) => {
    captureProjectCardClick({ title: project.name, href: project.href, cats: ["featured"] });
    if (/github\.com/i.test(project.href)) captureGithubLinkClicked(project.href, project.name);
    else captureExternalLinkClicked(project.href, project.name);
  };
  return (
    <motion.section
      className="hero-bento w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* CSS Grid Layout */}
      <style>{`
        .hero-bento {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-template-rows: repeat(3, auto);
          gap: 1rem;
          margin-bottom: 4rem;
        }

        @media (max-width: 768px) {
          .hero-bento {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }
        }

        .hero-bento > * {
          border: 1px solid var(--rule);
          border-radius: 14px;
          transition: all 200ms ease-out;
        }

        .hero-bento > *:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(166, 115, 64, 0.1);
        }

        /* Tile Backgrounds */
        .tile-identity {
          grid-column: 1 / 3;
          grid-row: 1 / 3;
          background: #FAF6EE;
          position: relative;
          overflow: hidden;
        }

        .tile-pitch {
          grid-column: 3 / 5;
          grid-row: 1 / 2;
          background: #F5EFE0;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .tile-shipping {
          grid-column: 5 / 7;
          grid-row: 1 / 2;
          background: #3D5A4E;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .tile-project {
          grid-column: span 2;
          grid-row: auto;
          background: #EFE7D2;
          position: relative;
          overflow: hidden;
        }

        .tile-stack {
          grid-column: 1 / 3;
          grid-row: 3 / 4;
          background: #F5EFE0;
          padding: 2rem;
        }

        .tile-play {
          grid-column: 3 / 5;
          grid-row: 3 / 4;
          background: #FAF6EE;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tile-contact {
          grid-column: 5 / 7;
          grid-row: 3 / 4;
          background: #EFE7D2;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .tile-identity,
          .tile-pitch,
          .tile-shipping,
          .tile-project,
          .tile-stack,
          .tile-play,
          .tile-contact {
            grid-column: 1 !important;
            grid-row: auto !important;
          }
        }
      `}</style>

      {/* Identity Tile */}
      <motion.div className="tile-identity" variants={itemVariants}>
        <img
          src="/headshot-square.jpg"
          alt="Kerry Dean Jr."
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
          <h1 className="serif text-4xl sm:text-5xl font-medium text-white leading-tight tracking-tight">
            Kerry Dean Jr.
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-white/80">
            Software Engineer · Chicago
          </p>
        </div>
      </motion.div>

      {/* Pitch Tile */}
      <motion.div className="tile-pitch" variants={itemVariants}>
        <p className="serif text-2xl font-medium leading-snug text-[#1F1B15]">
          I build AI tools, automation systems, and side businesses. Currently shipping sports and AI projects from Chicago.
        </p>
        <Link
          href="/resume/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent)]/80"
        >
          Read about me →
        </Link>
      </motion.div>

      {/* Currently Shipping Tile */}
      <motion.div className="tile-shipping" variants={itemVariants}>
        <div className="text-center">
          <div className="text-5xl font-medium text-white">9</div>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-white/70">
            Years shipping production AI
          </p>
        </div>
      </motion.div>

      {/* Featured Project Tiles */}
      {FEATURED_PROJECTS.map((project, idx) => (
        <motion.a
          key={project.name}
          href={project.href}
          target="_blank"
          rel="noreferrer"
          onClick={() => onFeaturedClick(project)}
          className="tile-project group relative"
          variants={itemVariants}
        >
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="serif text-lg font-medium text-white">{project.name}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 rounded bg-[var(--accent)]/20 text-white"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          {project.hasLiveDemo && <SandboxPill kind="demo" />}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="font-mono text-[10px] uppercase tracking-widest px-3 py-2 rounded bg-[var(--accent)] text-white">
              Try it ↗
            </span>
          </div>
        </motion.a>
      ))}

      {/* Tech Stack Tile */}
      <motion.div className="tile-stack" variants={itemVariants}>
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--muted)] mb-4">
          Tech Stack
        </h3>
        <p className="font-mono text-sm text-[#1F1B15]/80 leading-relaxed">
          {STACK.join(' · ')}
        </p>
      </motion.div>

      {/* Play Tile */}
      <motion.div className="tile-play" variants={itemVariants}>
        <Link
          href="/play/"
          className="text-center hover:text-[var(--accent)] transition-colors"
        >
          <div className="serif text-2xl font-medium mb-2">Play</div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
            Explore interactive demos →
          </p>
        </Link>
      </motion.div>

      {/* Contact Tile */}
      <motion.div className="tile-contact" variants={itemVariants}>
        <h3 className="serif text-xl font-medium text-[#1F1B15] mb-4">
          Get in touch
        </h3>
        <p className="text-sm text-[#1F1B15]/70 mb-4">
          24 hour response guaranteed.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-white bg-[var(--accent)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Send message →
        </Link>
      </motion.div>
    </motion.section>
  );
}
