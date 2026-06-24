"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const typedChildren = children as React.ReactNode;
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-medium uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-none relative overflow-hidden group";

    const variants = {
      primary: "bg-foreground text-background hover:bg-accent hover:text-foreground",
      secondary: "bg-background-secondary text-foreground hover:bg-accent/10",
      outline: "border border-foreground text-foreground hover:bg-foreground hover:text-background",
      ghost: "hover:bg-background-secondary text-foreground",
      destructive: "bg-destructive text-white hover:bg-red-800",
    };

    const sizes = {
      sm: "h-9 px-4 text-[10px]",
      md: "h-11 px-6 py-2.5 text-xs",
      lg: "h-14 px-10 py-3.5 text-xs",
      icon: "h-10 w-10",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {variant === "primary" && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]" />
        )}
        <span className="relative z-10 flex items-center justify-center gap-2">{typedChildren}</span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";
