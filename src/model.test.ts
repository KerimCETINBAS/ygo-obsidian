import * as assert from "node:assert/strict";
import { cardFileBase, cardLinkAt, cardLinkLabel, cardTrigger, completedCardNames, fromApi, parseCardNote, renderCardNote, searchCards } from "./card-record";
import { parseYdk } from "./deck";
import { layoutOf, parseCombo, resolvePictures, slotCard } from "./model";
import { SAMPLE_SOURCE, VERSUS_SOURCE } from "./sample";

const parsed = parseCombo(SAMPLE_SOURCE);
assert.equal(parsed.ok, true);
if (!parsed.ok) throw new Error("sample failed");

const pictures = resolvePictures(parsed.doc.steps);
assert.equal(pictures.length, 9);
assert.equal(layoutOf(parsed.doc, pictures), "own");

assert.deepEqual(
  pictures[0].hand.map((card) => card.name),
  ["Sunseed Genius Loci", "Sunvine Sowing"],
);

assert.equal(slotCard(pictures[1], "m3")?.name, "Sunseed Genius Loci");
assert.equal(slotCard(pictures[1], "m3")?.glow, true);
assert.equal(pictures[1].hand[0]?.glow, false);

assert.equal(slotCard(pictures[2], "m3"), null);
assert.equal(slotCard(pictures[2], "emzL")?.name, "Sunavalon Dryas");
assert.equal(slotCard(pictures[2], "emzL")?.glow, true);
assert.deepEqual(
  pictures[2].hand.map((card) => card.name),
  ["Sunvine Sowing"],
);

assert.equal(pictures[3].hand.length, 0);
assert.equal(slotCard(pictures[3], "st3")?.name, "Sunvine Sowing");
assert.equal(slotCard(pictures[3], "st3")?.glow, true);
assert.equal(slotCard(pictures[3], "emzL")?.glow, false);

assert.equal(slotCard(pictures[5], "m2")?.glow, true);
assert.equal(slotCard(pictures[5], "emzL")?.glow, true);
assert.equal(slotCard(pictures[5], "st3")?.glow, false);
assert.equal(slotCard(pictures[5], "m4"), null);

assert.equal(slotCard(pictures[7], "m1")?.name, "Sunseed Genius Loci");
assert.equal(slotCard(pictures[7], "m2")?.name, "Sunseed Twin");
assert.equal(slotCard(pictures[7], "m4")?.name, "Sunvine Thrasher");
assert.equal(slotCard(pictures[8], "m1")?.name, "Sunseed Genius Loci");
assert.equal(slotCard(pictures[8], "emzL")?.glow, true);
assert.equal(slotCard(pictures[8], "m1")?.glow, false);

const broken = parseCombo("steps: nope");
assert.equal(broken.ok, false);

const versus = parseCombo(VERSUS_SOURCE);
assert.equal(versus.ok, true);
if (!versus.ok) throw new Error("versus failed");
const versusPictures = resolvePictures(versus.doc.steps);
assert.equal(layoutOf(versus.doc, versusPictures), "versus");
assert.equal(slotCard(versusPictures[0], "oppSt3")?.set, true);
assert.equal(slotCard(versusPictures[1], "oppSt3"), null);
assert.equal(slotCard(versusPictures[1], "oppM3")?.name, "Barrier Statue of the Stormwinds");
assert.equal(versusPictures[1].banished[0]?.name, "Skill Drain");
assert.equal(versusPictures[1].hand[0]?.glow, true);
assert.equal(parsed.doc.steps[0]?.frames.length, 2);
assert.equal(parsed.doc.steps[0]?.frames[0]?.type, "hand");
assert.equal(parsed.doc.steps[4]?.frames[1]?.type, "pay");
assert.equal(parsed.doc.steps[4]?.frames[1]?.amount, "1000");
assert.deepEqual(parsed.doc.steps[2]?.frames[0]?.using, ["Sunseed Genius Loci"]);

const linked = parseCombo(`
steps:
  - say: Opening hand
    frames:
      - { type: hand, card: [[Sunseed Genius Loci]] }
      - { type: summon, kind: Normal, card: [[Ash Blossom & Joyous Spring]], from: hand }
    cards:
      hand:
        - [[Sunseed Genius Loci]]
      m3: [[Sunvine Sowing]]
      oppSt3: { name: [[Skill Drain]], set: true }
`);
assert.equal(linked.ok, true);
if (!linked.ok) throw new Error("linked combo failed");
assert.equal(linked.doc.steps[0]?.frames[0]?.card, "Sunseed Genius Loci");
assert.equal(linked.doc.steps[0]?.frames[1]?.card, "Ash Blossom & Joyous Spring");
const linkedPicture = resolvePictures(linked.doc.steps)[0];
assert.equal(linkedPicture.hand[0]?.name, "Sunseed Genius Loci");
assert.equal(slotCard(linkedPicture, "m3")?.name, "Sunvine Sowing");
assert.equal(slotCard(linkedPicture, "oppSt3")?.set, true);
assert.equal(slotCard(linkedPicture, "oppSt3")?.name, "Skill Drain");

const deck = parseYdk("#main\n27520594\n27520594\n#extra\n93896655\n#side\n");
assert.deepEqual(deck.main, ["27520594", "27520594"]);
assert.deepEqual(deck.extra, ["93896655"]);
assert.deepEqual(deck.side, []);
assert.equal(cardLinkLabel("[[Sunseed Genius Loci]]"), "Sunseed Genius Loci");
assert.equal(cardLinkLabel("![[Sunavalon Dryas.png]]"), "Sunavalon Dryas");
assert.equal(cardLinkLabel("[[Ash Blossom & Joyous Spring|Ash]]"), "Ash Blossom & Joyous Spring");
assert.equal(cardLinkAt("card: [[Sunseed Genius Loci]]", 12), "Sunseed Genius Loci");
assert.equal(cardTrigger("see [[Sun", 9)?.query, "Sun");
assert.equal(cardTrigger("see ![[Dryas", 12)?.embed, true);
assert.deepEqual(completedCardNames("[[Ash Blossom]] and ![[Skill Drain]]"), ["Ash Blossom", "Skill Drain"]);
const stored = fromApi({ id: 27520594, name: "Sunseed Genius Loci", type: "Normal Monster", desc: "Seed", atk: 0, def: 600, level: 1, race: "Plant", attribute: "EARTH" });
assert.equal(stored?.image, "https://images.ygoprodeck.com/images/cards/27520594.jpg");
assert.equal(searchCards([{ id: 1, name: "Sunavalon Dryas", type: "Link" }], "dry").length, 1);
assert.equal(cardFileBase("Number 39: Utopia"), "Number 39 Utopia");
const note = renderCardNote({
  id: 27520594,
  name: "Sunseed Genius Loci",
  type: "Normal Monster",
  desc: "A seed.",
  atk: 0,
  def: 600,
  level: 1,
  linkval: null,
  race: "Plant",
  attribute: "EARTH",
  image: "https://images.ygoprodeck.com/images/cards/27520594.jpg",
});
const parsedNote = parseCardNote(note);
assert.equal(parsedNote?.id, 27520594);
assert.equal(parsedNote?.name, "Sunseed Genius Loci");
assert.equal(parsedNote?.desc, "A seed.");
const linkText = "1 Plant monster\nIf this card is Link Summoned: You can add 1 card.";
const linkNote = renderCardNote({ ...parsedNote!, desc: linkText, type: "Link Monster", linkval: 1 });
assert.equal(parseCardNote(linkNote)?.desc, linkText);
assert.ok(note.includes("\n---\n\n%%\nAuto-generated. Do not edit.\n%%\n\n## image\n"));
assert.ok(note.includes("## image\n\n![[Sunseed Genius Loci.png]]"));
assert.ok(note.includes("## text\n\nA seed."));

console.log("model tests passed");
