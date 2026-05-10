"use client";

import { OAuthButtonGroup } from "@stackframe/stack";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export function JoinForm() {
  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-xl mx-auto py-12">
      {/* Mascot Area */}
      <div className="relative group">
        <div className="absolute inset-0 bg-duo-macaw/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative duo-card bg-background p-8 rounded-[3rem] border-4 border-duo-swan shadow-[0_12px_0_var(--duo-swan)]">
          <Image 
            src="/mascot.png" 
            alt="Debo Mascot" 
            width={200} 
            height={200} 
            className="w-40 h-40 object-contain animate-float"
            priority
          />
        </div>
        {/* Speech Bubble */}
        <div className="absolute -top-12 -right-16 md:-right-24 bg-background p-6 rounded-[2rem] border-4 border-duo-swan shadow-[0_8px_0_var(--duo-swan)] max-w-[200px] hidden sm:block">
          <p className="text-sm font-black text-duo-eel uppercase tracking-tight">
            Ready to start remembering everything?
          </p>
          <div className="absolute -bottom-4 left-6 w-8 h-8 bg-background border-r-4 border-b-4 border-duo-swan rotate-45" />
        </div>
      </div>

      {/* Main Card */}
      <div className="duo-card w-full bg-background p-8 md:p-12 rounded-[3rem] border-4 border-duo-swan shadow-[0_16px_0_var(--duo-swan)]">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-duo-macaw/10 border-2 border-duo-macaw text-duo-macaw font-black uppercase tracking-widest text-[10px]">
            <Sparkles className="w-3 h-3" />
            <span>Join Early Access</span>
          </div>
          <h1 className="text-4xl font-heading font-black text-duo-eel leading-tight uppercase tracking-tight">
            Create your <span className="text-duo-macaw">memory bank</span>
          </h1>
          <p className="text-duo-wolf font-bold text-lg">
            30 seconds to set up. Lifetime of clarity.
          </p>
        </div>

        <div className="space-y-8">
          <div className="w-full">
            {/* Custom styled OAuth buttons would be ideal, but for now we use Stack's component */}
            {/* We can wrap it to match the aesthetic */}
            <div className="[&_button]:!h-16 [&_button]:!rounded-2xl [&_button]:!text-lg [&_button]:!font-black [&_button]:!border-2 [&_button]:!border-duo-swan [&_button]:!shadow-[0_4px_0_var(--duo-swan)] [&_button]:!transition-all [&_button]:active:!translate-y-1 [&_button]:active:!shadow-none">
              <OAuthButtonGroup type="sign-up" />
            </div>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-4 border-duo-swan opacity-50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.3em] font-black">
              <span className="bg-background px-4 text-duo-swan">or</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-duo-wolf font-bold mb-4">
              Already have an account?
            </p>
            <Link 
              href="/signin" 
              className="text-duo-macaw font-black uppercase tracking-widest text-sm hover:underline underline-offset-8"
            >
              Sign In Here
            </Link>
          </div>
        </div>


        <div className="mt-12 pt-8 border-t-4 border-duo-swan/50 text-center space-y-4">
          <p className="text-[10px] font-black text-duo-swan uppercase tracking-widest leading-relaxed">
            By joining, you agree to our{" "}
            <Link href="/terms" className="text-duo-wolf hover:text-duo-eel underline decoration-2">Terms</Link>
            {" "} & {" "}
            <Link href="/privacy" className="text-duo-wolf hover:text-duo-eel underline decoration-2">Privacy Policy</Link>
          </p>
          <div className="flex justify-center gap-4 text-[10px] font-black text-duo-swan uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-duo-feather" /> Encrypted</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-duo-macaw" /> Private</span>
          </div>
        </div>
      </div>
    </div>
  );
}

