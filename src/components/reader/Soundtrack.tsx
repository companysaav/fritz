"use client";

import { useState } from "react";

type Track = { youtube?: string; title?: string };

/**
 * A per-chapter ambient "soundtrack" — turns the media integration into a
 * reading feature. Toggling plays a hidden YouTube track while you read.
 */
export function Soundtrack({ tracks }: { tracks: Track[] }) {
  const [playing, setPlaying] = useState(false);
  const track = tracks.find((t) => t.youtube);
  if (!track?.youtube) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={() => setPlaying((p) => !p)}
        className="flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-bold text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-all hover:bg-mustard active:scale-95"
      >
        <span className={playing ? "animate-pulse text-ember" : ""}>
          {playing ? "♫" : "▶"}
        </span>
        {playing ? "playing ambience" : "play ambience"}
      </button>
      {playing && (
        <iframe
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          src={`https://www.youtube-nocookie.com/embed/${track.youtube}?autoplay=1&loop=1&playlist=${track.youtube}`}
          allow="autoplay"
          title={track.title ?? "ambience"}
        />
      )}
    </div>
  );
}
