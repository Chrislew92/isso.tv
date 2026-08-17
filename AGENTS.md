# ISSO.TV V3 — verbindliche Anleitung für alle KI-Agenten

Diese Datei gilt für Codex, Claude, Manus, Copilot, AGI-IDE-Agenten und jede andere Automation, die in diesem Repository arbeitet. Sie ist die operative Hauptanweisung. Tool-spezifische Dateien dürfen ihr nicht widersprechen.

## 1. Auftrag und Projektgrenze

- Dieses Repository ist ausschließlich **ISSO.TV V3 / Master Edition**, ein browsernatives 3D-Stadt-RPG.
- **V3 ist die einzige aktive Produktbasis.** Frühere Fehlversuche sind nicht Teil der Arbeitsgrundlage.
- V2 ist nur ein eingefrorener Feature-Spender am Git-Tag `v2-archive-2026-08-17`. Kein V2-Code wird blind zurückkopiert.
- `353L.ai` ist ein getrenntes KI-Chat-Projekt unter `C:\Users\chris\AndroidStudioProjects\353l.ai` und gehört nicht in dieses Repository.
- Öffentlich darf es nur eine ISSO.TV-Version geben: `https://isso.tv`.

## 2. Vor jeder Änderung vollständig lesen

1. `AGENTS.md` — Arbeits-, Sicherheits- und Qualitätsregeln.
2. `docs/PROJECT_STATE.md` — was im aktuellen V3-Code wirklich existiert.
3. `ROADMAP.md` — Reihenfolge, Arbeitspakete und Abnahmekriterien.
4. `STORY_BIBLE.md` — Welt, Ton, Figurenwürde und erzählerischer Kanon.
5. `docs/ARCHITECTURE.md` — Runtime, Zustand, Assets und bekannte technische Schulden.
6. Für Release-/Hosting-Aufgaben zusätzlich `docs/QA_RELEASE.md`.

Für Arbeiten an Kneipenstreit, Straßenraub, QTE oder Konfliktfolgen zusätzlich `docs/CONFLICT_SCENARIOS.md` vollständig lesen.

Für Arbeiten an Tierfiguren, Charaktermodellen, Bewegung, Kleidung, Werkzeugen oder der Oberen Gabe zusätzlich `docs/ANIMAL_LORE.md` vollständig lesen. Menschliche Hände/Füße an aufrechten Tierfiguren sind ohne ausdrückliche kanonische Ausnahme ein Art-Fehler.

Für Arbeiten an Weltgeschichte, Jahr 2033, höherer Macht, Gott-/Glaubensdeutung, Parallelwelt oder neuen Naturgesetzen zusätzlich `docs/EARTH_1.md` vollständig lesen. ISSO.TV bestätigt keine reale Religion als einzig wahr und benutzt Glauben nicht als Punktesystem.

Für den **tatsächlichen Implementierungsstand** gilt: ausführbare Tests und aktueller Code > `docs/PROJECT_STATE.md` > `ROADMAP.md` > ältere Konzepttexte. Für **Arbeits-, Sicherheits- und Deploymentregeln** bleibt `AGENTS.md` verbindlich. Ein Widerspruch wird dokumentiert und bereinigt; er wird nicht stillschweigend geraten.

## 3. Nicht verhandelbare Regeln

### Veröffentlichung und externe Systeme

- **Kein Deploy, kein Push, keine DNS-/Cloudflare-/Hosting-Änderung und kein Austausch von `isso.tv` ohne ausdrückliche Freigabe des Nutzers in der aktuellen Aufgabe.**
- Lokale Vorschau ausschließlich auf `127.0.0.1`, standardmäßig Port `5173`.
- Keine zweite öffentliche Beta-, Preview- oder Master-Domain anlegen.
- Der Git-Remote `live-origin` ist kein automatischer Push-Zielpunkt.
- Live bleibt unangetastet, bis Backup, Abnahme und Rückfallplan vollständig sind.

### Produktidentität

- Der Prolog beginnt beim Laden automatisch als Film und führt direkt in denselben spielbaren Morgen.
- Spielwelt, Figuren, Bewegung und räumliche Szenen sind echtes 3D. Lesbares HUD, Untertitel und Menüs dürfen als 2D-Overlay bleiben.
- 353L ist eine eigenständige Figur; keine kopierten Markenfiguren, Welten, Dialoge oder Assets.
- Strammburg ist eine fiktive Hafenmetropole mit eigener Geografie, keine nachgebaute Hamburg-Karte.
- Kleine Entscheidungen erzeugen sichtbaren Nachhall. Keine falschen Moralpunkte und keine schnelle Geldexplosion nach wenigen Klicks.
- Ein harter Zustand verändert den Run, beendet ihn aber nicht automatisch.

### Sicherheit, Würde und Datenschutz

- Keine echten Bank-, Gesundheits-, Zugangs- oder Identitätsdaten in Code, Assets, Saves oder Logs.
- Keine Anlage-, Gesundheits- oder Rechtsberatung als Spielbehauptung.
- Glücksspiel und Märkte bleiben klar als fiktionale Simulation markiert; kein Echtgeldfluss.
- Illegale Wege zeigen erzählerische Folgen, niemals reale Durchführungsschritte.
- Psychische Krise, Sucht, Armut, Herkunft, Körper, Geschlecht und Sexualität sind weder Punchline noch automatische Gefahr-/Kriminalitätswerte.
- Keine Spielstände ungefragt löschen. Bei Save-Schema-Änderungen Version erhöhen, Migration oder sicheren Fallback implementieren und testen.

## 4. Verbindlicher Arbeitsablauf

1. `git status --short` prüfen; fremde/ungeklärte Änderungen erhalten.
2. Ein Arbeitspaket aus `ROADMAP.md` wählen und dessen Abhängigkeiten prüfen.
3. Den kleinsten spielbaren vertikalen Schnitt umsetzen; keine parallele Neuarchitektur ohne Bedarf.
4. Logik in reinen Funktionen/Reducer halten und mit Vitest absichern.
5. 3D im echten Browser prüfen: Startfilm, Laden, Bewegung, Kamera, Interaktion, Reload und Konsole.
6. `npm run test`, `npm run build`, `npm audit` und `git diff --check` ausführen.
7. `docs/PROJECT_STATE.md`, `ROADMAP.md` und bei Architekturentscheidungen `docs/DECISIONS.md` aktualisieren.
8. Im Handoff exakt nennen: geändert, geprüft, offen, nächster sicherer Schritt, Live-Status.

Eine geplante Funktion darf niemals als implementiert beschrieben oder abgehakt werden. V2-Bestand zählt erst als V3-Funktion, wenn er neu integriert, sichtbar getestet und im aktuellen Branch vorhanden ist.

## 5. Standardbefehle

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
npm run test
npm run build
npm audit
```

Windows-Direktstart: `start-ISSO-TV.cmd`.

Repository-Wurzel:

```text
C:\Users\chris\Documents\Codex\2026-08-11\che\outputs\isso-tv-master-edition
```

## 6. Technische Leitplanken

- React/Vite und React Three Fiber bleiben bis zu einer ausdrücklich beschlossenen Migration die Runtime.
- `src/game/state.js` ist die zentrale Zustandsmaschine; zustandsverändernde Spielregeln nicht in 3D-Komponenten verstecken.
- `src/game/canon.js` enthält Welt-/Interaktionsdaten. Neue Koordinaten nur an einer kanonischen Stelle definieren; bestehende Doppelungen sind laut Roadmap abzubauen.
- `src/components/RealtimeWorld.jsx` rendert und steuert die Szene, entscheidet aber nicht über Wirtschaft oder Storyfolgen.
- Blender-Quellen liegen unter `assets/source/`, Runtime-GLBs unter `public/models/`, Konzepte unter `assets/concept/`.
- `.blend1`, `node_modules/`, `dist/`, Geheimnisse und temporäre Renderdateien nicht committen.
- Runtime-Assets vor Integration auf Dateigröße, Polygonzahl, Texturen, Materialzahl und Ladezeit prüfen.
- Keine Rückkehr zu 2.5D-Sprites als Spielerfigur oder Kulisse, um kurzfristig „mehr Inhalt“ vorzutäuschen.
- Performance-Ziel für den Vertical Slice: stabiler Spielbetrieb auf dem Referenz-Desktop; mittelfristig 60 FPS, keine dauerhaften Frames über 33 ms. Qualität darf adaptiv skaliert werden.

## 7. Definition of Done

Eine Aufgabe ist erst fertig, wenn:

- der neue Pfad im aktuellen V3-Build auffindbar und verständlich ist,
- mindestens eine sichtbare spielerische Folge existiert,
- Reload/Save nicht beschädigt werden,
- Tests für neue Zustandslogik vorhanden sind,
- Browserkonsole keine neuen Fehler enthält,
- `npm run test` und `npm run build` erfolgreich sind,
- relevante Roadmap-/Statusdokumente aktualisiert wurden,
- kein Live-System verändert wurde, sofern dafür keine ausdrückliche Freigabe vorlag.

## 8. Pflicht-Handoff für den nächsten Agenten

Am Ende einer Arbeitssitzung in `docs/HANDOFF.md` aktualisieren:

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

Wenn keine Änderung vorgenommen wurde, wird kein künstlicher Fortschritt eingetragen.
