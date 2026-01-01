/**
 * Google Apps Script for collecting Alchemy Deck reviews
 *
 * Setup:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code
 * 4. Click Deploy > New deployment
 * 5. Select type: Web app
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Deploy and copy the URL
 * 9. Replace SHEETS_URL in review.html with your URL
 */

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    const data = JSON.parse(e.postData.contents);

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Reviewer',
        'Approved',
        'Needs Work',
        'Rejected',
        'Reviews (JSON)'
      ]);
    }

    // Add the review data
    sheet.appendRow([
      data.timestamp,
      data.reviewer,
      data.summary.approved,
      data.summary.needsWork,
      data.summary.rejected,
      JSON.stringify(data.reviews)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify deployment
function doGet(e) {
  return ContentService
    .createTextOutput('Alchemy Deck Review collector is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}
