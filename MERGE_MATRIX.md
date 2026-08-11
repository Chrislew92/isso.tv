# ISSO.TV — Merge Matrix zur einzigen Master Edition

Ziel: Die **ISSO.TV Master Edition** in diesem Ordner ist die einzige Quellbasis für den künftigen Release auf `isso.tv`. Die laufende Vanilla-Version und die Git-Historie unter `C:\Users\chris\AndroidStudioProjects\isso.tv` sind ausschließlich geprüfte Spender — nie wieder eine zweite Produktbasis.

## Verifizierter Ausgangspunkt

| Bereich | Stand |
|---|---|
| Öffentliche Live-Adresse | `https://isso.tv` antwortet mit HTTP 200; gelieferte HTML-Datei: 201.579 Zeichen beim letzten Check. |
| Live-Produkt | stabile Vanilla-/353L.EXE-Fassung mit Weltuhr, lokalem Spielstand und Rechtstexten. |
| Künftige Quellbasis | `outputs\isso-tv-master-edition`, React/Vite, lokaler Master-Run. |
| Alter AndroidStudio-Ordner | Git-Historie vorhanden, aktueller Arbeitsbaum dirty; nicht deployen und nicht überschreiben. |

## Übernahme-Regeln

1. Die Master Edition übernimmt nur Funktionen, die im neuen Spielloop sinnvoll, sicher und testbar sind.
2. Kein Kopieren von Passwörtern, Zugangscodes, privaten Angaben oder undeutlichen alten Texten.
3. Keine Rückkehr zu alten Waffen-/Tatmechaniken oder zu privaten Realweltbezügen.
4. Jede Übernahme erhält eine sichtbare Master-Edition-UI, einen Save-Fallback und einen erfolgreichen Produktions-Build.
5. Erst nach Abnahme ersetzt der Master die einzige öffentliche Adresse `isso.tv`.

## Feature-Matrix

| Legacy-/Live-Element | Entscheidung | Master-Status |
|---|---|---|
| Lokaler Spielstand über Reload | übernehmen | **bereits vorhanden** — getrennte Runs und Save-Normalisierung. |
| Weltuhr / gemeinsamer Tageskontext | neu interpretieren | **übernommen** — sichtbare Strammburg-Uhr; Stadtfunk-Lage ist für alle am selben Kalendertag gleich. |
| Schutzkonto | übernehmen | **übernommen** — sichtbare Benennung und Finanzprofil vereinheitlicht. |
| Passwort/Tor | nicht übernehmen | nicht erforderlich; kein Klartext-Passwort im Master. |
| „Vorhang, kein Schloss“-Transparenz | als Sicherheitsprinzip übernehmen | **offen** — bei späteren lokalen Daten-/Settings-Hinweisen. |
| Desktop, Raum, alte Comic-Route | nicht direkt übernehmen | durch Charakter-Start, Karte und Story-Run ersetzt. |
| Kiosk/Alltagsorte | neu interpretieren | **bereits vorhanden** — Kiosk, Markt, Park, Verkehr und Ortsaktionen. |
| Impressum/Datenschutz | beim Release neu und korrekt übernehmen | **offen** — keine veralteten oder privaten Angaben blind kopieren. |
| Logo-Vektoren | optional als Legacy-Asset sichern | **offen** — nur übernehmen, wenn sie visuell zur Master Edition passen. |
| Alte Waffen-/Tat- oder private Realweltbezüge | ausschließen | bewusst nicht Teil des Masters. |

## Reihenfolge bis zum einzigen Live-Release

- [ ] Master-Ordner mit Git und `.gitignore` als einzige Release-Quelle sichern.
- [x] Weltuhr als Strammburg-Kalender/Tageslage bauen.
- [ ] Live-Funktionen aus dieser Matrix einzeln in den Master übernehmen und testen.
- [ ] Rechtstexte für den tatsächlichen späteren Betreiber/Host neu prüfen und ergänzen.
- [ ] Lokalen Master auf Desktop und Mobile abnehmen.
- [ ] Bestehendes Live-Release sichern.
- [ ] Einmaliger, atomarer Austausch auf `isso.tv`.
- [ ] Danach nur diesen Master weiterentwickeln.
