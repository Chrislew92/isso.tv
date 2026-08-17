# ISSO.TV V3 — verifizierter Projektstand

Stand: 17.08.2026

Verifizierter Code-Meilenstein: `eee01eb` (`Build true 3D ISSO.TV V3 vertical slice`)

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
- einfacher harter Bewegungsbereich ohne vollständige Physik/Kollision,
- GPU-Regen, Fog, Schatten, mehrere Lichtquellen und adaptive Auflösung,
- Renderloop pausiert während Film und Dialogen.

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
- acht Vitest-Fälle (einschließlich fünf Wagen-Haltungen),
- Produktions-Build erfolgreich,
- npm-Audit zuletzt ohne bekannte Sicherheitslücke,
- interner Referenzlauf nach Initialladung bei ungefähr 55–56 FPS und 20–24 ms schlechtestem Normalframe.

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
- Audio-Landschaft, Musik-State-System und professionelle Animation-Blends,
- Synchronsprecher, datengetriebenes Dialogsystem, vollständige Vertonung und Tier-Lippensynchronität,
- echte Kollisions-/Physikschicht, Navigation Mesh, Treppen und Interaktionsanimationen,
- finaler Environment-Art-Pass, LOD/Kompression und Ladefortschritt,
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
| Persistenz | `src/game/save.js` | localStorage lesen/schreiben/löschen |
| Tests | `src/game/state.test.js` | reducerbasierte Regeln |
| Runtime-Modelle | `public/models/` | ausgelieferte GLB-Dateien |
| Blender-Quellen | `assets/source/` | editierbare Master-Assets |
| Asset-Pipeline | `tools/blender/` | reproduzierbare Erstellung/Inspektion |

## Bekannte technische Schulden

1. Interaktionskoordinaten stehen sowohl in `canon.js` als auch in `RealtimeWorld.jsx`; eine einzige Quelle fehlt.
2. Bewegungsgrenzen sind hart codierte Zonen, keine echte Kollision oder Navigation.
3. Das 3D-JavaScript-Chunk ist groß; Modelle und Texturen sind noch nicht Draco/Meshopt/KTX2-optimiert.
4. Animationen verändern Bones direkt und besitzen noch keinen AnimationMixer/Blend-Tree.
5. Die Minimap benutzt eigene feste Bounds; spätere Bezirke brauchen eine datengetriebene Kartenprojektion.
6. Footer verlinkt Rechtstexte, die im aktuellen `public/` noch nicht vorhanden sind.
7. `useGLTF.preload` startet erst beim Lazy-Import der 3D-Runtime; ein definierter Lade-/Fehlerzustand fehlt.
8. Save-Schema akzeptiert nur exakt Version `2`; echte Migrationsketten fehlen.

## Nächster freigegebener Arbeitsbereich

`ROADMAP.md` Phase 1: den bestehenden Morgen zu einem hochwertigen, stabilen 3D-Vertical-Slice ausbauen. Wirtschaft, Vollstadt und Langzeitspiel werden erst danach integriert.
