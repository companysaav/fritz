// Seed sample content via the service-role client (bypasses RLS).
// Run: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY / URL in .env.local");
  process.exit(1);
}
const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// --- block helpers ---------------------------------------------------------
const P = (text) => ({ type: "paragraph", text });
const H = (text, level = 2) => ({ type: "heading", level, text });
const IMG = (seed, caption) => ({
  type: "image",
  src: `https://picsum.photos/seed/${seed}/1600/1000`,
  alt: caption ?? "",
  caption,
});
const YT = (id, caption) => ({ type: "youtube", id, caption });
const Q = (text, cite) => ({ type: "quote", text, cite });
const ASIDE = (text) => ({ type: "aside", text });
const CALL = (title, text, tone) => ({ type: "callout", title, text, tone });
const HR = () => ({ type: "divider" });

const stats = (blocks) => {
  const text = blocks
    .map((b) => b.text ?? "")
    .join(" ")
    .trim();
  const words = text ? text.split(/\s+/).length : 0;
  return { word_count: words, reading_time_minutes: Math.max(1, Math.round(words / 220)) };
};

const cover = (seed) => `https://picsum.photos/seed/${seed}/900/1200`;
const wide = (seed) => `https://picsum.photos/seed/${seed}/1600/900`;
const face = (n) => `https://i.pravatar.cc/300?img=${n}`;

async function addMedia(type, src, alt) {
  const { data, error } = await db
    .from("media_assets")
    .insert({ type, url: src, external_url: src, alt, metadata: { seed: true } })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

const NOVEL_SLUG = "the-cartographer-of-small-hours";
const POST_SLUGS = [
  "one-chapter-at-a-time",
  "writing-with-the-lights-off",
  "sound-as-a-character",
];
const TAG_SLUGS = ["craft", "fantasy", "process", "sound"];

async function clean() {
  console.log("→ clearing previous seed…");
  await db.from("novels").delete().eq("slug", NOVEL_SLUG);
  await db.from("posts").delete().in("slug", POST_SLUGS);
  await db.from("tags").delete().in("slug", TAG_SLUGS);
  await db.from("media_assets").delete().filter("metadata->>seed", "eq", "true");
}

async function seedTags() {
  await db.from("tags").insert([
    { slug: "craft", name: "Craft" },
    { slug: "fantasy", name: "Fantasy" },
    { slug: "process", name: "Process" },
    { slug: "sound", name: "Sound" },
  ]);
}

async function seedNovel() {
  console.log("→ seeding the novel…");
  const coverId = await addMedia("image", cover("cartographer-cover"), "A lantern over an unfinished map");

  const { data: novel, error } = await db
    .from("novels")
    .insert({
      slug: NOVEL_SLUG,
      title: "The Cartographer of Small Hours",
      tagline: "a serialized fantasy about the maps we draw in the dark.",
      synopsis:
        "Every night at 3am the city rearranges itself, and only Wren can see the new streets before they set. Hired to map the hours no one remembers living, she discovers the small hours are not empty — they are inhabited, and someone has been redrawing her home while she sleeps.",
      status: "ongoing",
      visibility: "published",
      featured: true,
      accent_color: "#E4572E",
      cover_media_id: coverId,
      banner_media_id: coverId,
      soundtrack: [{ youtube: "jfKfPfyJRdk", title: "small hours ambience" }],
    })
    .select("id")
    .single();
  if (error) throw error;

  const chapters = [
    {
      slug: "the-three-am-street",
      number: 1,
      title: "The 3AM Street",
      excerpt: "Wren takes a commission no sane mapmaker would.",
      hero: wide("ch1-hero"),
      note: "This is where it begins. Read it slow — the city does.",
      blocks: [
        P(
          "The first rule of mapping the small hours is that you must be awake for none of the right reasons. Wren had been awake for all of them — grief, rent, a kettle that screamed like it meant it — when the commission slid under her door on paper the colour of weak tea.",
        ),
        P(
          "*Map the streets that exist between 3 and 4*, it said. *Payment on completion. Do not be seen.*",
        ),
        IMG("ch1-lantern", "The lantern she was told never to set down."),
        P(
          "She should have burned it. Instead she laced her boots, pocketed her good pen, and stepped into a city that had quietly stopped being the one she fell asleep in.",
        ),
        ASIDE(
          "I want you to notice she brings the **pen** and not a weapon. Mapmakers are like that. Tells you everything, really.",
        ),
        Q(
          "A map is just a promise that a place will still be there when you come back.",
          "Wren's mother, who is not in this story yet",
        ),
        P(
          "The street that should have been Carrow Lane was now a staircase going down into warm dark, and at the bottom someone had already drawn an X — in her handwriting.",
        ),
        P(
          "She pressed her palm to the wet ink and the world *answered*. A line surfaced behind her eyes, gold and absolute — [Cartographer's Mark] — and far below, something long [Sleeping]{void} opened a single eye.",
        ),
        HR(),
        P("She had not been here before. She was certain of it. The X was certain of something else."),
      ],
    },
    {
      slug: "everything-the-dark-keeps",
      number: 2,
      title: "Everything the Dark Keeps",
      excerpt: "The small hours, it turns out, are not empty.",
      hero: wide("ch2-hero"),
      note: "Turn the ambience on for this one. It was written to it.",
      blocks: [
        P(
          "Down the staircase the air changed its mind about being air and became something closer to held breath. Wren walked with the lantern low, the way you carry a candle past a sleeping animal you'd rather not wake.",
        ),
        YT("jfKfPfyJRdk", "The sound of the street below Carrow Lane."),
        P(
          "There were people here. Not ghosts — she'd mapped a haunting once and this was warmer than that, ruder than that. People living the hour the rest of the city had agreed to forget, hanging washing, arguing softly, trading in minutes like coin.",
        ),
        CALL(
          "A note on the geography",
          "The small hours fold. A street can be longer at its middle than at either end. Wren learned to measure them in breaths, not steps.",
        ),
        P(
          "An old man selling clocks with no hands looked up as she passed. *You're the new one*, he said, not unkindly. *The last cartographer drew us beautifully. Then she drew herself a door, and left through it, and now look.* He gestured at a row of houses that ended in a wall of fresh, wet ink.",
        ),
        ASIDE("Fresh ink. At 3am. Somebody is still **drawing**. Hold onto that."),
      ],
    },
    {
      slug: "in-her-own-hand",
      number: 3,
      title: "In Her Own Hand",
      excerpt: "Wren finds out who has been redrawing her home.",
      hero: wide("ch3-hero"),
      note: "End of the first arc. The next chapter drops soon — subscribe and I'll find you.",
      blocks: [
        P(
          "She found her own building three turns and one impossible corner from where it slept in daylight. Same crooked door. Same screaming kettle, faint through the window. And taped to the brick, a map of the small hours — finished, gorgeous, complete.",
        ),
        IMG("ch3-map", "The finished map. Every street she had yet to walk."),
        P(
          "It was her work. Not work she had done — work she *would* do, rendered in a hand that had grown surer with every street, ending in a final flourish she didn't yet know how to make.",
        ),
        Q("How do you finish a map of a place that is still drawing you?"),
        P(
          "At the bottom, where a cartographer signs, someone had already written her name. The ink was still wet. Behind her, very politely, the staircase folded itself away.",
        ),
        HR(),
        P("To be continued."),
      ],
    },
  ];

  for (const ch of chapters) {
    const heroId = await addMedia("image", ch.hero, ch.title);
    const s = stats(ch.blocks);
    const { error: cerr } = await db.from("chapters").insert({
      novel_id: novel.id,
      slug: ch.slug,
      number: ch.number,
      title: ch.title,
      excerpt: ch.excerpt,
      body: { blocks: ch.blocks },
      author_note: ch.note,
      hero_media_id: heroId,
      soundtrack: [{ youtube: "jfKfPfyJRdk", title: "small hours ambience" }],
      status: "published",
      ...s,
    });
    if (cerr) throw cerr;
  }

  const cast = [
    { slug: "wren", name: "Wren", role: "the cartographer", img: 5, bio: "Maps places so they'll still be there when she comes back. Currently being mapped in return." },
    { slug: "the-clockseller", name: "The Clockseller", role: "keeper of the hour", img: 12, bio: "Sells clocks with no hands. Remembers every cartographer who came before." },
    { slug: "the-last-one", name: "The Last Cartographer", role: "?", img: 32, bio: "Drew the small hours beautifully, then drew herself a door. The ink she left behind is still wet." },
  ];
  for (const [i, c] of cast.entries()) {
    const portraitId = await addMedia("image", face(c.img), c.name);
    await db.from("characters").insert({
      novel_id: novel.id,
      slug: c.slug,
      name: c.name,
      role: c.role,
      bio: c.bio,
      portrait_media_id: portraitId,
      position: i,
    });
  }
}

async function seedPosts() {
  console.log("→ seeding the writing…");
  const posts = [
    {
      slug: "one-chapter-at-a-time",
      title: "Why I'm publishing a novel one chapter at a time",
      dek: "Serialization isn't a marketing trick. It changes how a story is built.",
      seed: "post1",
      blocks: [
        P(
          "There's a particular kind of courage in letting people watch you build something before you know how it ends. Serialization forces it. You can't quietly revise chapter one once a thousand people have already lived inside it.",
        ),
        IMG("post1-desk", "The desk, mid-chapter."),
        P(
          "But that constraint is the gift. A chapter that has to *land* — has to earn the wait until the next one — is a chapter that respects your time. So that's the deal I'm making here.",
        ),
        Q("Write like someone is waiting. Because someone is."),
        ASIDE("He means you. I checked the list."),
      ],
    },
    {
      slug: "writing-with-the-lights-off",
      title: "Writing with the lights off",
      dek: "On atmosphere, and why I draft the night scenes at night.",
      seed: "post2",
      blocks: [
        P(
          "I write the small-hours chapters in the small hours. It's not superstition — it's that the prose comes out differently when the house is asleep and the only light is the one you're writing by.",
        ),
        P(
          "Try it. Kill the overheads, keep one warm lamp, and read back what you wrote in daylight. Half of it will be too much. The other half will be the good half.",
        ),
        CALL("A small practice", "Draft the mood at the hour the scene happens. Edit it at noon, when you're a sceptic again."),
      ],
    },
    {
      slug: "sound-as-a-character",
      title: "Sound as a character",
      dek: "Why every chapter here comes with an optional soundtrack.",
      seed: "post3",
      blocks: [
        P(
          "A film would never let a scene play silent by accident. Prose mostly does — and then we wonder why the screen pulls people away from the page.",
        ),
        YT("jfKfPfyJRdk", "What chapter two sounds like to me."),
        P(
          "So I give every chapter an ambience you can turn on. Not required. Not autoplay — I'm not a monster. Just there, if you want the room to hum while you read.",
        ),
        ASIDE("If you turned it on for this paragraph: hello. Cozy, isn't it."),
      ],
    },
  ];

  for (const p of posts) {
    const coverId = await addMedia("image", wide(p.seed), p.title);
    const s = stats(p.blocks);
    const { error } = await db.from("posts").insert({
      slug: p.slug,
      title: p.title,
      dek: p.dek,
      excerpt: p.dek,
      body: { blocks: p.blocks },
      cover_media_id: coverId,
      status: "published",
      featured: p.slug === "one-chapter-at-a-time",
      reading_time_minutes: s.reading_time_minutes,
    });
    if (error) throw error;
  }
}

async function main() {
  await clean();
  await seedTags();
  await seedNovel();
  await seedPosts();
  console.log("\n✓ seeded: 1 novel (3 chapters, 3 cast), 3 posts, 4 tags. 🐈");
}

main().catch((e) => {
  console.error("✗ seed failed:", e.message ?? e);
  process.exit(1);
});
