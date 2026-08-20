import { readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const worldUrl = new URL('../../public/models/isso-v3-vertical-slice-v1.glb', import.meta.url)

function readGlbJson() {
  const file = readFileSync(worldUrl)
  expect(file.toString('ascii', 0, 4)).toBe('glTF')
  const jsonLength = file.readUInt32LE(12)
  return JSON.parse(file.toString('utf8', 20, 20 + jsonLength))
}

describe('ISSO.TV V3 world asset', () => {
  it('keeps the poor Fährbude contract and removes the affluent room props', () => {
    const gltf = readGlbJson()
    const names = gltf.nodes.map((node) => node.name)
    expect(names).toEqual(expect.arrayContaining([
      'room_floor', 'room_wall_back', 'room_wall_left', 'room_wall_front',
      'mattress_floor', 'old_table_top', 'old_laptop_base', 'old_laptop_screen',
      'wall_patch_a', 'wall_patch_b',
    ]))
    for (const forbidden of ['bed_frame', 'room_rug', 'bedside', 'nightstand', 'room_lamp', 'storage_']) {
      expect(names.some((name) => name.toLowerCase().includes(forbidden))).toBe(false)
    }
  })

  it('uses the browser delivery budget and production compression extensions', () => {
    const gltf = readGlbJson()
    expect(statSync(worldUrl).size).toBeLessThan(10 * 1024 * 1024)
    expect(gltf.extensionsUsed).toEqual(expect.arrayContaining([
      'EXT_meshopt_compression', 'KHR_texture_basisu',
    ]))
  })
})
