# ISSO.TV V3 — aktuelle Übergabe

Datum / Agent: 20.08.2026 / Codex

Ausgangs-Commit dieses Abnahmepasses: `161cf7c`

Arbeitspaket: V3.1-Vertical-Slice abnehmen — kanonische Welt, kompletter Morgen, Kamera/Animation/NPC, Audio, Mobile und Accessibility.

## Geändert

- Fährbude auf kanonische Armut zurückgebaut: Bodenmatratze, alter Tisch/Laptop, abgenutzte Oberflächen, kühles Licht, kleine warme Hoffnungsecke; falsche Apartmentmöbel entfernt.
- Neues Prologbild integriert; alter Prolog und V3-Blockout-Figur aus `public/` in das ignorierte lokale Archiv verschoben.
- Film und 3D-Aufstehen bilden einen Ablauf; Steuerung bleibt bis zum sichtbaren Aufstehen gesperrt.
- Kamera auf 360° plus geometrische Verdeckungskorrektur umgestellt.
- Bewegungsauflösung, Bodenhaftung und Nav-Grundlage aus echter Weltgeometrie statt harter Rechteckgrenzen.
- V5-353L mit verbessertem Weighting, Gesichtsbones, elf Clips, Foot-Lock-Pass, Hufsprint/Auslaufen, Tierlaufübergang, Visemen und Outfit-Slot-Test.
- KTX2, Meshopt, lokale Decoder, drei Charakter-LODs und geteilte Three-/React-Three-Chunks.
- Offline-/Low-Memory-/WebGL-Fallbacks und eingebaute FPS-/Frame-Time-Probe.
- Reproduzierbare Runtime-Assetpipeline unter `tools/build_runtime_assets.ps1` und `docs/ASSET_PIPELINE.md`.
- Veraltete Projektstatus- und Roadmap-Aussagen auf den beweisbaren Stand gebracht.
- Alle Weltziele, Vorschau-Starts, Idle-Fokuspunkte und relevanten Lichter aus `canon.js` abgeleitet.
- Flurkamerakollision und Perspektive korrigiert; Vordach, Bahnhof/HQ1 und Hafenlicht lesbarer abgestimmt.
- Hafenarbeiter mit eigener Last-/Entspannungsreaktion, Kopf, Ohren und Schwanz erweitert.
- Interaktionsclips funktionieren für Tastatur, Maus, Touch und Gamepad statt nur über die E-Taste; Turn-Clips greifen bei scharfen Richtungswechseln.
- Vier Audiobusse und sechs Zonenmischungen mit eigenen kurzen Hufklängen abgeschlossen.
- Mobiles HUD 390×844 ohne Überdeckung sowie Fokusfalle, Escape und Fokuswiederherstellung geprüft.

## Im Browser sichtbar

- automatischer Bildfilm in der kargen Fährbude,
- 353L liegt auf der Bodenmatratze, reagiert, richtet sich auf und steht auf,
- danach frei steuerbarer V5-353L in derselben Wohnung,
- 360°-Kamera ohne künstlichen Seitenstopp und ohne beobachtetes Wandclippen,
- verständlicher 3D-Fehlerbildschirm bei `?force3dError=1`.

## Prüfung

- Tests: 38/38 in 12 Dateien bestanden.
- Build: erfolgreich; größtes JS-Chunk 368,90 kB.
- Audit: 0 bekannte Sicherheitslücken.
- Stabilisierte Referenzprobe: 59,9 FPS / 16,69 ms Mittel / 17,0 ms p95 / 180 Samples / WebGL2.
- GLB-Vertrag: V5 + LOD1/2 jeweils 1 Skin, 11 Clips, Meshopt und KTX2; Welt Meshopt und ausschließlich KTX2-Bilder.
- Browserkonsole im frischen normalen Lauf: keine neue Fehler- oder Warnschleife.
- `git diff --check`: sauber; finaler Build/Audit/Test werden unmittelbar vor dem lokalen Master-Commit erneut ausgeführt.

## Bekannte Grenzen / Risiken

- Die Animationen sind ein belastbarer erster authored Gameplay-Pass, noch kein Motion-Capture-/Cinematic-Endstandard.
- Die FPS-Zahl stammt aus der eingebauten Referenzprobe; Chrome-Trace, Core Web Vitals, VRAM-Langzeitprofil und schwache Mobilgeräte sind noch nicht vermessen.
- Der Slice-Art-Pass ist kohärent, aber Bahnhof/HQ1, Fernkulisse und der vorläufige Hafenarbeiter sind noch kein finaler Vollspiel-AAA-Standard.
- Finale Sprecher-, Musik-/Soundrechte sowie die physische Controller-, Laptop- und Tablet-Matrix fehlen; Softwarepfade, Mobile-HUD und Accessibility-Grundlagen sind geprüft.
- Der Gesamtspiel-Backlog ab M2 ist groß; der aktuelle Stand ist ein Vertical Slice, keine fertige Welt.

## Nächster kleinster sicherer Schritt

1. Nutzer nimmt die lokale Bildsprache des M1-Morgens ab; kein Deploy vor ausdrücklicher Freigabe.
2. Physische Controller-/Laptop-/Tablet-Matrix und Chrome-Langzeitprofil vor Alpha ausführen.
3. Danach M2-01 bis M2-05: Slots, Charakterstart, einfacher 0-Euro-Aufbau und deterministische Zeit. Keine Bank-/Insolvenz-/Schuldenverwaltung in ISSO.TV einführen.

Live verändert: **NEIN**. Kein Push, kein Deploy, keine DNS- oder Cloudflare-Änderung.
