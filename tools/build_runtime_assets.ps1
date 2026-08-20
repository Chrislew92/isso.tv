$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$cacheDir = Join-Path $projectRoot '.cache'
$ktxBin = Join-Path $cacheDir 'ktx\bin'
$toktx = Join-Path $ktxBin 'toktx.exe'
$models = Join-Path $projectRoot 'public\models'
$textures = Join-Path $projectRoot 'assets\textures'

if (-not (Test-Path -LiteralPath $toktx)) {
  throw 'KTX-Software fehlt unter .cache\ktx\bin. Siehe docs/ASSET_PIPELINE.md.'
}

New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null
$env:PATH = "$ktxBin;$env:PATH"

$character = Join-Path $models '353l-hi3d-character-v5.glb'
$characterRaw = Join-Path $cacheDir '353l-v5-blender.glb'
$characterKtx = Join-Path $cacheDir '353l-v5-ktx.glb'
Copy-Item -LiteralPath $character -Destination $characterRaw -Force
npx gltf-transform uastc $characterRaw $characterKtx --level 2 --rdo --rdo-lambda 1 --zstd 10
npx gltf-transform meshopt $characterKtx $character

$lod1Raw = Join-Path $cacheDir '353l-v5-lod1-simple.glb'
$lod2Raw = Join-Path $cacheDir '353l-v5-lod2-simple.glb'
npx gltf-transform simplify $character $lod1Raw --ratio 0.52 --error 0.002
npx gltf-transform meshopt $lod1Raw (Join-Path $models '353l-hi3d-character-v5-lod1.glb')
npx gltf-transform simplify $character $lod2Raw --ratio 0.22 --error 0.008
npx gltf-transform meshopt $lod2Raw (Join-Path $models '353l-hi3d-character-v5-lod2.glb')

$world = Join-Path $models 'isso-v3-vertical-slice-v1.glb'
$worldRaw = Join-Path $cacheDir 'isso-world-blender.glb'
$worldKtx = Join-Path $cacheDir 'isso-world-ktx-draco.glb'
Copy-Item -LiteralPath $world -Destination $worldRaw -Force

$textureNames = @(
  'room-floor-worn-hd-v2-runtime',
  'room-plaster-worn-hd-v2-runtime',
  'hall-terrazzo-hd-v1-runtime',
  'harbor-asphalt-hd-v1-runtime'
)
$mapping = @()
foreach ($name in $textureNames) {
  $source = Join-Path $textures "$name.jpg"
  $output = Join-Path $cacheDir "$name.ktx2"
  & $toktx --genmipmap --encode uastc --uastc_quality 2 --uastc_rdo_l 1.0 --zcmp 10 --assign_oetf srgb --assign_primaries bt709 $output $source
  $mapping += $name
  $mapping += $output
}
node (Join-Path $projectRoot 'tools\ktxify_world.mjs') $worldRaw $worldKtx @mapping
npx gltf-transform meshopt $worldKtx $world

npm test -- --run
npm run build
