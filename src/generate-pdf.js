/**
 * Generate print-ready PDF for Alchemy Deck
 * Creates a multi-page PDF with proper bleed and crop marks
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');

// Card dimensions in points (72 points = 1 inch) - TAROT SIZE
const CARD_WIDTH_PT = 2.75 * 72;   // 198 points
const CARD_HEIGHT_PT = 4.75 * 72;  // 342 points
const BLEED_PT = 3 * 2.834645669; // 3mm in points (~8.5 pt)
const CROP_MARK_LENGTH = 10;
const CROP_MARK_OFFSET = 5;

// Page size (US Letter with extra margin for crop marks)
const PAGE_WIDTH = 8.5 * 72;
const PAGE_HEIGHT = 11 * 72;
const MARGIN = 36; // 0.5 inch margin

const CARDS_DIR = path.join(__dirname, '..', 'docs', 'cards');
const OUTPUT_PDF = path.join(__dirname, '..', 'assets', 'alchemy-deck-print.pdf');

// Card order (all 34 oracle cards)
const CARD_IDS = [
  'stage-01', 'stage-02', 'stage-03', 'stage-04',
  'op-01', 'op-02', 'op-03', 'op-04', 'op-05', 'op-06', 'op-07',
  'elem-01', 'elem-02', 'elem-03', 'elem-04', 'elem-05',
  'prin-01', 'prin-02', 'prin-03',
  'vessel-01', 'vessel-02', 'vessel-03', 'vessel-04',
  'sage-01', 'sage-02', 'sage-03', 'sage-04', 'sage-05', 'sage-06',
  'arc-01', 'arc-02', 'arc-03', 'arc-04', 'arc-05'
];

async function createPrintPDF() {
  console.log('Creating print-ready PDF...');

  const pdfDoc = await PDFDocument.create();

  // Calculate cards per page (2 columns x 2 rows = 4 cards per page for tarot size)
  const COLS = 2;
  const ROWS = 2;
  const CARDS_PER_PAGE = COLS * ROWS;

  const cardWithBleed = {
    width: CARD_WIDTH_PT + (BLEED_PT * 2),
    height: CARD_HEIGHT_PT + (BLEED_PT * 2)
  };

  // Calculate spacing
  const totalWidth = COLS * cardWithBleed.width;
  const totalHeight = ROWS * cardWithBleed.height;
  const startX = (PAGE_WIDTH - totalWidth) / 2;
  const startY = PAGE_HEIGHT - MARGIN - cardWithBleed.height;

  let pageIndex = 0;
  let page = null;

  for (let i = 0; i < CARD_IDS.length; i++) {
    const cardId = CARD_IDS[i];
    const positionOnPage = i % CARDS_PER_PAGE;

    // Create new page if needed
    if (positionOnPage === 0) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageIndex++;
      console.log(`Creating page ${pageIndex}...`);
    }

    // Calculate position
    const col = positionOnPage % COLS;
    const row = Math.floor(positionOnPage / COLS);
    const x = startX + (col * cardWithBleed.width);
    const y = startY - (row * cardWithBleed.height);

    // Load and embed card image
    const imagePath = path.join(CARDS_DIR, `${cardId}.png`);
    if (fs.existsSync(imagePath)) {
      try {
        const imageBytes = fs.readFileSync(imagePath);
        const image = await pdfDoc.embedPng(imageBytes);

        page.drawImage(image, {
          x: x,
          y: y,
          width: cardWithBleed.width,
          height: cardWithBleed.height
        });

        // Draw crop marks
        drawCropMarks(page, x, y, cardWithBleed.width, cardWithBleed.height);

        console.log(`  Added: ${cardId}`);
      } catch (error) {
        console.error(`  Error loading ${cardId}: ${error.message}`);
      }
    } else {
      console.log(`  Skipping ${cardId} (no image)`);
    }
  }

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(OUTPUT_PDF, pdfBytes);

  console.log(`\nPDF saved to: ${OUTPUT_PDF}`);
  console.log(`Total pages: ${pageIndex}`);
  console.log(`Total cards: ${CARD_IDS.length}`);
}

function drawCropMarks(page, x, y, width, height) {
  const color = rgb(0, 0, 0);
  const lineWidth = 0.5;

  // Top-left corner
  page.drawLine({
    start: { x: x - CROP_MARK_OFFSET - CROP_MARK_LENGTH, y: y + height },
    end: { x: x - CROP_MARK_OFFSET, y: y + height },
    thickness: lineWidth, color
  });
  page.drawLine({
    start: { x: x, y: y + height + CROP_MARK_OFFSET },
    end: { x: x, y: y + height + CROP_MARK_OFFSET + CROP_MARK_LENGTH },
    thickness: lineWidth, color
  });

  // Top-right corner
  page.drawLine({
    start: { x: x + width + CROP_MARK_OFFSET, y: y + height },
    end: { x: x + width + CROP_MARK_OFFSET + CROP_MARK_LENGTH, y: y + height },
    thickness: lineWidth, color
  });
  page.drawLine({
    start: { x: x + width, y: y + height + CROP_MARK_OFFSET },
    end: { x: x + width, y: y + height + CROP_MARK_OFFSET + CROP_MARK_LENGTH },
    thickness: lineWidth, color
  });

  // Bottom-left corner
  page.drawLine({
    start: { x: x - CROP_MARK_OFFSET - CROP_MARK_LENGTH, y: y },
    end: { x: x - CROP_MARK_OFFSET, y: y },
    thickness: lineWidth, color
  });
  page.drawLine({
    start: { x: x, y: y - CROP_MARK_OFFSET },
    end: { x: x, y: y - CROP_MARK_OFFSET - CROP_MARK_LENGTH },
    thickness: lineWidth, color
  });

  // Bottom-right corner
  page.drawLine({
    start: { x: x + width + CROP_MARK_OFFSET, y: y },
    end: { x: x + width + CROP_MARK_OFFSET + CROP_MARK_LENGTH, y: y },
    thickness: lineWidth, color
  });
  page.drawLine({
    start: { x: x + width, y: y - CROP_MARK_OFFSET },
    end: { x: x + width, y: y - CROP_MARK_OFFSET - CROP_MARK_LENGTH },
    thickness: lineWidth, color
  });
}

createPrintPDF().catch(console.error);
