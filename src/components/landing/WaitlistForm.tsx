"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";

export function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false);

  // TODO: Replace with actual form submission handler (e.g. Supabase, Resend, Tally)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Send form data to backend
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="waitlist" className="py-20 px-6">
        <div className="mx-auto max-w-xl text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
            You&apos;re on the list.
          </h2>
          <p className="text-sm font-medium text-muted-foreground">
            We&apos;ll let you know as soon as early access opens. No spam, ever.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="waitlist" className="py-20 px-6">
      <div className="mx-auto max-w-xl">
        <div className="duo-card p-8 md:p-10">
          <div className="mb-8 text-center space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-primary/70">
              Early access
            </div>
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
              Reserve your spot
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              Be first in line when Debo opens for private preview.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="waitlist-name"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70"
              >
                Name
              </label>
              <input
                id="waitlist-name"
                name="name"
                type="text"
                required
                placeholder="Your name"
                className="duo-input w-full"
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="waitlist-email"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70"
              >
                Email
              </label>
              <input
                id="waitlist-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="duo-input w-full"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="waitlist-usecase"
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70"
              >
                What would you use Debo for?
              </label>
              <select
                id="waitlist-usecase"
                name="usecase"
                className="duo-input w-full appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23777%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
                defaultValue=""
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option value="journaling">Personal journaling &amp; memory</option>
                <option value="meetings">Meeting notes &amp; follow-ups</option>
                <option value="voice">Voice note organization</option>
                <option value="people">People &amp; relationship tracking</option>
                <option value="decisions">Decision logging &amp; recall</option>
                <option value="other">Something else</option>
              </select>
            </div>

            <button
              type="submit"
              className="minimal-btn-primary w-full py-3 text-sm mt-2 inline-flex items-center justify-center gap-2"
            >
              Reserve early access
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-5 text-center text-[11px] font-semibold text-muted-foreground/50 leading-relaxed">
            No spam. No selling your data. You&apos;ll only hear about Debo
            access and product updates.
          </p>
        </div>
      </div>
    </section>
  );
}
