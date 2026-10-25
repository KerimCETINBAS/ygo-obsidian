import { MarkdownView } from "obsidian";
import { cardLinkAt, cardLinkLabel, statLine, typeLine, type StoredCard } from "./card-record";
import type { CardStore } from "./card-store";
import type YgoComboPlugin from "./main";

type HoverEvent = {
  linktext?: string;
  sourcePath: string;
  targetEl: HTMLElement;
};

export class CardTip {
  readonly el: HTMLElement;
  anchor: HTMLElement | null = null;
  private timer = 0;
  private readonly nameEl: HTMLElement;
  private readonly lineEl: HTMLElement;
  private readonly statsEl: HTMLElement;
  private readonly descEl: HTMLElement;

  constructor() {
    this.el = document.createElement("div");
    this.el.className = "ygo-card-tip";
    this.el.hidden = true;
    this.nameEl = this.el.createEl("strong", { cls: "ygo-card-tip-name" });
    this.lineEl = this.el.createDiv({ cls: "ygo-card-tip-line" });
    this.statsEl = this.el.createDiv({ cls: "ygo-card-tip-stats" });
    this.descEl = this.el.createEl("p", { cls: "ygo-card-tip-desc" });
    document.body.append(this.el);
    this.el.addEventListener("pointerenter", () => window.clearTimeout(this.timer));
    this.el.addEventListener("pointerleave", () => this.hide(this.anchor));
  }

  show(anchor: HTMLElement, card: StoredCard | null, fallback = "") {
    window.clearTimeout(this.timer);
    this.anchor = anchor;
    if (!card) {
      this.nameEl.textContent = fallback;
      this.lineEl.textContent = "";
      this.statsEl.textContent = "";
      this.descEl.textContent = "";
    } else {
      this.nameEl.textContent = card.name;
      this.lineEl.textContent = typeLine(card);
      this.statsEl.textContent = statLine(card);
      this.descEl.textContent = card.desc;
    }
    this.el.hidden = false;
    this.place(anchor);
  }

  hide(anchor: HTMLElement | null) {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      if (this.anchor !== anchor || this.el.matches(":hover")) return;
      this.anchor = null;
      this.el.hidden = true;
    }, 180);
  }

  destroy() {
    window.clearTimeout(this.timer);
    this.el.remove();
  }

  private place(anchor: HTMLElement) {
    const rect = anchor.getBoundingClientRect();
    const width = this.el.offsetWidth;
    const height = this.el.offsetHeight;
    let top = rect.top - height - 8;
    let left = rect.left + rect.width / 2 - width / 2;
    if (top < 8) top = rect.bottom + 8;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    this.el.style.top = `${top}px`;
    this.el.style.left = `${left}px`;
  }
}

export function registerCardViews(plugin: YgoComboPlugin, store: CardStore) {
  plugin.registerMarkdownPostProcessor(async (element, context) => {
    const links = Array.from(element.querySelectorAll("a.internal-link"));
    for (const link of links) {
      if (!(link instanceof HTMLAnchorElement) || link.dataset.ygoCard === "1") continue;
      const name = cardLinkLabel(link.dataset.href ?? "");
      if (!name) continue;
      const dest = plugin.app.metadataCache.getFirstLinkpathDest(name, context.sourcePath);
      const entry = store.find(name);
      if (!entry || (dest && !store.owns(dest.path))) continue;
      const card = await store.read(entry);
      if (!card) continue;
      paintTarget(link, card, plugin, "ygo-card-link");
    }

    const embeds = Array.from(element.querySelectorAll(".internal-embed"));
    for (const embed of embeds) {
      if (!(embed instanceof HTMLElement) || embed.dataset.ygoCard === "1") continue;
      const name = embed.getAttribute("src") ?? "";
      if (!name) continue;
      const dest = plugin.app.metadataCache.getFirstLinkpathDest(name, context.sourcePath);
      const entry = store.find(name);
      const card = entry ? await store.read(entry) : dest ? null : await store.ensureExact(name.replace(/\.png$/i, ""));
      if (!card || (dest && !store.owns(dest.path))) continue;
      if (dest) paintTarget(embed, card, plugin, "ygo-card-hover");
      else paintEmbed(embed, card, plugin);
    }
  });

  plugin.registerDomEvent(document, "pointerover", (event) => {
    const hit = cardLinkTarget(plugin, event.target);
    if (!hit) return;
    if (event.relatedTarget instanceof Node && hit.el.contains(event.relatedTarget)) return;
    const sourcePath = plugin.app.workspace.getActiveFile()?.path ?? "";
    const dest = plugin.app.metadataCache.getFirstLinkpathDest(hit.name, sourcePath);
    if (dest && !store.owns(dest.path)) return;
    plugin.showCard(hit.el, null, hit.name);
    void reveal(plugin, store, hit.el, hit.name);
  });
  plugin.registerDomEvent(document, "pointerout", (event) => {
    const hit = cardLinkTarget(plugin, event.target);
    if (!hit) return;
    const next = event.relatedTarget instanceof Node ? cardLinkTarget(plugin, event.relatedTarget) : null;
    if (next && next.name === hit.name) return;
    if (event.relatedTarget instanceof Node && (hit.el.contains(event.relatedTarget) || plugin.tip.el.contains(event.relatedTarget))) return;
    plugin.hideCard(hit.el);
  });

  plugin.registerEvent(
    plugin.app.workspace.on("hover-link" as "editor-change", ((event: HoverEvent) => {
      const name = cardLinkLabel(event.linktext ?? "");
      if (!name || !event.targetEl) return;
      const dest = plugin.app.metadataCache.getFirstLinkpathDest(name, event.sourcePath);
      if (dest && !store.owns(dest.path)) return;
      plugin.showCard(event.targetEl, null, name);
      void reveal(plugin, store, event.targetEl, name);
    }) as (editor: unknown) => void),
  );
}

type CmView = {
  posAtDOM(node: Node): number;
  state: { doc: { lineAt(pos: number): { from: number; text: string } } };
};

function cardLinkTarget(plugin: YgoComboPlugin, target: EventTarget | null): { el: HTMLElement; name: string } | null {
  const host = target instanceof HTMLElement ? target : target instanceof Element ? target.parentElement : null;
  if (!(host instanceof HTMLElement) || host.closest(".ygo-card-tip, .ygo-host, .ygo-deck, .ygo-deck-host, .ygo-field-host, .ygo-grid, .ygo-grid-host")) return null;
  const rendered = host.closest("a.internal-link, [data-href], .cm-hmd-internal-link, .internal-embed, .cm-hmd-embed");
  if (rendered instanceof HTMLElement) {
    const raw = rendered.getAttribute("data-href") || rendered.getAttribute("href") || rendered.getAttribute("src") || "";
    if (raw && !/^https?:/i.test(raw)) {
      const name = cardLinkLabel(raw);
      if (name && name.length <= 120 && !name.includes("\n")) return { el: rendered, name };
    }
  }
  if (!host.closest(".cm-editor")) return null;
  const cm = cmFor(plugin, host);
  if (!cm) return null;
  let pos: number;
  try {
    pos = cm.posAtDOM(host);
  } catch {
    return null;
  }
  const line = cm.state.doc.lineAt(pos);
  const ch = pos - line.from;
  const name = cardLinkAt(line.text, ch) ?? (ch > 0 ? cardLinkAt(line.text, ch - 1) : null);
  if (!name) return null;
  const anchor = host.closest(".cm-hmd-internal-link, .cm-line");
  return { el: anchor instanceof HTMLElement ? anchor : host, name };
}

function cmFor(plugin: YgoComboPlugin, el: Element): CmView | null {
  let found: CmView | null = null;
  plugin.app.workspace.iterateAllLeaves((leaf) => {
    if (found || !(leaf.view instanceof MarkdownView)) return;
    if (!leaf.view.containerEl.contains(el)) return;
    found = (leaf.view.editor as unknown as { cm?: CmView }).cm ?? null;
  });
  return found;
}

async function reveal(plugin: YgoComboPlugin, store: CardStore, target: HTMLElement, name: string) {
  const entry = store.find(name);
  const card = entry ? await store.read(entry) : await store.ensureExact(name);
  if (plugin.tip.anchor !== target) return;
  if (!card) {
    plugin.hideCard(target);
    return;
  }
  plugin.showCard(target, card, name);
}

function paintTarget(target: HTMLElement, card: StoredCard, plugin: YgoComboPlugin, className: string) {
  target.dataset.ygoCard = "1";
  target.classList.add(className);
  target.addEventListener("pointerenter", () => plugin.showCard(target, card));
  target.addEventListener("pointerleave", () => plugin.hideCard(target));
}

function paintEmbed(embed: HTMLElement, card: StoredCard, plugin: YgoComboPlugin) {
  embed.empty();
  const image = embed.createEl("img", { attr: { alt: card.name, src: card.image } });
  paintTarget(embed, card, plugin, "ygo-card-embed");
  image.addEventListener("pointerenter", () => plugin.showCard(embed, card));
}
