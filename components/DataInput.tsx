
import React, { useRef, useState } from 'react';
/* Added missing Database import from lucide-react */
import { Upload, FileType, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { InventoryRow, ColumnMapping } from '../types';

interface DataInputProps {
  onDataProcessed: (data: InventoryRow[]) => void;
  isProcessing: boolean;
  columnMapping: ColumnMapping;
  onColumnMappingChange: (mapping: ColumnMapping) => void;
}

const DataInput: React.FC<DataInputProps> = ({ 
  onDataProcessed, 
  isProcessing, 
  columnMapping, 
  onColumnMappingChange 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    
    // Prüfe Dateityp
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Excel-Datei verarbeiten
      handleExcelFile(file);
    } else if (fileExtension === 'csv') {
      // CSV-Datei verarbeiten
      handleCSVFile(file);
    } else {
      alert('Nicht unterstütztes Dateiformat. Bitte verwenden Sie CSV oder Excel-Dateien.');
      return;
    }
  };

  const handleExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Erstes Arbeitsblatt verwenden
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // In JSON konvertieren
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          alert('Excel-Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten.');
          return;
        }
        
        // Erste Zeile als Header verwenden
        const headers = jsonData[0] as string[];
        console.log('Excel Headers found:', headers);
        
        // Daten verarbeiten
        const rows: InventoryRow[] = jsonData.slice(1).map((row: any[], index) => {
          const obj: any = {};
          
          headers.forEach((header, idx) => {
            let val: any = row[idx];
            
            // Handle empty/null values
            if (val === null || val === undefined || val === '') {
              val = '';
            }
            
            // Detect numeric columns based on mapping
            const safeColumnMapping = columnMapping || {};
            const mappedName = Object.keys(safeColumnMapping).find(key => safeColumnMapping[key as keyof ColumnMapping] === header);
            if (mappedName && ['Istbestand', 'Inventurergebnis', 'Preis', 'Verbrauch', 'Jahr', 'Sicherheitsbestand'].includes(mappedName)) {
              if (val === '' || val === null || val === undefined) {
                val = mappedName === 'Sicherheitsbestand' ? 0 : 0; // Default to 0 for numeric fields
              } else {
                val = typeof val === 'number' ? val : parseFloat(val.toString().replace(',', '.').replace(/[^\d.-]/g, '') || '0');
              }
            }
            
            obj[header] = val;
            // Also set standard name for processing
            if (mappedName) obj[mappedName] = val;
          });
          
          return obj as InventoryRow;
        }).filter((row, index) => {
          // Prüfe ob die Zeile gültige Daten hat - weniger strenge Validierung
          const hasArtikel = row.Artikel && row.Artikel.toString().trim().length > 0;
          const safeColumnMapping = columnMapping || {};
          const hasMappedArtikel = Object.keys(row).some(key => {
            const mappedField = Object.keys(safeColumnMapping).find(field => safeColumnMapping[field as keyof ColumnMapping] === key);
            return mappedField === 'Artikel' && row[key] && row[key].toString().trim().length > 0;
          });
          
          // Prüfe, ob mindestens die wichtigsten Felder (Artikel + ein numerisches Feld) vorhanden sind
          const hasRequiredNumericData = (row.Istbestand && row.Istbestand > 0) || 
                                         (row.Inventurergebnis && row.Inventurergebnis > 0) ||
                                         (row.Preis && row.Preis > 0) ||
                                         (row.Verbrauch && row.Verbrauch > 0);
          
          const isValid = (hasArtikel || hasMappedArtikel) && hasRequiredNumericData;
          
          if (!isValid && index < 5) {
            console.log(`Excel Row ${index + 2} filtered out:`, {
              hasArtikel,
              hasMappedArtikel, 
              hasRequiredNumericData,
              row,
              columnMapping
            });
          }
          
          return isValid;
        });

        console.log(`Processed ${rows.length} valid rows from Excel file`);
        console.log('Sample Excel row:', rows[0]);
        
        if (rows.length === 0) {
          const mappedArtikelColumn = columnMapping?.Artikel;
          alert(`Keine gültigen Datensätze in Excel-Datei gefunden!\n\nPrüfen Sie:\n1. Spalten-Mapping: "${mappedArtikelColumn}" (in Einstellungen)\n2. Ob die "${mappedArtikelColumn}"-Spalte existiert und Daten enthält\n\nGefundene Spalten: ${headers.join(', ')}\nErwartete Artikel-Spalte: "${mappedArtikelColumn}"`);
          return;
        }

        onDataProcessed(rows);
      } catch (error) {
        console.error('Fehler beim Lesen der Excel-Datei:', error);
        alert('Fehler beim Verarbeiten der Excel-Datei. Stellen Sie sicher, dass es sich um eine gültige Excel-Datei handelt.');
      }
    };
    
    reader.onerror = () => {
      alert('Fehler beim Lesen der Excel-Datei.');
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      console.log('Raw file content (first 500 chars):', text.substring(0, 500));
      
      // Verbesserter CSV Parser
      let lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) {
        alert('Datei ist leer oder konnte nicht gelesen werden.');
        return;
      }
      
      // Verschiedene Trennzeichen versuchen
      const firstLine = lines[0];
      let separator = ';';
      if (firstLine.includes(',') && !firstLine.includes(';')) {
        separator = ',';
      } else if (firstLine.includes('\t')) {
        separator = '\t';
      }
      
      console.log('Detected separator:', separator);
      
      const headers = firstLine.split(separator).map(h => h.trim().replace(/"/g, ''));
      console.log('Headers found:', headers);
      
      if (headers.length < 2) {
        alert(`Fehler: Nur ${headers.length} Spalte(n) gefunden. Überprüfen Sie das Trennzeichen (Semikolon, Komma oder Tab).`);
        return;
      }
      
      const rows: InventoryRow[] = lines.slice(1).map((line, index) => {
        const values = line.split(separator).map(v => v.trim().replace(/"/g, ''));
        const obj: any = {};
        
        headers.forEach((header, idx) => {
          let val: any = values[idx] || '';
          
          // Detect numeric columns based on mapping
          const safeColumnMapping = columnMapping || {};
          const mappedName = Object.keys(safeColumnMapping).find(key => safeColumnMapping[key as keyof ColumnMapping] === header);
          if (mappedName && ['Istbestand', 'Inventurergebnis', 'Preis', 'Verbrauch', 'Jahr'].includes(mappedName)) {
            val = parseFloat(val.replace(',', '.').replace(/[^\d.-]/g, '') || '0');
          }
          
          obj[header] = val;
          // Also set standard name for processing
          if (mappedName) obj[mappedName] = val;
        });
        
        return obj as InventoryRow;
      }).filter((row, index) => {
        // Prüfe ob die Zeile gültige Daten hat
        const hasArtikel = row.Artikel && row.Artikel.toString().trim().length > 0;
        const hasMappedArtikel = Object.keys(row).some(key => {
          const mappedField = Object.keys(columnMapping || {}).find(field => columnMapping?.[field as keyof ColumnMapping] === key);
          return mappedField === 'Artikel' && row[key] && row[key].toString().trim().length > 0;
        });
        const hasData = Object.values(row).some(val => val && val.toString().trim().length > 0);
        
        const isValid = (hasArtikel || hasMappedArtikel) && hasData;
        
        if (!isValid && index < 5) {
          console.log(`Row ${index + 2} filtered out:`, {
            hasArtikel,
            hasMappedArtikel, 
            hasData,
            row,
            columnMapping
          });
        }
        
        return isValid;
      });

      console.log(`Processed ${rows.length} valid rows from ${lines.length - 1} total rows`);
      console.log('Sample processed row:', rows[0]);
      
      if (rows.length === 0) {
        const safeMapping = columnMapping || {};
        const mappedArtikelColumn = safeMapping.Artikel || 'Artikel';
        alert(`Keine gültigen Datensätze gefunden!\n\nPrüfen Sie:\n1. Spalten-Mapping: "${mappedArtikelColumn}" (in Einstellungen)\n2. Ob die "${mappedArtikelColumn}"-Spalte in der CSV existiert und Daten enthält\n3. Das Dateiformat (CSV mit Semikolon-Trennzeichen)\n\nGefundene Spalten: ${headers.join(', ')}\nErwartete Artikel-Spalte: "${mappedArtikelColumn}"`);
        console.log('Debug Info:', { columnMapping: safeMapping, headers, separator, firstFewRows: lines.slice(0, 3) });
        return;
      }

      onDataProcessed(rows);
    };
    
    reader.onerror = () => {
      alert('Fehler beim Lesen der CSV-Datei. Versuchen Sie es mit einer anderen Datei.');
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-slate-800 mb-3 text-center">Daten-Import</h3>
          <p className="text-slate-500">Laden Sie Ihre Bestandsdaten als CSV oder Excel hoch. <br/>Achten Sie auf das korrekte Spalten-Mapping in den Einstellungen.</p>
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          className={`relative border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileChange} 
            className="hidden" 
            accept=".csv,.xlsx,.xls" 
          />
          
          <div className="bg-indigo-100 p-6 rounded-3xl text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          
          {fileName ? (
            <div className="flex items-center gap-2 text-indigo-600 font-bold">
              <CheckCircle2 size={20} />
              <span>{fileName} geladen</span>
            </div>
          ) : (
            <>
              <p className="text-lg font-bold text-slate-800 mb-1">Datei hierher ziehen</p>
              <p className="text-slate-400">Oder klicken, um den Dateimanager zu öffnen</p>
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-blue-50 flex items-center gap-4">
            <FileType className="text-blue-600" size={24} />
            <div>
              <p className="text-xs font-bold text-blue-900/40 uppercase tracking-wider">Format</p>
              <p className="text-sm font-semibold text-blue-900">CSV / XLSX</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 flex items-center gap-4">
            <CheckCircle2 className="text-emerald-600" size={24} />
            <div>
              <p className="text-xs font-bold text-emerald-900/40 uppercase tracking-wider">Validierung</p>
              <p className="text-sm font-semibold text-emerald-900">Automatisch</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 flex items-center gap-4">
            <AlertCircle className="text-amber-600" size={24} />
            <div>
              <p className="text-xs font-bold text-amber-900/40 uppercase tracking-wider">Tipp</p>
              <p className="text-sm font-semibold text-amber-900">Semikolon-Trennzeichen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
        <div className="flex items-start gap-6">
          <div className="bg-indigo-500/20 p-4 rounded-2xl text-indigo-400">
            <Database size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold mb-2">Wie Ihre Daten verarbeitet werden</h4>
            <p className="text-indigo-100/60 leading-relaxed text-sm">
              Ihre hochgeladene Datei wird über eine gesicherte Ende-zu-Ende-Verschlüsselung an unsere 
              Server-Infrastruktur übertragen. Dort werden die komplexen KPI-Berechnungen (Andler-Formel, ABC-Mapping) 
              durchgeführt und die Ergebnisse temporär im Arbeitsspeicher gehalten. Ihre Daten verlassen niemals 
              die sichere Zone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataInput;
