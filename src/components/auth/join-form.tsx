"use client";

import { useState } from "react";
import { stackClientApp } from "@/stack/client";
import { OAuthButtonGroup, OAuthButton } from "@stackframe/stack";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function JoinForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleJoin = async () => {
    setLoading(true);
    setError("");

    try {
      await stackClientApp.signInWithOAuth("google");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <Card className="border-2">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">
          Get Started with Debo
        </CardTitle>
        <CardDescription className="text-base">
          Join the intelligent AI companion built for minimalists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {error && (
          <div
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive text-center"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="w-full">
          <OAuthButtonGroup app={stackClientApp} className="w-full">
            <OAuthButton providerId="google" className="w-full" />
          </OAuthButtonGroup>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center mt-2 text-xs text-muted-foreground text-center">
        <p className="max-w-[280px]">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
