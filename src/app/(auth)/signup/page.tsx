"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    
    await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
    }, {
        onError: (ctx) => {
            setError(ctx.error.message || "An unexpected error occurred");
            setLoading(false);
        }
    });
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join Debo using your Google account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {error && <p className="text-sm font-medium text-destructive" role="alert">{error}</p>}
            <Button 
                variant="outline" 
                className="w-full py-6 flex items-center justify-center gap-2" 
                onClick={handleGoogleSignup} 
                disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {loading ? "Connecting…" : "Continue with Google"}
            </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center mt-4 text-sm text-muted-foreground">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
