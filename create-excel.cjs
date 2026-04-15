const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('📊 Creating Excel file from CSV data...');

// Read the CSV data
const csvData = fs.readFileSync(path.join(__dirname, 'Testdaten_Lageranalyse_Komplett.csv'), 'utf8');

// Parse CSV to JSON
const lines = csvData.split('\n');
const headers = lines[0].split(',');
const data = [];

// Add headers
data.push(headers);

// Add data rows
for (let i = 1; i < lines.length; i++) {
  if (lines[i].trim()) {
    const row = lines[i].split(',');
    // Convert numeric fields
    const processedRow = row.map((cell, index) => {
      const header = headers[index];
      if (['Jahr', 'Istbestand', 'Inventurergebnis', 'Verbrauch'].includes(header)) {
        return parseInt(cell) || 0;
      }
      if (['Preis', 'Sicherheitsbestand (%)'].includes(header)) {
        return parseFloat(cell) || 0;
      }
      return cell;
    });
    data.push(processedRow);
  }
}

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(data);

// Style the headers
const range = XLSX.utils.decode_range(ws['!ref']);
for (let col = range.s.c; col <= range.e.c; col++) {
  const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
  if (ws[cellAddress]) {
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center" }
    };
  }
}

// Set column widths
const colWidths = [
  { wch: 25 }, // Artikel
  { wch: 8 },  // Jahr
  { wch: 12 }, // Istbestand
  { wch: 15 }, // Inventurergebnis
  { wch: 12 }, // Verbrauch
  { wch: 10 }, // Preis
  { wch: 20 }  // Sicherheitsbestand (%)
];
ws['!cols'] = colWidths;

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Lageranalyse');

// Write file
const excelPath = path.join(__dirname, 'Perfect_Match_Lageranalyse.xlsx');
XLSX.writeFile(wb, excelPath);

console.log('✅ Excel file created:', excelPath);
console.log('📝 File contains:', data.length - 1, 'data rows');
console.log('📊 Columns:', headers.join(', '));
