// src/components/ui/button.tsx
"use client";

import * as React from "react";

type Variant = "default" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 " +
    "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-border bg-background hover:bg-muted",
    ghost: "hover:bg-muted",
    destructive: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
    icon: "h-9 w-9",
};

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", size = "md", ...props }, ref) => (
        <button
            ref={ref}
            className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        />
    )
);
Button.displayName = "Button";