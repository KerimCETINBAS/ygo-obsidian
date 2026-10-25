import { normalizePath, requestUrl, TFile, type Vault } from "obsidian";
import {
  cardFileBase,
  fromApi,
  parseCardNote,
  renderCardNote,
  searchCards,
  type CardIndexEntry,
  type StoredCard,
} from "./card-record";

export class CardStore {
  private readonly cards = new Map<number, StoredCard>();
  private readonly byName = new Map<string, StoredCard>();
  private readonly inflight = new Map<string, Promise<StoredCard | null>>();

  constructor(
    private readonly vault: Vault,
    private readonly folderOf: () => string,
  ) {}

  folder(): string {
    return normalizePath(this.folderOf().replace(/^\/+/, "").replace(/\/+$/, "")) || "YGO/cards";
  }

  async load() {
    await ensureFolder(this.vault, this.folder());
    this.cards.clear();
    this.byName.clear();
    const prefix = `${this.folder()}/`;
    for (const file of this.vault.getMarkdownFiles()) {
      if (!file.path.startsWith(prefix)) continue;
      const card = parseCardNote(await this.vault.cachedRead(file));
      if (!card) continue;
      card.image = this.imagePath(file.basename) ?? card.image;
      this.remember(card);
    }
  }

  owns(path: string): boolean {
    const folder = this.folder();
    return path === folder || path.startsWith(`${folder}/`);
  }

  imageOf(name: string): string | null {
    return this.cardByName(name)?.image || null;
  }

  find(name: string): CardIndexEntry | null {
    const card = this.cardByName(name);
    return card ? { id: card.id, name: card.name, type: card.type } : null;
  }

  search(query: string): CardIndexEntry[] {
    return searchCards([...this.cards.values()], query);
  }

  async read(entry: CardIndexEntry): Promise<StoredCard | null> {
    const current = this.cards.get(entry.id);
    return current ? this.refresh(current) : null;
  }

  async save(card: StoredCard): Promise<StoredCard> {
    const folder = this.folder();
    await ensureFolder(this.vault, folder);
    const base = cardFileBase(card.name);
    const mdPath = normalizePath(`${folder}/${base}.md`);
    const pngPath = normalizePath(`${folder}/${base}.png`);
    const note = renderCardNote(card);
    const existing = this.vault.getAbstractFileByPath(mdPath);
    if (existing instanceof TFile) await this.vault.modify(existing, note);
    else await this.vault.create(mdPath, note);

    if (!this.vault.getAbstractFileByPath(pngPath)) {
      try {
        const response = await requestUrl({ url: card.image, throw: false });
        if (response.status === 200) await this.vault.createBinary(pngPath, response.arrayBuffer);
      } catch {
        // The note still holds the text if the picture cannot be fetched.
      }
    }

    const stored = { ...card, image: this.imagePath(base) ?? "" };
    this.remember(stored);
    return stored;
  }

  async ensureExact(name: string): Promise<StoredCard | null> {
    const existing = this.cardByName(name);
    if (existing) return this.refresh(existing);
    const key = `name:${name.trim().replace(/\.png$/i, "").toLowerCase()}`;
    return this.once(key, async () => {
      const again = this.cardByName(name);
      if (again) return this.refresh(again);
      const card = await fetchExact(name.replace(/\.png$/i, ""));
      if (!card) return null;
      return this.save(card);
    });
  }

  async ensureId(id: number): Promise<StoredCard | null> {
    if (!Number.isFinite(id)) return null;
    const existing = this.cards.get(id);
    if (existing) return this.refresh(existing);
    return this.once(`id:${id}`, async () => {
      const again = this.cards.get(id);
      if (again) return this.refresh(again);
      const card = await fetchById(id);
      if (!card) return null;
      return this.save(card);
    });
  }

  async searchRemote(query: string): Promise<StoredCard[]> {
    const response = await requestUrl({
      url: `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(query)}`,
      throw: false,
    });
    if (response.status !== 200) return [];
    const data = response.json?.data;
    if (!Array.isArray(data)) return [];
    return data.map(fromApi).filter((card): card is StoredCard => card !== null);
  }

  private once(key: string, run: () => Promise<StoredCard | null>): Promise<StoredCard | null> {
    const current = this.inflight.get(key);
    if (current) return current;
    const pending = run().finally(() => {
      if (this.inflight.get(key) === pending) this.inflight.delete(key);
    });
    this.inflight.set(key, pending);
    return pending;
  }

  private cardByName(name: string): StoredCard | null {
    const key = name.trim().replace(/\.png$/i, "").toLowerCase();
    return this.byName.get(key) ?? this.byName.get(cardFileBase(name).toLowerCase()) ?? null;
  }

  private async refresh(card: StoredCard): Promise<StoredCard> {
    const base = cardFileBase(card.name);
    const file = this.vault.getAbstractFileByPath(normalizePath(`${this.folder()}/${base}.md`));
    if (!(file instanceof TFile)) return card;
    const parsed = parseCardNote(await this.vault.cachedRead(file));
    if (!parsed) return card;
    parsed.image = this.imagePath(base) ?? card.image;
    this.remember(parsed);
    return parsed;
  }

  private imagePath(base: string): string | null {
    const file = this.vault.getAbstractFileByPath(normalizePath(`${this.folder()}/${base}.png`));
    return file instanceof TFile ? this.vault.getResourcePath(file) : null;
  }

  private remember(card: StoredCard) {
    this.cards.set(card.id, card);
    this.byName.set(card.name.toLowerCase(), card);
    this.byName.set(cardFileBase(card.name).toLowerCase(), card);
  }
}

async function ensureFolder(vault: Vault, folder: string) {
  const parts = folder.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!vault.getAbstractFileByPath(current)) await vault.createFolder(current);
  }
}

async function fetchById(id: number): Promise<StoredCard | null> {
  const response = await requestUrl({
    url: `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`,
    throw: false,
  });
  if (response.status !== 200) return null;
  return fromApi(response.json?.data?.[0]);
}

async function fetchExact(name: string): Promise<StoredCard | null> {
  const response = await requestUrl({
    url: `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(name)}`,
    throw: false,
  });
  if (response.status !== 200) return null;
  return fromApi(response.json?.data?.[0]);
}
