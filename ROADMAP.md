# ISSO.TV — Master Roadmap (lokal / intern)

Stand: 11.08.2026  
Status: **spielbarer Vertical Slice** — Kernsysteme vorhanden, Master Edition im Ausbau.

Diese Datei ist unsere Fortsetzungsgrundlage. Neue Gedanken kommen zuerst in den Backlog, dann werden sie zu einer klaren, testbaren Aufgabe. Nur tatsächlich eingebaute und geprüfte Punkte werden abgehakt.

> **Projektgrenze:** Diese Roadmap und dieses Repository betreffen ausschließlich das Spiel **ISSO.TV Master Edition**. Der KI-Chat **353L.ai** ist ein getrenntes Projekt unter `C:\Users\chris\AndroidStudioProjects\353l.ai` und wird hier nicht bearbeitet.

> **Ein-Version-Regel:** Es gibt genau **eine** öffentliche Produktionsversion: `isso.tv`. Lokale Entwicklung läuft ausschließlich auf `127.0.0.1`; keine zweite öffentliche Vorschau, keine parallele Master-/Beta-Domain und keine zusätzlichen Live-Server. Ein Release ersetzt die bestehende Live-Version erst nach Backup, Build und Abnahme.

## Leitidee

ISSO.TV ist ein endloser Stadtrun in der fiktiven Metropole **Strammburg**. Es geht um Geld, Alltag, Hunger, Zeit, Beziehungen, Projekte, Risiko und Konsequenzen — immer mit einer spielbaren Entscheidung, niemals nur als Textwand.

`50.000 € + 35 Renommee` ist der erste Meilenstein, kein Abspann. Ein Run endet nicht durch eine Zahl: Krisen, Behandlung und Haft sind weiterlaufende Kapitel mit veränderten Optionen.

## Fester Canon

- Strammburg ist eine eigenständige Hafenmetropole mit Hamburg-DNA, aber keine reale Hamburg-Karte.
- Eitelstedt ist der Ursprung; **HQ1** ist die Keimzelle von EyTonLand.
- EyTonLand, Schloss EyTonLand und Earthpeace 2033 sind spätere Endgame-/Weltkapitel.
- 353L kann als Esel-Avatar, Mensch, KI, Mensch im Roboterkörper oder als unerkanntes KI-im-Mensch-Mysterium erzählt werden.
- Z-Coin / `#zedcoinz` ist eine **fiktive** ISSO.TV-Währung mit hohem Risiko.
- Psychische Krisen und Behandlung werden würdevoll erzählt: kein Horrorbild, keine Diagnose als Spielwert, keine Behauptung, dass Krankheit Kriminalität verursacht.
- Riskante/illegale Storywege bleiben fiktional und abstrakt. Das Spiel zeigt Folgen, nicht reale Vorgehensweisen.
- Vielfalt ist selbstverständlich: Herkunft, Look, Geschlecht, Beziehung und Körperform erzeugen keine besseren oder schlechteren Stats.
- Der Humor ist eine Hommage an schnelle, absurde Gesellschaftssatire: eigenständige Strammburg-Figuren, keine South-Park-Charaktere, -Bilder, -Dialoge oder kopierten Storys.

## Humor-Leitplanken

- [ ] Jede große Storylinie bekommt mindestens einen absurden Kontrast: ein Amt, ein Vertrag, eine App, ein Konzern oder ein Stadtmythos dreht völlig durch.
- [ ] Der Witz trifft Systeme, Geldlogik, Bürokratie, Tech-Hype und Macht — nicht Menschen wegen Krankheit, Herkunft, Körper oder Identität.
- [ ] Nach einer starken Pointe muss eine echte Entscheidung folgen; Humor ist Gameplay, nicht nur Text.
- [ ] Zwischen Eskalationen bleiben ruhige, ehrliche Szenen möglich. Dadurch tragen die harten Gags besser.
- [ ] Strammburg hat eigene Running Gags: Esel-353L, Zedcoinz, überforderte Stadttechnik, HQ1, EyTonLand-Mythos und Hafenlogik.

## Arbeitsmodus

- [ ] Vor jeder größeren Änderung: diese Roadmap um Status und nächsten Sprint ergänzen.
- [ ] Pro Sprint nur ein spielbarer Kern: bauen, lokal testen, Build prüfen, dann abhaken.
- [ ] Neue Ideen zuerst unter **Parkplatz** sammeln; nicht mitten im Sprint das Kernziel wechseln.
- [ ] Nach jedem Sprint einen kurzen Spielstand-Test mit neuem Charakter und persönlichem Run durchführen.
- [ ] Spielstände nie ungefragt löschen oder überschreiben.

---

# 0. Grundgerüst & Stabilität

## Erledigt

- [x] React/Vite-Projekt läuft lokal.
- [x] Produktions-Build läuft.
- [x] Persönlicher Spielstand und neuer Charakter-Run sind getrennt.
- [x] Finanzprofil kann liquide Mittel, Sparbuch, Schutzkonto, Schulden, Fixkosten und Banking bearbeiten.
- [x] Alte Saves werden normalisiert; neue Systeme erhalten Fallback-Werte.
- [x] Das Spiel ist als Dauer-Run angelegt; 50k sind Meilenstein.

## Offen

- [ ] Save-Slot-Verwaltung: benannte Slots, Zeitpunkt, Charakter, Kapitel, Vorschau.
- [ ] Export/Import eines Spielstands als lokale Datei.
- [ ] Sicheres Versions-/Migrationssystem für spätere Änderungen.
- [ ] „Neuer Run“-Bestätigung und Wiederherstellung eines zuletzt gelöschten lokalen Slots.
- [ ] Settings: Lautstärke, Animationen, Kontrast, Schriftgröße, Sprache.

# 1. Charakter-Erstellung & Identität

## Erledigt

- [x] Name, Alter, Form, Wohnen und Startweg sind wählbar.
- [x] Freie Formen: Mensch, KI, Mensch + Roboterkörper, KI im Menschen.
- [x] Vier gleichwertige Crew-Presets mit eigenen Auftaktszenen: Alex, Malik, Yuna, Ally.
- [x] Keine Wertevor- oder -nachteile aufgrund von Herkunft oder Look.
- [x] Esel-/353L-Visual als aktuelles Key Art.

## Offen

- [ ] Mehr Presets und Look-Varianten ohne Stat-Unterschiede.
- [ ] Outfit, Inventar, Wohnung, Stimme und Körperform als rein erzählerische Anpassung.
- [ ] Charakter-Biografie in drei kurzen, editierbaren Sätzen.
- [ ] Konsequente KI-/Cyborg-/Sleeper-spezifische spätere Storysignale.
- [ ] 3D-Avatar-Prototyp: laufen, stehen, Blickrichtung, einfache Emotes.

# 2. Alltag, Basis & Überleben

## Erledigt

- [x] Giro, Sparbuch, Schutzkonto, Schulden, Fixkosten, Banking-Kontext.
- [x] Hunger, Durst und wöchentlicher Essenskorb.
- [x] Selbst gekaufte Essensgutscheine für Essen und Getränke.
- [x] Tabak als optionaler Gewohnheits-/Entzugsstrang.
- [x] Routine, Kontakte, Zeitkosten und Alltagsanker.
- [x] Krisen führen in ein weiterlaufendes Krisenkapitel statt in den Abspann.
- [x] Strammburg-Weltuhr und tagesgleiche Stadtfunk-Lage.

## Offen

- [ ] Kalender: Tage, Wochen, Monate, Jahreszeiten, Feiertage, Fristen.
- [ ] Miete, Strom, Internet, Telefon, Verträge und Mahnungen als verständliche monatliche Abläufe.
- [ ] Inventar: Essen, Getränke, Tickets, Schlüssel, Unterlagen, Technik.
- [ ] Schlaf, Energie, Hygiene und Wohnungskomfort — kompakt, ohne Mikromanagement.
- [ ] Krankmeldung, Termine und Unterstützung als sensible, freiwillige Story-/Alltagsoptionen.
- [ ] Weitere Gewohnheiten nur mit eigenen, nicht-stereotypen Spielsystemen und klaren Schutzgrenzen.

# 3. Strammburg, Karte & Bewegung

## Erledigt

- [x] Klickbare Schemamap mit HQ1, Park, Kiosk, Supermarkt, Haltestelle, Bahnhof, Zuhause, Behandlung, Neonhafen und Haftkapitel.
- [x] Ortsaktionen mit kleinen, sichtbaren Folgen.
- [x] Lokale Wege und spätere Netzfreischaltung über den Bahnhof.
- [x] Haftkapitel ist als nicht-finaler Schauplatz vorbereitet.

## Offen

- [ ] Viertel definieren: Eitelstedt, Neonhafen, Glasring, Wohnring, Bahnhofsviertel, Inselhafen.
- [ ] Map-Ansicht im Browser auf Desktop und Mobile visuell testen und nachziehen.
- [ ] Verkehr: zu Fuß, Bus, Bahn, Nachtlinie, Taxi/Fahrtendienst — mit Zeit und Preis.
- [ ] Ortsabhängige Begegnungen, Fundstücke und Tageszeiten.
- [ ] Innenräume: Wohnung, Kiosk, Markt, Bahnhofshalle, HQ1, Park, Behandlung, Haft.
- [ ] Spätere 3D-Stadt als bewusst kleine, dichte Bezirke statt leerer Riesenkulisse.

# 4. Menschen, Nachrichten & Beziehungen

## Erledigt

- [x] Park-Nachricht eines Kollegen als erste freiwillige Sozialszene.
- [x] Kontakte sind ein sichtbarer Wert.
- [x] Der Parkkreis ist als soziale Gruppierung angelegt.

## Offen

- [ ] Telefon-/Messenger-Ansicht: Nachrichten, Anrufe, Einladungen, verpasste Termine.
- [ ] 12–20 wiederkehrende NPCs mit Ort, Beziehung, Grenzen, Erinnerung und eigener Agenda.
- [ ] Beziehungssystem: Bekanntschaft, Vertrauen, Crew, Konflikt, Distanz — ohne „richtige“ Antwort.
- [ ] Regenbogenfreundliche Beziehungen und Figuren als normale Weltteile, nicht als Bonus-System.
- [ ] Hund-/KI-Begleiter als Supportfiguren mit klaren Grenzen und keinen Zwangseingriffen.
- [ ] Nachrichten-Pacing: höchstens ein relevanter Impuls pro Zyklus, damit das Tempo bleibt.

# 5. Wege, Gruppen & Rang

## Erledigt

- [x] Drei Gruppierungen: Signalwerk/HQ1, Neonhafen-Kollektiv, Parkkreis.
- [x] Einladungen erscheinen abhängig von gewählten Wegen und Kontakten.
- [x] Rang, Aufträge und Auftragszähler sind implementiert.

## Offen

- [ ] Rangtitel und 3–5 echte Aufträge pro Gruppierung.
- [ ] Fraktionswechsel, Ausstieg, Rivalitäten und Ruf-Folgen.
- [ ] Signalwerk: Lizenzen, digitale Produkte, Projektpitches, EyTonLand-Aufbau.
- [ ] Neonhafen: fiktive Nachtarbeit/Risikoaufträge mit nachvollziehbaren Folgen, ohne reale Tat-Anleitung.
- [ ] Parkkreis: Community, kleine Jobs, Fürsorge, Crew und lokale Chancen.
- [ ] Weitere Wege: Haushalt/Arbeit, Unternehmertum, Kunst/Content, Markt/Trading, Stadtpolitik.

# 6. Konsequenzkapitel: Krise, Behandlung, Haft

## Erledigt

- [x] Krisen werden nicht mehr als Endbild behandelt.
- [x] Behandlungsort kann besucht werden und bietet Check-in/Routine.
- [x] Haftkapitel ist als gesperrter, später freischaltbarer Ort vorhanden.

## Offen

- [ ] Krisenkapitel mit klarer UI: Was ist passiert? Welche sicheren nächsten Schritte gibt es?
- [ ] Behandlungs-/Station-Kapitel mit Ruhe, Gesprächen, Rückkehrplan und Selbstbestimmung.
- [ ] Haftkapitel mit Zeit, Briefen, Arbeit, Kontakten, Entlassung und Rückkehr in die Stadt.
- [ ] Forensik nur als sehr sensibler, komplett fiktiver Rechts-/Behandlungspfad; nie als Synonym für psychische Krise oder Strafe.
- [ ] Konsequenzketten für riskante Wege, Schulden, Verträge und Ruf.
- [ ] Schutznetz: Jeder harte Zustand hat mindestens zwei nachvollziehbare Wege zurück in den Run.

# 7. Geld, Markt & Stadtrun-System

## Erledigt

- [x] Euro als Hauptwährung; BTC, ETH, LTC, SOL mit EUR-Startkurs und Run-Simulation.
- [x] Z-Coin als fiktiver #zedcoinz-Asset.
- [x] Kaufen/Verkaufen, Portfolio, Vermögen, Risiko und Zeitkosten.
- [x] Spilo-Sprung mit 10/20/50/100 € Einsatz.
- [x] Z-Coin-Storymoment bei ausreichendem Bestand vorbereitet.

## Offen

- [ ] Portfolio-Diagramm und klare Gewinn-/Verlust-Historie.
- [ ] Markt-News als fiktive, spielrelevante Ereignisse.
- [ ] Risikoprofil, Limit-Mechanik, Sparziele und Notgroschen ohne Echtgeld-Bezug.
- [ ] Z-Coin-Langzeitbogen: frühe Skepsis, Community, Nutzen, Königsmoment, Gegenreaktion.
- [ ] Spilo ausbalancieren: sichtbare Wahrscheinlichkeiten, Krisenschutz, keine Echtgeld-Ästhetik.
- [ ] Haushaltsbuch-Auswertung: „wo ging Geld hin?“ in einfacher Sprache.

# 8. Unternehmen & EyTonLand

## Offen

- [ ] HQ1-Projektboard: Idee → Prototyp → Lizenz → erste Kundschaft → Team.
- [ ] Digitale Lizenzen und Projekte als wiederholbarer, sauberer Einkommensweg.
- [ ] EyTonLand GmbH/UG als fiktive Unternehmensphase: Papierkram, Branding, Team, Verantwortung.
- [ ] Eigene Domains/Marken im Spiel als fiktive Assets, keine Live-Konten.
- [ ] Schutz von Assets: Passwörter, Backups, Verträge, Marken, Delegation, Vertrauen.
- [ ] Schloss EyTonLand und Insel als spätes Weltkapitel, nicht als schneller Geldpreis.

# 9. Story, Kapitel & Endlosspiel

## Erledigt

- [x] Prolog für Neuankunft und vier erste Akte.
- [x] Erste Storyakte, Rauch-/Recovery-Akte und Z-Coin-Akte.
- [x] 50k-Meilenstein ohne Endscreen.

## Offen

- [ ] Kapitelstruktur für 1–3 Spieljahre: Ankommen, Basis, Crew, Druck, Aufbau, Insel.
- [ ] Wiederkehrende Jahreszeiten, Silvester, Geburtstage, Deadline- und Jubiläumsereignisse.
- [ ] Storygedächtnis: Figuren erinnern Entscheidungen und Ortsbesuche.
- [ ] Mehrere Endgame-Zustände statt eines Endes: EyTonLand, Zed-König, stabiles Leben, Crew-Stadt, Rückkehr nach HQ1.
- [ ] New Game+ mit geerbten kosmetischen Erinnerungen, nicht mit unfairen Stats.

# 10. Präsentation, Audio & 3D

## Erledigt

- [x] Dark Master-Edition-UI, Symbole, Legenden und Key Art.
- [x] Responsive Basis für Mobile.

## Offen

- [ ] Visuelles QA auf 360px, 768px und Desktop.
- [ ] Sound: Hafen, U-Bahn, Wohnung, Markt, ruhige/angespannte Zustände.
- [ ] Musik-States: Alltag, Risiko, Krise, Crew, Meilenstein.
- [ ] Barrierefreiheit: Tastatur, Fokus, Textgrößen, Motion-Reduktion, Kontrast.
- [ ] 3D-Diorama pro Ort, dann echte Lauf-/Kamera-Prototypen.
- [ ] Charakterporträts/Look-Varianten mit gleicher Qualität für alle Presets.

# 11. Qualität, Datenschutz & Veröffentlichung

## Offen

- [ ] Release-Protokoll für die einzige Live-Adresse `isso.tv`: Backup → Build → Abnahme → atomarer Austausch → Live-Check → Rückfallplan.
- [ ] Den Master-Edition-Ordner als einzige Release-Quelle festlegen; alte Skeleton-/Nebenordner niemals deployen.
- [ ] Vor jedem Deploy prüfen: keine Test-URLs, lokalen Hosts, API-Schlüssel oder alternativen Domains im Build.
- [ ] Keine persönlichen Bankdaten, medizinischen Daten oder privaten Zugangsdaten im Spielstand/Repository.
- [ ] Klarer Hinweis: Simulation, kein Echtgeld, keine Anlage- oder Gesundheitsberatung.
- [ ] Lokale Datenlöschung und Export verständlich machen.
- [ ] Component-/Logiktests für Essen, Krise, Reise, Saves, Fraktionen und Markt.
- [ ] Balancing-Tests mit 10 vollständigen Runs verschiedener Charaktere.
- [ ] Fehlerlog, Crash-Schutz, Offline-Fallback für Kurse.
- [ ] Release-Checkliste, Impressum/Datenschutz nur bei echter Veröffentlichung.

---

# Nächster Sprint — jetzt anfangen

1. [ ] **Haft- und Behandlungskapitel spielbar machen**
   - Eigene Aktionen, Zeitfortschritt, Kontakte, Rückkehr in die Stadt.
   - Kein Game Over, keine Stigmatisierung, mindestens zwei Wege zurück.
2. [ ] **Telefon/Messenger bauen**
   - Kolleg:innen, Einladungen, Fraktionsnachrichten und Termine als kurze, relevante Impulse.
3. [ ] **Map-Spieltest & Bewegung polieren**
   - Alle Verbindungen, Mobile-Layout, Netzfreischaltung und Ortsaktionen prüfen.
4. [ ] **Erste drei vollständigen Fraktionsaufträge schreiben**
   - Je Signalwerk, Neonhafen, Parkkreis: Rang 1 → Rang 2 → sichtbare Konsequenz.

# Parkplatz — Ideen, noch nicht im Sprint

- Strammburg als Hafenmetropole mit Untergrundbahn, Fähren, Inselhafen und Bezirkskultur.
- ISSO.TV als schneller Stadt-/Entscheidungsmodus, nicht als reale Fahrzeug- oder Verbrechenssimulation.
- Hund, KI und Ally als spätere Begleiterfiguren.
- Earthpeace 2033, EyTonLand-Insel, Riesenschildkröten, Schloss und Queen als spätes Mythos-Kapitel.
- Weitere Charakter-Looks, Wohnungen, Stadtjobs, Minispiele, Clubs, Content-/Medienwelt.
- Zedcoinz-Community und digitale Lizenzen als fiktive Spiel-Assets.

## Definition of Done für eine Aufgabe

Eine Checkbox wird erst abgehakt, wenn:

1. die Aktion im Spiel auffindbar und verständlich ist,
2. sie mindestens eine sichtbare Folge hat,
3. sie den Spielstand nicht kaputtmacht,
4. sie auf Mobile lesbar bleibt,
5. `npm run build` erfolgreich durchläuft.
