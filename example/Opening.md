# Opening

This combo needs [[Sunseed Genius Loci]], or any way to summon it.

```ygo-combo
name: Opening
board: own
steps:
  - say: Loci in hand
    frames:
      - { type: hand, card: [[Sunseed Genius Loci]] }
    glow:
      - hand
    cards:
      hand:
        - [[Sunseed Genius Loci]]

  - say: Normal Summon Loci
    frames:
      - { type: summon, kind: Normal, card: [[Sunseed Genius Loci]], from: hand, to: m2 }
    glow:
      - m2
    cards:
      hand: []
      m2: [[Sunseed Genius Loci]]

  - say: Link into Dryas
    frames:
      - { type: link, card: [[Sunavalon Dryas]], using: [[[Sunseed Genius Loci]]], to: emzL }
    glow:
      - emzL
    cards:
      m2: null
      emzL: [[Sunavalon Dryas]]
      gy:
        - [[Sunseed Genius Loci]]

  - say: Dryas searches Sowing
    frames:
      - { type: activate, card: [[Sunavalon Dryas]], note: add Sunvine Sowing }
    glow:
      - emzL
    cards:
      hand:
        - [[Sunvine Sowing]]

  - say: Sowing summons Twin
    frames:
      - { type: activate, card: [[Sunvine Sowing]] }
      - { type: summon, kind: Special, card: [[Sunseed Twin]], from: deck, to: m3, note: beside Dryas }
    glow:
      - m3
    cards:
      hand: []
      m3: [[Sunseed Twin]]
      gy:
        - [[Sunseed Genius Loci]]
        - [[Sunvine Sowing]]

  - say: Thrasher and Loci
    frames:
      - { type: summon, kind: Special, card: [[Sunvine Thrasher]], from: extra, to: m2, note: zone Dryas points to }
      - { type: summon, kind: Special, card: [[Sunseed Genius Loci]], from: gy, to: m1, note: empty side of Dryas }
    glow:
      - m2
      - m1
    cards:
      m1: [[Sunseed Genius Loci]]
      m2: [[Sunvine Thrasher]]
      gy:
        - [[Sunvine Sowing]]

  - say: Link Jasmine
    frames:
      - { type: link, card: [[Aromaseraphy Jasmine]], using: [[[Sunavalon Dryas]], [[Sunvine Thrasher]]], to: emzL }
    glow:
      - emzL
    cards:
      emzL: [[Aromaseraphy Jasmine]]
      m2: null
      gy:
        - [[Sunvine Sowing]]
        - [[Sunavalon Dryas]]
        - [[Sunvine Thrasher]]

  - say: Link Twin into Dryas
    frames:
      - { type: link, card: [[Sunavalon Dryas]], using: [[[Sunseed Twin]]], to: emzR }
    glow:
      - emzR
    cards:
      m3: null
      emzR: [[Sunavalon Dryas]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]

  - say: Link Loci into Healer
    frames:
      - { type: link, card: [[Sunvine Healer]], using: [[[Sunseed Genius Loci]]], to: m3, note: zone Jasmine points to }
    glow:
      - m3
    cards:
      m1: null
      m3: [[Sunvine Healer]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunseed Genius Loci]]

  - say: Healer gains 300
    frames:
      - { type: activate, card: [[Sunvine Healer]] }
      - { type: target, card: [[Sunavalon Dryas]] }
      - { type: gain, amount: 300 }
      - { type: hand, card: [[Therion "Lily" Borea]], note: Jasmine searches }
    glow:
      - m3
      - emzR
      - emzL
    cards:
      hand:
        - [[Therion "Lily" Borea]]

  - say: Lonefire under Jasmine
    frames:
      - { type: summon, kind: Special, card: [[Lonefire Blossom]], from: deck, to: m2, note: tribute Sunvine Healer }
    glow:
      - m2
    cards:
      m3: null
      m2: [[Lonefire Blossom]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunseed Genius Loci]]
        - [[Sunvine Healer]]

  - say: Summon Lily Borea
    frames:
      - { type: summon, kind: Special, card: [[Therion "Lily" Borea]], from: hand, to: m5, note: equip Sunseed Genius Loci }
    glow:
      - m5
    cards:
      hand: []
      m5: [[Therion "Lily" Borea]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunvine Healer]]

  - say: Borea searches Discolosseum
    frames:
      - { type: activate, card: [[Therion "Lily" Borea]], note: tribute the equipped Plant }
      - { type: hand, card: [[Therion Discolosseum]] }
    glow:
      - m5
    cards:
      hand:
        - [[Therion Discolosseum]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]

  - say: Discolosseum searches Regulus
    frames:
      - { type: activate, card: [[Therion Discolosseum]], to: field }
      - { type: hand, card: [[Therion "King" Regulus]] }
    glow:
      - field
    cards:
      field: [[Therion Discolosseum]]
      hand:
        - [[Therion "King" Regulus]]

  - say: Link Rosemary
    frames:
      - { type: link, card: [[Aromalilith Rosemary]], using: [[[Therion "Lily" Borea]], [[Aromaseraphy Jasmine]]], to: emzL }
    glow:
      - emzL
    cards:
      emzL: [[Aromalilith Rosemary]]
      m5: null
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Therion "Lily" Borea]]
        - [[Aromaseraphy Jasmine]]

  - say: Rosemary searches Blend
    frames:
      - { type: activate, card: [[Aromalilith Rosemary]], note: add Aroma Blend }
      - { type: hand, card: [[Aroma Blend]] }
    glow:
      - emzL
    cards:
      hand:
        - [[Therion "King" Regulus]]
        - [[Aroma Blend]]

  - say: Regulus on the far edge
    frames:
      - { type: summon, kind: Special, card: [[Therion "King" Regulus]], from: hand, to: m5, note: equip Therion Lily Borea }
    glow:
      - m5
    cards:
      hand:
        - [[Aroma Blend]]
      m5: [[Therion "King" Regulus]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]

  - say: Lonefire summons Evil Seed
    frames:
      - { type: activate, card: [[Lonefire Blossom]], note: tribute itself }
      - { type: summon, kind: Special, card: [[Ragnaraika the Evil Seed]], from: deck, to: m2 }
    glow:
      - m2
    cards:
      m2: [[Ragnaraika the Evil Seed]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Lonefire Blossom]]

  - say: Banish Samurai Beetle
    frames:
      - { type: activate, card: [[Ragnaraika the Evil Seed]] }
      - { type: hand, card: [[Ragnaraika Bloom]] }
      - { type: banish, card: [[Ragnaraika Samurai Beetle]], from: deck }
    glow:
      - m2
      - banished
    cards:
      hand:
        - [[Aroma Blend]]
        - [[Ragnaraika Bloom]]
      banished:
        - [[Ragnaraika Samurai Beetle]]

  - say: Bloom summons Beetle
    frames:
      - { type: activate, card: [[Ragnaraika Bloom]], note: summon the banished Beetle }
      - { type: summon, kind: Special, card: [[Ragnaraika Samurai Beetle]], from: banished, to: m4 }
    glow:
      - m4
    cards:
      hand:
        - [[Aroma Blend]]
      m4: [[Ragnaraika Samurai Beetle]]
      banished: []
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Lonefire Blossom]]
        - [[Ragnaraika Bloom]]

  - say: Link Jasmine again
    frames:
      - { type: link, card: [[Aromaseraphy Jasmine]], using: [[[Ragnaraika the Evil Seed]], [[Sunavalon Dryas]]], to: emzR }
    glow:
      - emzR
    cards:
      emzR: [[Aromaseraphy Jasmine]]
      m2: null
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Lonefire Blossom]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]

  - say: Place Humid Winds
    frames:
      - { type: activate, card: [[Aroma Blend]], note: discard any card }
      - { type: place, card: [[Humid Winds]], to: st3 }
    glow:
      - st3
    cards:
      hand: []
      st3: [[Humid Winds]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Lonefire Blossom]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Aroma Blend]]

  - say: Winds searches Rosalina
    frames:
      - { type: activate, card: [[Humid Winds]] }
      - { type: pay, amount: 1000 }
      - { type: hand, card: [[Aromalilith Rosalina]] }
    glow:
      - st3
    cards:
      hand:
        - [[Aromalilith Rosalina]]

  - say: Rosalina and Mudan
    frames:
      - { type: gain, amount: 500, note: Humid Winds }
      - { type: summon, kind: Special, card: [[Aromalilith Rosalina]], from: hand, to: m1, note: Rosemary summons }
      - { type: hand, card: [[Mudan the Rikka Fairy]], note: Jasmine searches }
    glow:
      - m1
      - emzL
      - emzR
    cards:
      hand:
        - [[Mudan the Rikka Fairy]]
      m1: [[Aromalilith Rosalina]]

  - say: Rosalina summons Laurel
    frames:
      - { type: summon, kind: Special, card: [[Aromage Laurel]], from: deck, to: m3 }
    glow:
      - m3
    cards:
      m3: [[Aromage Laurel]]

  - say: Skeletal Soldier
    frames:
      - { type: link, card: [[Ragnaraika Skeletal Soldier]], using: [[[Ragnaraika Samurai Beetle]], [[Aromaseraphy Jasmine]]], to: emzR }
      - { type: summon, kind: Special, card: [[Lonefire Blossom]], from: gy, to: m2, note: Beetle revives it }
    glow:
      - emzR
      - m2
    cards:
      emzR: [[Ragnaraika Skeletal Soldier]]
      m4: null
      m2: [[Lonefire Blossom]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunseed Twin]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Aroma Blend]]
        - [[Ragnaraika Samurai Beetle]]
        - [[Aromaseraphy Jasmine]]

  - say: Twin revives Jasmine
    frames:
      - { type: banish, card: [[Sunseed Twin]], from: gy }
      - { type: banish, card: [[Ragnaraika Skeletal Soldier]], from: field }
      - { type: summon, kind: Special, card: [[Aromaseraphy Jasmine]], from: gy, to: emzR }
    glow:
      - emzR
      - banished
    cards:
      emzR: [[Aromaseraphy Jasmine]]
      banished:
        - [[Sunseed Twin]]
        - [[Ragnaraika Skeletal Soldier]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Aroma Blend]]
        - [[Ragnaraika Samurai Beetle]]

  - say: Lonefire summons Petal
    frames:
      - { type: activate, card: [[Lonefire Blossom]], note: tribute itself }
      - { type: summon, kind: Special, card: [[Rikka Petal]], from: deck, to: m2 }
    glow:
      - m2
    cards:
      m2: [[Rikka Petal]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Aroma Blend]]
        - [[Ragnaraika Samurai Beetle]]
        - [[Lonefire Blossom]]

  - say: Petal searches Snowdrop
    frames:
      - { type: activate, card: [[Rikka Petal]], note: add Snowdrop the Rikka Fairy }
      - { type: hand, card: [[Snowdrop the Rikka Fairy]] }
    glow:
      - m2
    cards:
      hand:
        - [[Mudan the Rikka Fairy]]
        - [[Snowdrop the Rikka Fairy]]

  - say: Link Benghalancer
    frames:
      - { type: link, card: [[Benghalancer the Resurgent]], using: [[[Aromalilith Rosemary]], [[Aromage Laurel]]], to: emzL }
      - { type: gain, amount: 500, note: Laurel in the Graveyard }
      - { type: hand, card: [[Rikka Princess]], note: Jasmine searches }
    glow:
      - emzL
      - emzR
    cards:
      emzL: [[Benghalancer the Resurgent]]
      m3: null
      hand:
        - [[Mudan the Rikka Fairy]]
        - [[Snowdrop the Rikka Fairy]]
        - [[Rikka Princess]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Aroma Blend]]
        - [[Ragnaraika Samurai Beetle]]
        - [[Lonefire Blossom]]
        - [[Aromalilith Rosemary]]
        - [[Aromage Laurel]]

  - say: Mudan tributes Jasmine
    frames:
      - { type: summon, kind: Special, card: [[Mudan the Rikka Fairy]], from: hand, to: m3, note: tribute Aromaseraphy Jasmine }
      - { type: hand, card: [[Rikka Konkon]] }
    glow:
      - m3
    cards:
      emzR: null
      m3: [[Mudan the Rikka Fairy]]
      hand:
        - [[Snowdrop the Rikka Fairy]]
        - [[Rikka Princess]]
        - [[Rikka Konkon]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Aroma Blend]]
        - [[Ragnaraika Samurai Beetle]]
        - [[Lonefire Blossom]]
        - [[Aromalilith Rosemary]]
        - [[Aromage Laurel]]
        - [[Aromaseraphy Jasmine]]

  - say: Summon Rikka Princess
    frames:
      - { type: summon, kind: Special, card: [[Rikka Princess]], from: hand, to: m4 }
    glow:
      - m4
    cards:
      m4: [[Rikka Princess]]
      hand:
        - [[Snowdrop the Rikka Fairy]]
        - [[Rikka Konkon]]

  - say: Link Dancepione
    frames:
      - { type: link, card: [[Sylvan Dancepione]], using: [[[Rikka Princess]], [[Benghalancer the Resurgent]]], to: emzL, note: ignore the summon effect }
    glow:
      - emzL
    cards:
      emzL: [[Sylvan Dancepione]]
      m4: null
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Aroma Blend]]
        - [[Ragnaraika Samurai Beetle]]
        - [[Lonefire Blossom]]
        - [[Aromalilith Rosemary]]
        - [[Aromage Laurel]]
        - [[Aromaseraphy Jasmine]]
        - [[Rikka Princess]]
        - [[Benghalancer the Resurgent]]

  - say: Pointed monsters become Level 4
    frames:
      - { type: activate, card: [[Sylvan Dancepione]], note: choose Rikka Princess in the Graveyard }
      - { type: target, card: [[Aromalilith Rosalina]] }
      - { type: target, card: [[Mudan the Rikka Fairy]] }
    glow:
      - emzL
      - m1
      - m3

  - say: Link Strenna
    frames:
      - { type: link, card: [[Rikka Queen Strenna]], using: [[[Mudan the Rikka Fairy]], [[Aromalilith Rosalina]]], to: m3 }
    glow:
      - m3
    cards:
      m1: null
      m3: [[Rikka Queen Strenna]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Aroma Blend]]
        - [[Ragnaraika Samurai Beetle]]
        - [[Lonefire Blossom]]
        - [[Aromalilith Rosemary]]
        - [[Aromage Laurel]]
        - [[Aromaseraphy Jasmine]]
        - [[Rikka Princess]]
        - [[Benghalancer the Resurgent]]
        - [[Mudan the Rikka Fairy]]
        - [[Aromalilith Rosalina]]

  - say: Strenna adds Lonefire
    frames:
      - { type: activate, card: [[Rikka Queen Strenna]], note: detach a material }
      - { type: hand, card: [[Lonefire Blossom]], from: gy }
    glow:
      - m3
    cards:
      hand:
        - [[Snowdrop the Rikka Fairy]]
        - [[Rikka Konkon]]
        - [[Lonefire Blossom]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Aroma Blend]]
        - [[Ragnaraika Samurai Beetle]]
        - [[Aromalilith Rosemary]]
        - [[Aromage Laurel]]
        - [[Aromaseraphy Jasmine]]
        - [[Rikka Princess]]
        - [[Benghalancer the Resurgent]]
        - [[Mudan the Rikka Fairy]]
        - [[Aromalilith Rosalina]]

  - say: Snowdrop tributes Dancepione
    frames:
      - { type: summon, kind: Special, card: [[Snowdrop the Rikka Fairy]], from: hand, to: m1, note: tribute Sylvan Dancepione }
      - { type: summon, kind: Special, card: [[Lonefire Blossom]], from: hand, to: m4 }
    glow:
      - m1
      - m4
    cards:
      emzL: null
      m1: [[Snowdrop the Rikka Fairy]]
      m4: [[Lonefire Blossom]]
      hand:
        - [[Rikka Konkon]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Aroma Blend]]
        - [[Ragnaraika Samurai Beetle]]
        - [[Aromalilith Rosemary]]
        - [[Aromage Laurel]]
        - [[Aromaseraphy Jasmine]]
        - [[Rikka Princess]]
        - [[Benghalancer the Resurgent]]
        - [[Mudan the Rikka Fairy]]
        - [[Aromalilith Rosalina]]
        - [[Sylvan Dancepione]]

  - say: Rose Lover and Hyperyton
    frames:
      - { type: activate, card: [[Lonefire Blossom]], note: tribute Rikka Queen Strenna }
      - { type: summon, kind: Special, card: [[Rose Lover]], from: deck, to: m3 }
      - { type: summon, kind: Special, card: [[Sacred Tree Beast, Hyperyton]], from: extra, to: emzL, note: Strenna equips itself }
    glow:
      - emzL
      - m3
    cards:
      m3: [[Rose Lover]]
      emzL: [[Sacred Tree Beast, Hyperyton]]

  - say: Konkon chains Hyperyton
    frames:
      - { type: activate, card: [[Rikka Konkon]], to: st1 }
      - { type: chain, card: [[Sacred Tree Beast, Hyperyton]], n: 2, note: attach Therion Discolosseum }
    glow:
      - st1
      - emzL
    cards:
      hand: []
      st1: [[Rikka Konkon]]
      field: null

  - say: Set Rikka Sheet
    frames:
      - { type: set, card: [[Rikka Sheet]], from: deck, to: st5 }
    glow:
      - st5
    cards:
      st5: { name: [[Rikka Sheet]], set: true }

  - say: Everything becomes Level 8
    frames:
      - { type: activate, card: [[Snowdrop the Rikka Fairy]], note: target itself }
      - { type: target, card: [[Snowdrop the Rikka Fairy]] }
    glow:
      - m1

  - say: Xyz Teardrop
    frames:
      - { type: summon, kind: Xyz, card: [[Teardrop the Rikka Queen]], using: [[[Snowdrop the Rikka Fairy]], [[Rikka Petal]]], to: m2 }
    glow:
      - m2
    cards:
      m1: null
      m2: [[Teardrop the Rikka Queen]]

  - say: Summon Magnolia
    frames:
      - { type: activate, card: [[Aroma Blend]], from: gy }
      - { type: banish, card: [[Aroma Blend]] }
      - { type: link, card: [[Aromalilith Magnolia]], using: [[[Lonefire Blossom]], [[Sunvine Sowing]]], to: emzR }
    glow:
      - emzR
    cards:
      emzR: [[Aromalilith Magnolia]]
      m4: null
      banished:
        - [[Sunseed Twin]]
        - [[Ragnaraika Skeletal Soldier]]
        - [[Aroma Blend]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Ragnaraika Samurai Beetle]]
        - [[Aromalilith Rosemary]]
        - [[Aromage Laurel]]
        - [[Aromaseraphy Jasmine]]
        - [[Rikka Princess]]
        - [[Benghalancer the Resurgent]]
        - [[Mudan the Rikka Fairy]]
        - [[Aromalilith Rosalina]]
        - [[Sylvan Dancepione]]
        - [[Lonefire Blossom]]

  - say: Benghalancer returns
    frames:
      - { type: banish, card: [[Aromaseraphy Jasmine]], from: gy }
      - { type: summon, kind: Special, card: [[Benghalancer the Resurgent]], from: gy, to: m4 }
    glow:
      - m4
      - banished
    cards:
      m4: [[Benghalancer the Resurgent]]
      banished:
        - [[Sunseed Twin]]
        - [[Ragnaraika Skeletal Soldier]]
        - [[Aroma Blend]]
        - [[Aromaseraphy Jasmine]]
      gy:
        - [[Sunvine Sowing]]
        - [[Sunvine Thrasher]]
        - [[Sunvine Healer]]
        - [[Sunseed Genius Loci]]
        - [[Aromaseraphy Jasmine]]
        - [[Ragnaraika Bloom]]
        - [[Ragnaraika the Evil Seed]]
        - [[Sunavalon Dryas]]
        - [[Ragnaraika Samurai Beetle]]
        - [[Aromalilith Rosemary]]
        - [[Aromage Laurel]]
        - [[Rikka Princess]]
        - [[Mudan the Rikka Fairy]]
        - [[Aromalilith Rosalina]]
        - [[Sylvan Dancepione]]
        - [[Lonefire Blossom]]
```
