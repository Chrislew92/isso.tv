# ISSO.TV V3 — Full Voice, Synchronsprecher und Tier-Lippensynchronität

Status: verbindlicher Produktionsstandard; Sprecher-Casting, Dialogsystem und Laufzeit-Lippensynchronität sind noch nicht implementiert.

## Ziel

ISSO.TV soll sich wie ein gesprochenes 3D-Filmspiel anfühlen. 353L erhält einen festen Synchronsprecher und eine wiedererkennbare Stimme. Relevante Figuren werden ebenfalls besetzt. Gesprochener Ton, Untertitel, Körpersprache und Mund-/Schnauzenbewegung bilden eine gemeinsame Szene.

Deutsch ist die erste vollständige Sprachfassung. Weitere Sprachen folgen erst, wenn Dialog-IDs, Untertitel, Timing und Audioaustausch technisch stabil sind.

## Was „alles gesprochen“ bedeutet

Voll vertont werden:

- Film- und Storydialoge,
- gewählte Spielerantworten,
- innere Gedanken von 353L,
- Telefonate, Sprachnachrichten und wichtige Funkdurchsagen,
- räumliche NPC-Gespräche und relevante Reaktionen,
- kurze Zustands-/Interaktions-Barks, sofern sie sich nicht störend wiederholen,
- Konflikt-, Hufsprint-, Nachhall- und Beziehungsszenen,
- optionale Audiodeskription für filmische Schlüsselstellen als eigener späterer Track.

Nicht als Tausende starre Sprachdateien aufgenommen werden müssen:

- jeder wechselnde Geldbetrag, Kurs oder Zahlenwert,
- rein technische Einstellungen,
- zufällig erzeugte Namen und frei eingegebener Text.

Diese dynamischen Inhalte bleiben lesbar und für Screenreader semantisch korrekt. „Full Voice“ bedeutet vollständige erzählerische Vertonung, nicht schlecht zusammengeschnittene Zahlenschnipsel.

## 353L — Castingprofil

353L klingt nicht wie eine schrille Cartoon-Eselfigur.

- warme, eigenständige Stimme mit leicht rauer Textur,
- trockenes Timing und leiser Humor,
- glaubwürdige Ruhe; Kraft wird nicht permanent gespielt,
- Unsicherheit und Paranoia dürfen hörbar sein, ohne Karikatur psychischer Belastung,
- innere Gedanken sind näher, leiser und intimer als gesprochene Sätze,
- Wut ist selten und deshalb deutlich; nach Gewalt eher Atem/Stille als Siegerbrüllen,
- einzelne tierische Atem-, Schnaub- oder Ohrreaktionen ergänzen Sprache, ersetzen sie aber nicht.

Beim Casting werden mindestens diese Testszenen gesprochen:

1. ruhiger Morgen auf der Matratze,
2. trockener Dialog mit Lotte/Donkey-Connection,
3. freundlicher Kneipenmoment,
4. „Ich wollte ihm gar nicht wehtun.“ nach dem möglichen Kampf,
5. erschrockener Atem/innerer Gedanke nach dem Straßenraub-Gegenwehrpfad,
6. hoffnungsvoller, aber nicht kitschiger Satz über HQ1/Earthpeace.

Die endgültige Besetzung ist eine bewusste Nutzerentscheidung. Kein Agent erklärt eine provisorische Stimme ungefragt zur Masterstimme.

## Rechte und Einwilligung

Vor öffentlicher Nutzung braucht jede Sprecherleistung eine schriftlich geklärte Vereinbarung zu:

- Projekt, Rolle, Sprache und konkretem Aufnahmeumfang,
- Bearbeitung, Schnitt und Lautheitsanpassung,
- Spiel, Trailer, Website und Marketing,
- Laufzeit, Gebiet und Vergütung,
- Nachaufnahmen und späteren Erweiterungen,
- Namensnennung oder gewünschter Anonymität,
- **separater ausdrücklicher Zustimmung** für jede synthetische Stimmnachbildung.

Aus normalen Sprachaufnahmen entsteht niemals automatisch die Erlaubnis, eine KI-Stimme zu trainieren oder neue Sätze zu erzeugen. Temporäre KI-/TTS-Stimmen dürfen nur als klar markierter interner Timing-Platzhalter verwendet werden und werden vor Release ersetzt, sofern keine gesonderten Rechte vorliegen.

## Dialogdaten statt Text im Komponenten-Code

Langfristige Dialoge erhalten stabile IDs und liegen datengetrieben unter `src/content/dialogue/`.

Beispielschema:

```js
{
  id: 'de.room.connection.morning.353l.01',
  speaker: '353l',
  text: 'Guten Morgen.',
  audio: '/audio/de/353l/room_connection_morning_01.ogg',
  durationMs: 1120,
  performance: 'quiet',
  visemes: '/audio/de/353l/room_connection_morning_01.visemes.json',
  subtitle: true,
  skippable: true
}
```

Regeln:

- Text, Untertitel und Audio benutzen dieselbe Dialog-ID.
- Entscheidungen speichern die ID, nicht den sichtbaren deutschen Satz.
- Untertitel können korrigiert werden, ohne Save-IDs zu brechen.
- Jede Zeile kennt Sprecher, Ort, emotionale Richtung und ungefähre Dauer.
- Fehlendes Audio fällt kontrolliert auf Untertitel zurück und blockiert den Run nicht.

## Aufnahme- und Dateistandard

Masteraufnahme:

- WAV, 48 kHz, 24 Bit, Mono pro Stimme,
- trockene Aufnahme ohne fest eingebrannten Raumhall,
- konsistenter Mikrofonabstand und dokumentierte Session,
- Dateiname aus Sprache, Sprecher, Szene und Zeilen-ID,
- keine aggressive Normalisierung oder Rauschzerstörung am Rohmaster.

Runtime:

- webtaugliches Opus/OGG plus notwendiger Browser-Fallback,
- Sprache, Musik und Effekte auf getrennten Lautstärkegruppen,
- Streaming/Lazy Loading nach Szene; nicht das gesamte Spiel beim Start laden,
- Sprachdateien mit Cache-Version und sauberem Fehlerfallback.

Lautheit, Dynamik und konkrete Codec-Bitraten werden durch Hörtest und Browserprofil festgelegt; Rohmaster bleiben unverändert archiviert.

## Tiergerechte Lippensynchronität

Aufrechte Tiere bekommen keine menschlichen Lippenmodelle. Die jeweilige Anatomie trägt die Sprache.

### 353L-Viseme

Für den ersten Pass reichen wenige saubere, blendbare Formen:

| Visem | Sprachgruppe | Sichtbare Bewegung |
| --- | --- | --- |
| `REST` | Pause/Stille | entspannte Schnauze, Atem |
| `CLOSED` | M/B/P | Maul geschlossen, weicher Druck |
| `OPEN` | A/Ä | Kiefer öffnet sichtbar |
| `WIDE` | E/I | Maulwinkel/Schnauze etwas breiter |
| `ROUND` | O/U | Schnauzenöffnung runder, nicht menschlich gespitzte Lippen |
| `TEETH` | F/V/S/Z | Zähne/Luft nur subtil sichtbar |
| `TONGUE` | L/N/D/T | kleine Zungen-/Kieferandeutung, kein Übertreiben |
| `BREATH` | Seufzer/Schnauben | Nüstern, Brust, Kopf und Ohren reagieren |

Zusätzliche Performance-Kanäle:

- Blinzeln und Blickziel,
- Ohrenrichtung und -spannung,
- Nüstern/Atem,
- Kopf-/Halsbewegung,
- Körpergewicht und Vorderhuf-Gesten.

Viseme sprechen Laute; Ohren, Blick und Körper spielen Bedeutung. Beides wird getrennt animiert und anschließend kombiniert.

### Andere Tierarten

- Katze/Hund: Kiefer, Schnauze, Wangen, Ohren; Pfoten bleiben Pfoten.
- Vogel: Schnabelöffnung, Hals, Zunge und Kopfbewegung statt Lippen.
- Schildkröte: Kiefer/Hals/Augen; Panzer und Körperhaltung tragen Performance.

Jede neue Art bekommt ein eigenes Viseme-Mapping. Menschen-/KI-Körper dürfen andere Rigs verwenden, teilen aber Dialog-IDs und Timingformat.

## Laufzeit-Lippensync

Produktionsziel:

1. Text und Aufnahme werden über dieselbe Dialog-ID geladen.
2. Ein Offline-Prozess erzeugt zeitgestempelte Phoneme/Viseme.
3. Runtime blendet die Viseme weich auf Shape Keys oder Bones.
4. Emotion, Blick, Ohren und Gesten laufen als eigener Performance-Layer.
5. Bei fehlender Viseme-Datei nutzt die Figur einen einfachen amplitudenbasierten Kieferfallback.
6. Bei fehlendem Audio bleiben Untertitel und ruhige Idle-Performance aktiv.

Viseme-Datei:

```json
{
  "dialogueId": "de.room.connection.morning.353l.01",
  "cues": [
    { "atMs": 0, "viseme": "REST", "weight": 1 },
    { "atMs": 90, "viseme": "OPEN", "weight": 0.7 },
    { "atMs": 240, "viseme": "CLOSED", "weight": 0.9 }
  ]
}
```

## Spieltempo

- Dialog kann unterbrochen/übersprungen werden, ohne Zustand doppelt auszulösen.
- Untertitel erscheinen synchron und bleiben lang genug lesbar.
- Wiederholte Barks haben Cooldowns und Varianten.
- Gewählte Antwort wird gesprochen, während die Kamera bereits in die Folgeszene übergehen darf.
- Lange Gespräche enthalten Bewegung, Blickwechsel oder kurze Spielerhandlungen.
- Der Spieler kann Sprache separat von Musik/Effekten regeln.

## Barrierefreiheit

- Untertitel standardmäßig verfügbar, unabhängig von Ton.
- Untertitelgröße, Hintergrund, Sprechername und Kontrast einstellbar.
- „Kein Zeitdruck“ pausiert QTE-Zeit während wichtiger Sprache.
- Dialogprotokoll/Nachhall lässt gehörte Zeilen erneut lesen und optional abspielen.
- Stummes Spielen bleibt vollständig möglich.
- Hörbare Hinweise erhalten bei gameplayrelevanter Bedeutung eine visuelle Entsprechung.

## Erster lieferbarer Vertical Slice

Für die erste echte Voice-/Lip-Sync-Abnahme reichen:

1. 353Ls erste Zeile nach dem Film,
2. vollständige Donkey-Connection zwischen 353L und Lotte,
3. ein räumlicher Reaktions-Bark an der Tür,
4. ein innerer Gedanke am Hafen,
5. Untertitel, Skip, Lautstärke und fehlendes-Audio-Fallback,
6. 353L-Viseme plus Ohren/Blick/Atem im Browser.

Erst wenn dieser kleine Satz sauber funktioniert, werden Kneipe, Straßenraub, NPC-Massen oder alle Akte aufgenommen.

## Abnahme

- Stimme passt zum Castingprofil und wurde ausdrücklich freigegeben.
- Nutzungsrechte sind dokumentiert; keine ungeklärte synthetische Ableitung.
- Audio, Text, Untertitel und Viseme besitzen dieselbe stabile Dialog-ID.
- Schnauze trifft sichtbare Hauptlaute ohne Flattern oder Übertreibung.
- Ohren/Blick/Körper wirken nicht mechanisch an die Lautstärke gekoppelt.
- Skip, Pause, Reload und fehlende Datei beschädigen keinen Zustand.
- Dialog bleibt auf Desktop/Mobile verständlich und performant.
- Stummes Spiel und Untertitel-only sind vollständig möglich.
