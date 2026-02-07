# Thai Flashcards App

Eine moderne Web-App zum Lernen von Thai-Vokabeln im eleganten Apple-Design.

## Funktionen
- **Apple-Style Design**: Clean, minimalistisch und responsiv.
- **Bilingual**: Interface umschaltbar zwischen Deutsch und Thai.
- **Lernmodi**: 
  - Thai ↔ Deutsch
  - Thai ↔ Englisch
- **Intelligent**: Speichert den Lernfortschritt und bietet einen Modus zum Wiederholen von Fehlern.

## Nutzung

### Lokal starten
Einfach die Datei `index.html` mit einem beliebigen Webbrowser (Chrome, Safari, Edge) öffnen.

### Online verfügbar machen (GitHub Pages)
Damit du die App bequem auf dem iPhone oder Android-Gerät nutzen kannst:

1. Erstelle ein neues Repository auf GitHub.
2. Lade alle Dateien aus diesem Ordner hoch:
   - `index.html`
   - `style.css`
   - `app.js`
   - `data.js`
   - `lang.js`
3. Gehe im Repository zu **Settings** -> **Pages**.
4. Wähle unter **Source** den Branch `main` und klicke auf **Save**.
5. GitHub zeigt dir den Link zu deiner Webseite an. Speichere ihn als Lesezeichen!

## Vokabeln hinzufügen
Öffne die Datei `data.js` mit einem Texteditor. Füge neue Einträge nach diesem Muster hinzu:

```javascript
{
    id: 11, // Eindeutige Nummer
    thai: "...",
    transliteration: "...",
    german: "...",
    english: "...",
    category: "..."
},
```
