import { parse } from "yaml";
import { cardLinkLabel } from "./card-record";

export type CardView = {
  name: string;
  glow: boolean;
  set: boolean;
};

export type ZoneId =
  | "hand"
  | "field"
  | "emzL"
  | "emzR"
  | "m1"
  | "m2"
  | "m3"
  | "m4"
  | "m5"
  | "st1"
  | "st2"
  | "st3"
  | "st4"
  | "st5"
  | "gy"
  | "banished"
  | "oppHand"
  | "oppField"
  | "oppM1"
  | "oppM2"
  | "oppM3"
  | "oppM4"
  | "oppM5"
  | "oppSt1"
  | "oppSt2"
  | "oppSt3"
  | "oppSt4"
  | "oppSt5"
  | "oppGy"
  | "oppBanished";

export type PileId = "hand" | "gy" | "banished" | "oppHand" | "oppGy" | "oppBanished";

export type BoardPicture = {
  [K in ZoneId]: K extends PileId ? CardView[] : CardView | null;
};

export type FrameType =
  | "activate"
  | "summon"
  | "link"
  | "target"
  | "chain"
  | "banish"
  | "set"
  | "pay"
  | "gain"
  | "hand"
  | "place";

export type Frame = {
  type: FrameType;
  card?: string;
  kind?: string;
  from?: string;
  to?: string;
  using?: string[];
  n?: number;
  amount?: string;
  note?: string;
};

export type Step = {
  say: string;
  lines: string[];
  frames: Frame[];
  glow: string[];
  cards?: Record<string, unknown>;
};

export type ComboDoc = {
  name: string;
  board: "own" | "versus" | "auto";
  steps: Step[];
};

export type Parsed =
  | { ok: true; doc: ComboDoc }
  | { ok: false; error: string };

const PILES = new Set<PileId>(["hand", "gy", "banished", "oppHand", "oppGy", "oppBanished"]);

const FRAME_TYPES = new Set<FrameType>([
  "activate",
  "summon",
  "link",
  "target",
  "chain",
  "banish",
  "set",
  "pay",
  "gain",
  "hand",
  "place",
]);

const ALIASES = buildAliases();

export function isPile(zone: ZoneId): zone is PileId {
  return PILES.has(zone as PileId);
}

export function emptyPicture(): BoardPicture {
  return {
    hand: [],
    field: null,
    emzL: null,
    emzR: null,
    m1: null,
    m2: null,
    m3: null,
    m4: null,
    m5: null,
    st1: null,
    st2: null,
    st3: null,
    st4: null,
    st5: null,
    gy: [],
    banished: [],
    oppHand: [],
    oppField: null,
    oppM1: null,
    oppM2: null,
    oppM3: null,
    oppM4: null,
    oppM5: null,
    oppSt1: null,
    oppSt2: null,
    oppSt3: null,
    oppSt4: null,
    oppSt5: null,
    oppGy: [],
    oppBanished: [],
  };
}

export function parseCombo(source: string): Parsed {
  const text = source.trim();
  if (!text) {
    return { ok: true, doc: { name: "Combo", board: "auto", steps: [] } };
  }

  let raw: unknown;
  try {
    raw = parse(quoteCardLinks(text));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read this combo.";
    return { ok: false, error: message };
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "The combo block needs a name and a steps list." };
  }

  const record = raw as Record<string, unknown>;
  const name = typeof record.name === "string" && record.name.trim() ? record.name.trim() : "Combo";
  const board = record.board === "versus" || record.board === "own" ? record.board : "auto";

  if (record.steps !== undefined && !Array.isArray(record.steps)) {
    return { ok: false, error: "steps must be a list." };
  }

  const steps = Array.isArray(record.steps) ? record.steps.map(parseStep) : [];
  return { ok: true, doc: { name, board, steps } };
}

export function resolvePictures(steps: Step[]): BoardPicture[] {
  let current = emptyPicture();
  return steps.map((step) => {
    current = structuredClone(current);
    clearGlow(current);
    if (step.cards) applyCards(current, step.cards);
    applyGlow(current, step.glow);
    return current;
  });
}

export function layoutOf(doc: ComboDoc, pictures: BoardPicture[]): "own" | "versus" {
  if (doc.board === "versus") return "versus";
  if (doc.board === "own") return "own";
  return pictures.some(hasOpponentCard) ? "versus" : "own";
}

export function topCard(pile: CardView[]): CardView | null {
  return pile.length ? pile[pile.length - 1] : null;
}

export function slotCard(picture: BoardPicture, zone: ZoneId): CardView | null {
  const value = picture[zone];
  if (Array.isArray(value)) return topCard(value);
  return value;
}

export function pileGlow(picture: BoardPicture, zone: ZoneId): boolean {
  const value = picture[zone];
  if (Array.isArray(value)) return value.some((card) => card.glow);
  return Boolean(value?.glow);
}

function parseStep(raw: unknown, index: number): Step {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { say: `Step ${index + 1}`, lines: [], frames: [], glow: [] };
  }

  const record = raw as Record<string, unknown>;
  const lines = Array.isArray(record.lines) ? record.lines.map(lineToString).filter((line) => line.length > 0) : [];
  const say =
    typeof record.say === "string" && record.say.trim()
      ? record.say.trim()
      : lines[0] ?? `Step ${index + 1}`;
  const glow = Array.isArray(record.glow) ? record.glow.map((item) => String(item).trim()).filter(Boolean) : [];
  const cards =
    record.cards && typeof record.cards === "object" && !Array.isArray(record.cards)
      ? (record.cards as Record<string, unknown>)
      : undefined;

  return { say, lines, frames: parseFrames(record.frames), glow, cards };
}

function parseFrames(raw: unknown): Frame[] {
  if (!Array.isArray(raw)) return [];
  const frames: Frame[] = [];
  for (const item of raw) {
    const frame = parseFrame(item);
    if (frame) frames.push(frame);
  }
  return frames;
}

function parseFrame(raw: unknown): Frame | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const typeName = typeof record.type === "string" ? record.type.trim().toLowerCase() : "";
  if (!FRAME_TYPES.has(typeName as FrameType)) return null;

  const frame: Frame = { type: typeName as FrameType };
  const card = cardName(record.card);
  const kind = textField(record.kind);
  const from = textField(record.from);
  const to = textField(record.to);
  const note = textField(record.note);
  if (card) frame.card = card;
  if (kind) frame.kind = kind;
  if (from) frame.from = from;
  if (to) frame.to = to;
  if (note) frame.note = note;
  if (record.amount != null && String(record.amount).trim()) frame.amount = String(record.amount).trim();
  if (typeof record.n === "number" && Number.isFinite(record.n)) frame.n = record.n;
  else if (typeof record.n === "string" && record.n.trim() && Number.isFinite(Number(record.n))) frame.n = Number(record.n);
  if (Array.isArray(record.using)) {
    const using = record.using.map((item) => cardName(item)).filter(Boolean);
    if (using.length) frame.using = using;
  }
  return frame;
}

function textField(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  return "";
}

function lineToString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function applyCards(picture: BoardPicture, cards: Record<string, unknown>) {
  for (const [key, value] of Object.entries(cards)) {
    const zone = aliasZone(key);
    if (!zone) continue;
    if (isPile(zone)) {
      picture[zone] = normalizePile(value);
    } else {
      picture[zone] = normalizeCard(value);
    }
  }
}

function applyGlow(picture: BoardPicture, glow: string[]) {
  for (const token of glow) {
    const zone = aliasZone(token);
    if (zone) {
      const value = picture[zone];
      if (Array.isArray(value)) {
        for (const card of value) card.glow = true;
      } else if (value) {
        value.glow = true;
      }
      continue;
    }

    for (const card of eachCard(picture)) {
      if (card.name.toLowerCase() === token.toLowerCase()) card.glow = true;
    }
  }
}

function clearGlow(picture: BoardPicture) {
  for (const card of eachCard(picture)) card.glow = false;
}

function eachCard(picture: BoardPicture): CardView[] {
  const cards: CardView[] = [];
  for (const value of Object.values(picture)) {
    if (Array.isArray(value)) cards.push(...value);
    else if (value) cards.push(value);
  }
  return cards;
}

function hasOpponentCard(picture: BoardPicture): boolean {
  const zones: ZoneId[] = [
    "oppHand",
    "oppField",
    "oppM1",
    "oppM2",
    "oppM3",
    "oppM4",
    "oppM5",
    "oppSt1",
    "oppSt2",
    "oppSt3",
    "oppSt4",
    "oppSt5",
    "oppGy",
    "oppBanished",
  ];
  return zones.some((zone) => {
    const value = picture[zone];
    return Array.isArray(value) ? value.length > 0 : value !== null;
  });
}

function normalizePile(value: unknown): CardView[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map(normalizeCard).filter((card): card is CardView => card !== null);
  }
  const card = normalizeCard(value);
  return card ? [card] : [];
}

function quoteCardLinks(source: string): string {
  return source.replace(/(?<!["'])!?\[\[([^\[\]\n]+?)\]\]/g, (match) => JSON.stringify(cardLinkLabel(match)));
}

function cardName(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return cardLinkLabel(String(value));
  if (Array.isArray(value) && value.length === 1) return cardName(value[0]);
  return "";
}

function normalizeCard(value: unknown): CardView | null {
  if (value == null) return null;
  const linked = cardName(value);
  if (linked) return { name: linked, glow: false, set: false };
  if (typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const name = cardName(record.name ?? record.card);
    if (!name) return null;
    return {
      name,
      glow: Boolean(record.glow),
      set: Boolean(record.set ?? record.facedown ?? record.faceDown),
    };
  }
  return null;
}

function aliasZone(raw: string): ZoneId | null {
  return ALIASES[canon(raw)] ?? null;
}

function canon(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_-]/g, "");
}

function buildAliases(): Record<string, ZoneId> {
  const map: Record<string, ZoneId> = {
    emzl: "emzL",
    emzleft: "emzL",
    leftextra: "emzL",
    emzr: "emzR",
    emzright: "emzR",
    rightextra: "emzR",
    field: "field",
    fieldspell: "field",
    gy: "gy",
    grave: "gy",
    graveyard: "gy",
    banished: "banished",
    banish: "banished",
    hand: "hand",
    opphand: "oppHand",
    oppfield: "oppField",
    oppg: "oppGy",
    oppgy: "oppGy",
    oppgrave: "oppGy",
    oppbanished: "oppBanished",
    oppbanish: "oppBanished",
  };

  for (let index = 1; index <= 5; index += 1) {
    map[`m${index}`] = `m${index}` as ZoneId;
    map[`monster${index}`] = `m${index}` as ZoneId;
    map[`st${index}`] = `st${index}` as ZoneId;
    map[`s${index}`] = `st${index}` as ZoneId;
    map[`spell${index}`] = `st${index}` as ZoneId;
    map[`trap${index}`] = `st${index}` as ZoneId;
    map[`oppm${index}`] = `oppM${index}` as ZoneId;
    map[`oppmonster${index}`] = `oppM${index}` as ZoneId;
    map[`oppst${index}`] = `oppSt${index}` as ZoneId;
    map[`oppspell${index}`] = `oppSt${index}` as ZoneId;
    map[`opptrap${index}`] = `oppSt${index}` as ZoneId;
  }

  return map;
}
