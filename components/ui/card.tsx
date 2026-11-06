import { forwardRef } from "react";

// Simple Card components (no radix-ui dependency)

const Card = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${props.className || ""}`} {...props} />
);

const CardHeader = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${props.className || ""}`} {...props} />
);

const CardTitle = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${props.className || ""}`} {...props} />
);

const CardContent = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 ${props.className || ""}`} {...props} />
);

function Button({ className, variant = "default", size = "default", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };
  const sizes: Record<string, string> = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className || ""}`} {...props} />
  );
}

export { Card, CardHeader, CardTitle, CardContent, Button };

