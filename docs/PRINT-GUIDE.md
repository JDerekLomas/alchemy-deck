# Alchemy Deck - Print Guide

## The Game Crafter Setup

### Requirements
- TGC account with API key enabled (Developer mode in profile)
- Images: **900×1500 pixels** (300 DPI with bleed for 2.75×4.75" tarot cards)
- Format: PNG or JPG, RGB color mode

### API Credentials
- API Key ID: `E4963FEA-E76C-11F0-B4B8-3F982389BF0E`
- Username: `dlomas`

### Current Upload (Jan 2026)
- Game ID: `1F1DD2DE-E76F-11F0-B3D7-9405CF0A6439`
- Deck ID: `213385BE-E76F-11F0-B3D7-8505CF0A6439`
- URL: https://www.thegamecrafter.com/make/games/1F1DD2DE-E76F-11F0-B3D7-9405CF0A6439

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

### 1. Resize Images (if needed)
```bash
cd docs
mkdir -p cards-tgc
for f in cards/*.png; do
  sips -z 1500 900 "$f" --out "cards-tgc/$(basename $f)"
done
```

### 2. Run Upload Script
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

### 3. Set Card Back
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
