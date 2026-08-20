# ISSO.TV V3 — Performance-Nachweis

Stand: 20.08.2026

## Referenzlauf

| Messwert | Ergebnis |
| --- | ---: |
| Renderer | WebGL2 |
| Samples | 180 Frames |
| FPS | 59,9 |
| durchschnittliche Framezeit | 16,69 ms |
| p95 Framezeit | 17,0 ms |

Gemessen wurde lokal im In-App-Browser nach stabilisiertem Lauf im Hafen; die ersten Ladeframes wurden nicht gewertet. `PerformanceProbe` schreibt das Ergebnis ausschließlich als Diagnoseattribut an `.realtime-world`; es verändert keinen Spielzustand. Die Probe ist kein Ersatz für den noch offenen Chrome-Trace und Gerätelaborpass.

## Produktionsbuild

- größtes JavaScript-Chunk: 368,90 kB minifiziert / 99,42 kB gzip,
- V5: 4.707.288 Byte,
- V5 LOD1: 4.276.136 Byte,
- V5 LOD2: 4.008.540 Byte,
- Welt: 8.783.396 Byte,
- Geometrie: Meshopt; Texturen: KTX2/UASTC; lokale Decoder.

## Noch erforderliche Messungen vor Alpha

- Chrome Performance Trace mit Long-Task-, Shader- und Speichernachweis,
- Core Web Vitals für den initialen Seiten-/Filmstart,
- 15-Minuten-Rundlauf durch Zimmer, Flur und Hafen,
- Low-Memory-Gerät mit 4 GB oder weniger,
- Laptop, Tablet und Mobile aus `docs/QA_RELEASE.md`,
- Sicht- und Leistungstest jedes neu hinzukommenden Bezirks.

Diese Datei behauptet bewusst keinen bestandenen Mobil- oder Core-Web-Vitals-Test.
