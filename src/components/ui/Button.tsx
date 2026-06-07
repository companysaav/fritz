import Link from "next/link";
import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all active:scale-95";

const variants = {
  primary: "bg-ink text-paper hover:bg-ember",
  mustard: "bg-mustard text-ink hover:-rotate-1",
  ghost: "border-2 border-ink text-ink hover:bg-ink hover:text-paper",
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof variants }) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
