# fritz — product & usability backlog

Prioritized from a "turn a reading site into a product people return to" review.
Note: many of these just wire up tables that already exist in the schema
(`reading_progress`, `bookmarks`, `reactions`, `comments`, `subscribers`,
`novel_parts`) — high value, low cost.

## 0. The unlock: reader accounts
Currently only admins can log in. Readers need accounts to unlock follow,
resume, bookmarks, comments, reactions. Reuse the existing Supabase auth.
- [ ] Reader sign-up / sign-in (magic link or password), separate from admin
- [ ] Reader profile + "my shelf" surface

## 1. The return loop (highest leverage)
- [ ] Follow a novel (per-novel subscribe)
- [ ] Email on new chapter (wire `subscribers`; actually send — e.g. Resend)
- [ ] Double opt-in / confirm + unsubscribe flow (`confirm_token` exists)
- [ ] Resume reading: "Continue from Chapter N →" banner on novel + home (`reading_progress`)
- [ ] Reader library / "my shelf": what I'm reading + what's new

## 2. Community
- [ ] Per-chapter comments (`comments` table; threaded, moderated)
- [ ] Reactions / claps at chapter end (`reactions` table)
- [ ] Comment moderation surface in the Studio

## 3. Reading experience
- [ ] Reader settings: font size, line-height
- [ ] Sepia / dark "night" reading theme (reader-only, not whole site)
- [ ] Chapter jump dropdown in the reader (avoid round-trips to the TOC)
- [ ] Keyboard arrows for prev/next chapter
- [ ] Arc/Part grouping in the TOC for long novels (`novel_parts`, unused)
- [ ] "Mark as read" / clearer X-of-N progress

## 4. Discovery & first-time UX
- [ ] Home "Start reading" CTA deep-links to featured novel's FIRST chapter (not the list)
- [ ] Browse by tag / genre (`tags` + join tables, unused in UI)
- [ ] Search (titles, chapters, posts — `search` tsvector columns exist)
- [ ] A real curated "Start Here"

## 5. Distribution / SEO (for visitors)
- [ ] Static/ISR rendering of public pages (currently all dynamic via cookie client);
      revalidate on publish (already calling `revalidatePath`)
- [ ] sitemap.xml
- [ ] RSS feed (site-wide + per-novel) — native web-serial follow mechanism
- [ ] Per-post/chapter OpenGraph images
- [ ] Structured data (Article / Book / BlogPosting)

## 6. Studio / author product
- [ ] Increment + display view counts (`view_count` exists, never used)
- [ ] Autosave + "preview as reader"
- [ ] Chapter reordering / renumbering (draft numbering is already drifting)
- [ ] Word-count / streak nudge
- [ ] Simple author analytics (views per chapter, follower count)

## 7. Trust & accessibility
- [ ] Contrast audit (mustard-on-cream text; lighter bleed colours)
- [ ] Visible focus rings; keyboard nav
- [ ] Alt text enforced on uploaded images
- [ ] Lightweight analytics (privacy-friendly)

---

## Suggested sequence
1. Reader accounts → 2. Follow + email-on-new-chapter → 3. Resume reading →
4. Comments + claps. (Converts the site into a platform with a retention loop.)
Then: RSS + sitemap + deep-linked "Start reading" (acquisition), then reader
settings + dark mode (session quality).

## Cheap high-impact wins (can do anytime, mostly standalone)
- [ ] Deep-link "Start reading" to first chapter
- [ ] RSS + sitemap.xml
- [ ] Claps (anonymous-friendly)
- [ ] Resume-reading banner
