# Cards and decks

## Deck

A deck is a `ygo-deck` block of passcodes, in YDK order. **Insert deck** pastes a short sample.

````md
```ygo-deck
#main
27520594
27520594
#extra
93896655
#side
```
````

Write one line per copy. Lines before the first header count as main. A header is `#main`, `#extra`, `#side`, or the same words after `!`, so `!side` starts the side deck. Any other `#` or `!` line is a comment. Anything that is not a passcode is skipped.

The block shows three rows: Main, Extra, and Side. An empty row says **Empty**. The number beside the heading is how many passcodes are in that section. Hover a card for its effect.

The passcode is only used to find the card the first time. The picture and the tooltip then come from `cards/Card Name.md` and `cards/Card Name.png`.

## In a sentence

`[[Sunseed Genius Loci]]` is the card note. `![[Sunseed Genius Loci.png]]` is the picture. Write the `.png` when you want the image. `![[Card#image]]` is not a picture embed.

Names keep `&` and commas: `[[Ash Blossom & Joyous Spring]]` and `![[Ash Blossom & Joyous Spring.png]]`.

A quote mark cannot be part of a file name on Windows. Therion "Lily" Borea is stored as `Therion Lily Borea.md` and `Therion Lily Borea.png`, so the note link is `[[Therion Lily Borea]]`. Inside a combo, use the official name `[[Therion "Lily" Borea]]`. The plugin reads that link before it reads the rest of the block.

Typing `[[` or `![[` suggests cards already in the vault, then cards from YGOPRODeck once the query is at least two characters. Choosing one, or closing the link with `]]`, saves the card into the card folder.

## The card note

```md
---
passcode: 27520594
name: Sunseed Genius Loci
type: Normal Monster
attribute: EARTH
race: Plant
level: 1
link:
atk: 0
def: 600
---

%%
Auto-generated. Do not edit.
%%

## image

![[Sunseed Genius Loci.png]]

## text

The effect, including every line after a summoning condition.
```

The tooltip is the whole `## text` section. `link` is the Link rating. `level` is the Level or Rank. Leave either one empty when the card does not have it. The plugin writes `%% Auto-generated. Do not edit. %%` on the line after the frontmatter. That comment shows in edit mode and stays hidden in reading mode and in embeds.

`example/Cards.md` places a note link and a picture next to each other. `example/Deck.md` is a full deck. `example/Opening.md` is a full combo.
