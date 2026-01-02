#!/bin/bash
export MULEROUTER_SITE="mulerouter"
export MULEROUTER_API_KEY="sk-mr-2dfbbdfe5bbd2e24235960b2d4f5b45bf1b59a087bc2524ff35c6c70a2657436"

SKILL_DIR="/Users/dereklomas/.claude/plugins/cache/mulerouter-skills/mulerouter-skills/1.0.0/skills/mulerouter-skills"
OUTPUT_DIR="/Users/dereklomas/new/alchemy-deck/docs/cards-v4"
BASE_STYLE="Detailed alchemical engraving illustration, hand-tinted with muted earth tones and gold accents, copper and sepia coloring, mystical Renaissance style, intricate linework, esoteric symbolism, aged parchment texture, high detail, centered composition, no text or letters"

generate() {
    local id=$1
    local prompt=$2
    echo "Generating: $id"
    cd "$SKILL_DIR"
    result=$(uv run python models/google/nano-banana-pro/generation.py --prompt "$BASE_STYLE, $prompt" --aspect-ratio "1:1" --resolution "2K" --json 2>&1 | grep -o 'https://[^"]*\.png' | head -1)
    if [ -n "$result" ]; then
        curl -s -o "$OUTPUT_DIR/$id.png" "$result"
        echo "Done: $id"
    else
        echo "FAILED: $id"
    fi
    sleep 2
}

generate "elem-01" "Elemental Fire, roaring alchemical flames in upward-pointing triangle, salamander spirit unharmed within the blaze, tetrahedron geometric form, solar rays"
generate "elem-04" "Elemental Earth, inverted triangle with horizontal line, gnome spirit guarding underground treasures, cube geometric form, crystals growing from soil"
generate "elem-05" "Quintessence fifth element, eternal immutable essence beyond the four elements, dodecahedron geometric form, spiraling celestial sphere with fixed stars, divine light"
generate "vessel-01" "Alchemical Athanor, tower furnace of brick with steady gentle flame, philosophical egg sealed within maintaining constant heat"

echo "Done generating missing cards"
ls -la "$OUTPUT_DIR"/*.png | wc -l
