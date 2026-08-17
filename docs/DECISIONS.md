# ISSO.TV V3 — Entscheidungsprotokoll

Dieses Protokoll hält dauerhafte Produkt-/Architekturentscheidungen fest. Neue Einträge werden angehängt, nicht rückwirkend umgeschrieben.

## D-001 — V3 ist die einzige aktive Produktbasis

- Datum: 17.08.2026
- Entscheidung: Dieses React/Vite-/3D-Repository ist die einzige aktive Entwicklungs- und künftige Release-Quelle.
- Grund: Parallele Fassungen haben Status, Spielstände und Deployments vermischt.
- Folge: Frühere Fehlversuche sind keine Arbeitsgrundlage. V2 bleibt ausschließlich als archivierter Feature-Spender verfügbar.

## D-002 — Ein öffentlicher Produktionsendpunkt

- Datum: 17.08.2026
- Entscheidung: Öffentlich existiert nur `https://isso.tv`; lokale Entwicklung nutzt `127.0.0.1`.
- Grund: Keine Nutzerverwirrung und kein versehentlicher Release veralteter Builds.
- Folge: Kein Agent deployt, pusht oder ändert Hosting/DNS ohne aktuelle ausdrückliche Nutzerfreigabe.

## D-003 — Film-first und echtes 3D

- Datum: 17.08.2026
- Entscheidung: Der Prolog startet automatisch; Figur, Spielraum, Bewegung und räumliche Szenen sind echtes 3D.
- Grund: ISSO.TV soll wie ein Film beginnen und unmittelbar spielbar werden.
- Folge: HUD/Untertitel bleiben für Lesbarkeit als Overlay erlaubt; 2.5D-Spieler-Sprites und flache Kulissen sind kein Ersatz für Spielwelt.

## D-004 — Reducer als Domänenkern

- Datum: 17.08.2026
- Entscheidung: Persistente Folgen laufen über reine Actions in `src/game/state.js`.
- Grund: Story-, Wirtschafts- und Save-Regeln bleiben testbar und unabhängig vom Renderer.
- Folge: 3D-Komponenten melden Absichten/Positionen, schreiben aber keine langfristigen Spielwerte direkt.

## Vorlage

```text
## D-XXX — Titel
- Datum:
- Entscheidung:
- Grund:
- Erwogene Alternativen:
- Folge:
```
