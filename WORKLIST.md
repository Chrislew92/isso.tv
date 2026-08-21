# ISSO.TV V3.1 — MACH-DASS-ES-LÄUFT-LISTE

Unsere eigene kurze Liste. Ein Schritt nach dem anderen. Jeder Schritt:
**fixen → im Browser prüfen → hier abhaken → committen.** Master bleibt heil,
alles läuft auf `fix/v3-stabil`.

Stand: 20.08.2026 · Branch: fix/v3-stabil

---

## 🔴 SCHRITT 1 — Grafik-Absturz (Context Lost)
**Problem:** `THREE.WebGLRenderer: Context Lost`. Die GPU stürzt ab.
**Ursache (aus der Konsole belegt):** die Modelle in `public/models/` haben
basisu/KTX2-Texturen mit Maßen, die nicht durch 4 teilbar sind → hunderte
`glCompressedTexSubImage2D`-Fehler → Kontext bricht zusammen.
**Betroffen:** isso-v3-vertical-slice-v1.glb, 353l-hi3d-character-v5(.glb/-lod1/-lod2)
**Fix:** Texturen mit gltf-transform sauber neu einbetten (auf 4er-Maße bringen).

- [x] 1a Welt-Modell entkomprimiert (dist-Original) — **Context Lost WEG, geprüft**
- [~] 1b Character: ktxfix lief, Metadaten ok. Rest-Warnungen (Maße nicht /4)
      crashen NICHT mehr. Voll sauber braucht das externe ktx-Tool → später/Codex.
- [x] 1c WebGL-Kontext lebt nach 5 s Spiel — kein Absturz mehr

## 🟠 SCHRITT 2 — Man sieht durch Wände
**Ursache:** Wände einseitig gerendert.
**Fix:** DoubleSide für Welt-Wände (schon vorbereitet auf altem Branch, neu einbauen).
- [x] 2a DoubleSide-Fix ist auf diesem Branch drin (prüfen im Bild)

## 🟠 SCHRITT 3 — 353L läuft durch Wände
**Ursache:** Kollision (`collectNavigationGeometry`) greift nicht richtig.
**Fix:** Kollisionsabfrage prüfen und zum Greifen bringen.
- [x] 3a Kollision diagnostiziert: Logik ok, aber nur Endpunkt-Check → Tunneling
- [x] 3b Fix: inkrementelle Teilschritte (kein Tunneling). Mit echten Wanddaten
      + 6 Unit-Tests bewiesen. Welt-Absturz sauber gefixt (Texturen 1254px
      gestrippt statt Modell-Downgrade) → room_wall_front bleibt erhalten.

## 🟡 SCHRITT 4 — Kamera klippt durch Wände
**Ursache:** Follow-Kamera ohne Kollision.
**Fix:** Kamera bei Wandkontakt näher ranziehen (Raycast).
- [x] 4a Kamera-Kollision laeuft jetzt als LETZTES (nach dem Zonen-Schwenk),
      damit der Schwenk sie nicht mehr ueberschreibt

---

## LOG (was wirklich passiert ist)
- 20.08 — Liste angelegt. Absturz-Ursache: kaputte basisu-Texturen.
- 20.08 — SCHRITT 1 ✔ Welt entkomprimiert → Context Lost weg, Szene läuft stabil.
- 20.08 — SCHRITT 6 ✔ Minimap unten rechts, Missions-Panel einklappbar.
- 21.08 — SCHRITT 4+5 ✔ Kamera-Kollision ans Ende verschoben (Schwenk klippt
         nicht mehr durch); Eingabe-Richtung beim Schwenk stabilisiert (dreht
         nicht mehr um). Code-Fix + 42 Tests gruen + Konsole fehlerfrei.
         Sicht-Abnahme im echten Browser noch offen (Vorschau-Pane rendert 3D nicht).
- 21.08 — SCHRITT 3 ✔ Kollision tunnelt nicht mehr (inkrementelle Teilschritte,
         mit echten Wanddaten + Tests bewiesen). Absturz sauber neu gefixt:
         die 4 kaputten Welt-Texturen (1254px) entfernt statt Modell-Downgrade;
         korrekte Welt mit room_wall_front wiederhergestellt. 42 Tests gruen.
         Character-Warnungen bleiben (kein Crash). SCHRITT 2a (Wände) drin.

## 🟠 SCHRITT 5 — Kamera schwenkt am Hauseingang, Laufrichtung dreht sich um
**Problem:** Beim Reingehen schwenkt die Kamera hart; im selben Moment kippt
die WASD-Richtung (vor wird zurück), 353L dreht um und läuft weg.
**Ursache (Verdacht):** Zonen-Kamerawechsel + Bewegung relativ zur Kamera →
bei hartem Schwenk invertiert "vorwärts".
**Fix:** Richtung während Kameraschwenk stabil halten / Schwenk sanft.
- [x] 5a diagnostiziert: Bewegung kamera-relativ, beim Zonen-Schwenk kippt
      camera.getWorldDirection → "vorwaerts" dreht sich um
- [x] 5b Eingabe-Richtung waehrend Schwenk eingefroren, sonst sanft nachgefuehrt

## 🟢 SCHRITT 6 — UI-Wünsche
- [x] 6a Minimap flush in die untere rechte Ecke — geprüft
- [x] 6b Missionsanzeige einklappbar (Klick auf Kopfzeile) — geprüft
- [x] 6c Steuerkreuz nur noch auf echten Touch-Geräten (Desktop: aus) — geprüft
