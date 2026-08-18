import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, Html, OrbitControls, useGLTF, useProgress } from '@react-three/drei'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  DoubleSide,
  MathUtils,
  PCFShadowMap,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { INTERACTIONS } from '../game/canon.js'
import { clampMovement, placeFor } from '../game/movement.js'

const MODEL_URL = '/models/isso-v3-vertical-slice-v1.glb'
const CHARACTER_MODEL_URL = '/models/353l-master-character-v3.glb'
const UP = new Vector3(0, 1, 0)
const SHADOW_OPTIONS = { enabled: true, type: PCFShadowMap }

const targets = {
  connection: { ...INTERACTIONS.connection, point: new Vector3(-3.15, 0, -3.36), radius: 2.25 },
  door: { ...INTERACTIONS.door, point: new Vector3(4.15, 0, 0.8), radius: 2.1 },
  cart: { ...INTERACTIONS.cart, point: new Vector3(19, 0, 3.1), radius: 2.8 },
  station: { ...INTERACTIONS.station, point: new Vector3(35.5, 0, -4.5), radius: 3.4 },
  signalwerk: { ...INTERACTIONS.signalwerk, point: new Vector3(27, 0, -11), radius: 3.4 },
}

function closestInteraction(position, run) {
  let closest = null
  for (const target of Object.values(targets)) {
    if (target.id === 'door' && run.doorOpen) continue
    if (target.id === 'cart' && run.cartResolved) continue
    const distance = position.distanceTo(target.point)
    if (distance <= target.radius && (!closest || distance < closest.distance)) closest = { ...target, distance }
  }
  return closest
}

function LoadingModel() {
  const { active, progress, loaded, total } = useProgress()
  const percent = Math.max(2, Math.min(100, Math.round(progress || 0)))
  return (
    <Html center>
      <div className="three-loader" role="status" aria-live="polite">
        <span>353L</span>
        <small>{active ? `STRAMMBURG LÄDT · ${percent}%` : 'ECHTES 3D IST BEREIT'}</small>
        <i aria-hidden="true"><b style={{ width: `${percent}%` }} /></i>
        <em>{total > 0 ? `${loaded} / ${total} BAUSTEINE` : 'WELT WIRD VERBUNDEN'}</em>
      </div>
    </Html>
  )
}

class WorldErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('ISSO.TV 3D runtime failed', error)
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="world-error" role="alert">
          <div>
            <span>⚠</span>
            <p className="eyebrow">3D-VERBINDUNG UNTERBROCHEN</p>
            <h2>Strammburg konnte nicht vollständig geladen werden.</h2>
            <p>Dein lokaler Spielstand bleibt erhalten. Ein Neuladen verbindet Welt und 353L erneut.</p>
            <button type="button" onClick={() => window.location.reload()}>↻ NOCH EINMAL LADEN</button>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}

function Rain() {
  const ref = useRef()
  const material = useRef()
  const count = 420
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      data[i * 3] = 9 + Math.random() * 46
      data[i * 3 + 1] = Math.random() * 16
      data[i * 3 + 2] = -17 + Math.random() * 34
    }
    return data
  }, [])
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={`
          uniform float uTime;
          void main() {
            vec3 drop = position;
            drop.y = mod(position.y - uTime * 13.0, 18.0);
            vec4 view = modelViewMatrix * vec4(drop, 1.0);
            gl_Position = projectionMatrix * view;
            gl_PointSize = 2.0;
          }
        `}
        fragmentShader={`
          void main() {
            float edge = abs(gl_PointCoord.x - 0.5);
            float alpha = smoothstep(0.5, 0.05, edge) * 0.48;
            gl_FragColor = vec4(0.66, 0.83, 0.90, alpha);
          }
        `}
      />
    </points>
  )
}

function HarborWater() {
  const material = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDeep: { value: new Color('#061d2b') },
    uShallow: { value: new Color('#176276') },
    uLamp: { value: new Color('#ef9e48') },
  }), [])

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh position={[30, -0.18, 18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[52, 8, 96, 24]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        side={DoubleSide}
        transparent
        depthWrite={false}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 p = position;
            float broad = sin(p.x * 0.44 + uTime * 0.72) * 0.045;
            float cross = sin(p.y * 1.55 - uTime * 1.18 + p.x * 0.13) * 0.026;
            float detail = sin((p.x + p.y) * 2.7 + uTime * 1.55) * 0.011;
            vWave = broad + cross + detail;
            p.z += vWave;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform vec3 uLamp;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            float bands = sin(vUv.x * 86.0 + vUv.y * 23.0 - uTime * 1.25);
            float fine = sin(vUv.x * 171.0 - vUv.y * 49.0 + uTime * 0.76);
            float gleam = smoothstep(0.90, 1.0, bands * 0.72 + fine * 0.28);
            float depthMix = clamp(0.32 + vUv.y * 0.52 + vWave * 2.2, 0.0, 1.0);
            vec3 color = mix(uDeep, uShallow, depthMix);
            color += vec3(0.28, 0.42, 0.46) * gleam * 0.18;
            float lampReflection = exp(-pow((vUv.x - 0.38) * 9.0, 2.0)) * (0.5 + 0.5 * sin(vUv.y * 95.0 + uTime));
            color = mix(color, uLamp, lampReflection * 0.035);
            gl_FragColor = vec4(color, 0.94);
          }
        `}
      />
    </mesh>
  )
}

const wetPatches = [
  { position: [17, 0.026, -2], scale: [3, 1.2, 1] },
  { position: [22, 0.026, -4], scale: [4, 1.4, 1] },
  { position: [28, 0.026, 2], scale: [3.5, 1, 1] },
  { position: [33, 0.026, 7], scale: [4.2, 1.3, 1] },
]

function WetPatches() {
  const material = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDeep: { value: new Color('#07191f') },
    uSky: { value: new Color('#63909a') },
  }), [])

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <group>
      {wetPatches.map((patch, index) => (
        <mesh
          key={index}
          position={patch.position}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={patch.scale}
          renderOrder={1}
        >
          <circleGeometry args={[1, 64]} />
          <shaderMaterial
            ref={index === 0 ? material : undefined}
            uniforms={uniforms}
            transparent
            depthWrite={false}
            side={DoubleSide}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform float uTime;
              uniform vec3 uDeep;
              uniform vec3 uSky;
              varying vec2 vUv;
              void main() {
                vec2 p = (vUv - 0.5) * 2.0;
                float radius = length(p);
                float brokenEdge = 0.82 + sin(atan(p.y, p.x) * 11.0 + uTime * 0.02) * 0.035;
                float edge = 1.0 - smoothstep(brokenEdge - 0.16, brokenEdge, radius);
                float grain = sin(vUv.x * 43.0 + vUv.y * 31.0) * 0.5 + 0.5;
                float glint = smoothstep(0.88, 1.0, sin((vUv.x + vUv.y) * 51.0) * 0.5 + 0.5);
                vec3 color = mix(uDeep, uSky, 0.20 + glint * 0.08);
                gl_FragColor = vec4(color, edge * (0.19 + grain * 0.045));
              }
            `}
          />
        </mesh>
      ))}
    </group>
  )
}

function Level({ run, paused, onInteract, onPrompt, onPosition, onReady, onFootstep, voiceState }) {
  const gltf = useGLTF(MODEL_URL)
  const characterGltf = useGLTF(CHARACTER_MODEL_URL)
  const level = useMemo(() => clone(gltf.scene), [gltf.scene])
  const characterModel = useMemo(() => clone(characterGltf.scene), [characterGltf.scene])
  const character = useRef(null)
  const door = useRef(null)
  const cart = useRef(null)
  const controls = useRef(null)
  const keys = useRef(new Set())
  const prompt = useRef(null)
  const lastReport = useRef(0)
  const motion = useRef({
    moving: false,
    time: 0,
    pace: 0,
    sprint: 0,
    stridePhase: 0,
    footstepIndex: -1,
    turnLean: 0,
    baseY: 0,
    emoteUntil: 0,
    doorAngle: 0,
    cartShift: 0,
    cartBaseZ: 0,
    zone: 'room',
    cameraTransition: 0,
  })
  const vectors = useRef({
    forward: new Vector3(),
    right: new Vector3(),
    direction: new Vector3(),
    next: new Vector3(),
    target: new Vector3(),
    followDelta: new Vector3(),
    cameraGoal: new Vector3(),
  })
  const { camera, gl } = useThree()
  const rigs = useMemo(() => ({
    hips: characterModel.getObjectByName('rig_hips'),
    spine: characterModel.getObjectByName('rig_spine'),
    neck: characterModel.getObjectByName('rig_neck'),
    armL: characterModel.getObjectByName('rig_arm_l'),
    armR: characterModel.getObjectByName('rig_arm_r'),
    forearmL: characterModel.getObjectByName('rig_forearm_l'),
    forearmR: characterModel.getObjectByName('rig_forearm_r'),
    legL: characterModel.getObjectByName('rig_leg_l'),
    legR: characterModel.getObjectByName('rig_leg_r'),
    shinL: characterModel.getObjectByName('rig_shin_l'),
    shinR: characterModel.getObjectByName('rig_shin_r'),
    footL: characterModel.getObjectByName('rig_foot_l'),
    footR: characterModel.getObjectByName('rig_foot_r'),
    head: characterModel.getObjectByName('rig_head'),
    earL: characterModel.getObjectByName('rig_ear_l'),
    earR: characterModel.getObjectByName('rig_ear_r'),
    tail: characterModel.getObjectByName('rig_tail'),
    jaw: characterModel.getObjectByName('rig_jaw'),
  }), [characterModel])
  const rigRest = useMemo(() => Object.fromEntries(
    Object.entries(rigs).map(([name, rig]) => [name, rig?.rotation.clone()]),
  ), [rigs])

  useEffect(() => {
    const blockout = level.getObjectByName('CHARACTER_353L_ROOT')
    if (blockout) blockout.visible = false
    character.current = characterModel.getObjectByName('CHARACTER_353L_ROOT') || characterModel
    character.current.position.set(0, 0, 0)
    character.current.scale.setScalar(1)
    character.current.updateMatrixWorld(true)
    const initialBounds = new Box3().setFromObject(character.current)
    const initialHeight = Math.max(initialBounds.max.y - initialBounds.min.y, 0.001)
    // Canon scale: 353L is a strong adult humanoid donkey, not a 3.35-metre giant.
    character.current.scale.setScalar(2.15 / initialHeight)
    character.current.updateMatrixWorld(true)
    const groundedBounds = new Box3().setFromObject(character.current)
    motion.current.baseY = -groundedBounds.min.y
    const previewZone = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('preview') : null
    const previewHallway = previewZone === 'hall'
    const previewThreshold = previewZone === 'threshold'
    const previewAwning = previewZone === 'awning'
    const previewHarbor = previewZone === 'harbor'
    const previewKiosk = previewZone === 'kiosk'
    character.current.position.set(
      previewHallway ? 7.35 : previewThreshold ? 3.48 : previewAwning ? 13.8 : previewKiosk ? 23 : previewHarbor ? 17.1 : -1.1,
      motion.current.baseY,
      previewHallway || previewThreshold || previewAwning ? 0 : previewHarbor || previewKiosk ? 3.1 : 0.7,
    )
    if (previewHarbor || previewKiosk) character.current.rotation.y = Math.PI
    motion.current.zone = previewHallway ? 'hallway' : previewAwning ? 'awning' : previewHarbor || previewKiosk ? 'harbor' : 'room'
    door.current = level.getObjectByName('door_pivot')
    cart.current = level.getObjectByName('cart_root')
    if (cart.current) motion.current.cartBaseZ = cart.current.position.z
    const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    const detailedCaster = /(door|frame|cart|mattress|blanket|pillow|bed_|bedside|desk_|connection_|storage_|window_frame|radiator|lamp_|kiosk|awning|hall_|mailbox|facade|station_|signalwerk_|container_|crane_|bollard_)/
    level.traverse((object) => {
      if (!object.isMesh) return
      if (object.name === 'harbor_water' || object.name.startsWith('puddle_')) object.visible = false
      object.castShadow = detailedCaster.test(object.name)
      object.receiveShadow = !object.name.startsWith('char_eye')
      object.frustumCulled = true
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of materials) {
        if (material?.map) {
          material.map.anisotropy = maxAnisotropy
          material.map.colorSpace = SRGBColorSpace
          material.map.needsUpdate = true
        }
        if (material?.name === 'floor_oak_hd') {
          material.color.set('#8d7867')
          material.roughness = 0.76
          material.needsUpdate = true
        }
      }
    })
    characterModel.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      object.frustumCulled = true
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of materials) {
        if (material?.map) {
          material.map.anisotropy = maxAnisotropy
          material.map.colorSpace = SRGBColorSpace
          material.map.needsUpdate = true
        }
        if (material) {
          // Keep the authored albedo neutral. A global beige tint washed the fur,
          // jacket and boots into one flat surface under the warm apartment lights.
          material.color?.set('#ffffff')
          material.roughness = Math.max(material.roughness ?? 0.72, 0.78)
          material.needsUpdate = true
        }
      }
    })

    const root = character.current
    if (root) {
      if (previewHallway) camera.position.set(root.position.x - 4.8, 2.35, root.position.z * 0.22)
      if (previewAwning) camera.position.set(root.position.x - 4.8, 2.55, root.position.z)
      if (previewHarbor) camera.position.set(root.position.x + 3.3, 2.85, root.position.z - 7.8)
      if (previewKiosk) camera.position.set(root.position.x + 3.5, 3.2, root.position.z - 7.0)
      if (controls.current) {
        controls.current.minAzimuthAngle = previewHallway ? -Math.PI * 0.78 : previewHarbor || previewKiosk ? -Math.PI : -Math.PI * 0.46
        controls.current.maxAzimuthAngle = previewHallway ? -Math.PI * 0.22 : previewHarbor || previewKiosk ? Math.PI : Math.PI * 0.46
      }
      controls.current?.target.copy(root.position).add(new Vector3(0, 1.08, 0))
      controls.current?.update()
    }
    onReady()
  }, [level, characterModel, gl])

  useEffect(() => {
    const down = (event) => {
      if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement?.tagName)) return
      const key = event.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(key)) {
        keys.current.add(key)
        event.preventDefault()
      }
      if ((key === 'e' || key === 'enter') && prompt.current && !paused) {
        onInteract(prompt.current.id)
        event.preventDefault()
      }
      if (key === 'q' && prompt.current && !paused) {
        onInteract(`${prompt.current.id}:silence`)
        event.preventDefault()
      }
      if (key === ' ' && !paused) {
        motion.current.emoteUntil = performance.now() + 900
        event.preventDefault()
      }
      if (key === 'r' && !event.repeat) onInteract('memory')
      if (key === 'f' && !event.repeat) onInteract('film')
    }
    const up = (event) => keys.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [onInteract, paused])

  useFrame((state, delta) => {
    const root = character.current
    if (!root) return
    const dt = Math.min(delta, 0.033)
    motion.current.time += dt
    const { forward, right, direction, next, target, followDelta, cameraGoal } = vectors.current
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    right.crossVectors(forward, UP).normalize()
    direction.set(0, 0, 0)
    const activeKeys = keys.current
    if (activeKeys.has('w') || activeKeys.has('arrowup')) direction.add(forward)
    if (activeKeys.has('s') || activeKeys.has('arrowdown')) direction.sub(forward)
    if (activeKeys.has('d') || activeKeys.has('arrowright')) direction.add(right)
    if (activeKeys.has('a') || activeKeys.has('arrowleft')) direction.sub(right)
    const moving = !paused && direction.lengthSq() > 0.01
    const sprinting = moving && activeKeys.has('shift')

    if (moving) {
      direction.normalize()
      const desiredSpeed = sprinting ? 6.15 : 3.05
      motion.current.travelSpeed = MathUtils.lerp(
        motion.current.travelSpeed ?? 0,
        desiredSpeed,
        1 - Math.exp(-dt * 8.5),
      )
      next.copy(root.position).addScaledVector(direction, dt * motion.current.travelSpeed)
      root.position.copy(clampMovement(root.position, next, run.doorOpen))
      const desiredRotation = Math.atan2(direction.x, direction.z)
      const turnDelta = MathUtils.euclideanModulo(desiredRotation - root.rotation.y + Math.PI, Math.PI * 2) - Math.PI
      root.rotation.y += turnDelta * (1 - Math.exp(-dt * 12))
      motion.current.turnLean = MathUtils.lerp(motion.current.turnLean, MathUtils.clamp(turnDelta * 0.46, -0.22, 0.22), 1 - Math.exp(-dt * 9))
    } else {
      motion.current.travelSpeed = MathUtils.lerp(motion.current.travelSpeed ?? 0, 0, 1 - Math.exp(-dt * 13))
      motion.current.turnLean = MathUtils.lerp(motion.current.turnLean, 0, 1 - Math.exp(-dt * 7))
    }

    motion.current.sprint = MathUtils.lerp(
      motion.current.sprint,
      sprinting ? 1 : 0,
      1 - Math.exp(-dt * (sprinting ? 5.5 : 7.5)),
    )
    const targetPace = moving ? (sprinting ? 1.12 : 0.62) : 0
    motion.current.pace = MathUtils.lerp(
      motion.current.pace,
      targetPace,
      1 - Math.exp(-dt * (moving ? 9 : 11)),
    )
    motion.current.stridePhase += dt * MathUtils.lerp(3.8, 10.8, motion.current.pace)
    const footstepIndex = Math.floor(motion.current.stridePhase / Math.PI)
    if (moving && footstepIndex !== motion.current.footstepIndex) {
      motion.current.footstepIndex = footstepIndex
      onFootstep?.(motion.current.zone, sprinting ? 1 : 0.62)
    }
    const stride = Math.sin(motion.current.stridePhase)
    const strideOpposite = -stride
    const step = stride * 0.62 * motion.current.pace
    const leftKnee = Math.max(0, -stride) * 0.42 * motion.current.pace
    const rightKnee = Math.max(0, stride) * 0.42 * motion.current.pace
    const breathing = Math.sin(motion.current.time * 1.55) * 0.012
    const bodyBob = moving
      ? (Math.abs(Math.sin(motion.current.stridePhase * 2)) - 0.5) * (0.025 + motion.current.pace * 0.025)
      : breathing * 0.35
    root.position.y = motion.current.baseY + bodyBob
    if (camera.isPerspectiveCamera) {
      camera.fov = MathUtils.lerp(camera.fov, 48 + motion.current.sprint * 4.5, 1 - Math.exp(-dt * 5.5))
      camera.updateProjectionMatrix()
    }
    const emote = performance.now() < motion.current.emoteUntil
    const voice = voiceState?.current
    const voiceLevel = voice?.active && voice.speaker === '353L' ? voice.level : 0
    const mouthLevel = voice?.active ? voice.mouth : 0
    if (rigs.legL) rigs.legL.rotation.x = MathUtils.lerp(rigs.legL.rotation.x, rigRest.legL.x + step, 1 - Math.exp(-dt * 14))
    if (rigs.legR) rigs.legR.rotation.x = MathUtils.lerp(rigs.legR.rotation.x, rigRest.legR.x + strideOpposite * 0.62 * motion.current.pace, 1 - Math.exp(-dt * 14))
    if (rigs.shinL) rigs.shinL.rotation.x = MathUtils.lerp(rigs.shinL.rotation.x, rigRest.shinL.x + leftKnee, 1 - Math.exp(-dt * 15))
    if (rigs.shinR) rigs.shinR.rotation.x = MathUtils.lerp(rigs.shinR.rotation.x, rigRest.shinR.x + rightKnee, 1 - Math.exp(-dt * 15))
    if (rigs.footL) rigs.footL.rotation.x = MathUtils.lerp(rigs.footL.rotation.x, rigRest.footL.x - step * 0.22 - leftKnee * 0.28, 1 - Math.exp(-dt * 17))
    if (rigs.footR) rigs.footR.rotation.x = MathUtils.lerp(rigs.footR.rotation.x, rigRest.footR.x + step * 0.22 - rightKnee * 0.28, 1 - Math.exp(-dt * 17))
    if (rigs.armL) rigs.armL.rotation.x = MathUtils.lerp(rigs.armL.rotation.x, rigRest.armL.x - step * 0.70 - (emote ? 0.75 : 0), 1 - Math.exp(-dt * 12))
    if (rigs.armR) rigs.armR.rotation.x = MathUtils.lerp(rigs.armR.rotation.x, rigRest.armR.x + step * 0.70 + (emote ? 0.22 : 0), 1 - Math.exp(-dt * 12))
    if (rigs.forearmL) rigs.forearmL.rotation.x = MathUtils.lerp(rigs.forearmL.rotation.x, rigRest.forearmL.x - Math.max(0, step) * 0.18, 1 - Math.exp(-dt * 13))
    if (rigs.forearmR) rigs.forearmR.rotation.x = MathUtils.lerp(rigs.forearmR.rotation.x, rigRest.forearmR.x + Math.min(0, step) * 0.18, 1 - Math.exp(-dt * 13))
    if (rigs.hips) {
      rigs.hips.rotation.z = MathUtils.lerp(rigs.hips.rotation.z, rigRest.hips.z + stride * 0.035 * motion.current.pace - motion.current.turnLean * 0.32, 1 - Math.exp(-dt * 10))
      rigs.hips.rotation.y = MathUtils.lerp(rigs.hips.rotation.y, rigRest.hips.y + stride * 0.025 * motion.current.pace, 1 - Math.exp(-dt * 10))
    }
    if (rigs.spine) {
      rigs.spine.rotation.x = MathUtils.lerp(
        rigs.spine.rotation.x,
        rigRest.spine.x - motion.current.pace * 0.045 - motion.current.sprint * 0.07 + breathing,
        1 - Math.exp(-dt * 9),
      )
      rigs.spine.rotation.z = MathUtils.lerp(rigs.spine.rotation.z, rigRest.spine.z + motion.current.turnLean * 0.42 - stride * 0.018 * motion.current.pace, 1 - Math.exp(-dt * 9))
    }
    if (rigs.head) {
      rigs.head.rotation.z = rigRest.head.z + Math.sin(motion.current.time * 1.1) * 0.018 + voiceLevel * 0.025
      rigs.head.rotation.x = MathUtils.lerp(rigs.head.rotation.x, rigRest.head.x - voiceLevel * 0.035, dt * 10)
    }
    if (rigs.earL) rigs.earL.rotation.x = rigRest.earL.x + Math.sin(motion.current.time * 1.7) * 0.035 - voiceLevel * 0.08
    if (rigs.earR) rigs.earR.rotation.x = rigRest.earR.x + Math.sin(motion.current.time * 1.5 + 1.4) * 0.03 + voiceLevel * 0.055
    if (rigs.jaw) rigs.jaw.rotation.x = MathUtils.lerp(rigs.jaw.rotation.x, rigRest.jaw.x + mouthLevel * 0.24, dt * 22)
    if (rigs.tail) rigs.tail.rotation.y = rigRest.tail.y + Math.sin(motion.current.time * 1.8) * 0.12

    const zone = placeFor(root.position)
    if (zone !== motion.current.zone) {
      motion.current.zone = zone
      motion.current.cameraTransition = zone === 'hallway' || zone === 'room'
        ? 1.35
        : zone === 'harbor'
          ? 1.7
          : 0
      if (controls.current) {
        if (zone === 'hallway') {
          controls.current.minAzimuthAngle = -Math.PI * 0.78
          controls.current.maxAzimuthAngle = -Math.PI * 0.22
        } else if (zone === 'room') {
          controls.current.minAzimuthAngle = -Math.PI * 0.46
          controls.current.maxAzimuthAngle = Math.PI * 0.46
        } else {
          controls.current.minAzimuthAngle = -Math.PI
          controls.current.maxAzimuthAngle = Math.PI
        }
      }
    }

    target.copy(root.position)
    target.y += 1.08
    if (controls.current) {
      followDelta.copy(target).sub(controls.current.target).multiplyScalar(1 - Math.exp(-dt * 9))
      controls.current.target.add(followDelta)
      camera.position.add(followDelta)
      if (zone === 'hallway') {
        // Keep the lens near the corridor centre even when 353L walks along a wall.
        // The target still follows him, so the shot stays responsive without letting
        // the apartment doorway or the wainscot swallow the camera.
        camera.position.z = MathUtils.lerp(camera.position.z, root.position.z * 0.22, 1 - Math.exp(-dt * 8))
      }
      controls.current.update()
    }

    if (motion.current.cameraTransition > 0 && controls.current) {
      if (zone === 'hallway') cameraGoal.set(root.position.x - 4.8, root.position.y + 2.35, root.position.z * 0.22)
      else if (zone === 'harbor') {
        const cameraOutsideHall = camera.position.x > 11.65
        cameraGoal.set(
          root.position.x - 3.2,
          root.position.y + 2.85,
          cameraOutsideHall ? root.position.z - 2.7 : camera.position.z,
        )
      }
      else cameraGoal.set(root.position.x, root.position.y + 2.2, root.position.z + 6.2)
      camera.position.lerp(cameraGoal, 1 - Math.exp(-dt * 5.5))
      controls.current.update()
      motion.current.cameraTransition = Math.max(0, motion.current.cameraTransition - dt)
    }

    motion.current.doorAngle = MathUtils.lerp(motion.current.doorAngle, run.doorOpen ? -1.46 : 0, 1 - Math.exp(-dt * 6))
    if (door.current) door.current.rotation.y = motion.current.doorAngle
    motion.current.cartShift = MathUtils.lerp(motion.current.cartShift, run.cartResolved ? 2.0 : 0, 1 - Math.exp(-dt * 3))
    if (cart.current) cart.current.position.z = motion.current.cartBaseZ + motion.current.cartShift

    const nextPrompt = paused ? null : closestInteraction(root.position, run)
    if (prompt.current?.id !== nextPrompt?.id) {
      prompt.current = nextPrompt
      onPrompt(nextPrompt)
    }

    if (state.clock.elapsedTime - lastReport.current > 0.18) {
      onPosition({ x: root.position.x, z: root.position.z, location: placeFor(root.position) })
      lastReport.current = state.clock.elapsedTime
    }
    motion.current.moving = moving
  })

  return (
    <>
      <primitive object={level} />
      <primitive object={characterModel} />
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={3.3}
        maxDistance={10.5}
        minPolarAngle={0.76}
        maxPolarAngle={1.34}
        minAzimuthAngle={-Math.PI * 0.46}
        maxAzimuthAngle={Math.PI * 0.46}
        target={[-1.1, 1.08, 0.7]}
      />
    </>
  )
}

function WorldLighting() {
  return (
    <>
      <ambientLight color="#b7cbd2" intensity={0.38} />
      <hemisphereLight args={['#b8d4df', '#2f2117', 1.72]} />
      <directionalLight
        castShadow
        color="#ffc58b"
        intensity={1.72}
        position={[18, 24, 10]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.00018}
        shadow-normalBias={0.025}
        shadow-camera-far={75}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
      />
      <pointLight color="#ffd6ae" intensity={23} distance={11} decay={2} position={[0, 3.4, 4.2]} />
      <pointLight color="#ffc17b" intensity={14} distance={6.5} decay={2} position={[-0.2, 1.45, 2.5]} />
      <spotLight color="#ffd0a0" intensity={29} distance={13} decay={2} angle={0.72} penumbra={0.82} position={[-2.1, 3.6, -0.2]} />
      <pointLight color="#ff9c45" intensity={19} distance={9} decay={2} position={[2.2, 3.3, -3.5]} />
      <pointLight color="#bfd3d8" intensity={5} distance={4.8} decay={2} position={[5.35, 2.25, 0.35]} />
      <pointLight color="#ffd09a" intensity={13} distance={5.5} decay={2} position={[7.65, 2.12, -1.30]} />
      <pointLight color="#ffbb72" intensity={13} distance={5.5} decay={2} position={[10.35, 2.12, 1.30]} />
      <pointLight color="#ffad55" intensity={8.5} distance={8} decay={2} position={[12, 2.75, 0]} />
      <pointLight color="#ffd19a" intensity={11} distance={9} decay={2} position={[17.5, 3.8, 0]} />
      <pointLight color="#8fc6d4" intensity={12} distance={9} decay={2} position={[19.5, 3.6, 7]} />
      <pointLight color="#ff923c" intensity={30} distance={14} decay={2} position={[23, 3.0, 5]} />
      <pointLight color="#5e9daf" intensity={17} distance={20} decay={2} position={[31, 5.5, 12]} />
      <pointLight color="#ffc882" intensity={7} distance={13} decay={2} position={[16.5, 3.4, 17.5]} />
      <pointLight color="#5cb9da" intensity={14} distance={16} decay={2} position={[0, 2.5, -3.5]} />
    </>
  )
}

function WorldScene(props) {
  const [lost, setLost] = useState(false)
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('force3dError')) {
    throw new Error('Intentional local 3D fallback check')
  }
  return (
    <section className="realtime-world" aria-label="Echte frei begehbare 3D-Welt von Strammburg">
      <Canvas
        shadows={SHADOW_OPTIONS}
        frameloop={props.paused && !props.voiceActive ? 'demand' : 'always'}
        dpr={[0.9, 1.35]}
        camera={{ fov: 48, near: 0.08, far: 110, position: [0, 2.45, 7.2] }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.08
          gl.outputColorSpace = SRGBColorSpace
          gl.shadowMap.type = PCFShadowMap
          gl.setClearColor(new Color('#071117'))
          gl.domElement.addEventListener('webglcontextlost', () => setLost(true), { once: true })
        }}
      >
        <fog attach="fog" args={['#12232b', 16, 78]} />
        <WorldLighting />
        <Rain />
        <HarborWater />
        <WetPatches />
        <Suspense fallback={<LoadingModel />}>
          <Level {...props} />
        </Suspense>
        <AdaptiveDpr />
      </Canvas>
      {lost && <div className="webgl-warning">Die 3D-Verbindung wurde unterbrochen. Bitte einmal neu laden.</div>}
    </section>
  )
}

export default function RealtimeWorld(props) {
  return (
    <WorldErrorBoundary>
      <WorldScene {...props} />
    </WorldErrorBoundary>
  )
}

useGLTF.preload(MODEL_URL)
useGLTF.preload(CHARACTER_MODEL_URL)
