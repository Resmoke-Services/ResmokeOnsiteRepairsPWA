
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Login() {
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleRedirectResult = async () => {
      setLoading(true);
      try {
        const result = await getRedirectResult(auth);
        // If result is null, it means the user just landed on the page.
        // If it has a value, it means they are coming back from the redirect.
        if (result) {
          // User successfully signed in.
          // The useUser hook will handle the user state change.
        }
      } catch (error: any) {
        console.error("Error getting redirect result", error);
        if (error.code !== 'auth/web-storage-unsupported') {
             toast({
              variant: "destructive",
              title: "Login Failed",
              description: "Could not sign you in with Google. Please try again.",
            });
        }
      } finally {
        setLoading(false);
      }
    };
    handleRedirectResult();
  }, [auth, toast]);


  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with Google", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Could not start the sign-in process. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm animate-fade-in shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl text-foreground">
          Resmoke Onsite PWA
        </CardTitle>
        <CardDescription>Login to manage your repair jobs</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          onClick={signIn}
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-5 w-5" />
          )}
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
