# ISSO.TV V3 — QA- und Release-Gates

## Lokales Gate für jedes Arbeitspaket

- [ ] frischer Start zeigt den Film ohne vorgeschaltete Frage,
- [ ] Filmende/Überspringen führt in eine bedienbare 3D-Szene,
- [ ] WASD, Maus, Zoom, E, Q, Leertaste, R und Escape funktionieren entsprechend dem HUD,
- [ ] Interaktion erzeugt genau eine nachvollziehbare Folge,
- [ ] Reload lädt den Run ohne Crash,
- [ ] Reset fragt nach und betrifft nur den lokalen V3-Save,
- [ ] Browserkonsole enthält keine neuen Fehler/Warnschleifen,
- [ ] `npm run test` erfolgreich,
- [ ] `npm run build` erfolgreich,
- [ ] `npm audit` ohne ungeklärte relevante Lücke,
- [ ] `git diff --check` sauber.

## Geräte-Matrix vor Alpha

| Ziel | Viewport/Input | Mindestprüfung |
| --- | --- | --- |
| Desktop | 1920×1080, Maus/Tastatur | kompletter Morgen, 60-FPS-Ziel |
| Laptop | 1366×768, Maus/Tastatur | HUD ohne Überdeckung, stabil spielbar |
| Tablet | 768×1024, Touch | Menüs/Film lesbar; Touch-Steuerung vorhanden |
| Mobile | 390×844, Touch | Einstieg, Untertitel, UI und Pause bedienbar |
| Reduced Motion | OS/Browser-Einstellung | keine erzwungenen starken UI-Bewegungen |
| Tastatur | ohne Maus | Menüs, Fokus, Dialoge und Reset erreichbar |

## Performance-Budgets für Phase 1

- Ziel: 60 FPS auf dem Referenz-Desktop; kein dauerhafter Einbruch unter 50 FPS.
- Normalframe: möglichst unter 20 ms, niemals dauerhaft über 33 ms.
- Keine Shader-/Konsolenwarnung pro Frame.
- Runtime-Modelle erhalten dokumentierte Polygon-/Texturkosten.
- Initiales Laden zeigt Fortschritt/Fehlerzustand und friert die UI nicht ein.
- Neue Assets werden erst nach Sicht- und Laufzeittest in `public/` übernommen.

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
