# ISSO.TV — 353L.EXE · Handover

Fusion der beiden älteren Übergaben, korrigiert gegen die laufende Datei.
**Stand: 2026-08-08.** Alles hier wurde im Code nachgeschlagen, nicht erinnert.

---

## 1. Was es ist

Browserspiel in einer **einzigen `index.html`** (~105 KB). Kein Framework, kein
Server, keine Bilddateien — alles CSS und Inline-SVG. Datei öffnen, läuft.

**Highroller-RPG mit echtem Druck** — kein Verzweiflungssimulator. Der Aufstieg
muss sich lohnen, sonst ist es kein Spiel. (Diese Korrektur kam vom Autor selbst,
nachdem eine zu bittere Fassung gebaut war.)

Schauplatz **Eitelstedt**, erfundene Schreibung eines echten Hamburger Stadtteils.
Du wohnst in einem Zimmer eines Familienhauses zwischen den Blocks, mit einem
Mitbewohner. Gegner ist **TA$CH€N** (der Taschengrabscher), der sich jede Woche
etwas nimmt.

## 2. Ablauf

```
b0 Zugang (Passwort)  →  b1 Nacht (dreimal nicht einschlafen)
b2 Raum, Ego-Perspektive mit sichtbaren Händen (WASD · Maus · Klick)
      ├─ Schreibtisch (E) → b3 Senderkennung → b4 Desktop
      └─ Wohnungstür rechts (E) → b10 Straße
b4 Desktop  →  353L.exe → b5 Comic (5 Bilder) → b6 Name + Beruf → b7 Spiel
b8 Netzwerk/Motherbrowser · b9 Fokus-Sortierer (Minispiel) · b10 Straße
```

**Komplett ohne Maus bedienbar:** Leertaste, WASD, E, Pfeile, 1–9, Z (Joker),
Esc (aus dem Spiel zurück zum Desktop), Enter.

Der Rechner ist keine Einbahnstraße: „◀ Aufstehen" in der Taskleiste führt
zurück in den Raum, die Wohnungstür nach draußen, und alles wieder zurück.

## 3. Kern

**Eine Woche = eine Situation = eine Entscheidung.** Ziel `ZIEL = 25.000 €`
bis Silvester; `MAXW` kommt aus dem **echten Kalender** (Wochen bis 31.12.),
aktuell **21** — *nicht* 52, wie eine ältere Übergabe behauptete.

Drei Kräfte: **RICHKID (rot) nimmt · WORKLIFE (blau) baut · Arbeit (grau)
ist nur der Boden.** Start bei **0 €**.

**Regel, die über allem steht:** Das Spiel muss allein über die
Antwortmöglichkeiten funktionieren. Jeder Knopf sagt, was er tut und was er
bringt. Der Szenentext ist Beiwerk.

Was nicht geht, ist **sichtbar gesperrt** statt eine Woche zu fressen
(`gesperrt()`): krankgeschrieben sperrt ARBEITEN, kein Geld sperrt SETZEN und
HAUS, Insolvenz sperrt die großen Züge. Wenn alles gesperrt ist, erscheint
automatisch „Tag rumkriegen".

## 4. Zahlen (im Code nachgeschlagen)

| | |
|---|---|
| Ziel | 25.000 € · Wochen aus dem Kalender (21) |
| Sieben Berufe | 180–550 €, wechselbar im Spiel, inkl. **Arbeitslos** und **Umschulung** |
| Homebunker | 40 % rein, **3,0×** nach 6 Wochen — geschützt vor TA$CH€N |
| Setzen | 30 % rein, 50 % auf 3× |
| Idee | ~+20 % vom Konto, 12 % zäh (aber nie null) |
| ZEDCOINZ | 1.000 € = 1 ZED · geschützt, **wächst aber nicht mit** |
| P-Konto | 1.000 € unpfändbar — auch für dich selbst gesperrt |
| Fixkosten | steigen jede Woche gegen einen Dispo von 1.500, der stillsteht |
| Joker | 3 pro Runde, nimmt die Woche zurück |
| Enden | **8**, inkl. ERDE-1 (geheim) und KRYPTO-KÖNIG |

**Paranoia-Schutz:** Basis-Angriffschance 0,22 · Strohhalm +0,30 ·
Türschloss −0,15 (35 % Block) · Mitbewohner −0,25 (60 % Block, 50 €/Woche).

## 5. Die Weltuhr

Zufall gesät aus `saison() * 1009 + woche`, Saison = UTC-Tag. Damit spielt
**jeder Mensch am selben Tag dasselbe Spiel** — gleiche Szene, gleiche
Ereignisse, gleiche Würfe, unabhängig von vorherigen Klicks.

Kein Server, keine Datenbank, kein Datenschutzproblem. **Die Zeit ist der Server.**

## 6. haushalt.exe — und seine Grenze

Zweites Programm auf dem Desktop: ein echtes Haushaltsbuch. Einnahmen und
Fixkosten rein, raus kommt was bleibt — pro Monat, pro Woche, **pro Tag**.
Alles in `localStorage`, **nichts verlässt den Browser**.

> **Eiserne Regel: Das Ding rechnet, es berät nicht.**
> Schuldnerberatung ist in Deutschland reguliert und darf nicht jeder anbieten.
> Ein Rechner für eigene Zahlen ist frei — Empfehlungen wären es nicht.
> Diese Grenze fehlte in beiden Vorgänger-Dokumenten.

## 7. Regeln für den nächsten Agenten

- **Kein Refactoring** in React/Vue/Svelte. Die `index.html` bleibt monolithisch.
- **Farbe ist Information, nicht Deko.** Rot/Blau/Grau bedeuten etwas; die Welt
  darf knallen, die Entscheidung bleibt streng.
- **Optik:** fette schwarze Outlines, weiße Kreidekontur, flache Sattfarben,
  Sticker-Schatten. Vorbild sind die AJ-Cover (*Wonderland*, *Back Am Block*).
  Nichts Rundes, nichts Web-2.0.
- **Echtes 3D würde die flache Optik kaputtmachen** — 2.5D ist der Weg.
- **Nicht ins Private kippen.** Eitelstedt und TA$CH€N bleiben; alles, was den
  Autor identifiziert, wurde bewusst entfernt (ISSO WATERS, Peet, echte Straßen,
  Bankname, Familienangehörige). Nicht wieder einbauen.
- **Tabu:** das MedalGuard-System nicht anfassen.

## 8. Fallen, die schon zugeschnappt sind

Diese drei Fehler hatten die Datei **komplett lahmgelegt** — sie lud gar nicht mehr:

1. `let mgAktiv` doppelt deklariert → Skript bricht sofort ab
2. `\\'b4\\'` statt `\'b4\'` im Darknet-Drop → Zeichenkette endet mittendrin
3. `$('code')` zeigte auf ein Feld, das inzwischen `id="pw"` hieß → `null.focus()`

**Lehre:** Nach jeder Änderung `window.ISSO` in der Konsole prüfen. Ist es
`undefined`, ist die Datei tot. Und beim Umbenennen von HTML-IDs immer das
Skript mitziehen.

Dazu: Browser cachen die Datei hartnäckig — beim Testen `?v=` an die URL hängen.

## 9. Stand & was fehlt

| | |
|---|---|
| Code | läuft, getestet, alle Enden feuern |
| Git | Repo **lokal** angelegt, Commit `9b92f1d` |
| GitHub | ❌ nicht gepusht (`gh` ist nicht eingeloggt) |
| Online | ❌ isso.tv zeigt weiterhin die leere STRATO-Baukastenseite |
| Impressum/Datenschutz | ❌ **fehlt** — bei öffentlicher Seite Pflicht (§ 5 DDG) |
| Offene Entscheidung | Echtzeit (ein Zug pro Tag) oder Spiel zum Hinsetzen |
| Nächster Bau | Bunker Valley als 2.5D-Allee |

**Wichtig zum Thema Backup:** Das lokale Repo liegt auf derselben Platte wie
das Original. Das ist **kein Backup**. Erst der Push macht es zu einem —
und gleichzeitig zum datierten Nachweis für den Namen.

**Weg nach draußen:** `gh auth login` (nur der Autor), dann Repo anlegen,
pushen, Pages einschalten. Ergebnis wäre `chrislew92.github.io/isso-tv` ohne
jede DNS-Änderung. isso.tv selbst umzubiegen ist ein eigener, späterer Schritt
bei STRATO.

**Und wenn es öffentlich geht:** Der Zugangscode steht dann im offenen
Quelltext. Er ist ein Vorhang, kein Schloss — er hält Zufallsbesucher raus,
mehr war nie versprochen. Echter Schutz bräuchte `.htaccess` beim Hoster
oder Cloudflare Access.

---

© 2026 Christoph Lewandowski

