import Link from "next/link";

import { display } from "@/lib/fonts";

export function Wordmark({
  size = "text-2xl",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`${display.className} ${size} lowercase leading-none tracking-tight text-ink transition-transform hover:-rotate-2 inline-flex items-center ${className}`}
    >
      fri
      {/* the "t" crossbar doubles as a pair of cat ears via the dotted z */}
      tz
      <span className="text-mustard">.</span>
    </Link>
  );
}
