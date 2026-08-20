# ISSO.TV V3 — QA- und Release-Gates

## Lokales Gate für jedes Arbeitspaket

- [x] frischer Start zeigt den Film ohne vorgeschaltete Frage,
- [x] Filmende/Überspringen führt in eine bedienbare 3D-Szene,
- [x] WASD, Maus, Zoom, E, Q, Leertaste, R und Escape funktionieren entsprechend dem HUD,
- [x] Interaktion erzeugt genau eine nachvollziehbare Folge,
- [x] Reload lädt den Run ohne Crash,
- [x] Reset fragt nach und betrifft nur den lokalen V3-Save,
- [x] Browserkonsole enthält keine neuen Fehler/Warnschleifen,
- [x] Sprache, Untertitel, Skip und fehlendes-Audio-Fallback lösen keine Szene doppelt aus,
- [x] `npm run test` erfolgreich,
- [x] `npm run build` erfolgreich,
- [x] `npm audit` ohne ungeklärte relevante Lücke,
- [x] `git diff --check` sauber.

## Nachweis des V5-Kernabschlusses vom 20.08.2026

- [x] automatischer Filmstart ohne Frage,
- [x] sichtbares Liegen, Reagieren, Aufrichten und Aufstehen vor der Steuerungsfreigabe,
- [x] Fährbude mit Bodenmatratze, altem Tisch/Laptop und ohne falsche Apartmentmöbel,
- [x] 360°-Kamera und geometrische Verdeckungskorrektur im Zimmer sichtbar geprüft,
- [x] Weltgeometrie liefert Kollision, Boden und Nav-Grundlage; Bewegungsregressionen bestanden,
- [x] V5/LOD1/LOD2 mit Skin, elf Clips, Meshopt und KTX2 automatisiert geprüft,
- [x] verständlicher erzwungener 3D-Fehlerfall statt Weißbild,
- [x] frischer normaler Browserlauf ohne neue Fehler-/Warnschleife,
- [x] `npm test -- --run`: 40/40 in 13 Dateien,
- [x] `npm run build`: erfolgreich,
- [x] `npm audit`: 0 bekannte Sicherheitslücken,
- [x] stabilisierte Referenzprobe nach Surface-Art-Pass: 56,0 FPS / 17,86 ms Mittel / 18,3 ms p95,
- [x] kompletter Morgen mit Verbindung, Tür, Hafenwagen, Bahnhof und HQ1 auf isoliertem Localhost-Teststand; Reload behielt sechs Nachhall-Ereignisse und HQ1-Position,
- [x] Mobile 390×844, Touch-HUD, Optionsdialog, Untertitelgröße, Kontrast und ruhige Kamera im Browser geprüft,
- [x] Controller- und Touch-Softwarepfad deterministisch durch echte Bewegung, Kollision und `353L_Walk` geführt; Gamepad-Mapping und Touch-Zustand regressionsgetestet,
- [ ] physischer Controller sowie Laptop-/Tablet-Gerätematrix,
- [x] Reset-Löschung als vollständige isolierte Sitzung: Bestätigung brachte Film und leeren Run zurück; der zweite bestätigte Reset entfernte sechs Ereignisse und HQ1-Position,
- [ ] Nutzerabnahme des lokalen M1-Vertical-Slice.

Details und Grenzen der Messung: `docs/PERFORMANCE.md`.

## Geräte-Matrix vor Alpha

| Ziel | Viewport/Input | Mindestprüfung |
| --- | --- | --- |
| Desktop | 1920×1080, Maus/Tastatur | kompletter Morgen, 60-FPS-Ziel |
| Laptop | 1366×768, Maus/Tastatur | HUD ohne Überdeckung, stabil spielbar |
| Tablet | 768×1024, Touch | Menüs/Film lesbar; Touch-Steuerung vorhanden |
| Mobile | 390×844, Touch | Einstieg, Untertitel, UI und Pause bedienbar |
| Reduced Motion | OS/Browser-Einstellung | keine erzwungenen starken UI-Bewegungen |
| Tastatur | ohne Maus | Menüs, Fokus, Dialoge und Reset erreichbar |
| Stumm/Untertitel | Ton 0 | kompletter Storypfad verständlich und bedienbar |

## Performance-Budgets für Phase 1

- Ziel: 60 FPS auf dem Referenz-Desktop; kein dauerhafter Einbruch unter 50 FPS.
- Normalframe: möglichst unter 20 ms, niemals dauerhaft über 33 ms.
- Keine Shader-/Konsolenwarnung pro Frame.
- Runtime-Modelle erhalten dokumentierte Polygon-/Texturkosten.
- Initiales Laden zeigt Fortschritt/Fehlerzustand und friert die UI nicht ein.
- Neue Assets werden erst nach Sicht- und Laufzeittest in `public/` übernommen.
- Sprachdateien werden szenenweise geladen; Viseme dürfen die Bildrate nicht sichtbar destabilisieren.

## Release-Gate für die einzige Live-Version

Dieses Gate darf nur nach ausdrücklicher Nutzerfreigabe gestartet werden.

1. [ ] finalen lokalen Commit und Git-Status dokumentieren,
2. [ ] bestehendes Live-Release und Konfiguration wiederherstellbar sichern,
3. [ ] Produktions-Build aus genau diesem Repository erzeugen,
4. [ ] keine Secrets, localhost-URLs oder privaten Pfade im Build,
5. [ ] Impressum/Datenschutz inhaltlich und technisch geprüft,
6. [ ] Desktop/Mobile/Save/Audio/Barrierefreiheit abgenommen,
7. [ ] Deployment-Ziel eindeutig `isso.tv`; keine zweite öffentliche Version,
8. [ ] atomar austauschen,
9. [ ] Live-Smoke-Test durchführen,
10. [ ] bei Fehlern sofort auf gesicherten Stand zurückfallen,
11. [ ] Commit, Zeitpunkt und Live-Prüfung in `docs/HANDOFF.md` dokumentieren.

Ohne erfüllte Punkte 1–7 gibt es keinen Deploy.
