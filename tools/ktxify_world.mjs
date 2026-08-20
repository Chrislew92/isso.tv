import { readFile } from 'node:fs/promises'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, KHRTextureBasisu } from '@gltf-transform/extensions'
import draco3d from 'draco3d'

const [input, output, ...pairs] = process.argv.slice(2)
if (!input || !output || pairs.length % 2 !== 0) {
  throw new Error('Usage: node tools/ktxify_world.mjs input.glb output.glb textureName file.ktx2 [...]')
}

const decoder = await draco3d.createDecoderModule()
const encoder = await draco3d.createEncoderModule()
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'draco3d.decoder': decoder, 'draco3d.encoder': encoder })
const document = await io.read(input)
document.createExtension(KHRTextureBasisu).setRequired(true)
const mapping = new Map()
for (let index = 0; index < pairs.length; index += 2) mapping.set(pairs[index], pairs[index + 1])

let replaced = 0
for (const texture of document.getRoot().listTextures()) {
  const match = [...mapping.entries()].find(([name]) => texture.getName().includes(name))
  if (!match) continue
  texture.setImage(await readFile(match[1]))
  texture.setMimeType('image/ktx2')
  replaced += 1
}
if (replaced !== mapping.size) throw new Error(`Expected ${mapping.size} KTX2 replacements, got ${replaced}`)
await io.write(output, document)
console.log(`KTX2_REPLACED=${replaced}`)
