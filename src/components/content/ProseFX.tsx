"use client";

import { useEffect } from "react";

/**
 * Drives the scroll-triggered word effects ({grow}, {reveal}): each run sits in
 * its resting state, then animates when it scrolls into view and holds. One
 * IntersectionObserver for the whole article — robust across browsers (vs.
 * scroll-driven CSS), and disabled for prefers-reduced-motion.
 *
 * Adds `fx-ready` to <html> so {reveal}'s hidden start state only applies when
 * this runs — if JS never loads, the text stays visible instead of vanishing.
 * Mount once on a reading page.
 */
export function ProseFX() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const targets = document.querySelectorAll<HTMLElement>(
      ".fx-grow, .fx-reveal",
    );
    if (targets.length === 0) return;

    document.documentElement.classList.add("fx-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target); // animate once, then leave it settled
          }
        }
      },
      // fire a touch before the word is centred, so it animates as you arrive
      { rootMargin: "0px 0px -25% 0px", threshold: 0.6 },
    );
    targets.forEach((t) => io.observe(t));
    return () => {
      io.disconnect();
      document.documentElement.classList.remove("fx-ready");
    };
  }, []);

  return null;
}
