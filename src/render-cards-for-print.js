#!/usr/bin/env node
/**
 * Render full card layouts (with text) as images for printing
 * Uses Puppeteer to screenshot cards from a local HTML file
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const OUTPUT_DIR = path.join(DOCS_DIR, 'cards-tgc');

// Card dimensions for TGC tarot: 900x1500 px (2.75" x 4.75" at ~327 DPI with bleed)
const CARD_WIDTH = 900;
const CARD_HEIGHT = 1500;

// All card IDs in order
const cardIds = [
  'stage-01', 'stage-02', 'stage-03', 'stage-04',
  'op-01', 'op-02', 'op-03', 'op-04', 'op-05', 'op-06', 'op-07',
  'elem-01', 'elem-02', 'elem-03', 'elem-04', 'elem-05',
  'prin-01', 'prin-02', 'prin-03',
  'vessel-01', 'vessel-02', 'vessel-03', 'vessel-04',
  'sage-01', 'sage-02', 'sage-03', 'sage-04', 'sage-05', 'sage-06',
  'arc-01', 'arc-02', 'arc-03', 'arc-04', 'arc-05'
];

// Selected versions - use V4 (square 1:1) for all cards
// Version options: "cards" (v2), "cards-v1", "cards-v3", "cards-v4"
const selectedVersions = {
  "stage-01": "cards-v4", "stage-02": "cards-v4", "stage-03": "cards-v4", "stage-04": "cards-v4",
  "op-01": "cards-v4", "op-02": "cards-v4", "op-03": "cards-v4", "op-04": "cards-v4",
  "op-05": "cards-v4", "op-06": "cards-v4", "op-07": "cards-v4",
  "elem-01": "cards-v4", "elem-02": "cards-v4", "elem-03": "cards-v4", "elem-04": "cards-v4", "elem-05": "cards-v4",
  "prin-01": "cards-v4", "prin-02": "cards-v4", "prin-03": "cards-v4",
  "vessel-01": "cards-v4", "vessel-02": "cards-v4", "vessel-03": "cards-v4", "vessel-04": "cards-v4",
  "sage-01": "cards-v4", "sage-02": "cards-v4", "sage-03": "cards-v4", "sage-04": "cards-v4", "sage-05": "cards-v4", "sage-06": "cards-v4",
  "arc-01": "cards-v4", "arc-02": "cards-v4", "arc-03": "cards-v4", "arc-04": "cards-v4", "arc-05": "cards-v4"
};

// Card data (matching print.html)
const cards = [
  { id: "stage-01", type: "stage", subtype: "nigredo", category: "Stage", title: "Nigredo", subtitle: "Blackening",
    prompt: "The first stage of transformation. Something must die for the new to be born. What needs to end? What shadow are you avoiding? The dark night holds the seed of dawn.",
    quote: '"I am black, white, yellow, and red." —Maier' },
  { id: "stage-02", type: "stage", subtype: "albedo", category: "Stage", title: "Albedo", subtitle: "Whitening",
    prompt: "Purification after darkness. The impurities wash away, revealing what was hidden beneath. What clarity is emerging? What false beliefs are dissolving?",
    quote: '"Water purifies all imperfect things." —Sendivogius' },
  { id: "stage-03", type: "stage", subtype: "citrinitas", category: "Stage", title: "Citrinitas", subtitle: "Yellowing",
    prompt: "Solar consciousness awakens. After purification comes illumination—the first glimpse of wisdom. What insight is breaking through? What understanding is dawning?",
    quote: '"The vulture cries: I am white and black, yellow and red." —Maier' },
  { id: "stage-04", type: "stage", subtype: "rubedo", category: "Stage", title: "Rubedo", subtitle: "Reddening",
    prompt: "The Great Work complete. Opposites unite, the self becomes whole. Integration of all that was separated. What would wholeness look like here?",
    quote: '"The fixed becomes volatile; the volatile, fixed." —Khunrath' },
  { id: "op-01", type: "operation", category: "Operation", title: "Calcination", subtitle: "Burning",
    prompt: "Reduction by fire. Ego attachments, false identities, outdated beliefs—all fuel for the flames. What must be burned away?",
    quote: '"All impurities are purified by fire." —Sendivogius' },
  { id: "op-02", type: "operation", category: "Operation", title: "Dissolution", subtitle: "Dissolving",
    prompt: "Letting go into the waters. Rigid structures soften, defenses melt, emotions finally flow. Where are you holding too tightly?",
    quote: '"Water joins together everything dissolved." —Sendivogius' },
  { id: "op-03", type: "operation", category: "Operation", title: "Separation", subtitle: "Discerning",
    prompt: "Sorting the essential from the inessential. Not all that dissolved belongs together. What serves your growth? What must be left behind?",
    quote: '"Fire separates everything that is joined." —Sendivogius' },
  { id: "op-04", type: "operation", category: "Operation", title: "Conjunction", subtitle: "Uniting",
    prompt: "The sacred marriage within. What was separated now reunites at a higher level. Masculine and feminine, light and shadow, mind and heart.",
    quote: '"The animated spirit is joined to the body." —Khunrath' },
  { id: "op-05", type: "operation", category: "Operation", title: "Fermentation", subtitle: "Inspiring",
    prompt: "New life from decay. The breakdown creates conditions for breakthrough. Crisis becomes catalyst. What inspiration is arising from difficulty?",
    quote: '"Nature gives motion, motion excites fire." —Sendivogius' },
  { id: "op-06", type: "operation", category: "Operation", title: "Distillation", subtitle: "Refining",
    prompt: "Repeated cycles of purification. Rise, condense, return, rise again. Each pass extracts more essence. What needs further refinement?",
    quote: '"The tincture represents the Soul." —Drebbel' },
  { id: "op-07", type: "operation", category: "Operation", title: "Coagulation", subtitle: "Manifesting",
    prompt: "Spirit takes form. The refined essence crystallizes into reality. Insight becomes action, vision becomes creation. What is ready to manifest?",
    quote: '"Let it slowly coagulate in a warm place." —Drebbel' },
  { id: "elem-01", type: "element", subtype: "fire", category: "Element", title: "Fire", subtitle: "Will",
    prompt: "The principle of transformation and will. Fire purifies, energizes, and destroys what cannot withstand truth. Where do you need more fire?",
    quote: '"Fire acts in wonderful hidden ways." —Sendivogius' },
  { id: "elem-02", type: "element", subtype: "water", category: "Element", title: "Water", subtitle: "Emotion",
    prompt: "The principle of feeling and intuition. Water dissolves, cleanses, and connects. It flows around obstacles. What emotions need honoring?",
    quote: '"Water purifies all imperfect things." —Sendivogius' },
  { id: "elem-03", type: "element", subtype: "air", category: "Element", title: "Air", subtitle: "Thought",
    prompt: "The principle of mind and communication. Air carries words, ideas, and breath itself. What needs to be said? What thoughts seek expression?",
    quote: '"Motion excites air, air excites fire." —Sendivogius' },
  { id: "elem-04", type: "element", subtype: "earth", category: "Element", title: "Earth", subtitle: "Body",
    prompt: "The principle of matter and manifestation. Earth grounds, stabilizes, and gives form. What is the physical reality here? What needs grounding?",
    quote: '"Earth receives the Tincture." —Sendivogius' },
  { id: "elem-05", type: "element", subtype: "quintessence", category: "Element", title: "Quintessence", subtitle: "Spirit",
    prompt: "The fifth element, beyond the four. The eternal essence that animates all matter. What is the spiritual dimension here?",
    quote: '"The Quintessence is eternal, immutable." —Drebbel' },
  { id: "prin-01", type: "principle", category: "Principle", title: "Sulphur", subtitle: "Soul",
    prompt: "The combustible principle—what burns, desires, and animates. The soul's fire, the driving force within. What does your soul truly want here?",
    quote: '"Sulphur, Salt, Mercury—the three called Prima Materia." —Paracelsus' },
  { id: "prin-02", type: "principle", category: "Principle", title: "Mercury", subtitle: "Spirit",
    prompt: "The volatile principle—what moves, mediates, and transforms. The messenger between realms. What is in flux? What message is trying to get through?",
    quote: '"From living quicksilver comes the prima materia." —Rosicrucian MS' },
  { id: "prin-03", type: "principle", category: "Principle", title: "Salt", subtitle: "Body",
    prompt: "The fixed principle—what remains, preserves, and gives form. The body that contains soul and spirit. What is the structure here?",
    quote: '"The Sun is fire, salt, and base." —Paracelsus' },
  { id: "vessel-01", type: "vessel", category: "Vessel", title: "Athanor", subtitle: "The Furnace",
    prompt: "The furnace of slow, steady heat. Transformation requires sustained warmth over time. Where is patience the path?",
    quote: '"With one Athanor furnace; and one fire." —Khunrath' },
  { id: "vessel-02", type: "vessel", category: "Vessel", title: "Alembic", subtitle: "The Still",
    prompt: "The vessel of distillation. Vapors rise, condense, and the essence is collected drop by drop. What is the essential truth?",
    quote: '"Extract tincture from the cucurbit." —Drebbel' },
  { id: "vessel-03", type: "vessel", category: "Vessel", title: "Crucible", subtitle: "The Test",
    prompt: "The vessel of trial by fire. Here matter is tested and proved. Only what is genuine survives. What is being tested?",
    quote: '"The body dies, turns black, reduced to ashes." —Khunrath' },
  { id: "vessel-04", type: "vessel", category: "Vessel", title: "Retort", subtitle: "The Return",
    prompt: "The vessel of circulation. What rises must return to the body, again and again. What keeps returning?",
    quote: '"It begins where it ends." —Hermes' },
  { id: "sage-01", type: "sage", category: "Sage", title: "Hermes", subtitle: "Trismegistus",
    prompt: "As above, so below. The legendary founder taught that the macrocosm mirrors the microcosm. What pattern reflects a larger truth?",
    quote: '"Man bore the image of his father." —Pymander' },
  { id: "sage-02", type: "sage", category: "Sage", title: "Paracelsus", subtitle: "The Physician",
    prompt: "Nature is the teacher; experience over authority. The radical physician sought medicine hidden in nature. What does direct experience teach?",
    quote: '"These three are Prima Materia, like God." —Paracelsus' },
  { id: "sage-03", type: "sage", category: "Sage", title: "Boehme", subtitle: "The Mystic",
    prompt: "The divine spark in ordinary life. A shoemaker's vision revealed spirit hidden in matter. Where is the sacred in your everyday?",
    quote: '"Heaven is the Sea of Fire, from the 7 Spirits." —Aurora' },
  { id: "sage-04", type: "sage", category: "Sage", title: "Ficino", subtitle: "The Translator",
    prompt: "Beauty leads the soul upward. The philosopher who revived Hermes taught that love of beauty opens the path to wisdom.",
    quote: '"Hermes attempted to eradicate this stain from souls." —On Pleasure' },
  { id: "sage-05", type: "sage", category: "Sage", title: "Sendivogius", subtitle: "The Adept",
    prompt: "Work with nature, not against it. The practical adept taught that nature's secret fire works in hidden ways.",
    quote: '"Fire acts in wonderful hidden ways." —New Chemical Light' },
  { id: "sage-06", type: "sage", category: "Sage", title: "Agrippa", subtitle: "The Magus",
    prompt: "Hidden correspondences connect all things. The magus mapped the occult virtues linking stars, stones, plants, and souls.",
    quote: '"God impresses the seal of Ideas upon Intelligences." —Occult Philosophy' },
  { id: "arc-01", type: "arcana", category: "Arcana", title: "Prima Materia", subtitle: "First Matter",
    prompt: "The raw material before the work begins. Chaos, potential, the formless substance from which all emerges. What raw potential awaits?",
    quote: '"The Prima Materia is a divine mist." —Hellwig' },
  { id: "arc-02", type: "arcana", category: "Arcana", title: "Lapis", subtitle: "The Stone",
    prompt: "The goal of the Great Work. The perfected self that transforms everything it touches. What does completion mean here?",
    quote: '"He is praised in the Emerald Tablet... the living fire." —Hellwig' },
  { id: "arc-03", type: "arcana", category: "Arcana", title: "Ouroboros", subtitle: "Eternal Return",
    prompt: "The serpent eating its tail. Endings become beginnings, destruction feeds creation. What cycle is ending and beginning?",
    quote: '"It begins where it ends." —Hermes' },
  { id: "arc-04", type: "arcana", category: "Arcana", title: "Rebis", subtitle: "The Double",
    prompt: "The union of opposites in one being. Not compromise but integration—both/and rather than either/or. What dualities seek reconciliation?",
    quote: '"Man bore the image of his father." —Pymander' },
  { id: "arc-05", type: "arcana", category: "Arcana", title: "Elixir", subtitle: "The Medicine",
    prompt: "The universal medicine that heals all ills. The perfected tincture that restores wholeness. What healing is needed?",
    quote: '"The tincture heals all diseases... represents the Soul." —Drebbel' }
];

// Category color styles - ONE color per set
const categoryStyles = {
  stage:     { bg: 'linear-gradient(to bottom, #2d1f3d, #1f1629)', color: '#c084fc' },  // Purple
  operation: { bg: 'linear-gradient(to bottom, #4d2a10, #3d2008)', color: '#ff8c42' },  // Orange
  element:   { bg: 'linear-gradient(to bottom, #1a3d3a, #132d2b)', color: '#4ecdc4' },  // Teal
  principle: { bg: 'linear-gradient(to bottom, #4a3d10, #3d3008)', color: '#ffd166' },  // Gold
  vessel:    { bg: 'linear-gradient(to bottom, #3d2a1a, #2d1f13)', color: '#d4a574' },  // Copper
  sage:      { bg: 'linear-gradient(to bottom, #1a2a3d, #131f2d)', color: '#60a5fa' },  // Blue
  arcana:    { bg: 'linear-gradient(to bottom, #3d1a3d, #2d132d)', color: '#e879f9' }   // Magenta
};

// Platonic solids for elements (for reference in prompts)
// Fire → Tetrahedron (4 faces)
// Water → Icosahedron (20 faces)
// Air → Octahedron (8 faces)
// Earth → Cube (6 faces)
// Quintessence → Dodecahedron (12 faces)

function getStyle(card) {
  return categoryStyles[card.type];
}

function generateCardHTML(card) {
  const style = getStyle(card);
  const imageFolder = selectedVersions[card.id];
  const imagePath = `${imageFolder}/${card.id}.png`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      overflow: hidden;
      font-family: 'Cormorant Garamond', serif;
    }
    .card {
      width: 100%;
      height: 100%;
      background: #0d0a08;
      display: flex;
      flex-direction: column;
      border-radius: 40px;
      overflow: hidden;
    }
    .artwork {
      height: 60%;  /* 900px of 1500px card height */
      overflow: hidden;
      background: linear-gradient(135deg, #2a2420 0%, #1a1612 100%);
    }
    .artwork img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .text-panel {
      padding: 28px 36px 16px;
      background: ${style.bg};
      border-top: 6px solid rgba(212, 175, 55, 0.5);
    }
    .category {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 8px;
      color: ${style.color};
    }
    .title {
      font-family: 'Cinzel', serif;
      font-size: 52px;
      font-weight: 600;
      color: #fff;
      line-height: 1.1;
      letter-spacing: 0.02em;
    }
    .subtitle {
      font-family: 'Cormorant Garamond', serif;
      font-size: 34px;
      font-style: italic;
      color: rgba(255,255,255,0.65);
      margin-top: 6px;
      letter-spacing: 0.02em;
    }
    .prompt-area {
      padding: 24px 36px;
      font-size: 30px;
      line-height: 1.45;
      color: rgba(255,255,255,0.92);
      flex: 1;
      background: ${style.bg};
      font-family: 'Cormorant Garamond', serif;
      font-weight: 500;
    }
    .quote {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      color: #d4af37;
      font-size: 24px;
      padding: 18px 36px 28px;
      background: ${style.bg};
      border-top: 3px solid rgba(212, 175, 55, 0.25);
      line-height: 1.35;
      letter-spacing: 0.01em;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="artwork">
      <img src="${imagePath}" alt="${card.title}">
    </div>
    <div class="text-panel">
      <div class="category">${card.category}</div>
      <div class="title">${card.title}</div>
      <div class="subtitle">${card.subtitle}</div>
    </div>
    <div class="prompt-area">${card.prompt}</div>
    <div class="quote">${card.quote}</div>
  </div>
</body>
</html>`;
}

async function renderCards() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: CARD_WIDTH, height: CARD_HEIGHT, deviceScaleFactor: 1 });

  console.log(`Rendering ${cards.length} cards to ${OUTPUT_DIR}...\n`);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const html = generateCardHTML(card);
    const outputPath = path.join(OUTPUT_DIR, `${card.id}.png`);

    // Write temp HTML file so images can load with relative paths
    const tempHtmlPath = path.join(DOCS_DIR, `_temp_card_${card.id}.html`);
    fs.writeFileSync(tempHtmlPath, html);

    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: outputPath, type: 'png' });

    fs.unlinkSync(tempHtmlPath); // Clean up

    console.log(`[${i + 1}/${cards.length}] ${card.title}`);
  }

  await browser.close();
  console.log('\nDone! Cards saved to docs/cards-tgc/');
}

renderCards().catch(console.error);
