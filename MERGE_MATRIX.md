# ISSO.TV V2 → V3 — geprüfte Spendermatrix

V3 in diesem Repository ist die einzige aktive Produktbasis. V2 ist am Git-Tag `v2-archive-2026-08-17` eingefroren. Diese Matrix sagt nur, was dort als möglicher Spender existiert; kein Eintrag ist deshalb bereits in V3 eingebaut.

Der verbindliche V3-Ist-Stand steht in `docs/PROJECT_STATE.md`, die Reihenfolge der Neu-Integration in `ROADMAP.md`.

## Regeln für jede Rettung

1. Nur das konkrete V2-System untersuchen, niemals den gesamten V2-`App.jsx` zurückkopieren.
2. Begriffe, Rechenfälle und Content-Ideen dürfen Spender sein; Architektur, UI und Save werden V3-gerecht neu gebaut.
3. Keine persönlichen Werte, Zugangsdaten, Live-Konfigurationen oder privaten Realwelttexte übernehmen.
4. Jede Rettung braucht reine Domänenlogik, Tests, Save-Entscheidung und sichtbare V3-Einbindung.
5. Eine Funktion wird erst nach Browserprüfung im aktuellen V3-Branch als implementiert markiert.

## Spenderbestand

| V2-Bereich | Beleg im Archiv | V3-Ziel | Status |
| --- | --- | --- | --- |
| Charakter-Presets, Alter, Form, Wohnen | V2 `src/App.jsx` | `P2-03` | nur Spender |
| Finanzprofil, Schutzkonto, Schulden, Banking/Unterstützung | V2 `src/App.jsx` | `P2-04`, `P5-01` | nur Spender |
| Hunger, Durst, Essen, Gutscheine, Bestellung | V2 `src/App.jsx` | `P2-06`, `P2-07` | nur Spender |
| Zeit, Zyklen, Fristen | V2 `src/App.jsx` | `P2-05` | nur Spender |
| Park, Kiosk, Markt, Behandlung, Haft | V2 Ortsdaten | `P3`, `P4` | nur Story-/UX-Spender |
| Messenger, Parkkreis, Signalwerk, Neonhafen, Rang | V2 `src/App.jsx` | `P3-03`–`P3-08` | nur Spender |
| BTC, ETH, LTC, SOL, Z-Coin | V2 Marktdaten/-logik | `P5-04`, `P5-06` | nur Spender |
| Spilo 10/20/50/100 | V2 Spiellogik | `P5-05` | nur Spender |
| Klarheit+, Akte, Stadtfunk | V2 Content + `STORY_BIBLE.md` | `P3-07`, `P4` | konzeptioneller Spender |
| lokaler persönlicher Run/Normalisierung | V2 Save-Code | `P2-01`, `P2-02` | nur Spender |

## Ausgeschlossen

- monolithische Rückkehr zum alten V2-`App.jsx`,
- 2D-/Dashboard-Ersatz für die begehbare V3-Welt,
- alte Passwörter, Tore oder private Live-Konfiguration,
- ungeprüfte Rechtstexte oder personenbezogene Angaben,
- reale Tat-Anleitungen oder stereotype Krisen-/Suchttexte,
- ein paralleler V2-Live- oder Preview-Release.
