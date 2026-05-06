"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

type HeroProps = {
  isSignedIn?: boolean;
};

export function Hero({ isSignedIn = false }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-12 md:py-24 bg-background">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Side: Mascot */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-[280px] h-[280px] md:w-[420px] md:h-[420px] animate-in zoom-in duration-700">
              <Image 
                src="/mascot.png" 
                alt="Debo Mascot" 
                fill 
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start space-y-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-black text-duo-eel leading-[1.1] max-w-md">
              The free, fun, and effective way to <span className="text-duo-green">remember your life.</span>
            </h1>
            
            <div className="flex flex-col w-full max-w-xs space-y-4">
              {isSignedIn ? (
                <Button asChild variant="duolingo" size="lg" className="w-full">
                  <Link href="/dashboard">Continue Learning</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="duolingo" size="lg" className="w-full">
                    <Link href="/join">Get Started</Link>
                  </Button>
                  <Button asChild variant="duolingo-outline" size="lg" className="w-full">
                    <Link href="/join">I already have an account</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

