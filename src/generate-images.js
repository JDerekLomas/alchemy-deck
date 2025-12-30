#!/usr/bin/env node
/**
 * Alchemy Deck - Image Generator
 *
 * Generates artwork for all cards using Replicate's Flux model.
 *
 * Usage:
 *   REPLICATE_API_TOKEN=xxx node src/generate-images.js
 *   REPLICATE_API_TOKEN=xxx node src/generate-images.js --card stage-01
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const MODEL = "black-forest-labs/flux-1.1-pro";
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'deck-artwork');
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'cards');

// Base style for all cards - alchemical engraving aesthetic
const BASE_STYLE = `Detailed alchemical engraving illustration, hand-tinted with muted earth tones and gold accents, intricate crosshatching and fine linework, ornate art nouveau border with mystical symbols, aged parchment texture, Renaissance woodcut aesthetic meets art deco elegance. Central symbolic image with geometric sacred geometry elements. No text, no letters, no words.`;

// ============================================================================
// CARD DEFINITIONS WITH PROMPTS
// ============================================================================

const CARDS = [
  // STAGES
  {
    id: 'stage-01',
    name: 'Nigredo',
    prompt: `${BASE_STYLE} Central image: A crow perched on a skull atop a dark mound, black sun eclipsing behind, smoke rising. Border contains: tomb, rotting matter becoming soil, descent into cave, dark moon phases. Color palette: deep blacks, charcoal grays, hints of dark purple. Mood: somber, transformative darkness.`
  },
  {
    id: 'stage-02',
    name: 'Albedo',
    prompt: `${BASE_STYLE} Central image: White dove rising from waters, silver moon reflected in still pool, white lily blooming. Border contains: washing hands, mirror reflection, white rose, swan, morning mist. Color palette: silver, pearl white, pale blue, soft gray. Mood: purification, clarity emerging.`
  },
  {
    id: 'stage-03',
    name: 'Citrinitas',
    prompt: `${BASE_STYLE} Central image: Golden sunrise over mountain peak, awakening eye opening, yellow roses in bloom. Border contains: dawn breaking, solar rays, peacock displaying colors, golden chalice, awakening lion. Color palette: warm yellows, gold, amber, touches of orange. Mood: dawning wisdom, solar consciousness.`
  },
  {
    id: 'stage-04',
    name: 'Rubedo',
    prompt: `${BASE_STYLE} Central image: Phoenix rising from flames, red king and white queen united, philosopher's stone glowing red. Border contains: crowned heart, red rose, completed circle, rising sun at zenith, marriage symbols. Color palette: deep reds, crimson, gold, royal purple. Mood: completion, integration, achievement.`
  },

  // OPERATIONS
  {
    id: 'op-01',
    name: 'Calcination',
    prompt: `${BASE_STYLE} Central image: Matter burning in alchemical fire, ego dissolving into ash, phoenix nest aflame. Border contains: flames consuming, desert sun, volcanic fire, burnt remains becoming fertile. Color palette: orange flames, red heat, black ash, glowing embers. Mood: purifying destruction, necessary burning.`
  },
  {
    id: 'op-02',
    name: 'Dissolution',
    prompt: `${BASE_STYLE} Central image: Solid form dissolving into water, tears flowing into ocean, ice melting into stream. Border contains: rain falling, salt dissolving, waves eroding stone, emotional release. Color palette: deep blues, aqua, silver tears, flowing forms. Mood: surrender, emotional flooding, letting go.`
  },
  {
    id: 'op-03',
    name: 'Separation',
    prompt: `${BASE_STYLE} Central image: Alchemist separating substances with precise instruments, wheat from chaff, gold from dross. Border contains: sieve filtering, scales balancing, forked path, sorting hands. Color palette: contrasting light and dark, clear divisions, sharp edges. Mood: discernment, clarity of choice.`
  },
  {
    id: 'op-04',
    name: 'Conjunction',
    prompt: `${BASE_STYLE} Central image: Sacred marriage of sun and moon, king and queen embracing, two becoming one. Border contains: intertwined serpents (caduceus), yin-yang, wedding rings, merged flames. Color palette: gold and silver united, rose and white, harmonious blend. Mood: union, sacred marriage, integration.`
  },
  {
    id: 'op-05',
    name: 'Fermentation',
    prompt: `${BASE_STYLE} Central image: New life sprouting from decay, grape becoming wine, bread rising with yeast. Border contains: mushrooms on dead wood, butterfly emerging, germinating seed, bubbling vessel. Color palette: living greens, purples of wine, warm ferment browns. Mood: inspiration, vital spark, new life from death.`
  },
  {
    id: 'op-06',
    name: 'Distillation',
    prompt: `${BASE_STYLE} Central image: Alembic with vapor rising and condensing, essence being extracted drop by drop. Border contains: morning dew, refined spirit ascending, mountain peak, crystal clarity. Color palette: ethereal whites, clear blues, concentrated essence. Mood: refinement, purification, extracting essence.`
  },
  {
    id: 'op-07',
    name: 'Coagulation',
    prompt: `${BASE_STYLE} Central image: Crystalline form solidifying, spirit becoming matter, stone manifesting from light. Border contains: crystal growing, seed becoming tree, vision becoming reality, solid foundation. Color palette: earth browns, crystalline forms, solid golds. Mood: manifestation, incarnation, making real.`
  },

  // ELEMENTS
  {
    id: 'elem-01',
    name: 'Fire',
    prompt: `${BASE_STYLE} Central image: Sacred flame on altar, salamander in fire, transforming blaze. Triangle pointing upward as central geometric form. Border contains: candle, forge, lightning, burning bush, volcanic eruption. Color palette: reds, oranges, yellows, fierce flames. Mood: will, transformation, passionate action.`
  },
  {
    id: 'elem-02',
    name: 'Water',
    prompt: `${BASE_STYLE} Central image: Deep pool reflecting moon, undine water spirit, flowing stream. Triangle pointing downward as central geometric form. Border contains: rain, tears, ocean waves, well depth, flowing springs. Color palette: deep blues, silver, aquamarine, flowing forms. Mood: emotion, intuition, receptive depth.`
  },
  {
    id: 'elem-03',
    name: 'Air',
    prompt: `${BASE_STYLE} Central image: Wind moving through clouds, sylph air spirit, breath visible in cold. Triangle with horizontal line as central form. Border contains: feathers floating, birds in flight, windmill, incense smoke rising. Color palette: pale blues, white clouds, ethereal yellows. Mood: thought, communication, intellectual clarity.`
  },
  {
    id: 'elem-04',
    name: 'Earth',
    prompt: `${BASE_STYLE} Central image: Mountain rooted deep, gnome earth spirit, fertile soil with seeds. Inverted triangle with line as central form. Border contains: tree roots, crystals in cave, harvest grain, stone foundation. Color palette: rich browns, forest greens, terracotta, stone grays. Mood: grounding, stability, material form.`
  },
  {
    id: 'elem-05',
    name: 'Quintessence',
    prompt: `${BASE_STYLE} Central image: Eight-pointed star radiating light, ethereal spirit pervading all, heaven meeting earth. Border contains: starry cosmos, divine light rays, all four elements unified, cosmic egg. Color palette: deep purple, gold light, cosmic blues, ethereal white. Mood: transcendence, spirit, the fifth element.`
  },

  // PRINCIPLES
  {
    id: 'prin-01',
    name: 'Sulphur',
    prompt: `${BASE_STYLE} Central image: Solar lion breathing fire, burning yellow stone, the soul's desire. Sun symbol prominent. Border contains: flames of desire, active force, masculine sun, combustible spirit. Color palette: sulfur yellows, fiery oranges, solar gold. Mood: soul, desire, the combustible principle.`
  },
  {
    id: 'prin-02',
    name: 'Mercury',
    prompt: `${BASE_STYLE} Central image: Winged serpent, quicksilver flowing, messenger between realms. Mercury/Hermes symbol prominent. Border contains: caduceus, fluid motion, androgynous figure, volatile spirit. Color palette: silver mercury, iridescent, shifting hues. Mood: spirit, messenger, volatility, connection.`
  },
  {
    id: 'prin-03',
    name: 'Salt',
    prompt: `${BASE_STYLE} Central image: Cubic crystal formation, preserved body, crystallized essence. Circle with horizontal line (salt symbol). Border contains: cube, bones preserved, sea salt, fixed form, crystalline structure. Color palette: white crystals, pale earth, stable grays. Mood: body, fixity, preservation, form.`
  },

  // VESSELS
  {
    id: 'vessel-01',
    name: 'Athanor',
    prompt: `${BASE_STYLE} Central image: Tower furnace with eternal flame, slow-burning alchemical oven, patient fire. Border contains: hourglass, steady flame, brick tower, philosophical egg warming. Color palette: warm oranges, brick red, steady glow. Mood: patience, sustained effort, slow transformation.`
  },
  {
    id: 'vessel-02',
    name: 'Alembic',
    prompt: `${BASE_STYLE} Central image: Glass distillation apparatus with vapor rising and condensing, drops of pure essence. Border contains: ascending vapor, descending liquid, purified drops, refined spirit. Color palette: clear glass, ethereal vapor, pure drops. Mood: refinement, purification, essence extraction.`
  },
  {
    id: 'vessel-03',
    name: 'Crucible',
    prompt: `${BASE_STYLE} Central image: Glowing crucible under intense heat, materials being tested by fire. Border contains: trials by fire, testing forge, molten metal, endurance under pressure. Color palette: glowing red, molten orange, dark iron. Mood: testing, trial, proving strength.`
  },
  {
    id: 'vessel-04',
    name: 'Retort',
    prompt: `${BASE_STYLE} Central image: Curved vessel with substance circulating, rising and returning in endless cycle. Border contains: circular flow, ouroboros, return journey, pelican feeding young. Color palette: warm amber, circulation paths, returning flows. Mood: circulation, return, reflective cycle.`
  },

  // SAGES
  {
    id: 'sage-01',
    name: 'Hermes',
    prompt: `${BASE_STYLE} Central image: Hermes Trismegistus holding emerald tablet, stars above and earth below reflecting each other. Border contains: caduceus, emerald tablet, "as above so below" symbolism, Egyptian-Greek fusion. Color palette: emerald green, cosmic gold, mystical purple. Mood: ancient wisdom, cosmic correspondence.`
  },
  {
    id: 'sage-02',
    name: 'Paracelsus',
    prompt: `${BASE_STYLE} Central image: Physician-alchemist with sword and book, nature's secrets being revealed. Border contains: medicinal plants, chemical vessels, nature teaching, healing arts. Color palette: earth tones, medicinal greens, practical browns. Mood: natural wisdom, healing knowledge, practical magic.`
  },
  {
    id: 'sage-03',
    name: 'Boehme',
    prompt: `${BASE_STYLE} Central image: Cobbler with divine light illuminating his vision, aurora dawning in his soul. Border contains: divine eye, mystical dawn, inner light, tree of life and knowledge. Color palette: aurora colors, divine gold, mystical purples. Mood: mystical vision, divine spark, inner illumination.`
  },
  {
    id: 'sage-04',
    name: 'Ficino',
    prompt: `${BASE_STYLE} Central image: Scholar translating ancient texts, soul ascending through celestial spheres. Border contains: Platonic solids, planetary spheres, beauty and harmony, lyre of Orpheus. Color palette: celestial blues, scholarly browns, harmonic golds. Mood: philosophical beauty, soul's journey, translation.`
  },
  {
    id: 'sage-05',
    name: 'Sendivogius',
    prompt: `${BASE_STYLE} Central image: Alchemist revealing clear practical teachings, new light dawning on the art. Border contains: clear flask, seed growing into gold, practical implements, light of understanding. Color palette: clear light, practical earth tones, revealing gold. Mood: practical wisdom, clear teaching, new light.`
  },
  {
    id: 'sage-06',
    name: 'Agrippa',
    prompt: `${BASE_STYLE} Central image: Magus with three books representing natural, celestial, ceremonial magic. Border contains: magical symbols, pentagram, planetary seals, hidden correspondences. Color palette: mystical purples, magical blacks, symbol gold. Mood: occult philosophy, hidden forces, magical correspondence.`
  },

  // ARCANA
  {
    id: 'arc-01',
    name: 'Prima Materia',
    prompt: `${BASE_STYLE} Central image: Formless chaos before creation, dark potential, raw unworked matter. Border contains: void, potential forms, chaos waters, divine breath hovering. Color palette: deep blacks, primordial darkness, hints of hidden potential. Mood: chaos, potential, the unformed beginning.`
  },
  {
    id: 'arc-02',
    name: 'Lapis',
    prompt: `${BASE_STYLE} Central image: Glowing philosopher's stone radiating transformative light, red and white united. Border contains: gold transmutation, universal medicine, completed work, crowned achievement. Color palette: radiant red, pure white, transmuting gold. Mood: achievement, perfection, the goal attained.`
  },
  {
    id: 'arc-03',
    name: 'Ouroboros',
    prompt: `${BASE_STYLE} Central image: Serpent eating its own tail in perfect circle, self-renewing cycle. Border contains: eternal return, beginning is end, self-sufficient cycle, cosmic serpent. Color palette: serpent greens, eternal golds, circular forms. Mood: eternal return, self-renewal, containing all.`
  },
  {
    id: 'arc-04',
    name: 'Rebis',
    prompt: `${BASE_STYLE} Central image: Androgynous figure with sun and moon faces, king and queen unified in one body. Border contains: sacred marriage complete, two in one, hermaphrodite, unified opposites. Color palette: solar gold, lunar silver, unified purple. Mood: perfect union, duality resolved, wholeness.`
  },
  {
    id: 'arc-05',
    name: 'Elixir',
    prompt: `${BASE_STYLE} Central image: Golden liquid in crystalline vessel, drinkable gold, universal medicine. Border contains: healing drops, fountain of life, panacea, rejuvenating waters. Color palette: liquid gold, healing amber, crystalline clarity. Mood: healing, medicine, transformation through consumption.`
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`  Saved: ${filepath}`);
}

async function generateImage(card) {
  console.log(`\nGenerating: ${card.name} (${card.id})`);

  try {
    const output = await replicate.run(MODEL, {
      input: {
        prompt: card.prompt,
        aspect_ratio: "4:5",  // Good for cards
        output_format: "png",
        output_quality: 90,
      }
    });

    const imageUrl = output;
    const filename = `${card.id}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    await downloadImage(imageUrl, filepath);

    // Also copy to docs/cards for web
    const docsPath = path.join(DOCS_DIR, filename);
    fs.copyFileSync(filepath, docsPath);
    console.log(`  Copied to: ${docsPath}`);

    return true;
  } catch (error) {
    console.error(`  Error generating ${card.name}:`, error.message);
    return false;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('ALCHEMY DECK - Image Generator');
  console.log('='.repeat(60));

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('\nError: REPLICATE_API_TOKEN environment variable not set');
    console.log('Usage: REPLICATE_API_TOKEN=xxx node src/generate-images.js');
    process.exit(1);
  }

  await ensureDir(OUTPUT_DIR);
  await ensureDir(DOCS_DIR);

  // Check for specific card argument
  const cardArg = process.argv.find(arg => arg.startsWith('--card='));
  const specificCard = cardArg ? cardArg.split('=')[1] : null;

  let cardsToGenerate = CARDS;

  if (specificCard) {
    cardsToGenerate = CARDS.filter(c => c.id === specificCard);
    if (cardsToGenerate.length === 0) {
      console.error(`Card not found: ${specificCard}`);
      console.log('Available cards:', CARDS.map(c => c.id).join(', '));
      process.exit(1);
    }
  }

  console.log(`\nGenerating ${cardsToGenerate.length} card images...`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Model: ${MODEL}`);

  let success = 0;
  let failed = 0;

  for (const card of cardsToGenerate) {
    // Check if image already exists
    const filepath = path.join(OUTPUT_DIR, `${card.id}.png`);
    if (fs.existsSync(filepath) && !specificCard) {
      console.log(`\nSkipping ${card.name} (already exists)`);
      success++;
      continue;
    }

    const result = await generateImage(card);
    if (result) {
      success++;
    } else {
      failed++;
    }

    // Rate limiting - wait between requests
    if (cardsToGenerate.indexOf(card) < cardsToGenerate.length - 1) {
      console.log('  Waiting 2s...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Complete! Success: ${success}, Failed: ${failed}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
