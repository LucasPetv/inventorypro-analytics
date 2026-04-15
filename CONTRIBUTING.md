# Contributing to InventoryPro Analytics

Vielen Dank für dein Interesse, zu InventoryPro Analytics beizutragen! 🎉

## 🚀 Quick Start

1. **Repository forken** auf GitHub
2. **Klonen** deines Forks:
   ```bash
   git clone https://github.com/YOUR-USERNAME/inventorypro-analytics.git
   cd inventorypro-analytics
   ```
3. **Dependencies installieren**:
   ```bash
   npm install
   ```
4. **Development Server starten**:
   ```bash
   npm run electron-dev
   ```

## 🛠️ Development Workflow

### Branch Strategy
```bash
# Feature branch erstellen
git checkout -b feature/amazing-new-feature

# Oder für Bugfixes
git checkout -b fix/critical-bug-fix

# Changes committen
git add .
git commit -m "feat: add amazing new feature"

# Push und Pull Request erstellen
git push origin feature/amazing-new-feature
```

### Commit Messages
Wir verwenden [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Neue Features
- `fix:` - Bugfixes  
- `docs:` - Dokumentation
- `style:` - Code-Formatierung
- `refactor:` - Code-Refactoring
- `test:` - Tests hinzufügen
- `chore:` - Build/Tool-Änderungen

### Code Style
- **TypeScript** für Type-Sicherheit
- **ESLint** für Code-Qualität (läuft automatisch)
- **Prettier** für Code-Formatierung
- **Functional Components** mit React Hooks

## 🧪 Testing

```bash
# App im Development Mode testen
npm run electron-dev

# Production Build testen  
npm run build
npm run electron

# Portable Build testen
npm run pack-portable
```

### Test-Daten verwenden
- Nutze die Dateien in `/sample-data/` für Tests
- Teste sowohl CSV- als auch Excel-Import
- Prüfe verschiedene Spalten-Konfigurationen

## 🐛 Bug Reports

Beim Melden von Bugs bitte folgende Infos angeben:

```markdown
**Beschreibung:**
Kurze Beschreibung des Problems

**Schritte zum Reproduzieren:**
1. Gehe zu...
2. Klicke auf...
3. Scrolle nach unten zu...
4. Siehe Fehler

**Erwartetes Verhalten:**
Was sollte passieren

**Screenshots:**
Falls zutreffend, füge Screenshots hinzu

**Environment:**
- OS: [z.B. Windows 11]
- Node Version: [z.B. 18.17.0]
- Electron Version: [z.B. 40.2.1]
```

## ✨ Feature Requests

Für neue Features bitte folgendes Format:

```markdown
**Problem/Bedarf:**
Welches Problem löst das Feature?

**Lösungsvorschlag:**
Wie könnte das Feature aussehen?

**Alternativen:**
Gibt es andere Lösungsansätze?

**Zusätzlicher Kontext:**
Screenshots, Mockups, Links, etc.
```

## 🔧 Entwicklung

### Projekt-Struktur verstehen
```
electron-v1/
├── components/          # React UI Komponenten
├── services/           # Business Logic  
├── electron/          # Electron Main Process
├── assets/           # Statische Dateien
├── sample-data/     # Test-Daten
└── docs/           # Dokumentation
```

### Wichtige Scripts
- `npm run dev` - Vite Dev Server
- `npm run electron-dev` - Electron + Hot Reload
- `npm run build` - Production Build
- `npm run electron` - Electron Production
- `npm run dist-portable` - Portable Distribution

### Neue Komponenten hinzufügen
1. Erstelle Komponente in `/components/`
2. Verwende TypeScript für Props
3. Füge zu entsprechendem View hinzu
4. Teste mit Beispiel-Daten

### Neue Services hinzufügen  
1. Erstelle Service in `/services/`
2. Implementiere TypeScript Interface
3. Registriere in entsprechender App-Komponente
4. Teste in Dev- und Production-Mode

## 📋 Pull Request Guidelines

### Vor dem PR
- [ ] Code läuft ohne Fehler
- [ ] Neue Features sind getestet
- [ ] Dokumentation ist aktualisiert
- [ ] Commit Messages folgen Konvention

### PR Template
```markdown
## Beschreibung
Kurze Beschreibung der Änderungen

## Art der Änderung
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Tests
- [ ] Development Mode getestet
- [ ] Production Build getestet
- [ ] Mit Sample-Daten getestet

## Screenshots
(Falls UI-Änderungen)
```

## 🏆 Anerkennung

Alle Contributor werden in der README erwähnt! Dein Beitrag wird wertgeschätzt.

## ❓ Fragen?

- **GitHub Issues** für bug reports und feature requests
- **GitHub Discussions** für allgemeine Fragen
- **README.md** für Setup-Anleitungen

---

**Happy Contributing! 🚀**
