/**
 * ALCHEMY DECK REVIEW COLLECTOR
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://sheets.new to create a new Google Sheet
 * 2. Name it "Alchemy Deck Reviews"
 * 3. Click Extensions > Apps Script
 * 4. Delete any code there and paste this entire file
 * 5. Click Deploy > New deployment
 * 6. Select type: Web app
 * 7. Set "Execute as": Me
 * 8. Set "Who has access": Anyone
 * 9. Click Deploy and authorize when prompted
 * 10. Copy the Web app URL
 * 11. Paste it into review.html where it says GOOGLE_SCRIPT_URL
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Create headers if this is the first entry
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp', 'Reviewer', 'Approved', 'Needs Work', 'Rejected', 'Unreviewed'
      ];
      // Add card columns
      const cardIds = [
        'stage-01', 'stage-02', 'stage-03', 'stage-04',
        'op-01', 'op-02', 'op-03', 'op-04', 'op-05', 'op-06', 'op-07',
        'elem-01', 'elem-02', 'elem-03', 'elem-04', 'elem-05',
        'prin-01', 'prin-02', 'prin-03',
        'vessel-01', 'vessel-02', 'vessel-03', 'vessel-04',
        'sage-01', 'sage-02', 'sage-03', 'sage-04', 'sage-05', 'sage-06',
        'arc-01', 'arc-02', 'arc-03', 'arc-04', 'arc-05'
      ];
      cardIds.forEach(id => headers.push(id));
      sheet.appendRow(headers);

      // Bold the header row
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    // Build the row
    const row = [
      new Date().toISOString(),
      data.reviewer || 'Anonymous',
      data.summary.approved,
      data.summary.needsWork,
      data.summary.rejected,
      data.summary.unreviewed
    ];

    // Add individual card ratings
    const cardIds = [
      'stage-01', 'stage-02', 'stage-03', 'stage-04',
      'op-01', 'op-02', 'op-03', 'op-04', 'op-05', 'op-06', 'op-07',
      'elem-01', 'elem-02', 'elem-03', 'elem-04', 'elem-05',
      'prin-01', 'prin-02', 'prin-03',
      'vessel-01', 'vessel-02', 'vessel-03', 'vessel-04',
      'sage-01', 'sage-02', 'sage-03', 'sage-04', 'sage-05', 'sage-06',
      'arc-01', 'arc-02', 'arc-03', 'arc-04', 'arc-05'
    ];

    cardIds.forEach(id => {
      const review = data.reviews[id];
      if (review && review.rating) {
        row.push(review.rating === 'up' ? '✓' : review.rating === 'meh' ? '~' : '✗');
      } else {
        row.push('');
      }
    });

    sheet.appendRow(row);

    // Also log full data to a second sheet for detailed review
    let detailSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Raw Data');
    if (!detailSheet) {
      detailSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Raw Data');
      detailSheet.appendRow(['Timestamp', 'Reviewer', 'Full JSON']);
    }
    detailSheet.appendRow([
      new Date().toISOString(),
      data.reviewer || 'Anonymous',
      JSON.stringify(data, null, 2)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Review submitted!' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Alchemy Deck Review Collector is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
