import { parseCombo } from "../src/model";
import { SAMPLE_SOURCE, VERSUS_SOURCE } from "../src/sample";
import { mountCombo } from "../src/view";

const ART: Record<string, string> = {
  "sunseed genius loci": "27520594",
  "sunvine sowing": "53286626",
  "sunavalon dryas": "93896655",
  "sunseed twin": "66407907",
  "sunvine thrasher": "91557476",
  "skill drain": "82732705",
  "barrier statue of the stormwinds": "73356503",
  "lightning storm": "14532163",
  "ash blossom & joyous spring": "14558127",
};

function mountSample(id: string, source: string) {
  const node = document.getElementById(id);
  const parsed = parseCombo(source);
  if (!node || !parsed.ok) return;
  mountCombo(node, parsed.doc, (name) => {
    const passcode = ART[name.trim().toLowerCase()];
    return passcode ? `https://images.ygoprodeck.com/images/cards/${passcode}.jpg` : null;
  });
}

mountSample("own", SAMPLE_SOURCE);
mountSample("versus", VERSUS_SOURCE);
