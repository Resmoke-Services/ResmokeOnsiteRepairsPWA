"use client";

import { useAuth } from "@/hooks/use-auth";
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

export function Login() {
  const { signInWithGoogle, loading } = useAuth();

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
          onClick={signInWithGoogle}
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-5 w-5" />
          )}
          Login with Google
        </Button>
      </CardContent>
    </Card>
  );
}
