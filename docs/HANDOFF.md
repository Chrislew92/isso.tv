# ISSO.TV V3 — aktuelle Agentenübergabe

Datum / Agent: 18.08.2026 / Codex

Ausgangs-Commit: `146b92f`

Arbeitspaket: größerer HD-Wohnungsmaßstab, Flur-Art-Pass und spielbare Schwelle

## Geänderte Dokumentation

- `AGENTS.md`, `CLAUDE.md`, `MANUS.md` und `.github/copilot-instructions.md` als Agenten-Einstiege,
- `ROADMAP.md` als phasenweise Produktionsplanung mit IDs, Abhängigkeiten und Gates,
- `docs/PROJECT_STATE.md` als belegter V3-Ist-Stand,
- `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` und `docs/QA_RELEASE.md`,
- `MERGE_MATRIX.md` als ehrliche V2-Spendermatrix,
- `STORY_BIBLE.md` um 353Ls kontrollierte Stärke und zwei **mögliche** gespiegelte 1-gegen-1-QTE-Pfade ergänzt: gefeierter Kneipensieg mit innerem Unbehagen sowie späterer Straßenraub mit heftiger Gegenwehr, bewusstem Stopp und offener Frage nach seiner aggressiven Seite. Beide können vermieden werden; ein gewaltfreier Run bleibt gleichwertig.
- `docs/CONFLICT_SCENARIOS.md` enthält die vollständige Entscheidungs- und Nachhallmatrix. Beim Straßenraub sind frühes Vermeiden, **Weglaufen**, Abgeben, Reden, Hilfe und Gegenwehr gleichwertige Hauptpfade; pro Moment werden höchstens drei kontextuelle Optionen gezeigt.
- 353Ls **Hufsprint** ist verbindlicher Bewegungskanon: für wenige Sekunden ungefähr doppelte Menschengeschwindigkeit, spektakulär und direkt steuerbar; auf offener Strecke ist Flucht vor einem einzelnen menschlichen Räuber normalerweise erfolgreich.
- `docs/ANIMAL_LORE.md` definiert die **Obere Gabe**: ausgewählte Tiere können sich freiwillig aufrichten, müssen aber anatomisch Tier bleiben. 353L behält Vorder-/Hinterhufe; Katzen behalten Pfoten und Krallen. Aufrecht- und Tierhaltung sowie artspezifische Verben sind zukünftige Gameplay-Pakete.
- `docs/EARTH_1.md` definiert **Erde-1 im Jahr 2033** als Parallelwelt mit demselben Kalender und anderen Grundgesetzen. Eine höhere Macht kann für Gott stehen und machte die Obere Gabe möglich; ISSO.TV bestätigt dennoch keine bestimmte Religion und vergibt keine Glaubenspunkte.
- Die älteste Tierlegende versteht die Obere Gabe als einen von Gottes Friedensplänen. **Earthpeace 2033 wurde nicht pünktlich erreicht**; EyTonLand kann später versuchen, die verspätete Aufgabe praktisch weiterzuführen.
- Jedes aufgerichtete Tier trägt laut Tierwissen einen eigenen höheren Zweck, kennt ihn aber nicht. 353Ls Zweck bleibt ausdrücklich offen; Agenten dürfen Spuren schreiben, aber keine endgültige Antwort erfinden.
- Menschen können ebenfalls einen unbekannten höheren Zweck besitzen; bei bewusster KI bleibt die Frage offen. Nur Tiere teilen die Gewissheit der Oberen Gabe.
- Eitelstedt beginnt bewusst grau und nass. Hoffnung erscheint ohne Balken als lokale Weltveränderung: warme Fenster, reparierte Lichter, Grüße, Pflanzen, offene Orte und erinnerte gute Handlungen.
- `docs/VOICE_AND_LIPSYNC.md` definiert Full Voice. Der lokale KI-Voice-Vertical-Slice ist umgesetzt: elf Zeilen, stabile IDs, Untertitel, Audiofallback, `rig_jaw` sowie Kopf-/Ohrperformance. Anbieterrechte, finale Masterstimme und Phonemviseme bleiben offen; nichts davon ist zur Veröffentlichung freigegeben.

## Aktueller sichtbarer Stand

- Film startet automatisch.
- Danach ist 353L in einer zusammenhängenden 3D-Szene frei steuerbar.
- Donkey-Connection, Tür, Pier-Wagen, Bahnhof und Signalwerk erzeugen lokalen Nachhall.
- Die Wohnung besitzt jetzt einen ersten HD-Art-Pass: texturierter dunkler Eichenboden, einzelne Dielen, Bettaufbau, Teppich, Nachttisch/Lampe, Fensterrahmen, Heizkörper und geschlossener Stauraum.
- Das Zimmer misst jetzt rund 10,3 × 9,6 m; 353L besitzt statt der irrtümlichen 3,35 m einen glaubwürdigen 2,15-m-Maßstab. Die offene vierte Wand hält die Verfolgerkamera frei.
- Der Hausflur besitzt Terrazzo, Petrol-Vertäfelung, vier Türen, Rahmen, Briefkästen, Messingdetails, Lichtspalten und warme Leuchten.
- Die geöffnete Tür ist wirklich passierbar. Beim Übertritt dreht die Kamera weich auf die Längsachse des Flurs; der alte schwarze Wandclip ist beseitigt.
- 353L besitzt einen deformierenden Kiefer; 353L/Lotte/Bahnhof sprechen elf lokale deutsche KI-Vorschauzeilen mit Untertitel- und Autoplay-Fallback.
- Die lokale Vorschau ist noch kein freigegebener Release.

## Zuletzt geprüft

- `npm run test`: 16 Tests bestanden.
- `npm run build`: erfolgreich.
- `npm audit`: 0 bekannte Sicherheitslücken.
- Browser-Abnahme nach Raum-/Flurpass: normaler Zimmerstart, direkte Flur-QA, echter Schwellenübertritt und Flurlauf geprüft; keine Konsolenwarnungen oder -fehler. Die frühere 55–56-FPS-Baseline muss nach den zwei HD-Texturen erneut mit dem Performance-Werkzeug gemessen werden.

## Bekannte Risiken

- Wohnung und Flur besitzen den ersten Art-Pass; Vordach, Hafen, Bahnhof und Signalwerk sind weiterhin Vertical-Slice-/Blockout-Qualität.
- Harte Bewegungsgrenzen statt echter Kollision/Navmesh.
- Level-GLB jetzt ungefähr 8,74 MB; große 3D-Assets ohne Produktionskompression/LOD/KTX2.
- V2-Systeme sind noch nicht in V3 integriert.
- Rechtstext-Links führen im lokalen V3-Build noch nicht zu fertigen Dateien.

## Nächster kleinster Produktionsschritt

`P1-01` abschließen: Wohnung/Flur mit dem Performance-Werkzeug messen und Asset-Budgets festhalten. Danach `P1-05` am Vordach abschließen und `P1-06` Hafen/Pier/Kiosk auf denselben sichtbaren Standard ziehen.

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
