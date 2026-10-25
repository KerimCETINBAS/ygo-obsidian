# Combo Builder catalog

Read this when you write a Yu-Gi-Oh note for this plugin, or when you teach someone how to use it. The plugin does not check game rules. You place every card. The same reference, written for a person, is `docs/README.md`.

Worked notes in this repo:

- `example/Deck.md` is a deck.
- `example/Opening.md` is a full combo.
- `example/Cards.md` shows a card note beside its picture.

## Procedures

### teach-user

Show the vault in this order.

1. Open `example` as an Obsidian vault and enable Yu-Gi-Oh Combo Builder.
2. Open [[Deck]]. The fence is `ygo-deck`. Each line is a passcode. Sections are `#main`, `#extra`, and `#side`.
3. Open [[Opening]]. The fence is `ygo-combo`. The left side is the step list. The right side is the board for the selected step.
4. Open [[Cards]]. `[[Card Name]]` opens the card note. `![[Card Name.png]]` is only the picture.
5. The command **Insert combo** pastes a short sample. **Insert deck** pastes a short deck. The setting **Card folder** defaults to `cards`.

The widget has three board sizes: **Small**, **Large**, and **Full**. Small keeps a small board beside the steps. Large gives the board most of the widget. Full hides the step list and gives the board the whole widget. The buttons are at the top of the board. Escape leaves Full and returns to Small. Below 640px, Small and Large become **Steps** and **Board** tabs. While the cursor is inside a fence, Live Preview hides the widget and shows the source.

### write-deck

Input: a YDK list, or a list of passcodes with main, extra, and side.

Output: one `ygo-deck` fence. Passcodes only. Repeat a line for each copy. A line before any header counts as main. `#` and `!` comments are ignored unless the word is `main`, `extra`, or `side`. `!side` starts the side deck. Non-numeric lines are skipped.

````md
```ygo-deck
#main
27520594
#extra
93896655
#side
```
````

The first time a passcode is shown, the plugin saves `cards/Card Name.md` and `cards/Card Name.png`. Later pictures and tooltips come from those files. The passcode is only the lookup key.

### write-combo

Input: a line the user wants to play, told in order.

Output: one `ygo-combo` fence. Do not leave the line as numbered prose beside the fence. The fence is the sequence.

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

`name` is the title. `board` is `own`, `versus`, or `auto`. `auto` becomes `versus` when any opponent zone is filled.

Each step has:

- `say`: the step title.
- `frames`: the cards and actions in that step. When a step has frames, its `lines` are not shown.
- `glow`: zones or card names that light up on this step only.
- `cards`: the board change for this step.

Put the action in the frame. `from`, `to`, and `note` are joined on the card as `From hand · To m3 · note`.

### stage-board

A zone you leave out stays as it was. These piles replace the whole pile whenever you write them: `hand`, `gy`, `banished`, `oppHand`, `oppGy`, `oppBanished`. Write the full pile again. `null` clears one slot. `[]` clears a pile.

`glow` does not carry to the next step. Set it on the step that should light up.

There is no equip zone. Take the equipped card off the field or Graveyard and say what it equips in the frame note. A face-down card is `st5: { name: [[Rikka Sheet]], set: true }`.

Two copies of one card are two entries in the pile.

### link-card

In a combo or deck widget, the card is a wikilink: `card: [[Sunseed Genius Loci]]`. Several materials are `using: [[[Sunavalon Dryas]], [[Sunvine Thrasher]]]`. One material is `using: [[[Sunseed Genius Loci]]]`.

In normal note text:

- `[[Sunseed Genius Loci]]` is the card note.
- `![[Sunseed Genius Loci.png]]` is the picture.

Do not write `![[Card#image]]`. A picture is always the `.png` embed.

Windows cannot store `"` in a file name. The note for Therion "Lily" Borea is `[[Therion Lily Borea]]` and the picture is `![[Therion Lily Borea.png]]`. Inside a combo fence, keep the official name: `[[Therion "Lily" Borea]]`. Names with `&` stay as written: `[[Ash Blossom & Joyous Spring]]`.

A saved card note has YAML at the top (`passcode`, `name`, `type`, `attribute`, `race`, `level`, `link`, `atk`, `def`), then `## image` with the png embed, then `## text` with the effect. The tooltip is `## text`.

## Board

Our field, from the top:

| | | | | | | |
| --- | --- | --- | --- | --- | --- | --- |
| | | `emzL` | | `emzR` | | `banished` |
| `field` | `m1` | `m2` | `m3` | `m4` | `m5` | `gy` |
| | `st1` | `st2` | `st3` | `st4` | `st5` | |
| `hand` across the bottom | | | | | | |

`emzL` sits above `m2`. `emzR` sits above `m4`. A Link-1 in the left Extra Monster Zone with a bottom arrow points at `m2`. A Link-2 there with bottom-left and bottom-right arrows points at `m1` and `m3`.

The opponent board is the same field, mirrored left to right and placed above ours. The Extra Monster Zones are not flipped. Opponent keys are `oppHand`, `oppField`, `oppM1` through `oppM5`, `oppSt1` through `oppSt5`, `oppGy`, and `oppBanished`.

Accepted spellings include `monster1`, `spell1`, `trap1`, `s1`, `grave`, `graveyard`, `banish`, `emzleft`, `emz-left`, `fieldspell`, and the `opp` forms of those words.

## Frames

| `type` | What it shows | Extra fields |
| --- | --- | --- |
| `summon` | `Normal Summon`, `Special Summon`, `Xyz Summon`, or `Summon` | `kind`, `card`, `from`, `to`, `using`, `note` |
| `link` | Link | `card`, `using`, `to`, `note` |
| `activate` | Activate | `card`, `note` |
| `target` | Target | `card` |
| `chain` | `Chain 2` when `n` is set | `card`, `n`, `note` |
| `banish` | Banish | `card`, `from` |
| `set` | Set | `card`, `from`, `to` |
| `place` | On field | `card`, `to` |
| `hand` | In hand | `card`, `note` |
| `pay` | Pay | `amount` |
| `gain` | Gain | `amount`, `note` |

An unknown `type` is dropped. `pay` and `gain` do not need a card.

## Teaching rules

- Ask where the card starts, then write that step before the summon.
- After each action, say which zones changed. Restate a pile only when that pile changed.
- Use the official card name. Do not invent a card to fill "discard any card"; put that in `note`.
- Follow the user's tribute and column choices when they differ from the usual effect text.
- Hover a card in the deck, on the board, in the step list, or on a `[[link]]` to read `## text`.
- If the picture is missing, leave the fence as written. The plugin downloads the card on the next view. Do not paste a remote image URL.
