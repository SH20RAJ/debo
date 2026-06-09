import Link from "next/link";
import { waitlistUrl } from "@/lib/launch";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

export function FounderNote() {
  return (
    <section className="py-24 md:py-32 px-6 bg-landing-bg border-t border-landing-border-light">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-heading text-landing-2xl md:text-landing-3xl font-semibold tracking-tight text-landing-text-primary mb-8">
          Why I&apos;m building Debo
        </h2>
        <div className="space-y-6">
          <p className="text-landing-base md:text-landing-lg font-medium leading-relaxed text-landing-text-secondary">
            I kept losing useful context — voice notes, project ideas, saved links, meeting promises, and thoughts from different apps. AI chats were helpful, but every conversation started from zero.
          </p>
          <p className="text-landing-base md:text-landing-lg font-medium leading-relaxed text-landing-text-secondary">
            Debo is my attempt to build a private memory system that actually remembers the things I choose to save.
          </p>

          <div className="pt-8">
            <p className="font-semibold text-landing-text-primary text-landing-sm">Shaswat Raj</p>
            <p className="text-landing-xs text-landing-text-tertiary mb-8">Building Debo in public</p>

            <div className="flex gap-6 items-center text-landing-xs font-medium text-landing-text-secondary">
              <a href="https://github.com/sh20raj/debo" className="hover:text-landing-text-primary transition-colors flex items-center gap-1.5"><GithubIcon className="w-[18px] h-[18px]" /> GitHub</a>
              <a href="https://x.com/sh20raj" className="hover:text-landing-text-primary transition-colors flex items-center gap-1.5"><TwitterIcon className="w-[18px] h-[18px]" /> X/Twitter</a>
              <Link href={waitlistUrl} className="hover:text-landing-text-primary transition-colors">Waitlist</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
