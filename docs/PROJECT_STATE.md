# ISSO.TV V3 — verifizierter Projektstand

Stand: 20.08.2026

Produktstatus: **lokaler 3D-Vertical-Slice auf Branch `master`; nicht veröffentlicht und noch keine fertige Vollversion**

Dieses Dokument trennt strikt zwischen dem nachweisbar laufenden V3-Kern und dem geplanten Gesamtspiel. Der vollständige Ausbauplan steht in `ROADMAP.md`.

## Projektgrenze

| Thema | Verbindlicher Stand |
| --- | --- |
| Aktive Codebasis | dieses Repository; ausschließlich ISSO.TV V3 / Master Edition |
| Lokale Vorschau | `http://127.0.0.1:5173/` |
| Öffentliche Version | bestehendes `https://isso.tv`; durch diesen Arbeitsstand nicht verändert |
| Frühere Builds | nur Git-Historie bzw. lokales, ignoriertes Archiv; keine aktive Runtime |
| 353L.ai | getrenntes KI-Chat-Projekt; hier nicht bearbeiten |
| Echtgeld | nicht vorhanden |
| Save | Browser-`localStorage`, Schema 2 |

## Was jetzt tatsächlich funktioniert

### Film und derselbe spielbare Morgen

- Die Seite beginnt automatisch mit dem Prologbild `public/media/prolog-faehrbude-v3.png`; es gibt keine vorgeschaltete Frage.
- Das Bild erzählt die karge Fährbude: Matratze direkt auf dem Boden, alter Tisch, Laptop, kaltes Grau und nur ein kleiner warmer Lichtpunkt.
- Danach liegt 353L in derselben 3D-Wohnung auf der Matratze. Augenlider und Ohren reagieren, er richtet sich sichtbar auf, steht auf und erst dann wird die Steuerung freigegeben.
- Die Kamera übernimmt fließend; es gibt keinen Teleport zu einer bereits stehenden Figur.
- Film kann übersprungen oder erneut geöffnet werden. Untertitel und Ton-Fallback blockieren die Szene nicht.

### Fährbude und Strammburg

- Wohnung ohne Bettgestell, Teppich, Nachttisch, Lampe oder Schrank.
- Matratze, gebrauchte Decke und Kissen liegen auf einfachem Boden; Wände und Boden tragen reproduzierbare Gebrauchsspuren.
- Alter Tisch und Laptop bilden die kleine warme Hoffnungsecke. Das restliche Licht bleibt kühl, grau und arm, ohne den Raum unbewohnbar zu machen.
- Die begehbare Welt enthält außerdem Flur, Türschwelle, Vordach, Pier, Kiosk, Wagen, Bahnhof, Signalwerk/HQ1, Wasser, Schiff und Hafenhintergrund.
- Ein erster Hafenarbeiter-NPC reagiert auf den Wagenzustand. Das ist eine technische NPC-/Weggrundlage, noch keine lebendige Stadtpopulation.

### 353L V5

- Aktives Modell: `public/models/353l-hi3d-character-v5.glb`, 2,15 m, 120.000 Dreiecke, ein geskinntes Mesh und 2K-KTX2-Texturen.
- Sichtbare Tieranatomie bleibt erhalten: feste Hinterhufe, fellbedeckte greiffähige Vorderhufe, Ohren und Schwanz.
- 21-Gelenk-Rig plus Gesichtsbones, Kiefer und neun geprüfte Outfit-Slots.
- Elf Clips: Idle, Walk, Run, Turn links/rechts, Stop, Aufstehen, Tür, Laptop, Tragen und Übergang in die natürliche Tierlaufhaltung.
- Laufzeit blendet Clips, Beschleunigung, Hufsprint und kontrolliertes Auslaufen; ein prozeduraler Foot-Lock-Pass reduziert sichtbares Hufrutschen.
- Ohren, Schwanz, Blick, Kiefer und Schnauzen-Viseme reagieren getrennt auf Bewegung und Sprache.
- LOD1 und LOD2 werden entfernungsabhängig nachgeladen. Ein praktischer Outfit-Slot-Vertrag wird automatisiert geprüft; ein vollständiges Kleidungsgeschäft existiert noch nicht.

### Bewegung, Kollision und Kamera

- WASD/Pfeile, Shift-Hufsprint, Mausblick, Mausrad, Interaktion und Emote.
- Bewegung wird gegen benannte, tatsächlich exportierte Wand-, Möbel-, Tür- und Objektgeometrie aufgelöst; es gibt keine unsichtbare rechteckige Raumgrenze mehr.
- Bodenhaftung nutzt exportierte begehbare Flächen und Raycasts. Die Tür steuert die Durchquerbarkeit der Schwelle.
- Dieselben Navigationsdaten liefern die Grundlage für spätere NPC-Wege und Verkehr.
- Die Kamera kann vollständig um 353L kreisen. Ein Raycast zieht sie bei Wänden, Decken oder Möbeln automatisch vor das Hindernis.
- Zimmer, Flur/Vordach und Hafen besitzen eigene sinnvolle Kameraabstände und weiche Übergänge.

### Runtime, Performance und Fehlerfälle

- React 19, Vite 8, React Three Fiber und Three.js.
- Welt und Charakter verwenden `EXT_meshopt_compression`; Blender-Draco bleibt reproduzierbarer Pipeline-Zwischenschritt.
- Alle eingebetteten Laufzeittexturen sind UASTC-KTX2 mit Mipmaps; lokale Basis-/Draco-Decoder benötigen kein CDN.
- Charakter besitzt drei LOD-Stufen. Welt, Figur und 3D-Runtime werden lazy geladen; Three/React-Three sind in mehrere Produktionschunks geteilt.
- Adaptive Grafik, Low-Memory-Erkennung, Online-/Offline-Hinweis, sichtbarer Ladefortschritt und verständlicher WebGL-/Assetfehler statt Weißbild.
- Referenzmessung im lokalen In-App-Browser: 55,8 FPS, 17,93 ms durchschnittlich, 18,3 ms p95, 180 Samples, WebGL2. Das ist eine Runtime-Probe, kein vollständiger Core-Web-Vitals-/Gerätelaborbericht.

### Spielkern des aktuellen Slices

- reducerbasierter Run mit Weltzeit, Tür, Wagen, Besuchen, Dialogen und Nachhall,
- fünf gleichwertige Wagenhaltungen sowie Interaktionen an Donkey-Connection, Tür, Bahnhof und Signalwerk,
- lokaler Save/Load/Reset, normalisierte Einstellungen und Duplikatschutz für Ereignisse,
- Regen-/Raumambiente, Hufkontakte, Weltklänge, elf deutsche Vorschauzeilen und Untertitel.

## Verifikation am 20.08.2026

- `npm test -- --run`: **36/36 Tests in 11 Dateien bestanden**.
- `npm run build`: erfolgreich; größtes JavaScript-Chunk 368,90 kB minifiziert.
- `npm audit`: **0 bekannte Sicherheitslücken**, einschließlich Entwicklungswerkzeugen.
- Charakter: 4.707.288 Byte; LOD1 4.276.136 Byte; LOD2 4.008.540 Byte.
- Welt: 8.783.396 Byte.
- Charakter und Welt: Meshopt + KTX2; Charakter enthält 1 Skin und 11 Animationen.
- Frischer Browserlauf: automatischer Filmübergang abgeschlossen, Steuerung freigegeben, keine neue Fehler-/Warnschleife.
- Erzwungener lokaler 3D-Fehler: verständlicher Vollbild-Fallback sichtbar.
- PowerShell-Assetpipeline: Syntax geprüft.
- Kein Push, kein Deploy, keine DNS-/Cloudflare-/Live-Änderung.

## Was ausdrücklich noch nicht Teil der Runtime ist

- freie Charaktererstellung, mehrere spielbare Spezies/Formen und ein vollständiger Kleidungseditor,
- mehrere Save-Slots, Export/Import und sichere Langzeitmigrationen,
- detaillierte Konten-, Schulden-, Insolvenz- oder Haushaltsbuchverwaltung; diese gehört ausdrücklich nicht in ISSO.TV,
- Hunger, Durst, Energie, Essen, Gutscheine, Einkauf, Bestellung, Schlaf und Wochenrhythmus,
- Gewohnheiten/Sucht-/Entzugssysteme,
- echte Markt-/Kryptosimulation, Z-Coin, Spilo und belastbares Langzeitbalancing,
- vollständige NPC-Tagespläne, Verkehr, Messenger, Gruppen, Beziehungen und Stadtgedächtnis,
- spielbare Bar, Supermarkt, Park, Klinik, Haft, weitere Bezirke und EyTonLand,
- Hauptstory-Akte, Konfliktbranches, Krise-/Behandlungs- und Haftkapitel,
- finale Sprecher, endgültige Tonrechte, Aufnahme-/Mixqualität und vollständiges Lip-Sync pro Dialog,
- physischer Controller-Test sowie die vollständige Laptop-/Tablet-/Gerätematrix; Touch-HUD, Gamepad-Abfrage, Fokusfalle, Untertitelgröße, Kontrast und ruhige Kamera sind bereits eingebaut,
- Live-Backup, rechtliche Endprüfung, Hostingwechsel, Monitoring und Release.

Der nächste Produktblock ist nicht ein weiterer Grafik-Neustart, sondern M1-Abnahme und danach M2: Save-Schema, Charakterstart, einfacher 0-Euro-Aufbau und ein kompletter räumlicher Tagesloop.
