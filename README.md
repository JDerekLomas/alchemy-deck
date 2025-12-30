# Alchemy Deck

An oracle deck for contemplating transformation, drawn from the Western alchemical tradition and primary sources at [sourcelibrary.org](https://sourcelibrary.org).

## The Deck

**34 oracle cards + 5 prompt cards = 39 total**

### Card Categories

| Category | Cards | Theme |
|----------|-------|-------|
| **Stages** | Nigredo, Albedo, Citrinitas, Rubedo | The four stages of the Great Work |
| **Operations** | Calcination, Dissolution, Separation, Conjunction, Fermentation, Distillation, Coagulation | The seven alchemical processes |
| **Elements** | Fire, Water, Air, Earth, Quintessence | Classical elements + the fifth essence |
| **Principles** | Sulphur, Mercury, Salt | The Tria Prima (soul, spirit, body) |
| **Vessels** | Athanor, Alembic, Crucible, Retort | Tools of the art |
| **Sages** | Hermes, Paracelsus, Boehme, Ficino, Sendivogius, Agrippa | Wisdom from the tradition |
| **Arcana** | Prima Materia, Lapis, Ouroboros, Rebis, Elixir | Core symbols |

### Prompt Cards

1. **The Great Work** - 4-card spread mapping the alchemical stages
2. **The Crucible** - 3-card spread for times of transformation
3. **As Above, So Below** - 2-card spread for seeing correspondences
4. **Single Draw** - Daily contemplation practice
5. **AI Interpretation** - Guide for using AI to interpret spreads

## How to Use

### For Reflection

1. **Formulate a question** about a situation involving change or transformation
2. **Choose a spread** (Great Work, Crucible, or As Above So Below)
3. **Shuffle and draw** cards for each position
4. **Read each card** through the lens of its position
5. **Contemplate** the connections and what they reveal

### With AI Assistance

The cards include machine-readable content designed for AI interpretation:

1. Draw your spread
2. Photograph the cards or list them with their positions
3. Share with an AI (Claude, ChatGPT, etc.) using the prompt card template
4. Explore the symbolism and connections together

### Daily Practice

Draw a single card each morning. Sit with its question throughout the day. Notice where its themes appear. Journal in the evening.

## Primary Sources

Quotes on the cards come from translated alchemical texts at Source Library:

- **Sendivogius** - *New Chemical Light* (1628)
- **Drebbel** - *Two Treatises: On the Nature of Elements & On the Fifth Essence* (1628)
- **Paracelsus** - *Book of Meteors* (1566)
- **Ficino** - *On Pleasure*
- **Hellwig** - *Curious Physics* (1714)

All translations available at [sourcelibrary.org](https://sourcelibrary.org).

## Print Your Own Deck

Open `docs/print.html` in a browser and print:

- **Paper**: Letter size (8.5" × 11")
- **Print**: Double-sided, flip on long edge
- **Card size**: Poker-sized (2.5" × 3.5")
- **Cut**: Along card edges

The file includes card fronts, card backs, and prompt cards.

## Project Structure

```
alchemy-deck/
├── docs/
│   └── print.html      # Print-ready card sheets
├── src/
│   └── cards.json      # Card definitions and content
├── assets/
│   └── deck-artwork/   # Card artwork (to be generated)
└── README.md
```

## Generating Artwork

The deck currently uses placeholder symbols. To generate artwork:

1. Use the card definitions in `src/cards.json` for prompts
2. Generate images with an AI art tool (Flux, Midjourney, DALL-E)
3. Place images in `assets/deck-artwork/`
4. Update `docs/print.html` to reference the images

Suggested art style: *Art deco engraving with hand-tinted vintage colors, intricate linework, and alchemical symbolism.*

## Design Philosophy

The Alchemy Deck is not for fortune-telling. It's a tool for contemplating transformation.

The alchemists understood that making gold was really about making the self—that the laboratory and the soul were mirrors of each other. Every operation on matter was an operation on consciousness.

When you draw a card, you're not predicting the future. You're asking: *What transformation is present here? What stage am I in? What operation is needed?*

The quotes from primary sources connect you to a lineage of seekers who asked similar questions, using the language of metals and elements to speak about the mysteries of change.

## License

MIT

---

*"Fire purifies all fixed things, and by fire they are perfected."*
—Sendivogius, New Chemical Light (1628)
