# ISSO.TV V3 — Konfliktszenarien und Entscheidungsraum

Status: verbindliches Szenendesign für die späteren Arbeitspakete `P4-09` und `P4-10`; noch nicht implementiert.

Dieses Dokument verarbeitet die besten spielbaren Möglichkeiten für den Kneipenstreit und den Straßenraub. „Alle Möglichkeiten“ bedeutet hier: alle wesentlich unterschiedlichen Haltungen erhalten einen fairen Pfad. Es bedeutet nicht, zehn Buttons gleichzeitig zu zeigen.

## Gemeinsame Designregeln

1. Pro Entscheidungsmoment höchstens drei klar beschriftete Hauptaktionen.
2. Frühe räumliche Handlungen zählen: Straßenseite wechseln, Tür betreten, Freund ansprechen oder Ort verlassen geschieht möglichst direkt in 3D.
3. Weglaufen, nachgeben, reden, Hilfe holen und sich verteidigen sind vollständige Spielpfade — keine versteckten „falschen“ Antworten.
4. Es gibt kein Karma, keine Feigheit, kein Kampf-XP und keinen Loot für Gewalt.
5. Der Zustand nach der Szene ist wichtiger als „gewonnen/verloren“: Verletzung, Stress, Zeit, verlorene Gegenstände, Zeugen, Gerücht, Beziehung und eigene Verarbeitung.
6. Ein QTE ist kurz, filmisch und abstrakt. Es zeigt Reaktion und Stopp, keine reale Kampftechnik.
7. QTEs erhalten die Optionen langsam, ohne Zeitdruck und automatisch auflösen. Barrierefreiheit verändert nicht den erzählerischen Wert.
8. Ein Fehlschlag beendet den Run nicht. Er öffnet Versorgung, Gespräch, Behandlung, Anzeige/Verzicht oder Rückkehr nach Hause.

## 353Ls Hufsprint

353L besitzt als Esel eine außergewöhnliche kurze Sprintleistung. Auf freier Strecke kann er für einige Sekunden ungefähr das Doppelte der Geschwindigkeit eines durchschnittlichen Menschen erreichen. Weglaufen fühlt sich deshalb nicht wie eine schwache Menüwahl an, sondern wie eine eigene starke 3D-Fähigkeit.

Die Inszenierung:

- Ohren legen sich an, Oberkörper kippt nach vorne, Schritte werden zu harten Hufschlägen.
- Kamera geht etwas weiter und tiefer, Sichtfeld öffnet sich, Regen zieht schneller vorbei.
- Der Spieler lenkt weiter selbst; `Shift` hält den Hufsprint, alternativ ist Umschalten/Assist möglich.
- Kein hektisches Button-Mashing. Beschleunigung, eine klare Sprintphase und kontrolliertes Auslaufen tragen das Gefühl.
- Auf offener gerader Strecke hängt ein normaler menschlicher Verfolger 353L nicht ab. Spannung entsteht durch Route, enge Kurven, Hindernisse, nassen Boden, schwere Taschen und die Entscheidung, wohin er sprintet.
- Die Fähigkeit besitzt eine kurze körperliche Erholungsphase, aber keinen nervigen Dauer-Ausdauerbalken im HUD.

## Gemeinsames Zustandsformat

Spätere Implementierung soll keine lose Textsammlung werden. Ein Konflikt speichert mindestens:

```js
{
  encounterId: 'bar_dispute' | 'street_robbery',
  opened: true,
  approach: 'avoid' | 'talk' | 'leave' | 'seek_help' | 'comply' | 'run' | 'defend',
  outcome: 'defused' | 'escaped' | 'lost_property' | 'interrupted' | 'won' | 'injured',
  force: 'none' | 'controlled' | 'too_far',
  aftercare: 'check' | 'call_help' | 'confide' | 'report' | 'leave' | 'suppress',
  witnesses: [],
  worldMinutes: 0,
  aftermathFlags: []
}
```

Nur tatsächlich erlebte Felder werden gespeichert. Spätere NPCs reagieren auf konkrete Fakten, nicht auf eine globale Gut-/Böse-Zahl.

---

# Szene A — „Zum falschen Signal“

## Aufgabe der Szene

- Die Kneipe als sozialen Ort etablieren.
- Zeigen, dass 353L Konflikt vermeiden will und seine Kraft kennt.
- Falls der Spieler den Kampfpfad erlebt: Sieg und öffentliche Feier stehen 353Ls innerem Unbehagen gegenüber.
- Eine spätere Straßenraub-Szene emotional vorbereiten, ohne sie zu erzwingen.

## Mögliche Auslöser

Die Szene öffnet sich nicht bei jedem Kneipenbesuch. Mindestens zwei Bedingungen sollten zusammenkommen:

- später Abend,
- ein bestimmter Gast oder bestehender kleiner Konflikt,
- ein missverstandener Satz/Blick,
- 353L verteidigt eine andere Figur verbal,
- schlechte Stimmung nach einem Stadtfunk-Ereignis,
- Spieler bleibt trotz mehrerer Ausstiegsmöglichkeiten.

Alkohol ist kein notwendiger Auslöser und keine Entschuldigung. Psychische Verfassung erzeugt nicht automatisch Gewalt.

## Phase A0 — Noch ist nichts passiert

Räumliche Möglichkeiten:

| Wahl | Sofortige Folge | Späterer Nachhall |
| --- | --- | --- |
| Freundliche Distanz halten | 353L bleibt bei seiner Gruppe oder an der Theke. | Der Konflikt kann ganz ausfallen. |
| Den Gast ansprechen | Das Missverständnis wird früh sichtbar. | Gesprächs- oder Konfliktpfad öffnet sich. |
| Kneipe verlassen | Zeit/Abendplan ändern sich. | Kein Kampf; jemand fragt später, warum er ging. |

## Phase A1 — Der Streit beginnt

Je nach vorheriger Haltung erscheinen höchstens drei passende Optionen:

| Haltung | Spielaktion | Mögliche Folge |
| --- | --- | --- |
| Klären | „So war das nicht gemeint.“ / nachfragen | Gast beruhigt sich oder nennt den echten Grund. |
| Grenze setzen | „Bis hierhin. Ich gehe jetzt.“ | 353L bewegt sich Richtung Tür; Gegenüber kann nachlassen. |
| Hilfe einbeziehen | Wirt, Freund oder Türperson ansprechen | Konflikt wird sozial unterbrochen; Beziehung reagiert. |
| Humor | einen Strammburg-Satz zurückgeben | kann Spannung lösen oder bei falschem Timing reizen. |
| Schweigen | nicht weiter füttern | kann Ruhe bringen; ist nicht automatisch Zustimmung. |

## Phase A2 — Körperlicher Angriff

Nur wenn die vorherigen Pfade nicht beendet haben und das Gegenüber tatsächlich angreift:

1. **Abstand** — aus dem Angriff heraus und Richtung Tür; Wirt/Gäste können trennen.
2. **Schutz** — Angriff abwehren, ohne selbst den Kampf fortzusetzen.
3. **Gegenwehr** — kurzes 1-gegen-1-QTE starten.

Der Kampfpfad ist kein langer Lebensbalken-Kampf. Drei filmische Beats reichen:

- Gefahr wahrnehmen,
- auf Angriff reagieren,
- Stopp-Moment erkennen.

Wenn der Gegenwehrpfad läuft, gewinnt 353L deutlich. Die Ausführung beeinflusst jedoch Kosten und Nachhall:

| QTE-Verlauf | Ergebnis |
| --- | --- |
| ruhig/rechtzeitig | kontrollierter Sieg, geringe Verletzung, schnelle Trennung |
| verspätet/unsauber | 353L gewinnt, wird selbst getroffen oder beschädigt Inventar |
| Stopp verpasst | Umfeld greift ein; 353L erschrickt über seine Kraft, ohne Gore-Szene |
| Assist-/Auto-Modus | derselbe Storywert; neutrale, kontrollierte Choreografie |

## Phase A3 — Die Kneipe jubelt

Die Umgebung macht daraus sofort eine Heldengeschichte. 353Ls zentrale innere Zeile bleibt:

> „Ich wollte ihm gar nicht wehtun.“

Nach dem Sieg erscheinen keine zehn Menüpunkte, sondern zunächst drei kontextuelle Möglichkeiten:

- **Nach dem Gegner sehen** — Verantwortung vor Publikum; Gegner erinnert sich daran.
- **Die Feier abbrechen und gehen** — Schutz vor Überforderung; Gerücht entsteht trotzdem.
- **Bleiben und reden** — Wirt/Gäste erzählen ihre Version; 353L kann widersprechen.

Später separat möglich:

- sich entschuldigen, ohne den ursprünglichen Angriff kleinzureden,
- mit Lotte/einem Freund über die eigene Kraft sprechen,
- den Gegner erneut treffen,
- die Heldengeschichte korrigieren oder für sich arbeiten lassen,
- die Kneipe eine Zeit lang meiden.

## Mögliche Langzeitfolgen

- Spitzname/Gerücht in Eitelstedt,
- Respekt oder vorsichtige Distanz bei einzelnen Gästen,
- Wirt bietet Gespräch, Hausverbot oder eine klare Grenze — abhängig vom Verlauf,
- Gegner kann beschämt, dankbar, wütend oder später versöhnlich reagieren,
- 353L erhält keine Stärke-Punkte; er gewinnt Wissen über die Wirkung seiner Kraft.

---

# Szene B — Der Straßenraub

## Aufgabe der Szene

- Freie Bewegung und Aufmerksamkeit in Strammburg spielerisch relevant machen.
- Weglaufen ausdrücklich als kluge, vollständige Option behandeln.
- Verlust zulassen, ohne den Spieler moralisch abzuwerten.
- Im Gegenwehrpfad 353Ls aggressive Seite sichtbar machen und danach Verantwortung spielen.

## Faire Auslösebedingungen

Der Straßenraub darf nicht als unsichtbare Zufallsstrafe erscheinen. Die Welt kündigt die mögliche Lage an:

- später Weg zwischen Eitelstedt und Bahnhof,
- leerere Strecke oder geschlossener Kiosk,
- Stadtfunk-/NPC-Hinweis über die aktuelle Gegend,
- sichtbare alternative beleuchtete Route,
- Möglichkeit, Begleitung oder Verkehr zu wählen.

Der Spieler darf den Weg trotzdem nehmen, ohne dadurch „selbst schuld“ zu sein. Kriminalität wird nie an Herkunft, Krankheit oder Armut einer Figur gekoppelt.

## Phase B0 — Vorbeugen, ohne die Szene zu kennen

| Wahl | Kosten | Ergebnis |
| --- | --- | --- |
| beleuchteter Umweg | mehr Zeit | Begegnung unwahrscheinlicher; anderer Stadtkontakt möglich |
| Bus/Bahn/Taxi | Geld und Wartezeit | sichere Fahrt; Chance auf Verkehrsszene |
| jemanden anrufen/mitgehen | Beziehung/Timing | Begleitung oder Gespräch unterwegs |
| kurzer Weg allein | keine Zusatzkosten | schnellster Weg; Begegnung kann öffnen |

Keine dieser Wahlen ist dauerhaft optimal. Zeit, Geld, Beziehung und aktuelles Ziel entscheiden.

## Phase B1 — 353L bemerkt etwas

Solange Abstand besteht:

- **Straßenseite/Route wechseln** — direkte 3D-Bewegung, kein Menü nötig.
- **Offenen Ort betreten** — Kiosk, Kneipe, Haltestelle oder belebten Bereich erreichen.
- **Weglaufen** — sofortiger Fluchtpfad; kein Feigheitsmalus.
- **Kontakt/Hilfe aktivieren** — Telefon/Notruf-/Begleiteroption entsprechend der Situation.
- **Weitergehen und beobachten** — schneller, aber die direkte Begegnung bleibt möglich.

Die UI zeigt nur die drei Optionen, die räumlich wirklich erreichbar sind.

## Phase B2 — Die Forderung

Ein einzelner Räuber versperrt den Weg und fordert Geld oder einen Gegenstand. Mögliche Hauptpfade:

### 1. Weglaufen

Weglaufen ist eine der besten Optionen, wenn Raum vorhanden ist.

- Spieler wählt selbst eine sichtbare Richtung: Licht/Leute, Haltestelle oder zurück.
- 353L zündet per `Shift` den Hufsprint und ist auf freier Strecke ungefähr doppelt so schnell wie ein durchschnittlicher Mensch.
- Die Flucht ist direkte 3D-Steuerung mit wenigen filmischen Hindernisreaktionen, kein Button-Mashing; Assist-Modus kann Lenkkorrektur und Sprint automatisch übernehmen.
- Erfolg hängt vor allem davon ab, ob früh ein freier Weg gewählt wurde. Enge Kurven, nasser Boden, schwere Taschen, Energie und vorherige Aufmerksamkeit verändern die Schwierigkeit.
- Auf freier Strecke gelingt die Flucht gegen einen einzelnen menschlichen Räuber fast immer. Erfolg: spektakulär gewonnener Abstand, Stress und Zeitverlust; Besitz bleibt meist erhalten.
- Teilerfolg: Gegenstand fällt zurück, Hilfe/Zeugen greifen ein oder der Räuber gibt auf.
- Scheitern: Szene verzweigt zu Abgeben, Hilfe oder Gegenwehr; kein sofortiges Game Over.

### 2. Abgeben

- Spieler kann gefordertes Bargeld, einen unwichtigen Gegenstand oder — wenn plausibel — gar nichts Verfügbares zeigen.
- Der Räuber geht; 353L bleibt körperlich unverletzt, kann aber Stress/Verlust erleben.
- Später: sperren/ersetzen, erzählen, melden oder bewusst abschließen.
- Das Spiel nennt diese Wahl weder schwach noch falsch.

### 3. Reden/Zeit gewinnen

- ruhig antworten, Missverständnis prüfen oder auf sichtbare Zeugen hinweisen,
- kann Raum für Flucht/Hilfe schaffen,
- kann scheitern, ohne den Spieler wegen „falscher Dialogoption“ zu bestrafen,
- keine psychologische Manipulations- oder Tat-Anleitung.

### 4. Hilfe suchen

- laut auf sichtbare Personen/Ort aufmerksam machen,
- Telefon-/Begleiterfunktion, wenn bereits spielerisch verfügbar,
- in offenen Laden/Verkehr flüchten,
- Hilfe kann rechtzeitig, verspätet oder nur als Zeuge eintreffen.

### 5. Gegenwehr

Nur wenn der Räuber tatsächlich angreift oder Fluchtweg blockiert ist. Das QTE bleibt filmisch:

- Gefahr wahrnehmen,
- Angriff abwehren,
- heftige Huf-Gegenwehr,
- **Stopp** als eigener, deutlich lesbarer letzter Beat.

Im heftigen Gegenwehrpfad überwältigt 353L den Räuber stärker, als er es von sich kennt. Sound fällt danach fast vollständig weg. Kein Jubel, kein Loot, keine Siegpose.

## Phase B3 — Nachhall

Unmittelbar höchstens drei zur Lage passende Möglichkeiten:

| Wahl | Sichtbare Folge | Späteres Echo |
| --- | --- | --- |
| Zustand prüfen / Hilfe rufen | Zeit, Zeugen, Verantwortung | Räuber/Zeugen/Vertrauensfiguren erinnern es |
| Abstand gewinnen / sicheren Ort erreichen | schnelle Selbstsicherung | Stress bleibt; Gespräch später möglich |
| melden | formaler Konsequenzpfad | Rückfragen, Zeugen, verlorene Gegenstände |
| Vertrauensfigur anrufen | Beziehung wird belastbar oder konflikthaft | Lotte/Freund reagiert später erneut |
| verdrängen | Szene endet schnell | Schlaf, Route oder spätere Begegnung kann sie zurückholen |

Die Frage „Ist etwas Böses in 353L?“ erscheint nur nach heftiger Gegenwehr als innere Frage, niemals als Diagnose oder Spielwert.

## Ergebnisvarianten

| Hauptpfad | Möglicher Gewinn | Möglicher Preis |
| --- | --- | --- |
| früh vermeiden | Sicherheit, Planung | Zeit/Geld/anderer Termin |
| weglaufen | Besitz und Abstand | Energie, Stress, verlorene Zeit/Gegenstand |
| abgeben | körperliche Sicherheit | Geld/Gegenstand, Stress |
| reden | Deeskalation/Fluchtraum | Unsicherheit, Zeit, mögliches Scheitern |
| Hilfe | Zeugen/Unterstützung | Abhängigkeit von Ort/Timing |
| Gegenwehr | unmittelbare Gefahr beendet | Verletzung, Zeugen, Ruf, Selbstzweifel, Verantwortung |

---

# Ausgewählter Umfang für die erste Implementierung

Damit das Spieltempo erhalten bleibt, wird nicht sofort jede Untervariante gebaut.

## Kneipe — erste lieferbare Version

1. Klären.
2. Gehen/Hilfe holen.
3. Wenn Angriff erfolgt: Gegenwehr-QTE mit drei Beats.
4. Nach Sieg: nachsehen, gehen oder bleiben/reden.

## Straßenraub — erste lieferbare Version

1. Frühes Bemerken: beleuchteten Ort erreichen oder weitergehen.
2. Forderung: Hufsprint/Weglaufen, abgeben oder reden.
3. Bei blockierter/gescheiterter Flucht: Hilfe oder Gegenwehr.
4. Nach Gegenwehr: prüfen/Hilfe, sicheren Ort erreichen oder Vertrauensfigur anrufen.

Spätere Varianten werden erst ergänzt, wenn diese Pfade getestet, verständlich und im Save korrekt erinnert werden.

# Testfälle vor Abnahme

- gewaltfreier Run ohne eine der beiden Begegnungen,
- Kneipenstreit vollständig geklärt,
- Kneipe verlassen, bevor es körperlich wird,
- Kneipenkampf gewonnen und Gegner geprüft,
- Straßenraub früh durch Routenwahl vermieden,
- erfolgreich weggelaufen,
- Flucht gescheitert und Besitz abgegeben,
- freiwillig abgegeben ohne Kampf,
- Hilfe rechtzeitig erreicht,
- Gegenwehr mit kontrolliertem Stopp,
- Gegenwehr mit verspätetem Stopp und korrektem Nachhall,
- QTE-Assist/Auto-Modus mit gleichem Storywert,
- Reload nach jeder Hauptverzweigung ohne Duplikate,
- NPC-Erinnerung reagiert nur auf tatsächlich erlebte Fakten.
