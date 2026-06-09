"use client";

import { useEffect } from "react";

/**
 * Drives the {grow} word effect: each .fx-grow run sits at its normal size, then
 * swells when it scrolls into view and holds. One IntersectionObserver for the
 * whole article — robust across browsers (vs. scroll-driven CSS), and disabled
 * for readers who prefer reduced motion. Mount once on a reading page.
 */
export function ProseFX() {
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const targets = document.querySelectorAll<HTMLElement>(".fx-grow");
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target); // grow once, then leave it grown
          }
        }
      },
      // fire a touch before the word is centred, so it swells as you arrive
      { rootMargin: "0px 0px -25% 0px", threshold: 0.6 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return null;
}
