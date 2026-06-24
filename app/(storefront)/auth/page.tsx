"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast("Successfully logged in!", "success");
        router.push("/account");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast("Registration successful! Check your email to verify.", "success");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast(error.message, "error");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="w-full max-w-md overflow-hidden bg-background border border-card-border rounded-none shadow-[0_4px_24px_rgba(0,0,0,0.015)]">
        <div className="flex w-full border-b border-card-border/60">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4.5 text-center text-[10px] font-sans font-medium uppercase tracking-[0.2em] transition-all ${
              isLogin ? "border-b border-foreground text-foreground font-semibold" : "text-foreground-secondary/70 border-b border-transparent hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4.5 text-center text-[10px] font-sans font-medium uppercase tracking-[0.2em] transition-all ${
              !isLogin ? "border-b border-foreground text-foreground font-semibold" : "text-foreground-secondary/70 border-b border-transparent hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleAuth}
              className="flex flex-col gap-6"
            >
              {!isLogin && (
                <Input
                  label="Full Name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ENTER YOUR FULL NAME"
                />
              )}
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
              />
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER PASSWORD"
              />

              <Button variant="primary" type="submit" disabled={loading} className="mt-4 w-full !h-12 text-[10px] rounded-none tracking-[0.2em] font-sans font-semibold uppercase">
                {loading ? "Processing..." : isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-card-border/70"></div>
            <span className="px-4 text-[9px] font-sans uppercase tracking-[0.2em] text-foreground-secondary/80">or continue with</span>
            <div className="flex-1 border-t border-card-border/70"></div>
          </div>

          <Button
            variant="outline"
            className="mt-6 w-full !h-12 rounded-none text-[9px] tracking-[0.2em] font-sans uppercase flex items-center justify-center gap-2"
            onClick={handleGoogleAuth}
            type="button"
          >
            <svg className="h-3.5 w-3.5" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
            GOOGLE
          </Button>
        </div>
      </div>
    </div>
  );
}
