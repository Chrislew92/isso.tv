# ISSO.TV — Master Edition

Ein lokaler, frei steuerbarer 3D-Stadtrun über Entscheidungen, Risiko, Gewinn, Verlust und Nerven. Der Prolog beginnt automatisch als Film und geht direkt in dieselbe begehbare Strammburg-Szene über. 353L ist ein eigenes texturiertes und geriggtes 3D-Modell; Wohnung, Flur, Hafen, Bahnhof und Signalwerk liegen als echte Geometrie in einer zusammenhängenden Welt.

Es gibt kein Echtgeld, keine Konten und keine Käufe; der Spielstand bleibt ausschließlich im `localStorage` des Browsers. Diese V3 ist bis zur ausdrücklichen Freigabe nur eine lokale Vorschau und wird nicht automatisch auf `isso.tv` veröffentlicht.

## Start

```bash
npm install
npm run dev
```

Steuerung: `WASD`/Pfeiltasten gehen, Maus dreht die Kamera, Mausrad zoomt, `E` interagiert, `Q` bleibt still, `Leertaste` zeigt ein Emote.

Für eine Produktionsversion:

```bash
npm run build
```

Das erste Ziel eines Runs: 50.000 € Gesamtvermögen und 35 Renommee. Das ist ein Meilenstein, kein Ende: ISSO.TV ist als Dauer-Run angelegt.

## Roadmap

Die lokale Arbeitsgrundlage mit Canon, Status, offenen Punkten und dem nächsten Sprint steht in [ROADMAP.md](ROADMAP.md).

## Einstieg für KI-Agenten

Codex, Claude, Manus und andere IDE-/AGI-Agenten beginnen verbindlich mit [AGENTS.md](AGENTS.md). Danach gelten:

1. [Verifizierter Projektstand](docs/PROJECT_STATE.md)
2. [Produktionsroadmap](ROADMAP.md)
3. [Story Bible](STORY_BIBLE.md)
4. [Architektur](docs/ARCHITECTURE.md)
5. [Aktuelle Übergabe](docs/HANDOFF.md)
6. [QA- und Release-Gates](docs/QA_RELEASE.md)
7. [Konflikt- und Entscheidungsvarianten](docs/CONFLICT_SCENARIOS.md)
8. [Tierkanon: Die Obere Gabe](docs/ANIMAL_LORE.md)
9. [Erde-1, 2033 und die höhere Macht](docs/EARTH_1.md)

V3 ist die einzige aktive Codebasis. V2 bleibt ein archivierter Feature-Spender; geplant bedeutet niemals automatisch eingebaut. Kein Agent veröffentlicht oder verändert `isso.tv` ohne eine ausdrückliche Freigabe in der aktuellen Aufgabe.
