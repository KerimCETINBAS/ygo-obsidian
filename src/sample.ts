export const BOARD_SOURCE = `board: own
glow1:
  - emzL
cards:
  emzL: [[Sunavalon Dryas]]
  m3: [[Sunseed Genius Loci]]
`;

export const CARDS_SOURCE = `[Sunseed Genius Loci]
[Sunavalon Dryas]
[Sunvine Thrasher]
`;

export const DECK_SOURCE = `#created by ComboBuilder
#main
27520594
27520594
27520594
66407907
66407907
66407907
53286626
53286626
53286626
14558127
14558127
14558127
14532163
14532163
82732705
82732705
82732705
#extra
93896655
93896655
93896655
91557476
91557476
91557476
#side
73356503
73356503
73356503
14532163
`;

export const SAMPLE_SOURCE = `# Zones you leave out stay as they were.
# glow is placed by hand and only shows on this step. glow1 effect, glow2 target, glow3 summon, glow4 tribute.
name: Sunavalon
board: own
steps:
  - say: Opening hand
    frames:
      - { type: hand, card: [[Sunseed Genius Loci]] }
      - { type: hand, card: [[Sunvine Sowing]] }
    lines:
      - Sunseed Genius Loci and Sunvine Sowing in hand
    cards:
      hand:
        - [[Sunseed Genius Loci]]
        - [[Sunvine Sowing]]

  - say: Normal summon Loci
    frames:
      - { type: summon, kind: Normal, card: [[Sunseed Genius Loci]], from: hand }
    lines:
      - summon Sunseed Genius Loci to m3
    glow:
      - m3
    cards:
      hand:
        - [[Sunvine Sowing]]
      m3: [[Sunseed Genius Loci]]

  - say: Link Dryas
    frames:
      - { type: link, card: [[Sunavalon Dryas]], using: [[[Sunseed Genius Loci]]], to: EMZ }
    lines:
      - link Sunavalon Dryas using [Sunseed Genius Loci] to emz-left
    glow:
      - emzL
    cards:
      m3: null
      emzL: [[Sunavalon Dryas]]

  - say: Activate Sowing
    frames:
      - { type: activate, card: [[Sunvine Sowing]] }
    lines:
      - activate Sunvine Sowing
    glow:
      - st3
    cards:
      hand: []
      st3: [[Sunvine Sowing]]

  - say: Resolve Sowing
    frames:
      - { type: summon, kind: Special, card: [[Sunseed Twin]], from: deck }
      - { type: pay, amount: 1000 }
    lines:
      - summon Sunseed Twin from deck
      - pay 1000
    glow:
      - m2
    cards:
      m2: [[Sunseed Twin]]

  - say: Chain Twin, Dryas chains
    frames:
      - { type: activate, card: [[Sunseed Twin]] }
      - { type: target, card: [[Sunseed Genius Loci]] }
      - { type: chain, card: [[Sunavalon Dryas]], n: 2 }
    lines:
      - activate Sunseed Twin
      - target Sunseed Genius Loci
      - chain Sunavalon Dryas
    glow:
      - m2
      - emzL

  - say: Resolve Dryas
    frames:
      - { type: summon, kind: Special, card: [[Sunvine Thrasher]], from: extra }
      - { type: gain, amount: 1000 }
    lines:
      - summon Sunvine Thrasher from extra
      - gain 1000
    glow:
      - m4
    cards:
      m4: [[Sunvine Thrasher]]

  - say: Resolve Twin
    frames:
      - { type: summon, kind: Special, card: [[Sunseed Genius Loci]], from: gy }
    lines:
      - summon Sunseed Genius Loci from gy
    glow:
      - m1
    cards:
      m1: [[Sunseed Genius Loci]]

  - say: Activate Dryas
    frames:
      - { type: activate, card: [[Sunavalon Dryas]] }
    lines:
      - activate Sunavalon Dryas
    glow:
      - emzL
`;

export const VERSUS_SOURCE = `name: Into a floodgate
board: versus
steps:
  - say: They have Skill Drain
    frames:
      - { type: set, card: [[Skill Drain]] }
      - { type: place, card: [[Barrier Statue of the Stormwinds]] }
    lines:
      - opponent set Skill Drain
    cards:
      oppSt3: { name: [[Skill Drain]], set: true }
      oppM3: [[Barrier Statue of the Stormwinds]]
      hand:
        - [[Lightning Storm]]
        - [[Ash Blossom & Joyous Spring]]

  - say: Lightning Storm
    frames:
      - { type: activate, card: [[Lightning Storm]] }
      - { type: banish, card: [[Skill Drain]], from: field }
    lines:
      - activate Lightning Storm
      - banish Skill Drain from field
    glow:
      - hand
    cards:
      hand:
        - [[Ash Blossom & Joyous Spring]]
      oppSt3: null
      banished:
        - [[Skill Drain]]
`;
