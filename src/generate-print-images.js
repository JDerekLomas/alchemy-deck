/**
 * Generate print-ready card images at 300 DPI with proper bleed
 *
 * Specifications (TAROT SIZE):
 * - Card size: 70 × 120 mm (2.75" × 4.75")
 * - Bleed: 3mm per side
 * - Total with bleed: 76 × 126 mm
 * - At 300 DPI: 898 × 1488 pixels
 * - Safe zone: 5mm from edge (keep text/important elements inside)
 */

const Replicate = require('replicate');
const fs = require('fs');
const path = require('path');

const replicate = new Replicate();
const MODEL = "black-forest-labs/flux-1.1-pro";

// Print dimensions (TAROT SIZE)
const PRINT_WIDTH = 898;   // pixels at 300 DPI with bleed
const PRINT_HEIGHT = 1488; // pixels at 300 DPI with bleed

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'print-ready');
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'cards-print');

// Same cards as before but optimized prompts for print quality
const BASE_STYLE = `Detailed alchemical engraving illustration, hand-tinted with muted earth tones and gold accents, copper and sepia coloring, mystical Renaissance style, intricate linework, esoteric symbolism, aged parchment texture, high detail, centered composition with clear borders, print-ready quality, no text or letters`;

const CARDS = [
  // STAGES
  { id: "stage-01", name: "Nigredo", prompt: "Blackening stage of alchemy, dark ravens, decomposing matter, black sun, shadowy cauldron with dark smoke, skull and bones, death and putrefaction symbolism" },
  { id: "stage-02", name: "Albedo", prompt: "Whitening stage of alchemy, white dove, lunar symbolism, silver moon, purified white substance in vessel, pearl, snow white rose, washing and cleansing" },
  { id: "stage-03", name: "Citrinitas", prompt: "Yellowing stage of alchemy, golden dawn rising, solar symbolism, yellow sulfur, awakening consciousness, golden light breaking through, sunrise over alchemical landscape" },
  { id: "stage-04", name: "Rubedo", prompt: "Reddening stage of alchemy, phoenix rising from flames, red stone, completion of the great work, royal marriage of sun and moon, red rose, blood red elixir" },

  // OPERATIONS
  { id: "op-01", name: "Calcination", prompt: "Alchemical calcination, fierce flames burning matter to white ash, fire consuming base materials, salamander in flames, burning crucible" },
  { id: "op-02", name: "Dissolution", prompt: "Alchemical dissolution, matter dissolving in water, tears and rain, moon reflected in pool, sea serpent, watery depths, dissolution of form" },
  { id: "op-03", name: "Separation", prompt: "Alchemical separation, sword dividing light and dark, eagle and toad separating, filter and strainer, wheat from chaff, discernment" },
  { id: "op-04", name: "Conjunction", prompt: "Alchemical conjunction, sacred marriage, king and queen uniting, sun and moon joining, hermaphrodite, chemical wedding, two becoming one" },
  { id: "op-05", name: "Fermentation", prompt: "Alchemical fermentation, peacock tail colors, rotting fruit giving rise to new life, bacteria and yeast, bubbling ferment, inspiration arising" },
  { id: "op-06", name: "Distillation", prompt: "Alchemical distillation, alembic with rising vapors, condensing spirit, dew drops, eagle ascending, purified essence rising" },
  { id: "op-07", name: "Coagulation", prompt: "Alchemical coagulation, philosopher's stone forming, crystallization, solid gold emerging, phoenix egg, manifested perfection" },

  // ELEMENTS
  { id: "elem-01", name: "Fire", prompt: "Elemental fire, roaring flames, salamander, triangle pointing up, solar rays, burning torch, transformative fire, volcanic" },
  { id: "elem-02", name: "Water", prompt: "Elemental water, flowing streams, undine water spirit, triangle pointing down, lunar tides, fish and waves, dissolving waters" },
  { id: "elem-03", name: "Air", prompt: "Elemental air, swirling winds, sylph air spirit, birds in flight, clouds and sky, breath of life, intellectual clarity" },
  { id: "elem-04", name: "Earth", prompt: "Elemental earth, fertile soil, gnome earth spirit, mountains and caves, crystals growing, roots and stones, material foundation" },
  { id: "elem-05", name: "Quintessence", prompt: "Fifth element quintessence, starry cosmos, spiraling galaxy, divine light, ethereal spirit, transcendent essence, celestial sphere" },

  // PRINCIPLES
  { id: "prin-01", name: "Sulphur", prompt: "Alchemical sulphur principle, burning sun, masculine fire, active soul force, golden flames, combustible spirit, solar king" },
  { id: "prin-02", name: "Mercury", prompt: "Alchemical mercury principle, winged messenger, caduceus staff, quicksilver flowing, volatile spirit, hermaphrodite, mediating force" },
  { id: "prin-03", name: "Salt", prompt: "Alchemical salt principle, crystalline cube, fixed body, material form, white salt crystals, foundation stone, preserved form" },

  // VESSELS
  { id: "vessel-01", name: "Athanor", prompt: "Alchemical athanor furnace, tower furnace with sustained flame, philosophical egg inside, patient fire, brick oven, steady heat" },
  { id: "vessel-02", name: "Alembic", prompt: "Alchemical alembic still, glass distillation apparatus, condensing head, vapor rising and falling, drop of essence, copper still" },
  { id: "vessel-03", name: "Crucible", prompt: "Alchemical crucible, melting pot in fierce fire, molten gold, testing vessel, trial by fire, ceramic pot glowing red" },
  { id: "vessel-04", name: "Retort", prompt: "Alchemical retort vessel, bent-neck flask, circulating vapors, pelican vessel, philosophical circulation, returning to source" },

  // SAGES
  { id: "sage-01", name: "Hermes", prompt: "Hermes Trismegistus, Egyptian-Greek sage, emerald tablet, ibis bird, caduceus, pyramids, thrice-great master, as above so below" },
  { id: "sage-02", name: "Paracelsus", prompt: "Paracelsus the physician, Renaissance doctor, sword Azoth, medical herbs, alchemical medicine, natural philosophy, healing arts" },
  { id: "sage-03", name: "Boehme", prompt: "Jacob Boehme mystic, shoemaker sage, divine vision, aurora dawn light, mystical eye, theosophical symbols, spiritual illumination" },
  { id: "sage-04", name: "Ficino", prompt: "Marsilio Ficino, Florentine philosopher, translating ancient texts, lyre music, platonic academy, Renaissance humanism, beauty and soul" },
  { id: "sage-05", name: "Sendivogius", prompt: "Michael Sendivogius, Polish alchemist, new chemical light, practical laboratory, philosophical mercury, adept in robes, transmutation" },
  { id: "sage-06", name: "Agrippa", prompt: "Cornelius Agrippa, occult philosopher, three books of magic, pentagram, celestial correspondences, hidden wisdom, magical arts" },

  // ARCANA
  { id: "arc-01", name: "Prima Materia", prompt: "Prima materia first matter, chaotic void, unformed potential, cosmic egg, dark waters of creation, primordial chaos, divine mist" },
  { id: "arc-02", name: "Lapis", prompt: "Philosopher's stone lapis, radiant red stone, perfect gem, transmuting gold, completed work, ruby crystal, ultimate achievement" },
  { id: "arc-03", name: "Ouroboros", prompt: "Ouroboros serpent, dragon eating its tail, eternal cycle, infinity symbol, self-renewal, beginning and end united, cosmic snake" },
  { id: "arc-04", name: "Rebis", prompt: "Rebis double nature, hermaphrodite figure, sun and moon united, male and female merged, two-headed being, perfect union" },
  { id: "arc-05", name: "Elixir", prompt: "Elixir of life, golden liquid in vessel, universal medicine, panacea, immortality potion, healing draught, perfected tincture" }
];

async function generateImage(card) {
  const prompt = `${BASE_STYLE}, ${card.prompt}`;

  console.log(`Generating: ${card.name} (${card.id}) at ${PRINT_WIDTH}x${PRINT_HEIGHT}...`);

  try {
    const output = await replicate.run(MODEL, {
      input: {
        prompt: prompt,
        width: PRINT_WIDTH,
        height: PRINT_HEIGHT,
        aspect_ratio: "custom",
        output_format: "png",
        output_quality: 100,
        safety_tolerance: 5,
        prompt_upsampling: true
      }
    });

    // Download the image
    const imageUrl = output;
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Save to print-ready folder
    const printPath = path.join(OUTPUT_DIR, `${card.id}-print.png`);
    fs.writeFileSync(printPath, buffer);
    console.log(`  Saved: ${printPath}`);

    // Also copy to docs for preview
    const docsPath = path.join(DOCS_DIR, `${card.id}.png`);
    fs.writeFileSync(docsPath, buffer);

    return true;
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('============================================================');
  console.log('ALCHEMY DECK - Print-Ready Image Generator');
  console.log('============================================================');
  console.log(`Dimensions: ${PRINT_WIDTH} × ${PRINT_HEIGHT} pixels (300 DPI with 3mm bleed)`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Model: ${MODEL}`);
  console.log('');

  // Create output directories
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const card of CARDS) {
    // Check if already exists
    const printPath = path.join(OUTPUT_DIR, `${card.id}-print.png`);
    if (fs.existsSync(printPath)) {
      console.log(`Skipping ${card.name} (already exists)`);
      success++;
      continue;
    }

    const ok = await generateImage(card);
    if (ok) {
      success++;
    } else {
      failed++;
    }

    // Rate limiting
    await new Promise(r => setTimeout(r, 10000));
  }

  console.log('');
  console.log('============================================================');
  console.log(`Complete! Success: ${success}, Failed: ${failed}`);
  console.log('============================================================');
}

main().catch(console.error);
