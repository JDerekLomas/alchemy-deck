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
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'cards');

// Add --force flag to regenerate all images
const FORCE_REGENERATE = process.argv.includes('--force');

// Same cards as before but optimized prompts for print quality
const BASE_STYLE = `Detailed alchemical engraving illustration, hand-tinted with muted earth tones and gold accents, copper and sepia coloring, mystical Renaissance style, intricate linework, esoteric symbolism, aged parchment texture, high detail, centered composition with clear borders, print-ready quality, no text or letters`;

const CARDS = [
  // STAGES (research-informed revised prompts)
  { id: "stage-01", name: "Nigredo", prompt: "Nigredo stage of the Great Work, seven ravens circling a sol niger (black sun) eclipsing the sky, sealed alchemical vessel containing decomposing prima materia turning black, caput mortuum (death's head) emerging from dark vapors, lead transmuting, midnight atmosphere with no light except the dark sun's corona" },
  { id: "stage-02", name: "Albedo", prompt: "Albedo whitening stage, white dove (columba) ascending from dark waters, full silver moon reflected in purifying bath, sealed vessel containing brilliant white powder like fresh snow, white queen emerging, dew drops on white roses, mercurial waters washing the blackened matter to silver-white purity" },
  { id: "stage-03", name: "Citrinitas", prompt: "Citrinitas yellowing stage from Maier's Atalanta Fugiens, vulture perched on mountain summit crying at dawn, white matter in vessel turning golden yellow, sulfurous vapors rising, first rays of solar gold breaking over alchemical landscape, aurora consurgens (rising dawn), the wise awakening" },
  { id: "stage-04", name: "Rubedo", prompt: "Rubedo reddening completion stage, phoenix reborn from alchemical flames, glowing red philosopher's stone (lapis philosophorum) in sealed vessel, sacred marriage (coniunctio) of Sol and Luna as crowned king and queen embracing, red rose in full bloom, blood-red elixir dripping, the Great Work achieved" },

  // OPERATIONS
  { id: "op-01", name: "Calcination", prompt: "Calcination operation, fierce elemental fire consuming base matter in iron crucible, salamander spirit dancing in flames unharmed, white calcium ash forming at bottom, impurities burning away as dark smoke, the first operation of the seven, purification through destruction" },
  { id: "op-02", name: "Dissolution", prompt: "Dissolution operation, calcined ash dissolving in mercurial waters within a sealed glass vessel, silver moon reflected in the dark solution, undine water spirit in the depths, rigid forms melting and softening, tears of dew falling, the second operation of surrender" },
  { id: "op-03", name: "Separation", prompt: "Separation operation, flaming sword of discernment dividing light from darkness, white eagle of spirit ascending while black toad of matter descends, filter separating pure quintessence from dross, balanced scales weighing essence, the third operation of wisdom" },
  { id: "op-04", name: "Conjunction", prompt: "Conjunction operation from Khunrath's Amphitheater, sacred chemical wedding of Red King (sulphur) and White Queen (mercury), Sol and Luna embracing within sealed vessel, hermaphroditic rebis forming from their union, roses and lilies intertwined, the fourth operation of sacred marriage" },
  { id: "op-05", name: "Fermentation", prompt: "Fermentation operation, cauda pavonis (peacock's tail) displaying iridescent rainbow colors in the vessel, rotting matter giving birth to new golden growth, bubbling ferment with rising vapors, inspiration breaking through decay, the fifth operation of spiritual rebirth" },
  { id: "op-06", name: "Distillation", prompt: "Distillation operation from Drebbel's Treatises, elegant glass alembic with spiraling vapors rising, pure essence condensing as golden drops in the beak, white eagle of volatile spirit ascending, morning dew collecting, the sixth operation of repeated refinement until only pure tincture remains" },
  { id: "op-07", name: "Coagulation", prompt: "Coagulation operation, philosopher's stone crystallizing from purified tincture in warm athanor, ruby red lapis forming geometric structure, solid gold precipitating from solution, phoenix egg ready to hatch, the seventh and final operation where spirit becomes perfected matter" },

  // ELEMENTS
  { id: "elem-01", name: "Fire", prompt: "Elemental Fire from Sendivogius, roaring alchemical flames in upward-pointing triangle, salamander spirit unharmed within the blaze, solar rays emanating from burning heart, volcanic transformative power, the active masculine principle that purifies and transmutes all it touches" },
  { id: "elem-02", name: "Water", prompt: "Elemental Water from Sendivogius, mercurial waters flowing within downward-pointing triangle, undine spirit swimming in lunar-lit depths, silver moon governing the tides, fish and serpents in dissolving currents, the receptive feminine principle that purifies and joins all things" },
  { id: "elem-03", name: "Air", prompt: "Elemental Air from Sendivogius, swirling philosophical winds within triangle with horizontal line, sylph spirits soaring among clouds, eagles and doves in flight, breath of life spiritus carrying thoughts, the mediating principle between fire above and water below" },
  { id: "elem-04", name: "Earth", prompt: "Elemental Earth from Sendivogius, inverted triangle with horizontal line, gnome spirit guarding underground treasures, crystals growing from fertile soil, mountain caves with precious stones, deep roots in black earth, the fixed principle that receives and embodies the tincture" },
  { id: "elem-05", name: "Quintessence", prompt: "Quintessence fifth element from Drebbel's Treatises, eternal immutable essence beyond the four elements, spiraling celestial sphere with fixed stars, divine light radiating from center, the invincible heaven that animates all matter, ethereal spirit untouched by earthly transformation" },

  // PRINCIPLES
  { id: "prin-01", name: "Sulphur", prompt: "Alchemical Sulphur from Paracelsus, the combustible soul principle, Red King crowned with solar flames, golden lion breathing fire, burning sun with rays, the active masculine force that gives life and desire to all matter, one of three Prima Materia" },
  { id: "prin-02", name: "Mercury", prompt: "Alchemical Mercury from Rosicrucian tradition, the volatile spirit principle, winged Hermes-Mercurius with caduceus of intertwined serpents, living quicksilver flowing and transforming, hermaphroditic figure mediating between sulphur and salt, the ever-changing messenger between realms" },
  { id: "prin-03", name: "Salt", prompt: "Alchemical Salt from Paracelsus, the fixed body principle, perfect white crystalline cube, salt crystals forming geometric patterns, foundation stone that preserves form, the feminine receptive base that contains volatile spirit and burning soul, one of three Prima Materia" },

  // VESSELS
  { id: "vessel-01", name: "Athanor", prompt: "Alchemical Athanor from Khunrath's Amphitheater, tower furnace of brick with steady gentle flame, philosophical egg (vas hermeticum) sealed within maintaining constant heat, patient slow fire for the Great Work, one furnace and one fire as the masters taught" },
  { id: "vessel-02", name: "Alembic", prompt: "Alchemical Alembic from Drebbel's Treatises, elegant glass still with cucurbit base and curved helm (capitellum), vapors spiraling upward then condensing, pure tincture collecting drop by golden drop in receiver, copper and glass construction, the vessel of distillation" },
  { id: "vessel-03", name: "Crucible", prompt: "Alchemical Crucible from Khunrath, ceramic vessel glowing red-white in fierce flames, matter being tested and proved, body corrupted and reduced to precious ash, trial by fire revealing true nature, the testing vessel where only genuine gold survives" },
  { id: "vessel-04", name: "Retort", prompt: "Alchemical Retort and Pelican vessel from Hermetic tradition, bent-neck flask returning condensed vapors to the body, pelican feeding its young with its own blood, philosophical circulation where it begins where it ends, ouroboric process of eternal return and refinement" },

  // SAGES
  { id: "sage-01", name: "Hermes", prompt: "Hermes Trismegistus Thrice-Great from the Pymander, Egyptian-Greek sage holding the Emerald Tablet inscribed with secret wisdom, caduceus staff with twin serpents, pyramids at dawn behind, ibis of Thoth, the artisan mind containing the circles, as above so below gesture" },
  { id: "sage-02", name: "Paracelsus", prompt: "Paracelsus the physician-alchemist from Book of Meteors, Renaissance doctor with wild beard holding sword Azoth, surrounded by medicinal herbs and spagyric vessels, three principles (sulphur salt mercury) displayed, the radical reformer who learned from nature not books" },
  { id: "sage-03", name: "Boehme", prompt: "Jacob Boehme the shoemaker-mystic from Aurora, humble craftsman with tools as divine vision breaks through, seven spirits of God radiating, the Sea of Fire forming the Firmament above, mystical eye seeing spiritual foundations, theosophical dawn light illuminating ordinary life" },
  { id: "sage-04", name: "Ficino", prompt: "Marsilio Ficino from On Pleasure, Florentine philosopher translating Hermetic texts by candlelight, orphic lyre beside him, Platonic Academy gathering, ancient Greek manuscripts spread on desk, beauty leading the soul upward, Renaissance wisdom reviving the prisca theologia" },
  { id: "sage-05", name: "Sendivogius", prompt: "Michael Sendivogius from New Chemical Light, Polish adept in practical laboratory with working apparatus, rays of new chemical light revealing nature's secret fire, philosophical mercury in sealed vessel, the practical wisdom of working with nature's hidden ways" },
  { id: "sage-06", name: "Agrippa", prompt: "Cornelius Agrippa from Three Books of Occult Philosophy, the magus mapping celestial correspondences, three volumes open showing elemental celestial and divine worlds, pentagram and planetary seals, God impressing Ideas upon the Intelligences, stars and their virtues reflected below" },

  // ARCANA
  { id: "arc-01", name: "Prima Materia", prompt: "Prima Materia from Hellwig's Curious Physics, divine mist issuing from God's Paradise, cosmic egg floating in dark waters of chaos, formless potential before the Work begins, heavenly waters coagulating into first matter, the raw substance from which all transformation emerges" },
  { id: "arc-02", name: "Lapis", prompt: "Lapis Philosophorum from Hellwig, the Philosopher's Stone praised in the Emerald Tablet, radiant ruby-red gem containing living fire, transmuting base metals to gold by its presence, the completed Great Work emanating golden light, perfected matter that heals and transforms all it touches" },
  { id: "arc-03", name: "Ouroboros", prompt: "Ouroboros from Hermetic tradition, great serpent-dragon devouring its own tail, scales transitioning from light to dark around the circle, eternal cycle of death and rebirth, it always begins where it ends, self-sustaining transformation, the alpha and omega united in one symbol" },
  { id: "arc-04", name: "Rebis", prompt: "Rebis the Double Thing from Pymander, hermaphroditic figure with two heads, Sol crowning the male side and Luna the female, masculine and feminine perfectly merged in one body, the alchemical androgyne born from the chemical wedding, man bearing the image of the father who contains all" },
  { id: "arc-05", name: "Elixir", prompt: "Elixir of Life from Drebbel's Treatises, the tincture that heals all diseases representing the Soul, golden aurum potabile (drinkable gold) glowing in crystal vessel, universal medicine panacea emanating healing light, the perfected liquid stone that restores body and soul to wholeness" }
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
  console.log(`Preview: ${DOCS_DIR}`);
  console.log(`Model: ${MODEL}`);
  if (FORCE_REGENERATE) console.log('Mode: FORCE REGENERATE (replacing existing images)');
  console.log('');

  // Create output directories
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const card of CARDS) {
    // Check if already exists (skip unless --force)
    const printPath = path.join(OUTPUT_DIR, `${card.id}-print.png`);
    if (fs.existsSync(printPath) && !FORCE_REGENERATE) {
      console.log(`Skipping ${card.name} (already exists, use --force to regenerate)`);
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
