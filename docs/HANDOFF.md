# ISSO.TV V3 — aktuelle Agentenübergabe

Datum / Agent: 17.08.2026 / Codex

Ausgangs-Commit: `eee01eb`

Arbeitspaket: Dokumentations- und Agentenfundament

## Geänderte Dokumentation

- `AGENTS.md`, `CLAUDE.md`, `MANUS.md` und `.github/copilot-instructions.md` als Agenten-Einstiege,
- `ROADMAP.md` als phasenweise Produktionsplanung mit IDs, Abhängigkeiten und Gates,
- `docs/PROJECT_STATE.md` als belegter V3-Ist-Stand,
- `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` und `docs/QA_RELEASE.md`,
- `MERGE_MATRIX.md` als ehrliche V2-Spendermatrix,
- `STORY_BIBLE.md` um 353Ls kontrollierte Stärke und zwei **mögliche** gespiegelte 1-gegen-1-QTE-Pfade ergänzt: gefeierter Kneipensieg mit innerem Unbehagen sowie späterer Straßenraub mit heftiger Gegenwehr, bewusstem Stopp und offener Frage nach seiner aggressiven Seite. Beide können vermieden werden; ein gewaltfreier Run bleibt gleichwertig.

## Aktueller sichtbarer Stand

- Film startet automatisch.
- Danach ist 353L in einer zusammenhängenden 3D-Szene frei steuerbar.
- Donkey-Connection, Tür, Pier-Wagen, Bahnhof und Signalwerk erzeugen lokalen Nachhall.
- Die lokale Vorschau ist noch kein freigegebener Release.

## Zuletzt geprüft

- `npm run test`: 8 Tests bestanden.
- `npm run build`: erfolgreich.
- `npm audit`: 0 bekannte Sicherheitslücken.
- Browser-Referenzlauf: ungefähr 55–56 FPS nach Initialladung, keine neuen Runtime-Fehler.

## Bekannte Risiken

- Environment und Animationen sind noch Vertical-Slice-/Blockout-Qualität.
- Harte Bewegungsgrenzen statt echter Kollision/Navmesh.
- Große 3D-Assets ohne Produktionskompression/LOD.
- V2-Systeme sind noch nicht in V3 integriert.
- Rechtstext-Links führen im lokalen V3-Build noch nicht zu fertigen Dateien.

## Nächster kleinster Produktionsschritt

Mit `ROADMAP.md` Arbeitspaket `P1-01` beginnen: messbare Visual-/Performance-Budgets festlegen und danach Wohnung → Flur → Hafen als einen vollständigen Art-Pass bearbeiten.

Live verändert: **NEIN**

---

## Vorlage für die nächste Übergabe

```text
Datum / Agent:
Ausgangs-Commit:
Arbeitspaket:
Geänderte Dateien:
Was ist im Browser sichtbar:
Tests / Build / Audit:
Bekannte Fehler oder Risiken:
Nächster kleinster Schritt:
Live verändert: NEIN/JA + ausdrückliche Freigabe
```
