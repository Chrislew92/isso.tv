# ISSO.TV V3 — aktuelle Agentenübergabe

Datum / Agent: 18.08.2026 / Codex

Ausgangs-Commit: `2de458e`

Arbeitspaket: HD-Hafenpass, sichere Außenkamera, animierte Wasser-/Nassflächen und vollständiger Browser-Kernlauf

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
- Vordach und Pier besitzen jetzt eine konstruierte Schwelle, eigene Hafen-Asphaltoberfläche, Entwässerung, Kiosk-/Wagen-/Fassadendetails, Leuchten, Container-/Kran-Silhouetten, animiertes Wasser und weich auslaufende Nassstellen.
- Die geöffnete Tür ist wirklich passierbar. Im Flur bleibt die Linse näher an der Korridormitte; am Hafen bleibt sie hinter 353L und wechselt die Laufrichtung bei gedrücktem W nicht mehr um.
- 353L besitzt einen deformierenden Kiefer; 353L/Lotte/Bahnhof sprechen elf lokale deutsche KI-Vorschauzeilen mit Untertitel- und Autoplay-Fallback.
- Untertitel blenden selbst dann aus, wenn ein Browseraudio weder `ended` noch einen Fehler meldet.
- 353L besitzt jetzt einen ersten geglätteten Walk/Run/Turn/Stop-Gait mit Knie-/Hufarbeit, Gegenschwung, Hüftgewicht, Oberkörperneigung und Idle-Atmung.
- Wiederholte statische Details werden nach Bevel-Anwendung gebatcht; Blender meldet 277 Objekte / 272 Meshes. Wohnung, Flur und Hafen wurden danach erneut visuell geprüft.
- Die lokale Vorschau ist noch kein freigegebener Release.

## Zuletzt geprüft

- `npm run test`: 16 Tests bestanden.
- `npm run build`: erfolgreich.
- `npm audit`: 0 bekannte Sicherheitslücken.
- Browser-Abnahme: automatischer Filmstart, Wohnung, echter Tür-/Flur-/Vordach-/Hafenlauf, kamerarelative Steuerung, Rollwagenprompt, Auswahl „Direkt helfen“, sichtbare Wagenfolge und Nachhall 3 → 4 geprüft. Untertitel-Failsafe geprüft; keine Konsolenwarnungen oder -fehler.
- Produktionsbuild: Runtime-Chunk rund 981,10 kB / 267,66 kB gzip; Level-GLB 8.013.760 Byte. Die aktuelle FPS-/Core-Web-Vitals-Messung bleibt offen, weil in dieser Umgebung kein Chrome-Trace-Werkzeug verfügbar ist.

## Bekannte Risiken

- Wohnung, Flur, Vordach und Hafen besitzen einen ersten zusammenhängenden Art-Pass; Bahnhof/Signalwerk brauchen weitere Innenräume, Beschilderung, Props und NPCs.
- Harte Bewegungsgrenzen statt echter Kollision/Navmesh.
- Level-GLB jetzt rund 8,01 MB trotz größerer Welt; Laufzeit-JPEGs und statische Detailbatches sind eingebettet, Produktions-LOD/KTX2 fehlen weiterhin.
- V2-Systeme sind noch nicht in V3 integriert.
- Rechtstext-Links führen im lokalen V3-Build noch nicht zu fertigen Dateien.

## Nächster kleinster Produktionsschritt

`P1-01` mit einer echten Chrome-Trace-/Core-Web-Vitals-Messung abschließen. Danach `P1-07` Walk/Run/Turn/Stop sauber blenden und parallel `P1-06` um Hafensound, Schilder, einen ersten NPC sowie reduzierte Draw-Calls/LOD erweitern.

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
