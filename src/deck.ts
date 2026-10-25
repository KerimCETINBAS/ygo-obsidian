import type { StoredCard } from "./card-record";
import type { CardTip } from "./card-view";

export type DeckPiles = {
  main: string[];
  extra: string[];
  side: string[];
};

const SECTIONS: [keyof DeckPiles, string][] = [
  ["main", "Main"],
  ["extra", "Extra"],
  ["side", "Side"],
];

export function parseYdk(source: string): DeckPiles {
  const piles: DeckPiles = { main: [], extra: [], side: [] };
  let section: keyof DeckPiles = "main";
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#") || line.startsWith("!")) {
      const name = line.slice(1).trim().toLowerCase();
      if (name === "main" || name === "extra" || name === "side") section = name;
      continue;
    }
    if (/^\d+$/.test(line)) piles[section].push(line);
  }
  return piles;
}

export function mountDeck(
  root: HTMLElement,
  source: string,
  lookup: (id: string) => Promise<StoredCard | null>,
  tip: CardTip,
): { destroy(): void } {
  const piles = parseYdk(source);
  let destroyed = false;

  root.replaceChildren();
  root.classList.add("ygo-deck-host");
  const widget = document.createElement("div");
  widget.className = "ygo-deck";

  for (const [key, label] of SECTIONS) {
    const group = document.createElement("section");
    group.className = "ygo-deck-group";
    const title = document.createElement("h3");
    title.textContent = label;
    const count = document.createElement("span");
    count.textContent = String(piles[key].length);
    title.append(count);
    group.append(title);

    if (!piles[key].length) {
      const empty = document.createElement("p");
      empty.className = "ygo-deck-empty";
      empty.textContent = "Empty";
      group.append(empty);
    } else {
      const row = document.createElement("div");
      row.className = "ygo-deck-cards";
      for (const id of piles[key]) row.append(cardButton(id));
      group.append(row);
    }
    widget.append(group);
  }

  root.append(widget);

  return {
    destroy() {
      destroyed = true;
      tip.hide(tip.anchor);
    },
  };

  function cardButton(id: string): HTMLButtonElement {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "ygo-deck-card";
    const label = document.createElement("span");
    label.className = "ygo-deck-id";
    label.textContent = id;
    node.append(label);

    const image = document.createElement("img");
    image.alt = "";
    image.addEventListener("load", () => node.classList.add("has-image"));
    image.addEventListener("error", () => image.remove());
    node.append(image);

    const apply = (card: StoredCard | null) => {
      if (destroyed || !card) return;
      image.alt = card.name;
      if (card.image) image.src = card.image;
      if (tip.anchor === node) tip.show(node, card, card.name);
    };
    void lookup(id).then(apply);

    node.addEventListener("pointerenter", () => {
      node.classList.add("is-hover");
      tip.show(node, null, id);
      void lookup(id).then(apply);
    });
    node.addEventListener("pointerleave", () => {
      node.classList.remove("is-hover");
      tip.hide(node);
    });
    return node;
  }
}
