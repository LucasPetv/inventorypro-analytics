# GitHub Repository erstellen und Website veröffentlichen

## Schritt 1: Repository auf GitHub erstellen

1. **Gehe zu GitHub:** https://github.com
2. **Klicke auf "New Repository" (grüner Button)**
3. **Repository-Details:**
   - **Repository name:** `inventorypro-analytics`
   - **Description:** `Modern inventory analysis web application with KPI calculations`
   - **Public** ✅ (für GitHub Pages kostenlos)
   - **Initialize this repository with:**
     - ❌ Add a README file (haben wir schon)
     - ❌ Add .gitignore (haben wir schon)
     - ❌ Choose a license (haben wir schon)
4. **Klicke "Create repository"**

## Schritt 2: Lokales Repository mit GitHub verbinden

**Führe diese Befehle in der PowerShell aus:**

```powershell
# Remote-Repository hinzufügen (ersetze DEIN_GITHUB_USERNAME)
git remote add origin https://github.com/DEIN_GITHUB_USERNAME/inventorypro-analytics.git

# Branch von master zu main umbenennen (GitHub Standard)
git branch -M main

# Code zu GitHub pushen
git push -u origin main
```

## Schritt 3: GitHub Pages aktivieren

1. **Gehe zu deinem Repository auf GitHub**
2. **Klicke auf "Settings" (oben rechts)**
3. **Scrolle zu "Pages" (linke Sidebar)**
4. **Source:** 
   - Wähle "**GitHub Actions**" aus dem Dropdown
5. **Das war's!** 🎉

## Schritt 4: Automatisches Deployment

- **Jeder `git push` löst automatisch ein Deployment aus**
- **Nach ~2-3 Minuten ist deine Website live unter:**
  `https://DEIN_GITHUB_USERNAME.github.io/inventorypro-analytics/`

## Schritt 5: Zukünftige Updates

```powershell
# Änderungen committen und pushen
git add .
git commit -m "Update: Beschreibung der Änderung"
git push
```

## 🚀 Fertig!

Deine Website wird automatisch unter dieser URL verfügbar sein:
**`https://DEIN_GITHUB_USERNAME.github.io/inventorypro-analytics/`**

### Login-Daten für deine Website:
- **Admin:** `admin` / `admin123`
- **Demo:** `demo` / `demo123`

---

## 📝 Anpassungen

**In der README.md** kannst du den Link zur Live-Demo anpassen:
```markdown
🚀 **[Live Demo](https://DEIN_GITHUB_USERNAME.github.io/inventorypro-analytics/)**
```

**Falls du das Repository anders benennst**, ändere in `vite.config.ts`:
```typescript
const base = command === 'build' && process.env.npm_lifecycle_event === 'build-gh-pages'
  ? '/DEIN_REPO_NAME/' 
  : './';
```
