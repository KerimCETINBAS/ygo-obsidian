import type { StoredCard } from "./card-record";
import type { CardTip } from "./card-view";

export function mountGrid(
  root: HTMLElement,
  names: string[],
  lookup: (name: string) => Promise<StoredCard | null>,
  tip: CardTip,
): { destroy(): void } {
  let destroyed = false;

  root.replaceChildren();
  root.classList.add("ygo-grid-host");
  const grid = document.createElement("div");
  grid.className = "ygo-grid";

  if (!names.length) {
    const empty = document.createElement("p");
    empty.className = "ygo-grid-empty";
    empty.textContent = "Empty";
    root.append(empty);
  } else {
    for (const name of names) grid.append(cardButton(name));
    root.append(grid);
  }

  return {
    destroy() {
      destroyed = true;
      tip.hide(tip.anchor);
    },
  };

  function cardButton(name: string): HTMLButtonElement {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "ygo-grid-card";
    node.dataset.ygoName = name;
    const label = document.createElement("span");
    label.className = "ygo-grid-name";
    label.textContent = name;
    node.append(label);

    const image = document.createElement("img");
    image.alt = name;
    image.addEventListener("load", () => node.classList.add("has-image"));
    image.addEventListener("error", () => image.remove());
    node.append(image);

    const apply = (card: StoredCard | null) => {
      if (destroyed || !card) return;
      image.alt = card.name;
      if (card.image) image.src = card.image;
      if (tip.anchor === node) tip.show(node, card, card.name);
    };
    void lookup(name).then(apply);

    node.addEventListener("pointerenter", () => {
      node.classList.add("is-hover");
      tip.show(node, null, name);
      void lookup(name).then(apply);
    });
    node.addEventListener("pointerleave", () => {
      node.classList.remove("is-hover");
      tip.hide(node);
    });
    return node;
  }
}
