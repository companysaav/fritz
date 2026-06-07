"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const WALK_MS = 17000; // time to cross the screen

/** Side-profile fritz, walking. Tail sways, body bobs. */
function CatSide() {
  return (
    <svg width="56" height="36" viewBox="0 0 84 50" aria-hidden="true">
      <g className="fritz-bob" style={{ color: "var(--color-ink)" }}>
        {/* tail */}
        <path
          className="fritz-tail"
          d="M22 40 C 8 40, 5 22, 15 15 C 12 25, 17 33, 27 37 Z"
          fill="currentColor"
        />
        {/* body */}
        <path
          d="M20 40 C 17 27, 28 23, 42 23 C 58 23, 68 27, 68 35 C 68 41, 64 43, 58 43 L 26 43 C 22 43, 20 42, 20 40 Z"
          fill="currentColor"
        />
        {/* legs */}
        <rect x="30" y="41" width="4.5" height="8" rx="2" fill="currentColor" />
        <rect x="40" y="41" width="4.5" height="8" rx="2" fill="currentColor" />
        <rect x="54" y="41" width="4.5" height="8" rx="2" fill="currentColor" />
        {/* head */}
        <circle cx="66" cy="29" r="10" fill="currentColor" />
        {/* ears */}
        <path d="M58 22 l -2 -8 l 7 4 Z" fill="currentColor" />
        <path d="M72 21 l 3 -8 l -6 5 Z" fill="currentColor" />
        {/* eye */}
        <circle cx="69" cy="28" r="1.7" fill="var(--color-mustard)" />
      </g>
    </svg>
  );
}

export function WalkingFritz() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [dir, setDir] = useState<"lr" | "rl">("lr");
  const [run, setRun] = useState(0);

  useEffect(() => {
    // Not while writing in the Studio.
    if (pathname?.startsWith("/studio")) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    let timer: ReturnType<typeof setTimeout>;
    let alive = true;

    const cycle = () => {
      const wait = 25000 + Math.random() * 45000; // 25–70s between strolls
      timer = setTimeout(() => {
        if (!alive) return;
        setDir(Math.random() < 0.5 ? "lr" : "rl");
        setRun((r) => r + 1);
        setShow(true);
        timer = setTimeout(() => {
          if (!alive) return;
          setShow(false);
          cycle();
        }, WALK_MS);
      }, wait);
    };

    cycle();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-1 left-0 z-30 w-screen overflow-hidden"
    >
      <div
        key={run}
        className="w-fit will-change-transform"
        style={{ animation: `fritz-walk-${dir} ${WALK_MS}ms linear forwards` }}
      >
        <CatSide />
      </div>
    </div>
  );
}
