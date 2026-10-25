import {
  type BoardPicture,
  type CardView,
  type ComboDoc,
  type Frame,
  type FrameType,
  type ZoneId,
  emptyPicture,
  layoutOf,
  resolvePictures,
  slotCard,
} from "./model";

export type CardLookup = (name: string) => string | null;

export type CardHover = {
  show(anchor: HTMLElement, name: string): void;
  hide(anchor: HTMLElement): void;
};

export type ComboController = {
  destroy(): void;
  repaint(): void;
  getIndex(): number;
};

type Mode = "list" | "minimal" | "board";

const OWN_ROWS = [
  [".", ".", "emzL", ".", "emzR", ".", "banished"],
  ["field", "m1", "m2", "m3", "m4", "m5", "gy"],
  [".", "st1", "st2", "st3", "st4", "st5", "."],
  ["hand", "hand", "hand", "hand", "hand", "hand", "hand"],
];

const VERSUS_ROWS = [
  ["oppHand", "oppHand", "oppHand", "oppHand", "oppHand", "oppHand", "oppHand"],
  ["oppBanished", "oppSt5", "oppSt4", "oppSt3", "oppSt2", "oppSt1", "."],
  ["oppGy", "oppM5", "oppM4", "oppM3", "oppM2", "oppM1", "oppField"],
  [".", ".", "emzL", ".", "emzR", ".", "banished"],
  ["field", "m1", "m2", "m3", "m4", "m5", "gy"],
  [".", "st1", "st2", "st3", "st4", "st5", "."],
  ["hand", "hand", "hand", "hand", "hand", "hand", "hand"],
];

const LABELS: Record<ZoneId, string> = {
  emzL: "EMZ",
  emzR: "EMZ",
  field: "FIELD",
  gy: "GY",
  banished: "BAN",
  hand: "HAND",
  m1: "M1",
  m2: "M2",
  m3: "M3",
  m4: "M4",
  m5: "M5",
  st1: "S1",
  st2: "S2",
  st3: "S3",
  st4: "S4",
  st5: "S5",
  oppHand: "HAND",
  oppField: "FIELD",
  oppGy: "GY",
  oppBanished: "BAN",
  oppM1: "M1",
  oppM2: "M2",
  oppM3: "M3",
  oppM4: "M4",
  oppM5: "M5",
  oppSt1: "S1",
  oppSt2: "S2",
  oppSt3: "S3",
  oppSt4: "S4",
  oppSt5: "S5",
};

const FRAME_ICONS: Record<FrameType, string> = {
  activate: '<path d="M9 1.5 4.5 9h3.2L6.8 14.5 12 7H8.6z"/>',
  summon: '<path d="M8 2.5 3.5 8H6v5.5h4V8h2.5z"/>',
  link: '<circle cx="4" cy="8" r="1.6"/><circle cx="12" cy="8" r="1.6"/><path d="M5.6 8h4.8"/>',
  target: '<circle cx="8" cy="8" r="4.2"/><circle cx="8" cy="8" r="1"/><path d="M8 1.5v2.2M8 12.3v2.2M1.5 8h2.2M12.3 8h2.2"/>',
  chain: '<path d="M3 6.2h3.2a1.8 1.8 0 0 1 0 3.6H3M10 6.2h3a1.8 1.8 0 0 1 0 3.6H10M6.2 8h3.6"/>',
  banish: '<path d="M8 3.2a4.8 4.8 0 1 0 1.6 3.6"/><path d="M8 1.6v3.2h3.2"/>',
  set: '<rect x="4.5" y="2.2" width="7" height="11.6" rx="1"/>',
  pay: '<path d="M3 8h10"/>',
  gain: '<path d="M8 3v10M3 8h10"/>',
  hand: '<rect x="2.2" y="3" width="5.2" height="9.5" rx="0.8"/><rect x="8.6" y="4.2" width="5.2" height="9.5" rx="0.8"/>',
  place: '<rect x="3" y="3" width="10" height="10" rx="1"/>',
};

export function mountCombo(
  root: HTMLElement,
  doc: ComboDoc,
  lookup?: CardLookup,
  initialIndex = 0,
  hover?: CardHover,
): ComboController {
  const pictures = doc.steps.length ? resolvePictures(doc.steps) : [emptyPicture()];
  const layout = layoutOf(doc, pictures);
  const rows = layout === "versus" ? VERSUS_ROWS : OWN_ROWS;
  let index = 0;
  let mode: Mode = "list";
  let tab: "steps" | "board" = "steps";
  let destroyed = false;

  root.replaceChildren();
  root.classList.add("ygo-host");

  const widget = el("div", "ygo-combo is-list");
  widget.tabIndex = 0;

  const list = el("div", "ygo-list");
  const title = el("h3", "ygo-list-title");
  title.textContent = doc.name;
  list.append(title);

  if (!doc.steps.length) {
    const empty = el("p", "ygo-empty");
    empty.textContent = "No steps yet.";
    list.append(empty);
  }

  const preview = el("div", "ygo-preview");
  const bar = el("div", "ygo-bar");
  const caption = el("div", "ygo-caption");
  const counter = el("span", "ygo-counter");
  const say = el("strong", "ygo-caption-say");
  caption.append(counter, say);

  const modes = el("div", "ygo-modes");
  const modeButtons = (["list", "minimal", "board"] as const).map((id) => {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "ygo-mode";
    node.textContent = id === "list" ? "List" : id === "minimal" ? "Minimal" : "Full";
    node.addEventListener("click", () => setMode(id));
    modes.append(node);
    return node;
  });

  const controls = el("div", "ygo-modes");
  const prev = navButton("‹", "Previous step");
  const next = navButton("›", "Next step");
  controls.append(prev, next);
  bar.append(caption);

  const now = el("div", "ygo-now");
  const nowSay = el("strong", "");
  const nowFrames = el("div", "");
  now.append(nowSay, nowFrames);
  const stage = el("div", "ygo-stage");
  preview.append(bar, now, stage);

  const tabs = el("div", "ygo-tabs");
  const tabSteps = modeButton("Steps");
  const tabBoard = modeButton("Board");
  tabs.append(tabSteps, tabBoard);
  tabSteps.addEventListener("click", () => setTab("steps"));
  tabBoard.addEventListener("click", () => setTab("board"));

  const tools = el("div", "ygo-tools");
  tools.append(modes, controls);
  const toolbar = el("div", "ygo-toolbar");
  toolbar.append(tabs, tools);

  widget.append(list, preview);
  root.append(toolbar, widget);

  const compact = new ResizeObserver(() => paintChrome());
  compact.observe(root);
  if (hover) watchCardHover(root, hover);

  const stepButtons = doc.steps.map((step, stepIndex) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "ygo-step";
    const number = el("span", "ygo-step-n");
    number.textContent = String(stepIndex + 1);
    const body = el("span", "ygo-step-body");
    const heading = el("span", "ygo-say");
    heading.textContent = step.say;
    body.append(heading);
    if (step.frames.length) {
      const frames = el("span", "");
      renderFrames(frames, step.frames, lookup);
      body.append(frames);
    } else {
      for (const line of step.lines) {
        if (line === step.say) continue;
        const row = el("span", "ygo-line");
        row.textContent = line;
        body.append(row);
      }
    }
    item.append(number, body);
    item.addEventListener("pointerenter", () => item.classList.add("is-hover"));
    item.addEventListener("pointerleave", () => item.classList.remove("is-hover"));
    item.addEventListener("click", () => show(stepIndex));
    list.append(item);
    return item;
  });

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  widget.addEventListener("keydown", onWidgetKey);
  document.addEventListener("keydown", onEscape);

  setMode("list");
  show(initialIndex);

  return {
    destroy() {
      destroyed = true;
      compact.disconnect();
      document.removeEventListener("keydown", onEscape);
    },
    repaint() {
      if (!destroyed) show(index);
    },
    getIndex() {
      return index;
    },
  };

  function onWidgetKey(event: KeyboardEvent) {
    if (destroyed) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === "Escape" && mode === "board") {
      event.preventDefault();
      setMode("list");
    }
  }

  function onEscape(event: KeyboardEvent) {
    if (destroyed || mode !== "board" || event.key !== "Escape") return;
    event.preventDefault();
    setMode("list");
    widget.focus();
  }

  function setTab(next: "steps" | "board") {
    tab = next;
    paintChrome();
  }

  function setMode(nextMode: Mode) {
    mode = nextMode;
    paintChrome();
  }

  function paintChrome() {
    const compactOn = root.clientWidth > 0 && root.clientWidth < 640;
    const modeClass = mode === "minimal" ? "is-minimal" : mode === "board" ? "is-board" : "is-list";
    for (const node of [root, widget]) {
      node.classList.toggle("is-compact", compactOn);
      node.classList.remove("is-list", "is-minimal", "is-board");
      node.classList.add(modeClass);
    }
    widget.classList.toggle("is-tab-board", tab === "board");
    syncCardSize();
    tabSteps.classList.toggle("is-on", tab === "steps");
    tabBoard.classList.toggle("is-on", tab === "board");
    modeButtons.forEach((button, buttonIndex) => {
      button.classList.toggle("is-on", (["list", "minimal", "board"] as const)[buttonIndex] === mode);
    });
  }

  function show(nextIndex: number) {
    if (destroyed || !pictures.length) return;
    index = Math.max(0, Math.min(pictures.length - 1, nextIndex));
    const step = doc.steps[index];
    counter.textContent = doc.steps.length ? `${index + 1} / ${doc.steps.length}` : "0 / 0";
    say.textContent = step?.say ?? "";
    nowSay.textContent = step ? `${index + 1} / ${doc.steps.length}  ${step.say}` : "";
    renderFrames(nowFrames, step?.frames ?? [], lookup);
    prev.disabled = index <= 0;
    next.disabled = index >= pictures.length - 1;
    stepButtons.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === index));
    const active = stepButtons[index];
    if (active) keepStepVisible(list, active);
    stage.replaceChildren(drawBoard(pictures[index], rows, lookup));
    syncCardSize();
  }

  function syncCardSize() {
    const sample = stage.querySelector(".ygo-board > .ygo-slot");
    const measured = sample?.getBoundingClientRect().width ?? 0;
    const width = measured > 8 ? measured : fallbackCardWidth();
    if (width > 8) root.style.setProperty("--ygo-card", `${Math.round(width)}px`);
  }

  function fallbackCardWidth() {
    const combo = widget.getBoundingClientRect().width || root.getBoundingClientRect().width;
    const share = mode === "list" ? 0.7 / 2.15 : 0.72;
    return Math.max(28, (combo * share - 24 - 36) / 7);
  }
}

function enableDragScroll(row: HTMLElement) {
  let pointerId: number | null = null;
  let startX = 0;
  let startScroll = 0;
  let dragged = false;

  row.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScroll = row.scrollLeft;
    dragged = false;
    row.setPointerCapture(event.pointerId);
  });

  row.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;
    const dx = event.clientX - startX;
    if (Math.abs(dx) > 4) {
      dragged = true;
      row.classList.add("is-dragging");
    }
    if (dragged) row.scrollLeft = startScroll - dx;
  });

  const end = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    row.classList.remove("is-dragging");
    if (!dragged) return;
    const stopClick = (click: Event) => {
      click.preventDefault();
      click.stopPropagation();
      row.removeEventListener("click", stopClick, true);
    };
    row.addEventListener("click", stopClick, true);
  };

  row.addEventListener("pointerup", end);
  row.addEventListener("pointercancel", end);
}

function keepStepVisible(list: HTMLElement, item: HTMLElement) {
  const listRect = list.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  if (itemRect.top < listRect.top) list.scrollTop -= listRect.top - itemRect.top;
  else if (itemRect.bottom > listRect.bottom) list.scrollTop += itemRect.bottom - listRect.bottom;
}

function renderFrames(host: HTMLElement, frames: Frame[], lookup?: CardLookup) {
  host.replaceChildren();
  if (!frames.length) return;
  const row = el("span", "ygo-frames");
  for (const frame of frames) row.append(renderFrame(frame, lookup));
  enableDragScroll(row);
  host.append(row);
}

function renderFrame(frame: Frame, lookup?: CardLookup): HTMLElement {
  const node = el("span", `ygo-frame is-${frame.type}`);
  const kind = el("span", "ygo-frame-kind");
  const icon = el("span", "ygo-frame-icon");
  icon.append(frameIcon(frame.type));
  const label = el("span", "");
  label.textContent = frameLabel(frame);
  kind.append(icon, label);
  node.append(kind);
  node.addEventListener("pointerenter", () => node.classList.add("is-hover"));
  node.addEventListener("pointerleave", () => node.classList.remove("is-hover"));

  if (frame.amount) {
    const amount = el("span", "ygo-frame-amount");
    amount.textContent = frame.amount;
    node.append(amount);
  }
  if (frame.card) node.append(miniArt(frame.card, lookup));
  if (frame.using?.length) {
    const mats = el("span", "ygo-materials");
    for (const name of frame.using) mats.append(miniArt(name, lookup));
    node.append(mats);
  }
  const notes = [
    frame.from ? `From ${frame.from}` : "",
    frame.to ? `To ${frame.to}` : "",
    frame.note ?? "",
  ].filter(Boolean);
  if (notes.length) {
    const line = el("span", "ygo-frame-note");
    line.textContent = notes.join(" · ");
    node.append(line);
  }
  return node;
}

function frameLabel(frame: Frame): string {
  if (frame.type === "summon") return frame.kind ? `${frame.kind} Summon` : "Summon";
  if (frame.type === "link") return "Link";
  if (frame.type === "chain") return frame.n ? `Chain ${frame.n}` : "Chain";
  if (frame.type === "activate") return "Activate";
  if (frame.type === "target") return "Target";
  if (frame.type === "banish") return "Banish";
  if (frame.type === "set") return "Set";
  if (frame.type === "pay") return "Pay";
  if (frame.type === "gain") return "Gain";
  if (frame.type === "hand") return "In hand";
  if (frame.type === "place") return "On field";
  return frame.type;
}

function frameIcon(type: FrameType): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.innerHTML = FRAME_ICONS[type];
  return svg;
}

function miniArt(name: string, lookup?: CardLookup): HTMLElement {
  const art = el("span", "ygo-frame-art");
  art.dataset.ygoName = name;
  const text = el("span", "ygo-frame-name");
  text.textContent = name;
  art.append(text);
  const url = lookup?.(name);
  if (url) {
    const image = document.createElement("img");
    image.alt = name;
    image.addEventListener("load", () => art.classList.add("has-image"));
    image.src = url;
    art.append(image);
  }
  return art;
}

function drawBoard(picture: BoardPicture, rows: string[][], lookup?: CardLookup): HTMLElement {
  const board = el("div", rows === VERSUS_ROWS ? "ygo-board is-versus" : "ygo-board");
  const areas = [...new Set(rows.flat().filter((area) => area !== "."))] as ZoneId[];
  board.style.gridTemplateAreas = rows.map((row) => `"${row.join(" ")}"`).join(" ");
  for (const area of areas) {
    if (area === "hand" || area === "oppHand") {
      board.append(drawHand(picture, area, lookup));
      continue;
    }
    const value = picture[area];
    const pile = Array.isArray(value) ? value : null;
    const card = slotCard(picture, area);
    const slot = card ? drawCard(card, pile ? pile.some((item) => item.glow) : card.glow, lookup) : drawEmpty(LABELS[area]);
    slot.style.gridArea = area;
    slot.dataset.zone = area;
    if (pile && pile.length > 1) {
      const count = el("span", "ygo-count");
      count.textContent = String(pile.length);
      slot.append(count);
    }
    if (pile?.length) slot.title = pile.map((item) => item.name).join("\n");
    board.append(slot);
  }
  return board;
}

function drawHand(picture: BoardPicture, zone: "hand" | "oppHand", lookup?: CardLookup): HTMLElement {
  const row = el("div", "ygo-hand");
  row.style.gridArea = zone;
  const cards = picture[zone];
  if (!cards.length) {
    row.append(drawEmpty("HAND"));
    return row;
  }
  for (const card of cards) row.append(drawCard(card, card.glow, lookup));
  return row;
}

function drawCard(card: CardView, glow: boolean, lookup?: CardLookup): HTMLElement {
  const slot = el("div", "ygo-slot is-filled");
  slot.dataset.ygoName = card.name;
  if (glow) slot.classList.add("is-glow");
  if (card.set) {
    slot.classList.add("is-set");
    slot.title = card.name;
    const back = el("span", "ygo-card-back");
    back.textContent = card.name;
    slot.append(back);
    return slot;
  }
  const name = el("span", "ygo-card-name");
  name.textContent = card.name;
  slot.append(name);
  const url = lookup?.(card.name);
  if (url) {
    const image = document.createElement("img");
    image.alt = card.name;
    image.addEventListener("load", () => slot.classList.add("has-image"));
    image.src = url;
    slot.append(image);
  }
  return slot;
}

function watchCardHover(root: HTMLElement, hover: CardHover) {
  root.addEventListener("pointerover", (event) => {
    const node = cardNode(event.target);
    if (!node || !root.contains(node)) return;
    if (event.relatedTarget instanceof Node && node.contains(event.relatedTarget)) return;
    const name = node.dataset.ygoName ?? "";
    if (name) hover.show(node, name);
  });
  root.addEventListener("pointerout", (event) => {
    const node = cardNode(event.target);
    if (!node) return;
    if (event.relatedTarget instanceof Node && node.contains(event.relatedTarget)) return;
    hover.hide(node);
  });
}

function cardNode(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const node = target.closest("[data-ygo-name]");
  return node instanceof HTMLElement ? node : null;
}

function drawEmpty(label: string): HTMLElement {
  const slot = el("div", "ygo-slot");
  const text = el("span", "ygo-slot-label");
  text.textContent = label;
  slot.append(text);
  return slot;
}

function navButton(text: string, label: string): HTMLButtonElement {
  const node = document.createElement("button");
  node.type = "button";
  node.className = "ygo-nav";
  node.textContent = text;
  node.setAttribute("aria-label", label);
  return node;
}

function modeButton(label: string): HTMLButtonElement {
  const node = document.createElement("button");
  node.type = "button";
  node.className = "ygo-mode";
  node.textContent = label;
  return node;
}

function el(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
