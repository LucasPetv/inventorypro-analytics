# Sample Data / Beispieldaten

Dieser Ordner enthält Beispieldateien zum Testen der InventoryPro Analytics Anwendung.

## 📁 Dateien

### CSV-Dateien
- `Testdaten_Perfect_Match.csv` - Perfekt konfigurierte Testdaten mit Standard-Spalten
- `Testdaten_Lageranalyse_Komplett.csv` - Vollständige Testdaten mit allen KPI-relevanten Feldern

### Excel-Dateien  
- `Perfect_Match_Lageranalyse.xlsx` - Excel-Version der Perfect-Match-Daten

## 📊 Datenstruktur

Alle Beispieldateien verwenden folgende Spaltenstruktur:

| Spalte | Datentyp | Beschreibung |
|--------|----------|--------------|
| Artikel | Text | Eindeutige Artikel-Bezeichnung |
| Jahr | Integer | Bezugsjahr (2023-2025) |
| Istbestand | Integer | Aktueller Lagerbestand |
| Inventurergebnis | Integer | Inventur-Ergebnis |
| Verbrauch | Integer | Jährlicher Verbrauch |
| Preis | Float | Einkaufspreis pro Einheit |
| Sicherheitsbestand (%) | Float | Sicherheitsbestand in Prozent |

## 🚀 Verwendung

1. App starten (`npm run electron` oder `npm run electron-dev`)
2. "Daten Import" auswählen
3. Eine der Beispieldateien hochladen
4. Automatische Analyse der KPIs im Dashboard

## 🛠️ Eigene Testdaten erstellen

Du kannst das mitgelieferte Script verwenden, um aus CSV-Daten Excel-Dateien zu generieren:

```bash
node create-excel.cjs
```

## 📝 Hinweise

- Die Dateien enthalten fiktive Daten für Demonstrationszwecke
- Alle numerischen Werte wurden für realistische KPI-Berechnungen optimiert
- Die Spalten-Namen entsprechen dem Standard-Mapping der Anwendung
- Bei eigenen Daten können die Spalten in den Einstellungen angepasst werden
