# Board

Our field is drawn in this order. An empty slot shows the zone name you write in the combo, with the same letters: `emzL`, `m1`, `st1`, `gy`, `oppHand`.

| | | | | | | |
| --- | --- | --- | --- | --- | --- | --- |
| | | `emzL` | | `emzR` | | `banished` |
| `field` | `m1` | `m2` | `m3` | `m4` | `m5` | `gy` |
| | `st1` | `st2` | `st3` | `st4` | `st5` | |
| `hand` across the bottom | | | | | | |

`emzL` is above `m2`. `emzR` is above `m4`. A Link-1 in the left Extra Monster Zone with a down arrow points at `m2`. A Link-2 there with down-left and down-right arrows points at `m1` and `m3`.

The opponent's field is the same layout, turned to face ours and placed above. Monster zones and Spell/Trap zones swap sides. The Extra Monster Zones stay where they are. Write those zones as `oppHand`, `oppField`, `oppM1` through `oppM5`, `oppSt1` through `oppSt5`, `oppGy`, and `oppBanished`.

## What carries over

A zone you leave out of `cards` stays as it was on the previous step.

`null` clears one monster, Spell/Trap, Extra Monster Zone, or Field Spell:

```yaml
cards:
  m2: null
  field: null
```

These piles are replaced completely each time you write them:

`hand`, `gy`, `banished`, `oppHand`, `oppGy`, `oppBanished`

If Loci was in the Graveyard and you add Sowing, write both names. `[]` clears that pile. The top of the pile is the last name in the list, and that card is the one drawn in the zone.

`glow` is not carried over. List the zones, or a card name, on the step that should light up. `glow` is the plain highlight. Numbered lists use a different color: `glow1` effect, `glow2` target, `glow3` summon, `glow4` tribute. `glow5` and above keep going. A card named in more than one list keeps the last color.

```yaml
glow:
  - m3
glow1:
  - emzL
glow2:
  - hand
```

## One card

A face-up card is a wikilink:

```yaml
m3: [[Sunseed Genius Loci]]
```

A face-down card is an object. `set: true` turns the picture face-down. `facedown` and `faceDown` mean the same thing.

```yaml
st5: { name: [[Rikka Sheet]], set: true }
```

There is no equip zone. Remove the equipped card from the field or the Graveyard, and say what it is equipped to in the frame `note`.

## Other names for a zone

Spacing, underscores, and hyphens are ignored, and capital letters do not matter.

| You can write | Zone |
| --- | --- |
| `m1`, `monster1` | `m1` … `m5` |
| `st1`, `s1`, `spell1`, `trap1` | `st1` … `st5` |
| `emzL`, `emzleft`, `emz-left`, `leftextra` | `emzL` |
| `emzR`, `emzright`, `emz-right`, `rightextra` | `emzR` |
| `field`, `fieldspell` | `field` |
| `gy`, `grave`, `graveyard` | `gy` |
| `banished`, `banish` | `banished` |
| `hand` | `hand` |
| `oppM1`, `oppmonster1` | `oppM1` … `oppM5` |
| `oppSt1`, `oppspell1`, `opptrap1` | `oppSt1` … `oppSt5` |
| `oppField` | `oppField` |
| `oppGy`, `oppgrave` | `oppGy` |
| `oppBanished`, `oppbanish` | `oppBanished` |
| `oppHand` | `oppHand` |
