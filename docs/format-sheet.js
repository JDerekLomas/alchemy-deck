/**
 * ALCHEMY DECK SHEET FORMATTER
 *
 * Add this to your existing Google Apps Script:
 * 1. Go to your Google Sheet > Extensions > Apps Script
 * 2. Paste this code below your existing code
 * 3. Save, then run formatReviewSheet() from the menu (or add a custom menu)
 */

function formatReviewSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data to format yet!');
    return;
  }

  // Colors
  const gold = '#d4af37';
  const darkBg = '#1a1612';
  const headerBg = '#2a2420';
  const goodGreen = '#4ade80';
  const mehYellow = '#fbbf24';
  const badRed = '#f87171';
  const lightText = '#f5f5f5';
  const mutedText = '#a89078';

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setBackground(headerBg)
             .setFontColor(gold)
             .setFontWeight('bold')
             .setFontFamily('Georgia')
             .setHorizontalAlignment('center')
             .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  // Format data rows
  const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
  dataRange.setBackground(darkBg)
           .setFontColor(lightText)
           .setFontFamily('Arial')
           .setVerticalAlignment('middle');

  // Set alternating row colors
  for (let i = 2; i <= lastRow; i++) {
    const rowRange = sheet.getRange(i, 1, 1, lastCol);
    if (i % 2 === 0) {
      rowRange.setBackground('#221d19');
    }
    sheet.setRowHeight(i, 30);
  }

  // Format timestamp column (A)
  sheet.getRange(2, 1, lastRow - 1, 1).setFontColor(mutedText).setFontSize(9);

  // Format reviewer name column (B)
  sheet.getRange(2, 2, lastRow - 1, 1).setFontColor(gold).setFontWeight('bold');

  // Conditional formatting for ratings (columns G onwards = card ratings)
  const ratingCols = lastCol - 6; // First 6 cols are metadata
  if (ratingCols > 0) {
    const ratingRange = sheet.getRange(2, 7, lastRow - 1, ratingCols);

    // Clear existing conditional formatting
    const rules = sheet.getConditionalFormatRules();

    // Add new rules
    const newRules = [];

    // Green for approved (✓)
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('✓')
      .setBackground('#1a3d1a')
      .setFontColor(goodGreen)
      .setRanges([ratingRange])
      .build());

    // Yellow for meh (~)
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('~')
      .setBackground('#3d3a1a')
      .setFontColor(mehYellow)
      .setRanges([ratingRange])
      .build());

    // Red for rejected (✗)
    newRules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('✗')
      .setBackground('#3d1a1a')
      .setFontColor(badRed)
      .setRanges([ratingRange])
      .build());

    sheet.setConditionalFormatRules(newRules);
  }

  // Set column widths
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 120); // Reviewer
  sheet.setColumnWidth(3, 80);  // Approved
  sheet.setColumnWidth(4, 80);  // Needs Work
  sheet.setColumnWidth(5, 80);  // Rejected
  sheet.setColumnWidth(6, 80);  // Unreviewed

  // Card columns - narrower
  for (let i = 7; i <= lastCol; i++) {
    sheet.setColumnWidth(i, 45);
  }

  // Freeze header row and first 2 columns
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);

  // Center align rating columns
  if (ratingCols > 0) {
    sheet.getRange(1, 7, lastRow, ratingCols).setHorizontalAlignment('center');
  }

  // Add borders
  sheet.getRange(1, 1, lastRow, lastCol)
       .setBorder(true, true, true, true, true, true, '#3d3530', SpreadsheetApp.BorderStyle.SOLID);

  SpreadsheetApp.getUi().alert('Sheet formatted! ✨');
}

// Add custom menu
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Alchemy Deck')
    .addItem('Format Sheet', 'formatReviewSheet')
    .addItem('Create Summary Chart', 'createSummaryChart')
    .addToUi();
}

function createSummaryChart() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No data for chart yet!');
    return;
  }

  // Create a summary sheet if it doesn't exist
  let summarySheet = ss.getSheetByName('Summary');
  if (!summarySheet) {
    summarySheet = ss.insertSheet('Summary');
  } else {
    summarySheet.clear();
  }

  // Calculate totals
  const data = sheet.getRange(2, 3, lastRow - 1, 4).getValues(); // Approved, Needs Work, Rejected, Unreviewed
  let totals = [0, 0, 0, 0];
  data.forEach(row => {
    totals[0] += row[0] || 0;
    totals[1] += row[1] || 0;
    totals[2] += row[2] || 0;
    totals[3] += row[3] || 0;
  });

  // Write summary data
  summarySheet.getRange('A1:B5').setValues([
    ['Status', 'Count'],
    ['Approved', totals[0]],
    ['Needs Work', totals[1]],
    ['Rejected', totals[2]],
    ['Unreviewed', totals[3]]
  ]);

  // Create pie chart
  const chartBuilder = summarySheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(summarySheet.getRange('A2:B5'))
    .setPosition(1, 4, 0, 0)
    .setOption('title', 'Card Review Summary')
    .setOption('pieSliceText', 'percentage')
    .setOption('colors', ['#4ade80', '#fbbf24', '#f87171', '#666666'])
    .setOption('backgroundColor', '#1a1612')
    .setOption('legendTextStyle', {color: '#f5f5f5'})
    .setOption('titleTextStyle', {color: '#d4af37', fontSize: 16});

  summarySheet.insertChart(chartBuilder.build());

  // Format summary sheet
  summarySheet.getRange('A1:B1').setBackground('#2a2420').setFontColor('#d4af37').setFontWeight('bold');
  summarySheet.getRange('A2:B5').setBackground('#1a1612').setFontColor('#f5f5f5');
  summarySheet.setColumnWidth(1, 120);
  summarySheet.setColumnWidth(2, 80);

  SpreadsheetApp.getUi().alert('Summary chart created! 📊');
}
