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

## D-005 — Gewalt bleibt ein einmaliger Charakterbruch

- Datum: 17.08.2026
- Entscheidung: 353L erhält genau ein kanonisches 1-gegen-1-QTE gegen einen tatsächlich angreifenden Straßenräuber. Die Gegenwehr fällt erschreckend heftig aus und zwingt 353L zur Frage nach seiner aggressiven Seite.
- Grund: Seine enorme körperliche Stärke wird dramatisch sichtbar, ohne ihn zum Schläger oder Kämpfen zum wiederholbaren Belohnungsloop zu machen.
- Erwogene Alternative: Kneipenprügelei als normales Minispiel; verworfen, weil dies 353Ls bewusster Konfliktvermeidung und dem seltenen Gewicht der Szene widerspricht.
- Folge: Die Kneipe zeigt Zurückhaltung. Der Straßenraub zeigt Kontrollverlust und bewusstes Aufhören. Kein Gore, keine reale Kampfanleitung, kein Kampf-XP und kein Gut-/Böse-Meter; entscheidend sind Nachhall und spätere Verantwortung.

## D-006 — Zwei gespiegelte 1-gegen-1-Momente ersetzen D-005

- Datum: 17.08.2026
- Entscheidung: D-005 wird erzählerisch präzisiert und durch zwei nicht wiederholbare Spiegelmomente ersetzt. In der Kneipe gewinnt 353L ein kurzes 1-gegen-1 und wird öffentlich gefeiert, obwohl er niemandem wehtun wollte. Beim späteren Straßenraub wird seine Gegenwehr aggressiver und endet in erschrockener Stille.
- Grund: Derselbe körperliche Sieg erhält durch Umgebung und 353Ls Innenleben zwei völlig verschiedene Bedeutungen.
- Folge: Beide Szenen teilen eine knappe filmische QTE-Grammatik, vergeben aber weder Kampf-XP noch Loot. Kneipe: Jubel außen, Zweifel innen. Straßenraub: Gefahr außen, Kontrollverlust und Verantwortungsfrage innen. D-006 ersetzt die Aussage aus D-005, es gebe genau einen Kampf.

## D-007 — Kampfideen sind mögliche Pfade, keine Pflichtszenen

- Datum: 17.08.2026
- Entscheidung: D-006 beschreibt zwei mögliche Spiegelpfade, nicht zwei garantierte Ereignisse. Ort, Zeit, Beziehungen und Spielerentscheidungen bestimmen, ob Kneipenstreit oder Straßenraub stattfinden und ob daraus überhaupt ein Kampf wird.
- Grund: ISSO.TV soll Gedankenpunkte als echte Möglichkeiten abbilden und die Freiheit des Runs erhalten.
- Folge: Ein gewaltfreier Run ist vollständig und gleichwertig. Nur erlebte Pfade erzeugen Nachhall. Die emotionale Spiegelung entsteht, wenn ein Spieler beide Kampfvarianten tatsächlich erlebt.

## D-008 — Weglaufen wird durch den Hufsprint zur starken Esel-Fähigkeit

- Datum: 17.08.2026
- Entscheidung: 353L kann auf freier Strecke für kurze Zeit ungefähr doppelt so schnell wie ein durchschnittlicher Mensch sprinten. Flucht wird direkt in 3D gespielt und ausdrücklich als starke, kluge Option inszeniert.
- Grund: 353Ls Eselkörper soll nicht nur im Kampf Bedeutung haben. Geschwindigkeit schafft eine charaktereigene Lösung, die Gewalt vermeidet und trotzdem Adrenalin liefert.
- Folge: Offene Flucht gegen einen einzelnen menschlichen Verfolger gelingt bei früher freier Routenwahl fast immer. Spannung entsteht aus Raum, Untergrund, Gepäck und Hindernissen. Animation, Kamera, Sound und Assist-Modus gehören zum Hufsprint-Feature.

## D-009 — Die Obere Gabe richtet Tiere auf, macht sie aber nicht zu Menschen

- Datum: 17.08.2026
- Entscheidung: Eine alte, nur unter Tieren weitergegebene Legende erzählt von der Oberen Gabe. Manche Tiere können sich freiwillig aufrichten und auf zwei Beinen gehen. Der Preis ist, vollständig als ihre Art erkennbar zu bleiben: Hufe, Pfoten, Krallen, Schnabel, Flügel, Panzer, Sinne und Bewegungslogik verschwinden nicht.
- Grund: Der aufrechte Gang erklärt die gemeinsame Stadtwelt, ohne die Tierfiguren zu Menschen in Kostümen zu machen. Anatomie wird zu Story, Bewegung und Entscheidung.
- Folge: 353L behält vier echte Hufe; Katzen behalten Pfoten/Krallen. Aufrecht- und Tierhaltung werden langfristig spielbar. Charakter-, Kleidungs-, Werkzeug- und Rigdesign folgt `docs/ANIMAL_LORE.md`. Die Legende bleibt innerhalb der Welt mehrdeutig und erzeugt keine überlegene Tierkaste.

## D-010 — ISSO.TV spielt 2033 auf Erde-1

- Datum: 17.08.2026
- Entscheidung: 2033 bezeichnet denselben Kalender wie bei uns, aber Erde-1 ist eine Parallelwelt mit eigener Geschichte und anderen Grundgesetzen. Eine höhere Macht machte die Obere Gabe irgendwann möglich und kann als Gott verstanden werden.
- Grund: Vertrauter Alltag bleibt verständlich, während aufrechte Tiere, KI-Körper, Strammburg und spätere Weltideen keinen unrealistischen Technologiesprung unserer realen nächsten Jahre benötigen.
- Folge: Das Spiel bestätigt keine konkrete Religion und erklärt Zeitpunkt/Mechanismus der Gabe nicht endgültig. Glaube, Zweifel, Wissenschaft und Nichtglaube bleiben gleichwertige Perspektiven. Neue Erde-1-Gesetze brauchen Gameplaynutzen, Grenze und eigenen Entscheidungseintrag gemäß `docs/EARTH_1.md`.

## D-011 — Earthpeace 2033 ist ein verspäteter Friedensplan

- Datum: 17.08.2026
- Entscheidung: Die älteste Tierlegende beschreibt die Obere Gabe als einen von Gottes Plänen für den Weltfrieden. Die höhere Macht eröffnete Begegnung auf Augenhöhe, erzwang Frieden jedoch nicht. Im Spieljahr 2033 gilt die Earthpeace-Frist als sichtbar verpasst.
- Grund: Die Gabe erhält einen Sinn jenseits von Fähigkeiten, während freie Entscheidungen und die offene religiöse Deutung erhalten bleiben.
- Folge: Earthpeace 2033 ist kein erfülltes Prophezeiungs-Ende, sondern eine verspätete Aufgabe. EyTonLand kann später ein neuer praktischer Versuch werden. Strammburg darf die verpasste Deadline satirisch verwalten; das Spiel verteilt trotzdem keine Glaubenspunkte und erklärt keine reale Religion zur einzig richtigen.

## D-012 — Jedes aufgerichtete Tier trägt einen unbekannten höheren Zweck

- Datum: 17.08.2026
- Entscheidung: Jedes Tier, das durch die Obere Gabe aufrecht gehen kann, dient zugleich einem einzigartigen höheren Zweck. Kein Tier kennt den eigenen Zweck; Tiere wissen untereinander nur, dass jeder einen besitzt. Menschen können ebenfalls einen unbekannten Zweck haben, bei bewusster KI bleibt es offen. 353Ls Zweck bleibt ausdrücklich unbekannt.
- Grund: Die Gabe erhält persönliche Tiefe und verbindet freien Alltag mit einem größeren Mysterium, ohne Figuren auf vorbestimmte Missionen zu reduzieren.
- Folge: Zweck erscheint nur als mögliche Spur, Muster und Nachhall. Es gibt keinen Zweckwert, Questmarker, Klassenbonus oder göttliche Rechtfertigung. Die Tiergewissheit macht Menschen nicht zwecklos oder minderwertig. Kein Agent darf 353Ls Zweck ohne spätere ausdrückliche Nutzerentscheidung kanonisch auflösen.

## D-013 — Hoffnung verändert Eitelstedt lokal, nicht als Balken

- Datum: 17.08.2026
- Entscheidung: Eitelstedt beginnt grau, nass und erschöpft. Hoffnung wird durch kleine sichtbare Weltspuren dargestellt — warme Fenster, Licht, Grüße, Reparaturen, Pflanzen und benutzte Orte — nicht durch einen numerischen Hoffnungswert oder eine göttliche Rettungsszene.
- Grund: Die höhere Macht, der unbekannte Zweck und der verspätete Earthpeace-Plan sollen Hoffnung ermöglichen, ohne Probleme kleinzureden oder das Spiel religiös zu machen.
- Folge: Art-, Licht-, Audio- und World-State-Arbeit nutzt eine langsame lokale Hoffnungssprache. Grau bleibt Teil der Identität; Entscheidungen schaffen einzelne warme Beweise und können späteren Figuren-/Stadtfunk-Nachhall auslösen.

## D-014 — ISSO.TV erhält Full Voice und tiergerechte Lippensynchronität

- Datum: 17.08.2026
- Entscheidung: 353L erhält einen festen Synchronsprecher; relevante Storydialoge, gewählte Antworten, Gedanken, Telefonate und NPC-Szenen werden gesprochen und untertitelt. Tierfiguren synchronisieren Sprache über artspezifische Schnauzen-/Schnabel-Viseme sowie getrennte Ohren-, Blick-, Atem- und Körperperformance.
- Grund: Das Spiel soll sich wie ein durchgehender interaktiver 3D-Film anfühlen und Figuren über Stimme ebenso unverwechselbar machen wie über Körper und Entscheidungen.
- Folge: Dialoge werden datengetrieben über stabile IDs produziert. Der erste Slice vertont 353L/Lotte vollständig. Dynamische Zahlen bleiben semantischer Text statt Sprachschnipsel. Die finale Stimme braucht ausdrückliche Besetzungsfreigabe und geklärte Rechte; synthetische Ableitung ist niemals automatisch erlaubt. Untertitel-only und stummes Spielen bleiben vollständig möglich.

## D-015 — KI-Stimmen sind für den lokalen Casting-/Timing-Slice freigegeben

- Datum: 17.08.2026
- Entscheidung: Der Nutzer hat ausdrücklich freigegeben, den ersten V3-Vertical-Slice mit erzeugten deutschen KI-Stimmen umzusetzen. 353L nutzt zunächst Killian, Lotte Seraphina und die Bahnhofsstimme Conrad.
- Grund: Stimme, Timing, Untertitel, Autoplay-Fallback und tierische Mund-/Körperperformance müssen im echten Spiel geprüft werden, bevor der gesamte Textbestand vertont wird.
- Folge: Die erzeugten MP3-/Timing-Dateien dürfen lokal im Projekt bleiben und weiterentwickelt werden. Sie sind noch keine automatisch veröffentlichungsfähige Masterbesetzung. Vor Deploy werden Anbieterbedingungen, Nutzungsrechte und die finale künstlerische Besetzung ausdrücklich geprüft und protokolliert.

## D-016 — Verlustfreie Texturmaster, leichte Laufzeitderivate

- Datum: 18.08.2026
- Entscheidung: Jede extern erzeugte HD-Oberfläche bleibt als verlustfreier PNG-Master im Projekt. Das GLB bettet eine visuell geprüfte JPEG-Laufzeitfassung ein; Dateiname und Einsatz sind ausdrücklich getrennt.
- Grund: Die Masterquelle soll für spätere Material-/KTX2-Arbeit erhalten bleiben, ohne Startzeit und GLB durch mehrere unkomprimierte 2K-Oberflächen unnötig zu belasten.
- Erwogene Alternative: Nur PNG ausliefern; verworfen, weil der erste Hafenexport das Level-GLB auf rund 15,1 MB vergrößerte. Nur JPEG behalten; verworfen, weil wiederholte Bearbeitung dann auf einer verlustbehafteten Quelle aufbauen würde.
- Folge: Der erweiterte und statisch gebatchte Weltstand liegt mit drei Laufzeittexturen bei rund 8,01 MB. Vor späterem Release werden KTX2, Mipmaps, LOD und sichtbarer Qualitätsvergleich erneut geprüft; PNG-Master werden nicht automatisch an den Browser ausgeliefert.

## D-017 — Hi3D-Arbeiter-Esel wird der neue lokale 353L-Visual-Anchor

- Datum: 19.08.2026
- Entscheidung: Der vom Nutzer bereitgestellte Hi3D-Sculpt ersetzt im lokalen V3-Stand das bisherige Charaktermodell. Die Pipeline erhält die Erscheinung, normalisiert auf 2,15 m, reduziert zwei Millionen auf 79.017 Laufzeitdreiecke, verkleinert 8K-Texturen auf 2K und ergänzt die stabile Rig-/Outfit-Slot-API.
- Grund: Gesicht, Silhouette, Fell und Arbeitskleidung tragen 353Ls Figur wesentlich glaubwürdiger als der bisherige Platzhalter und bleiben mit rund 8,8 MB browserfähig.
- Erwogene Alternative: primitive Huf-Cover auf Handschuhe und Schuhe setzen; nach Vier-Richtungs-Sichtprüfung verworfen, weil die Anbauteile die Figur sichtbar verbilligten und beim Skin-Export unzuverlässig waren.
- Folge: Quellschuhe und lose Handinseln werden entfernt. Vier geschlossene, modellierte, einzehige Eselhufe ersetzen die sichtbaren Extremitäten; die Vorderhufschalen kapseln verschmolzene Quellflächen unter dem Ärmel. Stand- und sanfte Beinpose müssen aus vier Richtungen geprüft werden. Provisorischer Armschwung bleibt bis zum manuellen Weight-Painting aus; echte Browser-Laufabnahme bleibt Teil von `P1-07`. Die GLB enthält keine Lizenzmetadaten; kommerzielle Veröffentlichungsrechte müssen vor einem Deploy separat belegt werden. Diese Entscheidung gibt keinerlei Live-Freigabe.

## D-018 — Nutzerabgenommener V5-353L ersetzt den V4-Visual-Anchor

- Datum: 19.08.2026
- Entscheidung: Die Datei `Hi3D_Realistisches Anthropomorphes Esel-Arbeiter 3D-Modell_allparts_20260819_221428.glb` wird zum verbindlichen lokalen 353L-Visual-Anchor. D-018 ersetzt D-017 für das aktive Modell. V5 bewahrt Gesicht, Kleidung, Schwanz, feste Hinterhufe und die fellbedeckten greiffähigen Vorderhufe des gelieferten Modells.
- Grund: Der Nutzer hat diese Figur nach mehreren Generatorvarianten ausdrücklich als gefundenen 353L angenommen. Ihre Silhouette und alle vier Ansichten sind konsistent; externe Hufschalen würden die abgenommene Identität erneut verfälschen.
- Erwogene Alternative: V4 mit entfernten Händen/Schuhen und nachträglich modellierten Hufschalen; verworfen, weil dies nicht mehr dem abgenommenen Charakter entspricht.
- Folge: Die reproduzierbare V5-Pipeline reduziert 2.000.000 auf 120.000 Dreiecke, 8K auf 2K und exportiert nach KTX2/Meshopt 4.707.288 Byte mit 21-Gelenk-Rig, Gesichtsbones, elf Clips und Outfit-Slots. Mehrgelenk-Weighting, ein prozeduraler Foot-Lock und der erste Tierlaufübergang sind umgesetzt; ein späterer Cinematic-/Mocap-Pass bleibt Qualitätsausbau. Die Vorderhufe werden kanonisch als tierische, keratinbesetzte Greifhufe verstanden, nicht als Menschenhände. Die Quell-GLB enthält keine Lizenzmetadaten; vor Veröffentlichung müssen kommerzielle Rechte belegt werden. Kein Deploy wurde freigegeben.

## D-019 — Komprimierte lokale WebGL-Runtime ist der Master-Assetpfad

- Datum: 20.08.2026
- Entscheidung: Blender-Exporte bleiben editierbare Quellen; Browserassets werden anschließend reproduzierbar mit KTX2/UASTC, Meshopt und Charakter-LODs erzeugt. Basis- und Draco-Decoder werden lokal ausgeliefert, nicht von einem CDN geladen.
- Grund: Der V5-Charakter, die texturierte Welt und spätere Bezirke brauchen planbare Download-, GPU- und Offline-Eigenschaften. Ein einzelnes riesiges Three.js-Chunk und unkomprimierte Bildtexturen skalieren nicht mit der geplanten Stadt.
- Erwogene Alternativen: rohe Blender-GLBs direkt ausliefern; wegen Größe verworfen. Externe Decoder-CDNs; wegen Offline- und Ausfallabhängigkeit verworfen. Nur Draco oder nur Meshopt; Blender-Draco bleibt der Builder-Zwischenschritt, Meshopt der einheitliche Runtime-Vertrag.
- Folge: `npm run assets:runtime` ist der verbindliche lokale Optimierungspfad. Tests prüfen Skins, Clips, LODs, KTX2, Meshopt, Weltknoten und Budgets. Jede Änderung an Decoderpfaden oder GLB-Erweiterungen ist eine Runtime-API-Änderung. Kein Push oder Deploy ist Teil der Pipeline.

## Vorlage

```text
## D-XXX — Titel
- Datum:
- Entscheidung:
- Grund:
- Erwogene Alternativen:
- Folge:
```
