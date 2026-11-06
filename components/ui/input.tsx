export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted/60 focus:outline-none focus:border-brand-500 focus:border-2 disabled:cursor-not-allowed disabled:opacity-50 transition ${
        className || ""
      }`}
      {...props}
    />
  );
}

export { Input };
