import { readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const assetUrl = new URL('../../public/models/353l-hi3d-character-v5.glb', import.meta.url)
const lodUrls = [
  new URL('../../public/models/353l-hi3d-character-v5-lod1.glb', import.meta.url),
  new URL('../../public/models/353l-hi3d-character-v5-lod2.glb', import.meta.url),
]

function readGlbJson(url = assetUrl) {
  const file = readFileSync(url)
  expect(file.toString('ascii', 0, 4)).toBe('glTF')
  expect(file.readUInt32LE(4)).toBe(2)
  const jsonLength = file.readUInt32LE(12)
  return JSON.parse(file.toString('utf8', 20, 20 + jsonLength))
}

describe('353L Hi3D runtime character', () => {
  it('stays within the browser asset budget', () => {
    expect(statSync(assetUrl).size).toBeLessThan(12 * 1024 * 1024)
  })

  it('keeps the stable rig and outfit-slot contract', () => {
    const gltf = readGlbJson()
    const nodes = new Set(gltf.nodes.map((node) => node.name))
    const requiredNodes = [
      'CHARACTER_353L_ROOT',
      '353L_Hi3D_Master_Mesh',
      'rig_hips', 'rig_spine', 'rig_neck', 'rig_head', 'rig_jaw',
      'rig_ear_l', 'rig_ear_r', 'rig_tail',
      'rig_muzzle_wide', 'rig_muzzle_round', 'rig_nostrils',
      'rig_tongue', 'rig_eyelid_l', 'rig_eyelid_r',
      'rig_arm_l', 'rig_arm_r', 'rig_forearm_l', 'rig_forearm_r',
      'rig_hand_l', 'rig_hand_r', 'rig_leg_l', 'rig_leg_r',
      'rig_shin_l', 'rig_shin_r', 'rig_foot_l', 'rig_foot_r',
      'slot_head', 'slot_face', 'slot_torso', 'slot_back', 'slot_hip',
      'slot_front_hoof_l', 'slot_front_hoof_r',
      'slot_rear_hoof_l', 'slot_rear_hoof_r',
    ]

    expect([...nodes]).toEqual(expect.arrayContaining(requiredNodes))
    expect(gltf.skins).toHaveLength(1)
    expect(gltf.skins[0].joints.length).toBeGreaterThanOrEqual(20)
    const clipNames = new Set(gltf.animations?.map((clip) => clip.name))
    expect(gltf.animations?.length).toBeGreaterThanOrEqual(11)
    expect([...clipNames]).toEqual(expect.arrayContaining([
      '353L_Idle', '353L_Walk', '353L_Run', '353L_TurnLeft', '353L_TurnRight',
      '353L_Stop', '353L_StandUp', '353L_Door', '353L_Laptop', '353L_Carry',
      '353L_AnimalRunTransition',
    ]))
    expect(gltf.extensionsUsed).toEqual(expect.arrayContaining([
      'EXT_meshopt_compression', 'KHR_texture_basisu',
    ]))

    const root = gltf.nodes.find((node) => node.name === 'CHARACTER_353L_ROOT')
    const body = gltf.nodes.find((node) => node.name === '353L_Hi3D_Master_Mesh')
    expect(root.extras?.character_version).toBe(5)
    expect(body.extras?.anatomy_profile).toContain('front hooves')
  })

  it('ships two streamed, skinned and compressed LODs', () => {
    const mainBytes = statSync(assetUrl).size
    const sizes = lodUrls.map((url) => statSync(url).size)
    expect(sizes[0]).toBeLessThan(mainBytes)
    expect(sizes[1]).toBeLessThan(sizes[0])
    for (const url of lodUrls) {
      const gltf = readGlbJson(url)
      expect(gltf.skins).toHaveLength(1)
      expect(gltf.animations).toHaveLength(11)
      expect(gltf.extensionsUsed).toEqual(expect.arrayContaining([
        'EXT_meshopt_compression', 'KHR_texture_basisu',
      ]))
    }
  })
})
