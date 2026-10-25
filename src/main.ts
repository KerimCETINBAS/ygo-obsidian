import { MarkdownRenderChild, Plugin, PluginSettingTab, Setting, type App } from "obsidian";
import { completedCardNames } from "./card-record";
import { CardStore } from "./card-store";
import { CardNameSuggest } from "./card-suggest";
import { CardTip, registerCardViews } from "./card-view";
import { mountDeck } from "./deck";
import { mountGrid } from "./grid";
import { parseBoard, parseCardNames, parseCombo } from "./model";
import { BOARD_SOURCE, CARDS_SOURCE, DECK_SOURCE, SAMPLE_SOURCE } from "./sample";
import { mountBoard, mountCombo, type ComboController } from "./view";
import type { StoredCard } from "./card-record";

const DEFAULT_CARDS_FOLDER = "cards";

type Settings = {
  cardsFolder: string;
};

export default class YgoComboPlugin extends Plugin {
  settings: Settings = { cardsFolder: DEFAULT_CARDS_FOLDER };
  readonly tip = new CardTip();
  readonly store: CardStore;
  private readonly blocks = new Set<ComboBlock>();

  constructor(app: App, manifest: ConstructorParameters<typeof Plugin>[1]) {
    super(app, manifest);
    this.store = new CardStore(app.vault, () => this.cardsFolder());
  }

  async onload() {
    this.settings = Object.assign({ cardsFolder: DEFAULT_CARDS_FOLDER }, await this.loadData());
    await this.store.load();
    const suggest = new CardNameSuggest(this, this.store);
    this.registerEditorSuggest(suggest);
    preferCardSuggest(this.app, suggest);
    registerCardViews(this, this.store);

    this.registerMarkdownCodeBlockProcessor("ygo-combo", (source, element, context) => {
      const block = new ComboBlock(element, source, this, () => this.blocks.delete(block));
      this.blocks.add(block);
      context.addChild(block);
    });

    this.registerMarkdownCodeBlockProcessor("ygo-deck", (source, element, context) => {
      context.addChild(new DeckBlock(element, source, this));
    });

    this.registerMarkdownCodeBlockProcessor("ygo-board", (source, element, context) => {
      context.addChild(new BoardBlock(element, source, this));
    });

    this.registerMarkdownCodeBlockProcessor("ygo-cards", (source, element, context) => {
      context.addChild(new CardsBlock(element, source, this));
    });

    this.registerEvent(
      this.app.workspace.on("editor-change", (editor, info) => {
        const line = editor.getLine(editor.getCursor().line);
        const sourcePath = info.file?.path ?? "";
        for (const name of completedCardNames(line)) {
          if (this.app.metadataCache.getFirstLinkpathDest(name, sourcePath)) continue;
          void this.store.ensureExact(name.replace(/\.png$/i, ""));
        }
      }),
    );

    this.addSettingTab(new YgoSettingTab(this.app, this));

    this.addCommand({
      id: "insert-ygo-combo",
      name: "Insert combo",
      editorCallback: (editor) => {
        editor.replaceSelection(`\`\`\`ygo-combo\n${SAMPLE_SOURCE}\`\`\`\n`);
      },
    });

    this.addCommand({
      id: "insert-ygo-deck",
      name: "Insert deck",
      editorCallback: (editor) => {
        editor.replaceSelection(`\`\`\`ygo-deck\n${DECK_SOURCE}\`\`\`\n`);
      },
    });

    this.addCommand({
      id: "insert-ygo-board",
      name: "Insert board",
      editorCallback: (editor) => {
        editor.replaceSelection(`\`\`\`ygo-board\n${BOARD_SOURCE}\`\`\`\n`);
      },
    });

    this.addCommand({
      id: "insert-ygo-cards",
      name: "Insert cards",
      editorCallback: (editor) => {
        editor.replaceSelection(`\`\`\`ygo-cards\n${CARDS_SOURCE}\`\`\`\n`);
      },
    });
  }

  onunload() {
    this.tip.destroy();
  }

  showCard(target: HTMLElement, card: StoredCard | null, fallback = "") {
    this.tip.show(target, card, fallback);
  }

  hideCard(target: HTMLElement) {
    this.tip.hide(target);
  }

  rememberCard(name: string) {
    void this.store.ensureExact(name);
  }

  artFor(name: string): string | null {
    return this.store.imageOf(name);
  }

  cardsFolder(): string {
    return this.settings.cardsFolder.trim().replace(/^\/+/, "").replace(/\/+$/, "") || DEFAULT_CARDS_FOLDER;
  }
}

class ComboBlock extends MarkdownRenderChild {
  private controller: ComboController | null = null;
  private alive = false;

  private readonly pending = new Set<string>();

  constructor(
    containerEl: HTMLElement,
    private readonly source: string,
    private readonly plugin: YgoComboPlugin,
    private readonly onGone: () => void,
  ) {
    super(containerEl);
  }

  onload() {
    this.alive = true;
    this.render();
  }

  refresh() {
    if (this.alive) this.render();
  }

  onunload() {
    this.alive = false;
    this.controller?.destroy();
    this.controller = null;
    this.onGone();
  }

  private render() {
    const index = this.controller?.getIndex() ?? 0;
    this.controller?.destroy();
    this.controller = null;
    const parsed = parseCombo(this.source);
    this.containerEl.empty();
    if (!parsed.ok) {
      this.containerEl.createDiv({ cls: "ygo-error", text: parsed.error });
      return;
    }
    this.controller = mountCombo(this.containerEl, parsed.doc, (name) => this.art(name), index, {
      show: (anchor, name) => {
        this.plugin.showCard(anchor, null, name);
        void this.plugin.store.ensureExact(name).then((card) => {
          if (this.plugin.tip.anchor === anchor) this.plugin.showCard(anchor, card, card?.name || name);
        });
      },
      hide: (anchor) => this.plugin.hideCard(anchor),
    });
  }

  private art(name: string): string | null {
    const known = this.plugin.artFor(name);
    const key = name.trim().toLowerCase();
    if (!this.plugin.store.find(name) && !this.pending.has(key)) {
      this.pending.add(key);
      void this.plugin.store.ensureExact(name).then((card) => {
        this.pending.delete(key);
        if (card && this.alive) this.refresh();
      });
    }
    return known;
  }
}

class YgoSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: YgoComboPlugin,
  ) {
    super(app, plugin);
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    new Setting(containerEl)
      .setName("Card folder")
      .setDesc("Created in the vault when the plugin loads. Each card is stored here as name.md and name.png.")
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_CARDS_FOLDER)
          .setValue(this.plugin.settings.cardsFolder)
          .onChange(async (value) => {
            this.plugin.settings.cardsFolder = value.trim() || DEFAULT_CARDS_FOLDER;
            await this.plugin.saveData(this.plugin.settings);
            await this.plugin.store.load();
          }),
      );
  }
}

class BoardBlock extends MarkdownRenderChild {
  private view: { destroy(): void } | null = null;
  private alive = false;
  private readonly pending = new Set<string>();

  constructor(
    containerEl: HTMLElement,
    private readonly source: string,
    private readonly plugin: YgoComboPlugin,
  ) {
    super(containerEl);
  }

  onload() {
    this.alive = true;
    this.render();
  }

  onunload() {
    this.alive = false;
    this.view?.destroy();
    this.view = null;
  }

  private render() {
    this.view?.destroy();
    this.view = null;
    const parsed = parseBoard(this.source);
    this.containerEl.empty();
    if (!parsed.ok) {
      this.containerEl.createDiv({ cls: "ygo-error", text: parsed.error });
      return;
    }
    this.view = mountBoard(this.containerEl, parsed.doc.picture, parsed.doc.layout, (name) => this.art(name), {
      show: (anchor, name) => {
        this.plugin.showCard(anchor, null, name);
        void this.plugin.store.ensureExact(name).then((card) => {
          if (this.plugin.tip.anchor === anchor) this.plugin.showCard(anchor, card, card?.name || name);
        });
      },
      hide: (anchor) => this.plugin.hideCard(anchor),
    });
  }

  private art(name: string): string | null {
    const known = this.plugin.artFor(name);
    const key = name.trim().toLowerCase();
    if (!this.plugin.store.find(name) && !this.pending.has(key)) {
      this.pending.add(key);
      void this.plugin.store.ensureExact(name).then((card) => {
        this.pending.delete(key);
        if (card && this.alive) this.render();
      });
    }
    return known;
  }
}

class CardsBlock extends MarkdownRenderChild {
  private view: { destroy(): void } | null = null;

  constructor(
    containerEl: HTMLElement,
    private readonly source: string,
    private readonly plugin: YgoComboPlugin,
  ) {
    super(containerEl);
  }

  onload() {
    this.view = mountGrid(
      this.containerEl,
      parseCardNames(this.source),
      (name) => this.plugin.store.ensureExact(name),
      this.plugin.tip,
    );
  }

  onunload() {
    this.view?.destroy();
    this.view = null;
  }
}

class DeckBlock extends MarkdownRenderChild {
  private deck: { destroy(): void } | null = null;

  constructor(
    containerEl: HTMLElement,
    private readonly source: string,
    private readonly plugin: YgoComboPlugin,
  ) {
    super(containerEl);
  }

  onload() {
    this.deck = mountDeck(this.containerEl, this.source, (id) => this.plugin.store.ensureId(Number(id)), this.plugin.tip);
  }

  onunload() {
    this.deck?.destroy();
    this.deck = null;
  }
}

function preferCardSuggest(app: App, suggest: CardNameSuggest) {
  const manager = (app.workspace as unknown as { editorSuggest?: { suggests?: CardNameSuggest[] } }).editorSuggest;
  const list = manager?.suggests;
  if (!list) return;
  const index = list.indexOf(suggest);
  if (index > 0) {
    list.splice(index, 1);
    list.unshift(suggest);
  }
}
