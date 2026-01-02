# Alchemy Deck - Print Guide

## The Game Crafter Setup

### Requirements
- TGC account with API key enabled (Developer mode in profile)
- Images: **900×1500 pixels** (300 DPI with bleed for 2.75×4.75" tarot cards)
- Format: PNG or JPG, RGB color mode

### Card Layout Proportions
- **Card total:** 900×1500 px (2.75×4.75 in)
- **Artwork area:** 60% = 900×900 px (2.85 in) — ideal image: **1:1 square**
- **Text area:** 40% = 900×600 px (1.90 in)
  - Category/title/subtitle panel (~170px)
  - Prompt text (~330px, flex)
  - Quote with attribution (~100px)

### Category Colors (one per set)
| Category | Background | Accent | Cards |
|----------|------------|--------|-------|
| Stage | #2d1f3d → #1f1629 | #c084fc (Purple) | 4 |
| Operation | #4d2a10 → #3d2008 | #ff8c42 (Orange) | 7 |
| Element | #1a3d3a → #132d2b | #4ecdc4 (Teal) | 5 |
| Principle | #4a3d10 → #3d3008 | #ffd166 (Gold) | 3 |
| Vessel | #3d2a1a → #2d1f13 | #d4a574 (Copper) | 4 |
| Sage | #1a2a3d → #131f2d | #60a5fa (Blue) | 6 |
| Arcana | #3d1a3d → #2d132d | #e879f9 (Magenta) | 5 |

### Elements & Platonic Solids
| Element | Solid | Faces | Symbolism |
|---------|-------|-------|-----------|
| Fire | Tetrahedron | 4 | Sharpest, most active |
| Water | Icosahedron | 20 | Flows, many faces |
| Air | Octahedron | 8 | Light, balanced |
| Earth | Cube | 6 | Stable, grounded |
| Quintessence | Dodecahedron | 12 | Heavenly, encompasses all |

### API Credentials
- API Key ID: `E4963FEA-E76C-11F0-B4B8-3F982389BF0E`
- Username: `dlomas`

### Current Upload (Jan 2, 2026) - Full Card Layout
- Game ID: `73C4EB9E-E772-11F0-B4B8-8C5D2389BF0E`
- Deck ID: `75AE6110-E772-11F0-B3D7-392ECF0A6439`
- URL: https://www.thegamecrafter.com/make/games/73C4EB9E-E772-11F0-B4B8-8C5D2389BF0E
- Cards include: artwork, category, title, subtitle, prompt text, and source quote

### Pricing
- $0.284 per card
- 34 cards = ~$9.66 per deck
- Bulk discounts available (100+ decks)

## Image Versions

Images are stored in `/docs/`:
- `cards/` - V2: Research-informed prompts (Jan 1, 2026)
- `cards-v1/` - V1: Original prompts (Dec 30, 2025)
- `cards-v3/` - V3: Style-fixed regenerations
- `cards-tgc/` - Resized to 900×1500 for TGC upload

### Selected Versions for Print
| Version | Cards |
|---------|-------|
| V1 | stage-03, op-01, op-02, elem-01, elem-02, elem-04, sage-05 |
| V2 | 25 cards (most) |
| V3 | stage-02, op-04 |

## Process to Re-upload

### 1. Render Full Card Layouts
Cards need the complete layout with artwork, text, and styling - not just raw images.

```bash
# Render all cards with Puppeteer (900x1500 with full layout)
node src/render-cards-for-print.js
```

This creates cards in `docs/cards-tgc/` with:
- Artwork at top (from selected version: cards, cards-v1, cards-v3)
- Category badge
- Title and subtitle
- Prompt text
- Source quote

### 2. Resize Raw Images (if needed)
If you only need to resize raw artwork (no text overlay):
```bash
cd docs
mkdir -p cards-tgc
for f in cards/*.png; do
  sips -z 1500 900 "$f" --out "cards-tgc/$(basename $f)"
done
```

### 3. Run Upload Script
```bash
npm install
TGC_USERNAME="dlomas" TGC_PASSWORD="xxx" npm run upload:tgc
```

Or use Node directly to avoid shell escaping issues:
```bash
node -e "
process.env.TGC_USERNAME = 'dlomas';
process.env.TGC_PASSWORD = 'YOUR_PASSWORD';
require('./src/upload-to-gamecrafter.js');
"
```

### 4. Set Card Back
Upload a 900×1500 card back image via the TGC web interface or API.

## Generating New Images

### MuleRouter API
```bash
export MULEROUTER_SITE="mulerouter"
export MULEROUTER_API_KEY="sk-mr-..."

# Run generation script
bash src/generate-mulerouter.sh
```

### Base Style Prompt
```
Detailed alchemical engraving illustration, hand-tinted with muted earth tones and gold accents, copper and sepia coloring, mystical Renaissance style, intricate linework, esoteric symbolism, aged parchment texture, high detail, centered composition, no text or letters
```

## Review System

- Review UI: https://alchemy-deck.vercel.app/review.html
- Version selector: https://alchemy-deck.vercel.app/select.html
- Reviews stored in Google Sheet: https://docs.google.com/spreadsheets/d/1MwiJQf8ve1qZxs48rLpREDQC4pJDHF-BCJDVKCdv0UE/
