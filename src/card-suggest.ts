import { EditorSuggest, type Editor, type EditorPosition, type EditorSuggestContext, type EditorSuggestTriggerInfo, type TFile } from "obsidian";
import { cardFileBase, cardTrigger, type StoredCard } from "./card-record";
import type { CardStore } from "./card-store";
import type YgoComboPlugin from "./main";

type Suggestion = {
  id: number;
  name: string;
  type: string;
  card?: StoredCard;
};

export class CardNameSuggest extends EditorSuggest<Suggestion> {
  constructor(
    private readonly plugin: YgoComboPlugin,
    private readonly store: CardStore,
  ) {
    super(plugin.app);
    this.limit = 8;
    this.setInstructions([{ command: "↵", purpose: "add card" }]);
  }

  onTrigger(cursor: EditorPosition, editor: Editor, _file: TFile | null): EditorSuggestTriggerInfo | null {
    const trigger = cardTrigger(editor.getLine(cursor.line), cursor.ch);
    if (!trigger) return null;
    const query = trigger.query.trim();
    const local = this.store.search(query);
    if (trigger.embed && query.length === 0 && local.length === 0) return null;
    if (!trigger.embed && query.length < 2 && local.length === 0) return null;
    return {
      start: { line: cursor.line, ch: trigger.start },
      end: cursor,
      query: trigger.query,
    };
  }

  async getSuggestions(context: EditorSuggestContext): Promise<Suggestion[]> {
    const query = context.query.trim();
    const local = this.store.search(query).map((card) => ({ id: card.id, name: card.name, type: card.type }));
    if (query.length < 2) return local;
    await wait(160);
    if (this.context !== context) return [];
    const remote = await this.store.searchRemote(query);
    if (this.context !== context) return [];
    const seen = new Set(local.map((card) => card.name.toLowerCase()));
    const extra = remote
      .filter((card) => !seen.has(card.name.toLowerCase()))
      .map((card) => ({ id: card.id, name: card.name, type: card.type, card }));
    return [...local, ...extra].slice(0, this.limit);
  }

  renderSuggestion(value: Suggestion, el: HTMLElement): void {
    el.createDiv({ cls: "ygo-suggest-name", text: value.name });
    if (value.type) el.createDiv({ cls: "ygo-suggest-type", text: value.type });
  }

  selectSuggestion(value: Suggestion): void {
    const context = this.context;
    if (!context) return;
    const embed = cardTrigger(context.editor.getLine(context.start.line), context.end.ch)?.embed ?? false;
    const base = cardFileBase(value.name);
    const text = embed ? `![[${base}.png]]` : `[[${base}]]`;
    context.editor.replaceRange(text, context.start, context.end);
    this.close();
    if (value.card) void this.store.save(value.card);
    else void this.plugin.rememberCard(value.name);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
