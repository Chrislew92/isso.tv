# Masterprompt — ISSO.TV / 353L.EXE

Für jeden künftigen Agenten. **Stand 8. August 2026, gegen den Code geprüft.**
Ersetzt die ältere Fassung aus `Downloads\claude_master_prompt.md` — die enthielt
drei Fehler, siehe ganz unten.

---

## 1 · Die Welt

Der Spieler ist 34, lebt in **Eitelstedt**, will **25.000 €** zusammenkriegen.
**TA$CH€N** (der Taschengrabscher) nimmt sich jede Woche seinen Teil.

**Die Waage:** **Rot = RICHKID** (nehmen, schnell, riskant) ·
**Blau = WORKLIFE** (bauen, sichern) · **Grau = Arbeit** ist kein Weg, nur der Boden.

**Das Ökosystem:** **S7V3N** ist die Bank hinter TA$CH€N (eigene Seite, schwarz/gold,
„TA$CH€N arbeitet für uns"). **EyTonLand** ist das Dach über allem.

**Begriffe — exakt so schreiben:**
`ZEDCOINZ` (Kurzform `ZED`, 1.000 € = 1 ZED) · `BLUSTERS!` (**ein** Ausrufezeichen) ·
`TA$CH€N` · `Homebunker` · `Datenstrohhalm` · `Eitelstedt`

### Die These

**„Mit unendlichem Reichtum generiert man Unsterblichkeit."** — Chris, 8.8.2026.

Das ist das Ziel hinter dem Ziel. Die 50.000 € sind nur die erste Stufe; worauf
das Spiel zuläuft, ist der Punkt, an dem Geld aufhört, eine Zahl zu sein. Genau
das passiert im Ende **KRYPTO-KÖNIG**: 1 ZED = 500 Billiarden, das Konzept Geld
ist zerstört, `#dieletztedigitalewaehrung`.

Und weiter, sein zweiter Satz dazu: **„Wer sich selbst schafft zu kopieren in
3D World, wird praktisch unsterblich — aber nicht jeder hat Zugang."**

Da schließt sich das Ganze. Unsterblichkeit ist im Spiel nichts Mystisches,
sondern eine **Zugangsfrage** — und deshalb ist die Zugangsschranke am Anfang
(`b0`, die Kennung, die begrenzte Mitgliederzahl, die SafeIDs) keine Deko,
sondern die Aussage selbst. Das Bonzenviertel ist der Ort, an dem die drin
sind. Der Homebunker ist der Versuch, sich von unten einen Platz zu betonieren.

**Und das eine geht nicht ohne das andere.** Kein Reichtum ohne einen, der
abschöpft — sonst wäre er nichts wert. Kein Zugang ohne eine Schranke — sonst
wäre er keiner. Das Spiel funktioniert nur, weil beide Hälften da sind: wer
TA$CH€N rausnimmt, nimmt dem Reichtum den Sinn; wer die Schranke aufmacht,
nimmt der Unsterblichkeit den ihren. **Nie nur eine Hälfte bauen.**

Die Gegenkraft dazu ist das TA$CH€N-Prinzip. Alles zusammen ist das Spiel:
**jede Woche nimmt sich einer seinen Teil — und der einzige Ausweg ist, so weit
zu kommen, dass sein Anteil bedeutungslos wird.** Wer da ankommt, kommt rein.
Wer nicht, bleibt draußen und wird abgeschöpft. Genau das ist der Vorwurf, den
das Spiel erhebt.

### Das TA$CH€N-Prinzip

Chris' Satz dazu: **„wir werden die ganze Zeit gerippt."** Das ist der Kern des
Spiels, nicht bloß eine Mechanik. Jede Woche nimmt sich jemand seinen Teil,
ohne zu fragen, unabhängig davon, was man richtig gemacht hat. Die Fixkosten
steigen, der Dispo steht seit zehn Jahren still. Wer das aus dem Spiel nimmt,
nimmt ihm den Sinn.

Deshalb ist TA$CH€N **kein Gegner, den man besiegt** — er ist die Steuer aufs
Dasein. Man kann sich nur schützen (Tür, Mitbewohner, Bunker) oder so weit
kommen, dass sein Anteil egal wird.

### ZED und ZEE — eine Währung, zwei Einheiten

**Es ist keine zweite Währung.** ZEECOIN ist die kleinste Einheit von ZEDCOIN,
so wie Satoshi zu Bitcoin. Chris am 8.8.2026:
*„der zeecoin ist 0,00000001 zedcoin"* — sieben Nullen, dann die Eins.

| | |
|---|---|
| 1 `ZED` | 1.000 € (`ZEDKURS`) |
| 1 `ZED` | 100.000.000 `ZEE` (`ZEE_PRO_ZED`) |
| 1 `ZEE` | ein tausendstel Cent |

Deshalb kann der **Datenstrohhalm** ehrlich behaupten, er zapfe Mikro-Beträge
ab: er saugt ~100.000 ZEE pro Zug, was einem Euro entspricht. Vorher stand da
„Mikro-Cent-Beträge" und es kam 1 € pro 1,5 Sekunden — der Satz war gelogen.

**Der Halm ist die Sucht im Spiel.** Chris: *„der datenstrohhalm ist meine vape"*
und *„wir haben auch süchte"*. Er kostet **jede Woche einen Nerv**, solange er
läuft — sonst könnte man mit leerem Konto risikofrei durchsaugen, weil das
+30 %-Risiko nur Bargeld trifft und ZEE außer Reichweite von TA$CH€N liegt.

Die **500 Billiarden** pro ZED gelten nur im Ende **KRYPTO-KÖNIG** — der Moment,
in dem Geld aufhört, eine Zahl zu sein (`#dieletztedigitalewaehrung`).

> **Schreibweise noch offen:** im Code steht `ZEDCOINZ` (mit Z am Ende), Chris
> schreibt inzwischen meist `ZEDCOINS`. Steht in **einer** Konstante (`COIN`),
> ist also ein Ein-Wort-Wechsel. Nicht raten — fragen.

Markenschreibweise ist Pflicht: **MedalGuard.com · IronMind-BlackCore.com ·
ISSO.TV · S7V3N.com · EyTonLand.com**

---

## 2 · Architektur — hart und ohne Ausnahme

**Alles liegt in EINER `index.html`.** Kein React, Vue, Svelte, Tailwind, kein NPM.

> **Und ausdrücklich: kein CDN, kein `script src`, kein Three.js.**
> Die Datei enthält aktuell **null** externen Code. Das ist kein Zufall, das ist
> der Kern. Der Motherbrowser ist CSS, nicht WebGL. Wer das ändert, zerstört die
> einzige Eigenschaft, die ISSO.TV besonders macht.

**Styling:** Vanilla CSS, Arial Black + Monospace, fette schwarze Outlines mit
weißer Kreidekontur, flache Sattfarben, Sticker-Schatten. Nichts Rundes.

**Farbe ist Information, nicht Deko.** Rot/Blau/Grau bedeuten etwas.
**Nie Bedeutung allein über Farbe** — Chris ist farbenblind. Kontraste gegen
WCAG rechnen, nicht ansehen.

**State:** komplett in `S` + `localStorage`. Kein Server.
`S` wird von `neu()` neu gebunden → nach außen nur als Getter geben.

**Echtes 3D würde die flache Optik kaputtmachen.** 2.5D ist der Weg.

**Tabu:** das `medalguard`-System nicht anfassen.

---

## 3 · Was gebaut ist

`b0` Zugang · `b1` Nacht · `b2` Raum in Ego-Perspektive mit sichtbaren Händen ·
`b3` Senderkennung · `b4` Desktop · `b5` Comic · `b6` Name + Beruf · `b7` Spiel ·
`b8` Motherbrowser · `b9` Minispiel · `b10` Straße

**Komplett ohne Maus bedienbar.** Leertaste · WASD · E · Pfeile · 1–9 · Z · Esc.

Sieben Berufe (wechselbar im Spiel) · Homebunker · P-Konto · Privatinsolvenz ·
Krankschreibung · steigende Fixkosten gegen einen Dispo, der stillsteht ·
Türschloss + Mitbewohner als Schutz · 3 Joker · 20 Szenen · **8 Enden** ·
`haushalt.exe` · `unterstuetzen`

**Die Straße (`b10`) ist begehbar.** WASD/Pfeile, 3.120 Meter, fünf Orte:
Dein Haus · Kiosk · Die Bunker · Haltestelle · Ende der Straße. `E` geht hin,
`Esc` zurück. Die Häuserreihe recycelt sich im Kreis, die Beine laufen mit.

**Weltuhr:** Zufall gesät aus `saison() * 1009 + woche`, Saison = UTC-Tag.
Jeder spielt am selben Tag dasselbe Spiel. **Die Zeit ist der Server.**

> **Zwei Zufallsquellen, und das ist Absicht.** `zuf()` ist die Weltuhr — alles,
> was über Geld, Nerven, Szene oder TA$CH€N entscheidet. `deko()` ist Ambiente
> (Flackern, Getuschel, Chat-Ticker, Minispiel-Klötze) und läuft pro Bild.
> Käme die Deko aus der Weltuhr, würde **bloßes Herumstehen auf der Straße den
> Zufallsfaden weiterdrehen** — zwei Leute am selben Tag hätten verschiedene
> Angriffe, und die Garantie wäre wertlos. Niemals wieder zusammenlegen.

---

## 4 · Die Regeln, die wehtun wenn man sie bricht

**Das Spiel muss allein über die Antwortmöglichkeiten funktionieren.**
Jeder Knopf sagt, was er tut und was er bringt. Der Text ist Beiwerk.

**Nicht ins Elend kippen.** 30 % Fehlschlag bei einer Handlung pro Woche war
Frustsimulation — 12 % mit Trostbetrag ist richtig. Es ist ein Highroller-RPG,
kein Verzweiflungssimulator.

**Was nicht geht, ist sichtbar gesperrt** statt eine Woche zu fressen.

**`haushalt.exe` rechnet, es berät nicht.** Schuldnerberatung ist in Deutschland
reguliert. Diese Grenze ist eisern.

**Nichts Privates.** Alles, was den Autor identifiziert, wurde bewusst entfernt.
Nicht wieder einbauen.

---

## 5 · Fallen, die schon zugeschnappt sind

Diese Fehler hatten die Datei **komplett tot gelegt**:

1. `let mgAktiv` doppelt deklariert
2. `\\'b4\\'` statt `\'b4\'` — Zeichenkette endet mittendrin
3. `$('code')` zeigte auf ein Feld, das inzwischen `id="pw"` hieß
4. **`ziehe()` und `pruefe()` fehlten im Wochenabschluss** → ewig dieselbe Szene,
   kein Ende feuerte je

**Nach jeder Änderung `window.ISSO` in der Konsole prüfen.**
Ist es `undefined`, ist die Datei tot. Und beim Umbenennen von HTML-IDs immer
das Skript mitziehen. Browser cachen hartnäckig → `?v=` an die URL.

---

## 6 · Nächste Stufen (alle ohne fremden Code baubar)

**S7V3N-Kredite** — Kredit aufnehmen, Zinsen, Inkasso-Events härter als TA$CH€N
**Auktions-Sniper** — eigenes Minispiel für Domain-Flipping statt Blocksortieren
**TA$CH€N bekommt eine Stimme** — In-Game-Nachrichten ab Woche 10
**Bunker-Brummen** — prozeduraler Ton über die Web Audio API, verzerrt sich mit
sinkenden Nerven. Ohne MP3, ohne Bibliothek.
**Schwarzmarkt im Motherbrowser** — Skripte kaufen, Strohhalm-Ertrag hoch, Rot hoch

---

## Was an der alten Fassung falsch war

| Alt | Richtig |
|---|---|
| `ZEEDCOINZ` | **ZEDCOINZ** |
| `BLUSTERS!!!` | **BLUSTERS!** |
| „Three.js via CDN" | **kein CDN, kein externer Code** — widersprach der eigenen Zero-Dependency-Regel |
| „datumapp = Wüste/Darknet" | DatumApp.de ist ein eigenes Unity-Projekt, nicht Teil der Fiktion |

---

© 2026 Christoph Lewandowski

