"use client";

import { useEffect, useState } from "react";

/** Slim mustard progress bar pinned to the top while reading a chapter. */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      setProgress(height > 0 ? (scrolled / height) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1.5 bg-transparent">
      <div
        className="h-full bg-mustard transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
