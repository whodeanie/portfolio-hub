'use client';

/**
 * Contact Form Page using Web3Forms
 *
 * This component integrates with Web3Forms (https://web3forms.com) to handle
 * email submissions without requiring a backend. To set up:
 *
 * 1. Visit https://web3forms.com
 * 2. Enter kdjsplash@gmail.com in the "Get your free Access Key" field
 * 3. Click "Create Access Key"
 * 4. Check your email for the access key
 * 5. In Vercel project settings, add a new environment variable:
 *    - Name: NEXT_PUBLIC_WEB3FORMS_KEY
 *    - Value: [paste the access key from the email]
 * 6. Redeploy the site
 *
 * The form includes honeypot protection (botcheck field) and sends all
 * submissions directly to kdjsplash@gmail.com via Web3Forms API.
 */

import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  company: string;
  message: string;
  botcheck: string;
}

interface FormState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    message: '',
    botcheck: ''
  });

  const [formState, setFormState] = useState<FormState>({ status: 'idle' });

  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!accessKey) {
      setFormState({
        status: 'error',
        message: 'Setup needed. Contact form is not configured.'
      });
      return;
    }

    if (formData.botcheck) {
      return;
    }

    setFormState({ status: 'loading' });

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          message: formData.message,
          subject: `Portfolio inquiry from ${formData.name}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setFormState({
        status: 'success',
        message: 'Got it. I will reply within a day or two.'
      });

      setFormData({
        name: '',
        email: '',
        company: '',
        message: '',
        botcheck: ''
      });
    } catch (error) {
      const emailUser = 'kdjsplash';
      const emailDomain = 'gmail.com';
      setFormState({
        status: 'error',
        message: `Something went wrong. You can also email me at ${emailUser}@${emailDomain}`
      });
    }
  };

  const isButtonDisabled = !accessKey || formState.status === 'loading';

  return (
    <main className="min-h-screen px-6 sm:px-8 py-16 sm:py-24">
      <div className="mx-auto max-w-prose">
        <a
          href="/"
          className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)]"
        >
          Back to home
        </a>

        <section className="mt-12">
          <h1 className="serif text-5xl sm:text-6xl leading-[1.05] font-medium tracking-tight">
            Reach out. I read every message.
          </h1>
          <p className="mt-6 text-lg text-[var(--fg)]/85 leading-relaxed">
            Send me a message and I will get back to you soon.
          </p>
        </section>

        {formState.status === 'success' ? (
          <section className="mt-16 rounded-lg border border-green-600/30 bg-green-50 dark:bg-green-950/20 px-6 py-8">
            <p className="text-green-800 dark:text-green-300 leading-relaxed">
              {formState.message}
            </p>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="mt-16 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block font-mono text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--rule)] bg-[var(--bg)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-mono text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--rule)] bg-[var(--bg)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block font-mono text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
                Company (optional)
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[var(--rule)] bg-[var(--bg)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                placeholder="Your company"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block font-mono text-xs uppercase tracking-widest text-[var(--muted)] mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-[var(--rule)] bg-[var(--bg)] text-[var(--fg)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                placeholder="Tell me about your project, question, or opportunity..."
              />
            </div>

            {/* Honeypot */}
            <input
              type="text"
              name="botcheck"
              value={formData.botcheck}
              onChange={handleChange}
              style={{ display: 'none' }}
            />

            {/* Error State */}
            {formState.status === 'error' && (
              <div className="rounded-lg border border-red-600/30 bg-red-50 dark:bg-red-950/20 px-6 py-4">
                <p className="text-red-800 dark:text-red-300 text-sm leading-relaxed">
                  {formState.message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isButtonDisabled}
                className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 font-mono text-xs uppercase tracking-widest transition-colors ${
                  isButtonDisabled
                    ? 'border border-[var(--rule)] text-[var(--muted)] cursor-not-allowed opacity-60'
                    : 'border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)]'
                }`}
              >
                {!accessKey
                  ? 'Setup needed. See README.'
                  : formState.status === 'loading'
                    ? 'Sending.'
                    : 'Send message'}
              </button>
              {!accessKey && (
                <a
                  href="https://web3forms.com"
                  target="_blank"
                  rel="noreferrer"
                  className="ml-4 text-xs text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  Learn more →
                </a>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
