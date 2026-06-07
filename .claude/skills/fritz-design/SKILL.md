---
name: fritz-design
description: The fritz design system — use whenever building, restyling, or reviewing any fritz UI (pages, components, emails, the Studio). Covers palette, typography, voice/personality, layout, components, the bleed-through colour system for skills/system text, and motion. Apply it so everything stays on-brand.
---

# fritz — design system

fritz is a home for serialized web novels and writing. The site is a **reading
house hosted by a cat named fritz**. It should feel *authored* — warm, playful,
editorial, with personality in every corner. Words come first; media (image,
sound, film) is woven in only when it makes the story bigger.

The feeling: **a beautiful printed page that occasionally winks at you.**

## 1. Palette

Defined as Tailwind theme tokens in `src/app/globals.css` (`@theme`). Always use
the token classes (`bg-paper`, `text-ink`, `text-mustard`, etc.), never raw hex.

| Token | Hex | Use |
|---|---|---|
| `paper` | `#f6eedc` | warm cream canvas (page background) |
| `paper-2` | `#efe3c9` | cards, sections, insets |
| `ink` | `#1a1714` | primary text, the cat, dark surfaces |
| `ink-soft` | `#4a4138` | secondary text |
| `muted` | `#8a7c69` | captions, meta, timestamps |
| `mustard` | `#f2b705` | **the signature accent** — highlights, selection, eyes |
| `ember` | `#e4572e` | warm pop — hovers, links in prose, drop-cap |
| `line` | `#1a17141f` | hairline borders |

Rules: cream background everywhere (there's a faint dotted texture on `body`).
Mustard is the star accent — use it with restraint so it keeps its presence.
Selection is mustard-on-ink. The site is light/warm — **no dark mode.**

## 2. Typography

Three faces, loaded via `next/font` in `src/lib/fonts.ts`:

- **Display** — Shrikhand (`font-display`): chunky, warm, hand-lettered. The
  fritz voice. **Wordmark + headings only. Always lowercase.** Never for body.
- **Body** — Fraunces (`font-body`): a soft, characterful reading serif. All
  long-form prose (novels, essays). Comfortable measure (~65ch), line-height ~1.85.
- **Sans** — Nunito (`font-sans`): friendly rounded UI — nav, buttons, meta, labels.

Headings are lowercase display. Prose uses `.prose-fritz` (see globals.css);
chapter openings get a `.dropcap` first letter in ember.

## 3. Voice & personality

Write microcopy **as fritz, the cat** — warm, a little wry, never corporate.
Lowercase for headings and playful bits. Examples already in the product:

- 404: "fritz looked everywhere. This page isn't here."
- empty state: "nothing written yet — fritz is sharpening a pencil."
- subscribe: "get the next chapter the moment it drops."
- footer: "© fritz — curled up somewhere warm, writing."

Every empty state, error, button, and confirmation is a chance for character.
The mascot (`src/components/site/Mascot.tsx`, peeking-eyes motif) and the
occasional **walking cat** (`WalkingFritz.tsx`) carry the personality visually.

## 4. Layout & shape

- Content max-widths: `max-w-6xl` (listings/home), `max-w-3xl` (articles),
  `max-w-2xl` (the immersive chapter reader). Horizontal padding `px-5`.
- Generous vertical rhythm (`py-16`+ on sections). Let it breathe.
- Radii are soft and large: `rounded-2xl` for cards/inputs, `rounded-full` for
  buttons/pills/nav items.
- Borders are the hairline `border-line`. Cards sit on `bg-paper`/`bg-paper-2`.
- Signature hover: a playful lift + hard offset shadow —
  `hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--color-ink)]`.
- Buttons tilt slightly on hover (`hover:-rotate-1` / `hover:-rotate-2` on the
  wordmark). Use sparingly; it should feel alive, not jittery.

## 5. Components (existing vocabulary — reuse, don't reinvent)

- `ButtonLink` (`components/ui/Button.tsx`): variants `primary` (ink→ember),
  `mustard`, `ghost`. Pills, bold sans, `active:scale-95`.
- `Header` / `Footer` / `Wordmark` / `Mascot` / `MascotEyes` in `components/site`.
- `PostCard`, `NovelCard` in `components/cards`.
- Reader: `ReadingProgress` (mustard top bar), `Soundtrack` (ambient YouTube
  toggle), `ChapterNav`.
- Section header pattern: lowercase display `h2` on the left, a small ember
  "see all →" link on the right.

## 6. Bleed-through — colour for skills / classes / system text

The core storytelling device (this is a progression-fantasy / LitRPG site).
Certain phrases — skills, classes, system messages — **glow in colour**, like the
veil between worlds thinning. Authored in the Studio by **selecting text and
clicking a colour** (TipTap inline colour). Rendered HTML is plain
`<span style="color: …">`; the glow is applied automatically by CSS:
`.prose-fritz span[style*="color"] { font-weight:600; text-shadow:0 0 12px color-mix(in srgb, currentColor 55%, transparent) }`.

Palette (keep these exact hexes; they have matching glows):
gold `#9a7300` (default / king's-will), ember `#bf3a1d`, frost `#1f6f8b`,
void `#6b3fa0` (eldritch), jade `#2f7d4f`, rose `#b0306a`, ash `#6b5d4f` (neutral system).

Default prose stays plain — colour is reserved for these moments so it keeps its
weight. (Legacy markdown content uses `[skill]{color}` tags via `BlockRenderer`.)

## 7. Motion

Tasteful and rare. Hover lifts/tilts; mustard reading-progress bar; the
**walking cat** crosses the bottom of the page every ~25–70s (paused in the
Studio and for `prefers-reduced-motion`). Nothing autoplays loudly; ambience is
opt-in. Motion should feel like the house is alive, never like it's demanding
attention.

## 8. Do / Don't

- DO keep headings lowercase display; DO keep body in the serif; DO write
  microcopy in fritz's voice; DO reuse existing components and tokens.
- DON'T introduce new accent colours (mustard/ember are it, plus the bleed
  palette for prose); DON'T use the display face for body text; DON'T add dark
  mode; DON'T overuse motion or colour — restraint is what gives them presence.
