export type CardIndexEntry = {
  id: number;
  name: string;
  type: string;
};

export type StoredCard = CardIndexEntry & {
  desc: string;
  atk: number | null;
  def: number | null;
  level: number | null;
  linkval: number | null;
  race: string;
  attribute: string;
  image: string;
};

export type CardTrigger = {
  embed: boolean;
  query: string;
  start: number;
};

const LINK = /(!?\[\[)([^\]|#^\n]*)$/;
const CLOSED = /!?\[\[([^\]|#^]+)\]\]/g;

export function fromApi(raw: unknown): StoredCard | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const id = typeof record.id === "number" ? record.id : Number(record.id);
  const name = typeof record.name === "string" ? record.name.trim() : "";
  if (!Number.isFinite(id) || !name) return null;

  const images = Array.isArray(record.card_images) ? record.card_images : [];
  const first = images[0] && typeof images[0] === "object" ? (images[0] as Record<string, unknown>) : null;
  const image = typeof first?.image_url === "string" && first.image_url ? first.image_url : artUrl(id);

  return {
    id,
    name,
    type: text(record.type),
    desc: text(record.desc),
    atk: numberOrNull(record.atk),
    def: numberOrNull(record.def),
    level: numberOrNull(record.level),
    linkval: numberOrNull(record.linkval),
    race: text(record.race),
    attribute: text(record.attribute),
    image,
  };
}

export function artUrl(id: number): string {
  return `https://images.ygoprodeck.com/images/cards/${id}.jpg`;
}

export function searchCards(cards: CardIndexEntry[], query: string, limit = 8): CardIndexEntry[] {
  const needle = query.trim().toLowerCase();
  const hits = needle ? cards.filter((card) => card.name.toLowerCase().includes(needle)) : cards;
  return hits.slice(0, limit);
}

export function cardTrigger(line: string, ch: number): CardTrigger | null {
  const match = line.slice(0, ch).match(LINK);
  if (!match) return null;
  return {
    embed: match[1].startsWith("!"),
    query: match[2],
    start: ch - match[0].length,
  };
}

export function cardFileBase(name: string): string {
  const cleaned = name.replace(/\.png$/i, "").replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || "card";
}

export function renderCardNote(card: StoredCard): string {
  const image = `${cardFileBase(card.name)}.png`;
  const fields = [
    `passcode: ${card.id}`,
    `name: ${yamlValue(card.name)}`,
    `type: ${yamlValue(card.type)}`,
    `attribute: ${yamlValue(card.attribute)}`,
    `race: ${yamlValue(card.race)}`,
    `level: ${card.level ?? ""}`,
    `link: ${card.linkval ?? ""}`,
    `atk: ${card.atk ?? ""}`,
    `def: ${card.def ?? ""}`,
  ];
  return `---\n${fields.join("\n")}\n---\n\n## image\n\n![[${image}]]\n\n## text\n\n${card.desc}\n`;
}

export function parseCardNote(text: string): StoredCard | null {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const fields = parseFields(match[1]);
  const id = Number(fields.passcode);
  const name = fields.name?.trim();
  if (!Number.isFinite(id) || !name) return null;
  const desc = section(match[2], "text");
  return {
    id,
    name,
    type: fields.type ?? "",
    desc,
    atk: optionalNumber(fields.atk),
    def: optionalNumber(fields.def),
    level: optionalNumber(fields.level),
    linkval: optionalNumber(fields.link),
    race: fields.race ?? "",
    attribute: fields.attribute ?? "",
    image: "",
  };
}

export function cardLinkAt(line: string, ch: number): string | null {
  const re = /!?\[\[([^\]|#^\n]+)\]\]/g;
  for (const match of line.matchAll(re)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (ch >= start && ch <= end) return cardLinkLabel(match[1]);
  }
  return null;
}

export function cardLinkLabel(raw: string): string {
  const body = raw.trim().replace(/^!\[\[/, "").replace(/^\[\[/, "").replace(/\]\]$/, "");
  return body.split("|")[0].split("#")[0].split("^")[0].replace(/\.png$/i, "").trim();
}

export function completedCardNames(line: string): string[] {
  const names: string[] = [];
  for (const match of line.matchAll(CLOSED)) {
    const name = match[1].trim();
    if (name) names.push(name);
  }
  return names;
}

export function typeLine(card: StoredCard): string {
  if (card.type.includes("Link")) return [card.attribute, card.race, card.linkval ? `Link ${card.linkval}` : ""].filter(Boolean).join(" · ");
  if (card.type.includes("XYZ")) return [card.attribute, card.race, card.level ? `Rank ${card.level}` : ""].filter(Boolean).join(" · ");
  if (card.type.includes("Monster")) return [card.attribute, card.race, card.level ? `Level ${card.level}` : ""].filter(Boolean).join(" · ");
  return [card.race, card.type].filter(Boolean).join(" · ");
}

export function statLine(card: StoredCard): string {
  if (!card.type.includes("Monster")) return card.type;
  if (card.type.includes("Link")) return `ATK ${card.atk ?? "?"} · ${card.type}`;
  return `ATK ${card.atk ?? "?"} / DEF ${card.def ?? "?"} · ${card.type}`;
}

function section(body: string, heading: string): string {
  const match = body.match(new RegExp(`(?:^|\\n)## ${heading}[ \\t]*\\r?\\n([\\s\\S]*?)(?=\\n## |$)`));
  return match?.[1]?.trim() ?? "";
}

function yamlValue(value: string): string {
  if (!value) return '""';
  if (/[:#\n"'&]/.test(value) || value !== value.trim()) return JSON.stringify(value);
  return value;
}

function parseFields(block: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of block.split(/\r?\n/)) {
    const split = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!split) continue;
    fields[split[1]] = unquote(split[2].trim());
  }
  return fields;
}

function unquote(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value) as string;
    } catch {
      return value.slice(1, -1);
    }
  }
  return value;
}

function optionalNumber(value: string | undefined): number | null {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
