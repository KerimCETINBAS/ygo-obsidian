# Frames

A frame is one action in a step. The `type` chooses the label. Any other field below can be set on any type. A type the plugin does not know is skipped.

```yaml
frames:
  - { type: summon, kind: Normal, card: [[Sunseed Genius Loci]], from: hand, to: m3 }
```

The card picture uses `[[Card Name]]`. Several materials are written `using: [[[Sunavalon Dryas]], [[Sunvine Thrasher]]]`. One material is `using: [[[Sunseed Genius Loci]]]`.

## Fields

| Field | What it does |
| --- | --- |
| `type` | Required. One of the types in the list below. |
| `card` | The card picture and name. Hover shows the effect. |
| `kind` | Changes the summon label. `Normal` is shown as **Normal Summon**. Other types ignore it for the label. |
| `from` | Printed as `From hand`, `From deck`, `From gy`, or whatever text you write. |
| `to` | Printed as `To m3`, `To emzL`, or whatever text you write. |
| `note` | Your own text, after `from` and `to`, separated by ` · `. |
| `using` | Small pictures of the materials, shown under the card. |
| `n` | Chain number. `2` is shown as **Chain 2**. Other types ignore it for the label. |
| `amount` | Text shown on the frame, usually Life Points. `pay` and `gain` use this. |

`from`, `to`, and `note` are one line: `From hand · To m3 · tribute the equipped Plant`.

## summon

Label: **Summon**, or **Normal Summon** / **Special Summon** / **Xyz Summon** when `kind` is set.

| Field | Use |
| --- | --- |
| `kind` | `Normal`, `Special`, `Xyz`, or any other word. |
| `card` | The monster that hits the field. |
| `from` | `hand`, `deck`, `gy`, `banished`, `extra`. |
| `to` | The zone, such as `m2` or `emzL`. |
| `using` | Materials, when you want them pictured. |
| `note` | Tribute, equip, or any other detail. |

```yaml
- { type: summon, kind: Special, card: [[Sunseed Twin]], from: deck, to: m3, note: beside Dryas }
```

## link

Label: **Link**.

| Field | Use |
| --- | --- |
| `card` | The Link Monster. |
| `using` | The materials. |
| `to` | Where it is summoned. |
| `note` | Arrow targets, or an effect you are skipping. |

```yaml
- { type: link, card: [[Sunavalon Dryas]], using: [[[Sunseed Genius Loci]]], to: emzL }
```

## activate

Label: **Activate**.

| Field | Use |
| --- | --- |
| `card` | The card that activates. |
| `from` | Where it activates from, such as `gy`. |
| `to` | Where it goes, such as `field` or `st1`. |
| `note` | What the effect does: a search, a tribute, a discard. |

```yaml
- { type: activate, card: [[Sunavalon Dryas]], note: add Sunvine Sowing }
```

## target

Label: **Target**.

| Field | Use |
| --- | --- |
| `card` | The card that is targeted. |
| `note` | Why, when the card name is not enough. |

```yaml
- { type: target, card: [[Sunavalon Dryas]] }
```

## chain

Label: **Chain**, or **Chain 2** when `n` is `2`.

| Field | Use |
| --- | --- |
| `card` | The card chained. |
| `n` | The chain link number. |
| `note` | What that link does. |

```yaml
- { type: chain, card: [[Sacred Tree Beast, Hyperyton]], n: 2, note: attach Therion Discolosseum }
```

## banish

Label: **Banish**.

| Field | Use |
| --- | --- |
| `card` | The card that leaves. |
| `from` | `gy`, `field`, `deck`, or `hand`. |
| `note` | What the banish pays for. |

```yaml
- { type: banish, card: [[Ragnaraika Samurai Beetle]], from: deck }
```

## set

Label: **Set**.

| Field | Use |
| --- | --- |
| `card` | The card set face-down. |
| `from` | Usually `deck` or `hand`. |
| `to` | A Spell/Trap zone, such as `st5`. |

The frame shows the action. The board card is face-down only when that zone is written as `st5: { name: [[Rikka Sheet]], set: true }`. See [Board](board.md).

```yaml
- { type: set, card: [[Rikka Sheet]], from: deck, to: st5 }
```

## place

Label: **On field**.

| Field | Use |
| --- | --- |
| `card` | A Spell, Trap, or monster placed rather than summoned. |
| `to` | The zone. |
| `note` | Face-up, in a column, or from another card's effect. |

```yaml
- { type: place, card: [[Humid Winds]], to: st3 }
```

## hand

Label: **In hand**.

| Field | Use |
| --- | --- |
| `card` | The card added to the hand. |
| `from` | `deck`, `gy`, or wherever it came from. |
| `note` | Which effect searched it. |

```yaml
- { type: hand, card: [[Therion "Lily" Borea]], note: Jasmine searches }
```

## pay

Label: **Pay**. No card is required.

| Field | Use |
| --- | --- |
| `amount` | The Life Points, or any other cost text. |
| `note` | What the payment is for. |

```yaml
- { type: pay, amount: 1000 }
```

## gain

Label: **Gain**. No card is required.

| Field | Use |
| --- | --- |
| `amount` | The Life Points gained. |
| `note` | Which effect gained them. |
| `card` | Optional, when a card on the field is the reason. |

```yaml
- { type: gain, amount: 500, note: Laurel in the Graveyard }
```
