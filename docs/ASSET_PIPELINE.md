# ISSO.TV V3 — Runtime-Asset-Pipeline

Stand: 20.08.2026

## Reihenfolge

1. `tools/blender/build_vertical_slice.py` erzeugt Blender-Master und Welt-GLB.
2. `tools/blender/build_hi3d_character.py` erzeugt V5-Master, Rig, elf Clips und Outfit-Slots.
3. `npm run assets:runtime` erzeugt KTX2-Texturen, Meshopt-Geometrie und zwei Charakter-LODs und führt Tests plus Produktionsbuild aus.

## Lokale Werkzeuge

- Node/npm aus dem Projekt.
- Blender 4.x für die beiden Python-Builder.
- KTX-Software 4.3+; in diesem Arbeitsstand liegt sie lokal und ignoriert unter `.cache/ktx/bin`.
- `@gltf-transform/cli` ist als Entwicklungsabhängigkeit festgehalten.
- Die CLI erhält per npm-`overrides` `sharp@0.35.3`; damit meldet auch der vollständige Entwicklungs-Audit 0 bekannte Lücken. Nach jedem Dependency-Update muss `npm audit` erneut laufen.

## Runtime-Vertrag

- V5: `public/models/353l-hi3d-character-v5.glb`
- LOD1/LOD2: gleichnamige `-lod1.glb`/`-lod2.glb`
- Welt: `public/models/isso-v3-vertical-slice-v1.glb`
- lokale Decoder: `public/draco/` und `public/basis/`
- Geometrie: `EXT_meshopt_compression`; Blender-Draco dient als Pipeline-Zwischenschritt.
- Texturen: `KHR_texture_basisu` / UASTC-KTX2 mit Mipmaps.

Das 56,58-MiB-Hi3D-Original bleibt absichtlich lokal und ignoriert unter `assets/source/353l-hi3d-character-v5-original.glb`. Der reproduzierbare Buildbericht enthält seinen Hash; committed werden editierbarer Blender-Master, optimierte Runtime-GLBs und Bericht.

Die Pipeline enthält bewusst keinen Push, kein Deployment und keine Änderung an `isso.tv`.
