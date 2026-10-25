# Yu-Gi-Oh Combo Builder

An Obsidian plugin. A combo is a step list on the left and a board you stage by hand on the right. There is no rules engine. The note decides where each card goes.

Used cards are written into the `cards` folder as `Card Name.md` and `Card Name.png`. The passcode is only the first lookup. After that, pictures and tooltips are read from those files.

The human reference is [docs](docs/README.md). Frame types and their fields are listed in [docs/frames.md](docs/frames.md). [AI.md](AI.md) is the same material arranged for an agent.

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

`npm run preview` builds the plugin and also copies it into `G:/viteria/Yugioh`.

## Release

Push a tag that matches `version` in `manifest.json`. Leave off the `v` prefix.

```bash
git tag 0.1.0
git push origin 0.1.0
```

The workflow builds the plugin and opens a draft release with `main.js`, `manifest.json`, and `styles.css`. Publish that draft. In the repository settings, Actions needs read and write permission so the workflow can create the release.

## License

[MIT](LICENSE)
