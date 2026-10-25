# Combo Builder

A combo is a list of steps next to a board. You decide where each card goes. The plugin does not apply Yu-Gi-Oh rules.

Open the `example` folder as a vault to see a finished deck, a full opening, and card pictures.

| Note | What it shows |
| --- | --- |
| [Frames](frames.md) | Every frame type and the fields it can take |
| [Board](board.md) | Zones, what carries over, and the opponent's field |
| [Cards](cards.md) | Decks, card notes, and pictures |

## A combo

Put the sequence in a `ygo-combo` block. `say` is the step title. `frames` are the actions in that step. `cards` is the board after the step.

````md
```ygo-combo
name: Opening
board: own
steps:
  - say: Normal Summon Loci
    frames:
      - { type: summon, kind: Normal, card: [[Sunseed Genius Loci]], from: hand, to: m3 }
    glow:
      - m3
    cards:
      hand: []
      m3: [[Sunseed Genius Loci]]
```
````

`name` is the title of the sequence. `board` is `own`, `versus`, or `auto`. With `auto`, the opponent's field appears when any `opp` zone has a card.

A page can hold more than one combo. **Insert combo** pastes a short sample.

If a step has frames, its `lines` stay hidden. A step with no frames shows `lines` under the title, except a line that repeats `say`.

`glow` lights a zone, or every visible card with that name, and only on that step. `glow1` is an effect, `glow2` a target, `glow3` a summon, and `glow4` a tribute. More colors are `glow5`, `glow6`, and so on.

## A board

`ygo-board` is only the board. There is no step list. `cards` places the cards. `glow` and `glow1` onward light them. `board` is `own`, `versus`, or omitted. Omit it and the opponent's field appears when any `opp` zone has a card.

````md
```ygo-board
glow1:
  - emzL
cards:
  emzL: [[Sunavalon Dryas]]
  m3: [[Sunseed Genius Loci]]
```
````

**Insert board** pastes a short sample.

## A card row

`ygo-cards` lays card names in a grid of 8 columns. It does not use passcodes. Write one `[Card Name]` on each line, inside the fence. `[Card Name]` is not a note link. `[[Card Name]]` outside the fence still opens the card note.

````md
```ygo-cards
[Sunseed Genius Loci]
[Sunavalon Dryas]
[Sunvine Thrasher]
```
````

**Insert cards** pastes a short sample.

## Views

**Small** is the default: steps on the left and a small board on the right. **Large** gives most of the widget to the board. **Full** hides the step list and gives the board the whole widget. The three buttons sit at the top of the board. Escape returns to Small.

When the note is narrower than 640px, Small and Large switch to **Steps** and **Board** tabs.

While the cursor is inside the block, Live Preview shows the source instead of the board.

## Card folder

The setting **Card folder** defaults to `cards`. The first time a card is needed, the plugin writes `Card Name.md` and `Card Name.png` there. After that, pictures and tooltips are read from those files.
