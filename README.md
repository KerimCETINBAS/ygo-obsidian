# Yu-Gi-Oh Combo Builder

An Obsidian plugin. A combo is a step list on the left and a board you stage by hand on the right. There is no rules engine. The note decides where each card goes.

Used cards are written into the `cards` folder as `Card Name.md` and `Card Name.png`. The passcode is only the first lookup. After that, pictures and tooltips are read from those files.

The human reference is [docs](docs/README.md). Frame types and their fields are listed in [docs/frames.md](docs/frames.md). [AI.md](AI.md) is the same material arranged for an agent.

## Network

A missing card is fetched once from YGOPRODeck, then stored in the vault.

- `https://db.ygoprodeck.com/api/v7/cardinfo.php` returns the name, passcode, and effect.
- `https://images.ygoprodeck.com/images/cards/{id}.jpg` is the picture.

The picture and the text are written to `cards/Card Name.png` and `cards/Card Name.md`. Later views and tooltips read those files. Typing `[[` also asks YGOPRODeck when the query is at least two characters and the card is not already in the vault. The plugin does not send note text anywhere else.

## AI

This plugin was written with an AI coding assistant. It does not send notes, decks, or combos to an AI service. [AI.md](AI.md) is only a guide an agent can read locally to write notes for this plugin.

## Syntax

A deck is YDK text:

````md
```ygo-deck
#main
27520594
#extra
93896655
#side
```
````

Inside a combo, a card is `[[Card Name]]`. Use `![[Card Name.png]]` when you want the picture.

`ygo-board` is the board alone: `cards` places the cards, and `glow` or `glow1` lights them. There are no steps.

`ygo-cards` is a grid of 8 columns. Each line is `[Card Name]`. That is not a note link. `[[Card Name]]` stays a link in the note, outside this fence.

````md
```ygo-combo
name: Opening
board: own
steps:
  - say: Normal summon Loci
    frames:
      - { type: summon, kind: Normal, card: [[Sunseed Genius Loci]], from: hand }
    cards:
      m3: [[Sunseed Genius Loci]]
```
````

## Example vault

`example/` is an Obsidian vault with a sample deck, a playable opening, and a note that shows card links and picture embeds. Open that folder as a vault and enable this plugin.

## Development

```bash
npm install
npm test
npm run build
```

`npm run build` writes the plugin to `dist/` and to `example/.obsidian/plugins/ygo-combo-builder/`.

## Release

Push a tag that matches `version` in `manifest.json`. Leave off the `v` prefix.

```bash
git tag 0.2.0
git push origin 0.2.0
```

## License

[MIT](LICENSE)
