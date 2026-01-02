#!/bin/bash
# Generate v4 alchemy deck cards - SQUARE 1:1 aspect ratio for 60/40 card layout

export MULEROUTER_SITE="mulerouter"
export MULEROUTER_API_KEY="sk-mr-2dfbbdfe5bbd2e24235960b2d4f5b45bf1b59a087bc2524ff35c6c70a2657436"

SKILL_DIR="/Users/dereklomas/.claude/plugins/cache/mulerouter-skills/mulerouter-skills/1.0.0/skills/mulerouter-skills"
OUTPUT_DIR="/Users/dereklomas/new/alchemy-deck/docs/cards-v4"

BASE_STYLE="Detailed alchemical engraving illustration, hand-tinted with muted earth tones and gold accents, copper and sepia coloring, mystical Renaissance style, intricate linework, esoteric symbolism, aged parchment texture, high detail, centered composition, no text or letters"

mkdir -p "$OUTPUT_DIR"

generate_card() {
    local id=$1
    local prompt=$2
    local full_prompt="$BASE_STYLE, $prompt"

    echo "=========================================="
    echo "Generating: $id"
    echo "=========================================="

    cd "$SKILL_DIR"

    # Use nano-banana-pro with 1:1 square aspect ratio
    result=$(uv run python models/google/nano-banana-pro/generation.py \
        --prompt "$full_prompt" \
        --aspect-ratio "1:1" \
        --resolution "2K" \
        --json 2>&1 | grep -A100 '^{' | head -20)

    echo "Result: $result"

    # Extract URL
    url=$(echo "$result" | grep -o 'https://[^"]*\.png' | head -1)
    if [ -z "$url" ]; then
        url=$(echo "$result" | grep -o 'https://[^"]*\.webp' | head -1)
    fi

    if [ -n "$url" ]; then
        echo "Downloading: $url"
        curl -s -o "$OUTPUT_DIR/$id.png" "$url"
        if [ -f "$OUTPUT_DIR/$id.png" ]; then
            echo "Saved: $OUTPUT_DIR/$id.png ($(ls -la "$OUTPUT_DIR/$id.png" | awk '{print $5}') bytes)"
        else
            echo "Download failed!"
        fi
    else
        echo "Error: Could not extract URL from result"
    fi

    echo ""
    sleep 2
}

# STAGES (4 cards)
generate_card "stage-01" "Nigredo stage of the Great Work, seven ravens circling a sol niger (black sun) eclipsing the sky, sealed alchemical vessel containing decomposing prima materia turning black, caput mortuum (death's head) emerging from dark vapors"

generate_card "stage-02" "Albedo whitening stage, white dove ascending from dark waters, full silver moon reflected in purifying bath, sealed vessel containing brilliant white powder, white queen emerging, dew drops on white roses"

generate_card "stage-03" "Citrinitas yellowing stage, vulture perched on mountain summit crying at dawn, white matter in vessel turning golden yellow, sulfurous vapors rising, first rays of solar gold breaking over alchemical landscape"

generate_card "stage-04" "Rubedo reddening completion stage, phoenix reborn from alchemical flames, glowing red philosopher's stone in sealed vessel, sacred marriage of Sol and Luna as crowned king and queen, red rose in full bloom"

# OPERATIONS (7 cards)
generate_card "op-01" "Calcination operation, fierce elemental fire consuming base matter in iron crucible, salamander spirit dancing in flames unharmed, white calcium ash forming"

generate_card "op-02" "Dissolution operation, calcined ash dissolving in mercurial waters within sealed glass vessel, silver moon reflected in dark solution, undine water spirit"

generate_card "op-03" "Separation operation, flaming sword of discernment dividing light from darkness, white eagle ascending while black toad descends, balanced scales"

generate_card "op-04" "Conjunction operation, sacred chemical wedding of Red King and White Queen, Sol and Luna embracing within sealed vessel, hermaphroditic rebis forming"

generate_card "op-05" "Fermentation operation, cauda pavonis peacock tail displaying iridescent rainbow colors in vessel, rotting matter giving birth to new golden growth"

generate_card "op-06" "Distillation operation, elegant glass alembic with spiraling vapors rising, pure essence condensing as golden drops, white eagle ascending"

generate_card "op-07" "Coagulation operation, philosopher's stone crystallizing from purified tincture in warm athanor, ruby red lapis forming geometric structure"

# ELEMENTS (5 cards) - Include Platonic solids
generate_card "elem-01" "Elemental Fire, roaring alchemical flames in upward-pointing triangle, salamander spirit unharmed within the blaze, tetrahedron geometric form, solar rays"

generate_card "elem-02" "Elemental Water, mercurial waters flowing within downward-pointing triangle, undine spirit swimming in lunar-lit depths, icosahedron geometric form"

generate_card "elem-03" "Elemental Air, swirling philosophical winds within triangle with horizontal line, sylph spirits soaring among clouds, octahedron geometric form"

generate_card "elem-04" "Elemental Earth, inverted triangle with horizontal line, gnome spirit guarding underground treasures, cube geometric form, crystals growing from soil"

generate_card "elem-05" "Quintessence fifth element, eternal immutable essence beyond the four elements, dodecahedron geometric form, spiraling celestial sphere with fixed stars, divine light"

# PRINCIPLES (3 cards)
generate_card "prin-01" "Alchemical Sulphur, the combustible soul principle, Red King crowned with solar flames, golden lion breathing fire, burning sun"

generate_card "prin-02" "Alchemical Mercury, winged Hermes-Mercurius with caduceus of intertwined serpents, living quicksilver flowing, hermaphroditic"

generate_card "prin-03" "Alchemical Salt, the fixed body principle, perfect white crystalline cube, salt crystals forming geometric patterns"

# VESSELS (4 cards)
generate_card "vessel-01" "Alchemical Athanor, tower furnace of brick with steady gentle flame, philosophical egg sealed within maintaining constant heat"

generate_card "vessel-02" "Alchemical Alembic, elegant glass still with cucurbit base and curved helm, vapors spiraling upward then condensing"

generate_card "vessel-03" "Alchemical Crucible, ceramic vessel glowing red-white in fierce flames, matter being tested and proved, trial by fire"

generate_card "vessel-04" "Alchemical Retort and Pelican vessel, bent-neck flask, pelican feeding its young with its own blood, circulation"

# SAGES (6 cards)
generate_card "sage-01" "Hermes Trismegistus Thrice-Great, Egyptian-Greek sage holding Emerald Tablet, caduceus staff with twin serpents, pyramids"

generate_card "sage-02" "Paracelsus the physician-alchemist, Renaissance doctor with wild beard holding sword Azoth, medicinal herbs and vessels"

generate_card "sage-03" "Jacob Boehme the shoemaker-mystic, humble craftsman with tools as divine vision breaks through, seven spirits radiating"

generate_card "sage-04" "Marsilio Ficino, Florentine philosopher translating Hermetic texts by candlelight, orphic lyre beside him"

generate_card "sage-05" "Michael Sendivogius, Polish adept in practical laboratory with working apparatus, philosophical mercury in vessel"

generate_card "sage-06" "Cornelius Agrippa, the magus mapping celestial correspondences, three volumes open, pentagram and planetary seals"

# ARCANA (5 cards)
generate_card "arc-01" "Prima Materia, divine mist issuing from Paradise, cosmic egg floating in dark waters of chaos, formless potential"

generate_card "arc-02" "Lapis Philosophorum, the Philosopher's Stone, radiant ruby-red gem containing living fire, transmuting gold"

generate_card "arc-03" "Ouroboros, great serpent-dragon devouring its own tail, scales transitioning from light to dark, eternal cycle"

generate_card "arc-04" "Rebis the Double Thing, hermaphroditic figure with two heads, Sol crowning male side and Luna the female"

generate_card "arc-05" "Elixir of Life, golden aurum potabile drinkable gold glowing in crystal vessel, universal medicine panacea"

echo "=========================================="
echo "COMPLETE! Generated 34 v4 cards (1:1 square)"
echo "Output: $OUTPUT_DIR"
echo "=========================================="
ls -la "$OUTPUT_DIR"/*.png 2>/dev/null | wc -l
