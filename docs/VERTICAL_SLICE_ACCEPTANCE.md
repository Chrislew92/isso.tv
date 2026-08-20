# ISSO.TV V3 — Vertical-Slice Acceptance Matrix (Master Edition)

Stand: 20.08.2026
Verantwortlich: Codex

## Zielbild
Dieser Stand deckt den Vertical Slice „Morgen → Wohnung → Flur → Hafen → Bahnhof/HQ1“ als durchgängigen, lokal spielbaren und wiederaufnehmbaren Lauf ab.

## 1) Weltkoordinaten und Pfadkette
- [x] `src/game/canon.js` ist die einzige kanonische Quelle für Orte und Interaktionspunkte.
- [x] `src/components/RealtimeWorld.jsx` nutzt die Kanondaten (`PLACES`, `INTERACTIONS`, `WORLD_START`) ohne eigene parallele Koordinatensätze.
- [x] Fluss vom `wake_mattress` bis `signalwerk_arrival` existiert als zusammenhängende Ereignisse (`run.events`).
- [x] Vorerst kein Orts-Doppelpunkt im selben Moment (`addEvent` dedupliziert).

## 2) Reload/Reset-Zusammenhang
- [x] Vollständiger Morgenläufe aus `filmEvents` auf frischem Lauf getestet (`connection → door → cart → station → signalwerk`).
- [x] `Reload` setzt Position und Nachhall konsistent weiter.
- [x] `Reset` löscht den lokalen V3-Slot und startet den Lauf auf die Fährbude zurück (ohne fremden Persistenzverlust).

## 3) Visueller Art-Pass für Frühpfade
- [x] Flur/Vordach/Hafen-Hintergrund haben eigene lesbare Oberflächen und Kanten (`SurfaceStoryDetails`).
- [x] NPC-Hintergrund-Haltung ist in den frühen Pfadstellen integriert.
- [x] Kamera-Limits und -Obstruktion sind nicht hart blockiert; Orbit-Umkreis funktioniert.
- [x] Öffnung/Film-Blendings bleiben in einem konsistenten V3-Palette-Stil; kein separates „Zweite-Grafikmodus“-System.

## 4) Audio-Mix und Tonmischung
- [x] Vier Audiobusse (`master`, `voice`, `ambience`, `effects`) existieren.
- [x] Sechse Zonen-Mischung für Ambiente (`AMBIENCE_MIX`) bleibt erhalten.
- [x] Eigene Presentation-Mode-Mix-Logik für `clear`, `cinematic`, `wake` ist aktiv (`setPresentationMode`).
- [x] Opening-/Wachmomenten sowie filmische Modi drosseln bewusst Effekt-/Ambience-Bus für klarere Sprach-/Szenenwirkung.

## 5) Mobile, Touch, Controller, A11y
- [x] Touchpad + Sprint-Button, Maus/Keyboard, Gamepad-Pfad sind vorhanden.
- [x] Fokusfalle, Escape-Verhalten, Untertitelgrößen, Kontrast und Reduced-Motion sind implementiert.
- [x] Mobile-HUD/Prompts sind vorhanden.
- [ ] Hardware-Controllertest auf Gerät wird noch manuell geprüft.

## 6) Movement/Cinematic/Mocap-Polish
- [x] 353L-Kinematic-Mix (Foot-lock, Turn/Stop/Interact, Hufsprint, Atem/Head/Ohr/Tail, Lippen-/Schnauzen-Sync) ist im Slice aktiv.
- [x] Kamera-Idle-Bewegung und Zielpunkt-Nachführung sind in der Welt aktiv.
- [x] Filmstil wird für filmfähige Momente nicht starr, sondern deterministisch variabel über Run-Historie berechnet.

## 7) Noch offen vor Finalfreigabe
- [ ] Physische Controller- und Laptop-/Tablet-Gerätematrix.
- [ ] Manuelle lokale M1-Freigabe im gewünschten Stil (einheitliche visuelle Richtung) durch den Nutzer.

## Nächste handfeste Schritte für Claude/weiteres Team
1. `npm run dev` lokaler Pfadcheck mit der neuen Präsentationsmix-Logik.
2. Nachvollziehbare M1-Abnahme im Browser (Kamera-/Soundbalance, keine harten Film-Unterbrechungen).
3. Gerätematrix ausklappen und danach auf M2-Startmodule (Character/Kleidung/Speiselogik/Zeitschleife) gehen.
