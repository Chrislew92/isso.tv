# ISSO.TV V3 — verifizierter Projektstand

Stand: 18.08.2026

Verifizierte Basis: `06d4322` (`Replace 3D white screens with recoverable loading states`).

Produktstatus: **lokaler technischer 3D-Vertical-Slice, nicht releasefähig und nicht zur Veröffentlichung freigegeben**

Dieses Dokument beschreibt ausschließlich Funktionen, die im aktuellen V3-Code nachweisbar vorhanden sind. Ideen und V2-Spender stehen in `ROADMAP.md`, nicht in der Fertig-Liste.

## Produktgrenzen

| Thema | Verbindlicher Stand |
| --- | --- |
| Aktive Codebasis | dieses Repository, Branch `master` |
| Öffentliche Version | bestehendes `https://isso.tv`; durch V3 noch nicht ersetzt |
| Lokale Vorschau | `http://127.0.0.1:5173/` |
| V2 | archivierter Spender am Tag `v2-archive-2026-08-17` |
| 353L.ai | getrenntes Projekt; hier nicht bearbeiten |
| Echtgeld | nicht vorhanden |
| Save-Ort | Browser-`localStorage`, Schlüssel `isso-tv-v3-run-v2` |

## Tatsächlich implementiert

### Einstieg und Präsentation

- automatischer Prolog-Film beim Laden, inklusive Poster und deutschen Untertiteln,
- Browser-Autoplay stumm; Ton kann bewusst aktiviert werden,
- Film kann übersprungen oder später erneut geöffnet werden,
- direkter Übergang vom Film in die bereits geladene 3D-Szene,
- HUD mit Weltzeit, Ort, Wetter, Kapiteltext, Minimap, Interaktionshinweis und Nachhall.

### Echte 3D-Runtime

- React Three Fiber / Three.js als Laufzeit,
- zusammenhängendes GLB mit Wohnung, Flur, Vordach, Hafen, Bahnhof und Signalwerk,
- texturiertes und geriggtes 353L-GLB statt Sprite,
- WASD/Pfeiltasten, Sprint mit Shift, Orbit-Kamera, Zoom und Kamera-Nachführung,
- getestete harte Bewegungszonen mit passierbarer geöffneter Wohnungstür, ohne vollständige Physik/Kollision,
- zonenabhängige Kameraführung: offener Filmset-Blick im Zimmer, zur Korridormitte geführte Perspektive im schmalen Flur und ein hinter 353L bleibender Übergang ins Hafengelände,
- GPU-Regen, Fog, Schatten, mehrere Lichtquellen und adaptive Auflösung,
- Renderloop pausiert während Film und Dialogen,
- 3D-Suspenseanzeige mit Prozent, Bausteinzähler und Fortschrittsleiste sowie ein Runtime-Error-Boundary mit verständlichem Wiederladen statt Weißbild.

### Lokaler HD-/Voice-Vertical-Slice

- Wohnung mit rund 10,3 × 9,6 m Grundfläche, glaubwürdig skaliertem 2,15-m-353L, HD-Eichenbodentextur, einzelnen Dielen, sauberem Bettaufbau, Teppich, Nachttisch, Lampe, Fensterrahmen, Fensterbank, Heizkörper, geschlossenem Stauraum und klarerer Lichtführung,
- Hausflur mit eigenem gekacheltem Terrazzo, Vertäfelung, vier Wohnungstüren, Rahmen, Briefkästen, Messingdetails, Lichtspalten und Leuchten,
- verlustfreie Raum-, Flur- und Hafen-Texturmaster unter `assets/textures/` sowie visuell hochwertige JPEG-Laufzeitderivate im GLB,
- ausgebautes Vordach mit Dachrippen, Trägern, Regenrinne, Ablauf, Pfostenbasen, Leuchten, Pflastervorplatz, Entwässerungsrinne und sicher lesbarem Weg,
- erster Hafen-Art-Pass mit gekacheltem Regenasphalt, Werkstattfassade, Kioskdetails, Rollwagen/Transportkisten, Bahnhof-/Signalwerkfassaden, kontrollierten Industrieleuchten, Container-/Kran-Silhouetten, animiertem Wasser und weichen Nassreflexionen,
- physische, aus der Blender-Quelle reproduzierbare 3D-Schilder `PIER 17` und `NACHTKIOSK`,
- räumliche Hafenweite mit detailliertem Arbeitsschiff, beleuchteter Kabine, Reling, Mast, Rettungskasten sowie ferner Speicherstadt, Schornsteinen und sparsamen Fensterlichtern,
- 353L-Material mit höherer Anisotropie, ruhigerer Rauheit und neuem deformierendem `rig_jaw`,
- elf lokale deutsche KI-Sprachzeilen für 353L, Lotte und Bahnhof,
- stabile Dialog-IDs, MP3-Dateien, Wortzeitmarken, Untertiteloverlay, Stimme-an/aus und Autoplay-Fallback; ein 6,8-Sekunden-Failsafe verhindert dauerhaft festhängende Untertitel,
- Kiefer-, Kopf- und Ohrperformance reagieren in Echtzeit auf den Sprachpegel.
- erster prozeduraler Gait-Pass mit beschleunigendem Walk/Run-Blend, Knie-/Hufgegenbewegung, Armgegenswing, Hüftgewicht, Oberkörperneigung, Kurvenlage, Körperhub und ruhiger Idle-Atmung,
- kontrolliert anlaufender Hufsprint mit ungefähr doppelter Gehgeschwindigkeit, verstärkter Körpervorlage, leichter FOV-Dynamik und sichtbarer `⇧ HUFSPRINT`-Steuerhilfe,
- statische Seriendetails wie Ziegel, Dielen, Gitter, Rippen und Papiere werden im reproduzierbaren Blender-Build nach Anwendung ihrer Bevels gebatcht; der aktuelle Weltstand enthält einschließlich 3D-Schildern, Schiff und ferner Speicherstadt 317 Objekte / 312 Meshes statt hunderter einzelner Detailknoten.

### Aktueller spielbarer Morgen

1. Film endet; 353L steht in der Wohnung auf.
2. Donkey-Connection bietet drei Haltungen.
3. Die Wohnungstür öffnet Flur und Außenweg.
4. Ein Rollwagen am Pier bietet fünf gleichwertige Haltungen.
5. Bahnhof/Gleis 4 kann betrachtet werden.
6. Signalwerk/HQ1 kann betreten bzw. als Idee markiert werden.
7. Ereignisse erscheinen im lokalen „Nachhall“.

### Zustand und Qualität

- reducerbasierter Run-Zustand mit Weltminuten, Tür, Wagen, Besuchen und Ereignissen,
- Save/Load/Reset über `localStorage` mit Schema-Version `2`,
- doppelte Ereignisse werden für denselben Moment verhindert,
- sechzehn Vitest-Fälle, darunter fünf Wagen-Haltungen und fünf Regressionen für Zimmer-/Tür-/Flurbewegung,
- Produktions-Build erfolgreich,
- npm-Audit zuletzt ohne bekannte Sicherheitslücke,
- frühere interne Referenzmessung vor dem aktuellen Hafenpass dokumentiert; für den jetzigen Stand wurde mangels verfügbarem Chrome-Trace-Werkzeug bewusst keine neue FPS-/Core-Web-Vitals-Zahl behauptet.

## Ausdrücklich noch nicht implementiert

Die folgenden Systeme existierten teilweise als V2-Prototyp oder Konzept, sind aber **nicht** Teil der aktuellen V3-Runtime:

- Charaktererstellung, Presets, Alter, Wohnform oder freie Startwerte,
- die Obere Gabe als spielbares Haltungssystem, Tierlauf oder weitere artspezifische Figuren/Fähigkeiten,
- Erde-1-/höhere-Macht-Lore als sichtbare In-Game-Fragmente oder Dialoge,
- Euro-/Vermögens-/Schutzkonto-/Schulden-/Insolvenz-System,
- Hunger, Durst, Essensgutscheine, Bestellung, Schlaf und Routinen,
- BTC/ETH/LTC/SOL/Z-Coin-Portfolio und echte/simulierte Marktwerte,
- Spilo-Sprung mit 10/20/50/100 Euro,
- Messenger, NPC-Beziehungen, Fraktionen, Rang und Aufträge,
- vollständige Stadtkarte, Verkehr und frei betretbare Stadt-Innenräume,
- Behandlung, Krise, Haft und Rückkehrpfade als spielbare 3D-Kapitel,
- mehrere Save-Slots, Export/Import und Save-Migrationen,
- Controller-, Touch- und vollständige Mobile-Steuerung,
- vollständige Audio-Landschaft, Musik-State-System und professionelle Animation-Blends,
- finale rechtlich geprüfte Masterstimmen, vollständige Vertonung, Offline-Phonem-/Visem-Timing und alle artspezifischen Mundformen,
- echte Kollisions-/Physikschicht, Navigation Mesh, Treppen und Interaktionsanimationen,
- finaler Environment-Art-Pass, LOD/Kompression und Asset-Streaming,
- fertige Impressums-/Datenschutzseiten im aktuellen V3-Build,
- Deployment-Workflow oder Freigabe zum Live-Austausch.

## Aktuelle Dateilandkarte

| Bereich | Datei / Ordner | Aufgabe |
| --- | --- | --- |
| App-Orchestrierung | `src/App.jsx` | Film, Modals, Reducer, UI/3D-Verbindung |
| 3D-Runtime | `src/components/RealtimeWorld.jsx` | Laden, Rendern, Bewegung, Kamera, Interaktionsnähe |
| HUD | `src/components/GameInterface.jsx` | Status, Navigation, Prompt, Footer |
| Film | `src/components/OpeningFilm.jsx` | Auto-Prolog und Übergang |
| Weltkanon | `src/game/canon.js` | Orte, Texte, Interaktionen, Zeitformat |
| Zustandslogik | `src/game/state.js` | Run-Zustand und Folgen |
| Bewegungslogik | `src/game/movement.js` | getestete Raum-/Tür-/Flurgrenzen und Ortszuordnung |
| Persistenz | `src/game/save.js` | localStorage lesen/schreiben/löschen |
| Tests | `src/**/*.test.js` | reducerbasierte Regeln, Dialogkonsistenz und Bewegungsregressionen |
| Voice-Runtime | `src/audio/useVoicePlayer.js` | Web Audio, Pegel, Untertitel- und Autoplayzustand |
| Dialogdaten | `src/content/dialogue/` | stabile deutsche Dialog-IDs und Sprachdateiverweise |
| Sprachdateien | `public/audio/de/` | lokaler KI-Voice-Vertical-Slice plus Wortzeitmarken |
| Runtime-Modelle | `public/models/` | ausgelieferte GLB-Dateien |
| Blender-Quellen | `assets/source/` | editierbare Master-Assets |
| HD-Texturen | `assets/textures/` | projektgebundene Oberflächenquellen |
| Asset-Pipeline | `tools/blender/` | reproduzierbare Erstellung/Inspektion |
| Voice-Pipeline | `tools/audio/` | reproduzierbare lokale Stimmerzeugung |

## Bekannte technische Schulden

1. Interaktionskoordinaten stehen sowohl in `canon.js` als auch in `RealtimeWorld.jsx`; eine einzige Quelle fehlt.
2. Bewegungsgrenzen sind hart codierte Zonen, keine echte Kollision oder Navigation.
3. Das 3D-JavaScript-Chunk ist mit rund 979 kB minifiziert weiterhin groß; Modelle nutzen noch kein Draco/Meshopt und Texturen kein KTX2.
4. Animationen verändern Bones direkt und besitzen noch keinen AnimationMixer/Blend-Tree.
5. Die Minimap benutzt eigene feste Bounds; spätere Bezirke brauchen eine datengetriebene Kartenprojektion.
6. Footer verlinkt Rechtstexte, die im aktuellen `public/` noch nicht vorhanden sind.
7. `useGLTF.preload` startet erst beim Lazy-Import der 3D-Runtime; ein definierter Lade-/Fehlerzustand fehlt.
8. Save-Schema akzeptiert nur exakt Version `2`; echte Migrationsketten fehlen.
9. Die lokalen KI-Stimmen sind noch nicht zur öffentlichen Veröffentlichung lizenzgeprüft.
10. Der erste Kieferpass ist amplitudenbasiert; echte Phonem-/Visem-Blends fehlen noch.
11. Drei eingebettete JPEG-Laufzeittexturen halten das erweiterte, gebatchte Level-GLB bei rund 8,68 MB; die verlustfreien PNG-Master werden nicht eingebettet. KTX2/Streaming fehlen.
12. Der zonenabhängige Kamerapass löst Hauptverdeckungen an Schwelle und Vordach, ersetzt aber noch keine geometrische Kamera-Kollision.
13. Der neue 3D-Fehlerfallback schützt Runtime-/Assetfehler, besitzt aber noch keine differenzierte Offline-, WebGL-Kompatibilitäts- oder Low-Memory-Diagnose.

## Nächster freigegebener Arbeitsbereich

`ROADMAP.md` Phase 1: den bestehenden Morgen zu einem hochwertigen, stabilen 3D-Vertical-Slice ausbauen. Wirtschaft, Vollstadt und Langzeitspiel werden erst danach integriert.
