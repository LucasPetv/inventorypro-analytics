# InventoryPro Analytics

Eine moderne Web-Anwendung für Lageranalyse und Inventar-KPI-Berechnung.

🚀 **[Live Demo](https://yourusername.github.io/inventorypro-analytics/)**

## 🚀 Features

- **Excel/CSV Import**: Unterstützt flexible Datenimporte mit konfigurierbarem Spalten-Mapping
- **KPI-Dashboard**: Berechnet automatisch wichtige Lagerkennzahlen wie Umschlagshäufigkeit, Reichweite, etc.
- **Web-Anwendung**: Läuft in jedem modernen Browser ohne Installation
- **Modern UI**: React + TypeScript + Tailwind CSS für eine moderne Benutzeroberfläche

## 📊 Unterstützte KPIs

- Umschlagshäufigkeit
- Reichweite in Tagen  
- Bestandswert
- Sicherheitsbestand-Analyse
- ABC-Analyse (geplant)
- Und viele weitere...

## 🛠️ Technologie-Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Excel**: SheetJS (xlsx)

## � Authentifizierung

Die Anwendung verwendet eine einfache Benutzerauthentifizierung mit folgenden Zugangsdaten:

- **Admin**: `admin` / `admin123`
- **Demo**: `demo` / `demo123`

## �📦 Installation & Setup

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn

### Development Setup
```bash
# Repository klonen
git clone <repository-url>
cd inventorypro-analytics

# Abhängigkeiten installieren
npm install

# Development Server starten
npm run dev

# Produktions-Build erstellen
npm run build

# Build-Vorschau
npm run preview

# Produktions-Version testen
npm run electron
```

### Portable Distribution erstellen
```bash
# Portable Electron App erstellen
npm run pack-portable

# Oder mit electron-builder
npm run dist-portable
```

## 📂 Projektstruktur

```
electron-v1/
├── components/          # React Komponenten
│   ├── Dashboard.tsx    # Haupt-Dashboard
│   ├── DataInput.tsx    # Excel/CSV Import
│   ├── AnalyticsTable.tsx # Datenansicht
│   └── ...
├── services/           # Business Logic
│   ├── inventoryService.ts
│   └── ...
├── electron/          # Electron Main Process
│   ├── main-simple.cjs
│   └── preload.js
├── assets/           # Statische Dateien
├── release/         # Build-Artefakte
└── test-data/       # Beispiel-Testdaten
```

## 📋 Beispiel-Datenformat

Die App unterstützt CSV/Excel-Dateien mit folgenden Spalten:

```csv
Artikel,Jahr,Istbestand,Inventurergebnis,Verbrauch,Preis,Sicherheitsbestand (%)
Schraube M8,2023,1200,1200,8000,0.12,10
Mutter M8,2023,600,600,4200,0.08,0
Palette EUR,2024,300,300,900,12.5,15
```

### Testdateien
- `Perfect_Match_Lageranalyse.xlsx` - Excel-Beispieldatei
- `Testdaten_Perfect_Match.csv` - CSV-Testdaten
- `Testdaten_Lageranalyse_Komplett.csv` - Vollständige Testdaten

## ⚙️ Konfiguration

### Spalten-Mapping
In den Einstellungen können die Spaltennamen an deine Datenstruktur angepasst werden:

```typescript
columnMapping = {
  Artikel: 'Artikel',
  Istbestand: 'Current_Stock', 
  Verbrauch: 'Consumption',
  Preis: 'Unit_Price',
  // ...
}
```

## 🔒 Sicherheit & Portable Mode

Die App ist speziell für sichere, portable Distribution entwickelt:

- ✅ Keine externen Netzwerk-Verbindungen im Produktions-Modus
- ✅ Alle Berechnungen lokal im Browser/Electron
- ✅ Keine Backend-Abhängigkeiten
- ✅ Perfekt für Demo-Zwecke und Offline-Nutzung

## 🚀 Scripts

```bash
npm run dev           # Vite Dev Server
npm run build         # Production Build
npm run electron      # Electron mit Production Build
npm run electron-dev  # Electron mit Hot-Reload
npm run dist-portable # Portable Distribution
npm run pack-portable # Alternative portable Erstellung
```

## 🧪 Testing

Beispiel-Testdaten sind im Repository enthalten. Die App kann mit den bereitgestellten CSV/Excel-Dateien getestet werden.

## 📝 Entwicklung

### Neue Features hinzufügen
1. Neue Komponenten in `components/` erstellen
2. Business Logic in `services/` implementieren  
3. Types in `types.ts` erweitern
4. Tests mit Beispieldateien durchführen

### Build-Pipeline
- Vite für Frontend-Build
- Electron-Builder für Desktop-Distribution
- TypeScript für Type-Sicherheit

## 🤝 Contributing

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📄 License

Dieses Projekt ist unter der MIT Lizenz veröffentlicht. Siehe `LICENSE` Datei für Details.

## 🐛 Known Issues & Fixes

### Excel/CSV Import Fehler
- **Problem**: `TypeError: Cannot convert undefined or null to object`
- **Lösung**: Fixed durch defensive columnMapping-Behandlung

### Logo Loading Issues  
- **Problem**: Logo wird in Production Build nicht geladen
- **Lösung**: Proper ES module imports für Assets

### White Screen Issues
- **Problem**: Electron zeigt weißen Bildschirm
- **Lösung**: Korrekte Dev/Production Mode Detection

## 📞 Support

Bei Fragen oder Problemen bitte ein GitHub Issue erstellen.

---

**InventoryPro Analytics** - Moderne Lageranalyse für professionelle Anwender.
