import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei/core/AdaptiveDpr.js'
import { Html } from '@react-three/drei/web/Html.js'
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js'
import { useGLTF } from '@react-three/drei/core/Gltf.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import {
  ACESFilmicToneMapping,
  AnimationMixer,
  Box3,
  Color,
  DoubleSide,
  LoopOnce,
  LoopRepeat,
  MathUtils,
  PCFShadowMap,
  Raycaster,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { INTERACTIONS, PLACES, WORLD_START } from '../game/canon.js'
import { readGamepad } from '../game/gamepad.js'
import { collectNavigationGeometry, groundMovement, placeFor, resolveMovement } from '../game/movement.js'

const MODEL_URL = '/models/isso-v3-vertical-slice-v1.glb'
const CHARACTER_MODEL_URL = '/models/353l-hi3d-character-v5.glb'
const UP = new Vector3(0, 1, 0)
const SHADOW_OPTIONS = { enabled: true, type: PCFShadowMap }

const targets = Object.fromEntries(Object.values(INTERACTIONS).map((target) => [
  target.id,
  { ...target, point: new Vector3(target.x, 0, target.z) },
]))

const PREVIEW_SPAWN = Object.freeze({
  connection: { x: INTERACTIONS.connection.x, z: INTERACTIONS.connection.z },
  threshold: { x: INTERACTIONS.door.x - 0.67, z: INTERACTIONS.door.z },
  hall: { x: PLACES.hallway.x, z: PLACES.hallway.z },
  awning: { x: PLACES.awning.x, z: PLACES.awning.z },
  harbor: { x: INTERACTIONS.cart.x - 1.9, z: INTERACTIONS.cart.z },
  kiosk: { x: PLACES.harbor.x + 4, z: PLACES.harbor.z },
  station: { x: INTERACTIONS.station.x - 1, z: INTERACTIONS.station.z },
  signalwerk: { x: INTERACTIONS.signalwerk.x - 1, z: INTERACTIONS.signalwerk.z },
})

function closestInteraction(position, run) {
  let closest = null
  for (const target of Object.values(targets)) {
    if (target.id === 'connection' && run.connectionTone) continue
    if (target.id === 'door' && run.doorOpen) continue
    if (target.id === 'cart' && run.cartResolved) continue
    if (target.id === 'station' && run.visited.includes('station')) continue
    if (target.id === 'signalwerk' && run.visited.includes('signalwerk')) continue
    const distance = position.distanceTo(target.point)
    if (distance <= target.radius && (!closest || distance < closest.distance)) closest = { ...target, distance }
  }
  return closest
}

function LoadingModel() {
  return (
    <Html center>
      <div className="three-loader" role="status" aria-live="polite">
        <span>353L</span>
        <small>STRAMMBURG LÄDT</small>
        <i aria-hidden="true"><b /></i>
        <em>WELT WIRD VERBUNDEN</em>
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

const HARBOR_MARKS = [-2.25, -1.35, -0.45, 0.45, 1.35, 2.25]
const STATION_TILES = [-2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1]

function SurfaceStoryDetails() {
  return (
    <group name="runtime_surface_story">
      {/* Worn corridor runner: readable, cheap and old instead of renovated. */}
      <mesh position={[PLACES.hallway.x + 0.25, 0.018, PLACES.hallway.z]} receiveShadow>
        <boxGeometry args={[5.5, 0.022, 1.12]} />
        <meshStandardMaterial color="#32464a" emissive="#0b1517" emissiveIntensity={0.2} roughness={0.96} />
      </mesh>
      {[[-1.7, -0.18], [0, 0.16], [1.7, -0.1]].map(([offset, z]) => (
        <mesh key={`runner-wear-${offset}`} position={[PLACES.hallway.x + 0.25 + offset, 0.032, PLACES.hallway.z + z]} rotation={[0, offset * 0.025, 0]}>
          <boxGeometry args={[0.42, 0.008, 0.035]} />
          <meshStandardMaterial color="#1c2a2c" emissive="#071012" emissiveIntensity={0.1} roughness={1} />
        </mesh>
      ))}

      {/* Wet, inexpensive threshold: rubber mat and irregular water marks. */}
      <mesh position={[PLACES.awning.x - 1.7, 0.03, PLACES.awning.z]} receiveShadow>
        <boxGeometry args={[1.32, 0.035, 1.08]} />
        <meshStandardMaterial color="#172023" roughness={0.93} />
      </mesh>
      {[
        [PLACES.awning.x + 0.7, 0.038, PLACES.awning.z + 0.72, 0.82, 0.38],
        [PLACES.awning.x + 2.0, 0.038, PLACES.awning.z - 0.66, 0.58, 0.28],
      ].map(([x, y, z, sx, sz], index) => (
        <mesh key={`awning-wet-${index}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, index * 0.7]} scale={[sx, sz, 1]} renderOrder={2}>
          <circleGeometry args={[1, 36]} />
          <meshStandardMaterial color="#182b31" emissive="#10262d" emissiveIntensity={0.18} metalness={0.16} roughness={0.28} transparent opacity={0.66} depthWrite={false} />
        </mesh>
      ))}

      {/* Loading bay ties cart, worker and wet asphalt into one foreground shot. */}
      <mesh position={[INTERACTIONS.cart.x, 0.016, INTERACTIONS.cart.z]} receiveShadow>
        <boxGeometry args={[6.2, 0.024, 4.5]} />
        <meshStandardMaterial color="#26373c" emissive="#0c171b" emissiveIntensity={0.16} roughness={0.76} metalness={0.04} />
      </mesh>
      {HARBOR_MARKS.map((offset, index) => (
        <mesh key={`harbor-mark-${offset}`} position={[INTERACTIONS.cart.x + offset, 0.04, INTERACTIONS.cart.z - 2.02]} rotation={[0, index % 2 ? 0.018 : -0.018, 0]}>
          <boxGeometry args={[0.56, 0.018, 0.11]} />
          <meshStandardMaterial color="#c86c32" emissive="#3a1809" emissiveIntensity={0.22} roughness={0.86} />
        </mesh>
      ))}
      <group position={[INTERACTIONS.cart.x + 2.45, 0.045, INTERACTIONS.cart.z + 1.42]}>
        {[-0.24, -0.08, 0.08, 0.24].map((z) => (
          <mesh key={`drain-${z}`} position={[0, 0, z]}>
            <boxGeometry args={[0.84, 0.028, 0.055]} />
            <meshStandardMaterial color="#10171a" metalness={0.58} roughness={0.46} />
          </mesh>
        ))}
      </group>

      {/* Station and HQ1 use the same wet-industrial visual grammar. */}
      {STATION_TILES.map((offset) => (
        <mesh key={`station-tile-${offset}`} position={[PLACES.station.x + offset, 0.035, PLACES.station.z + 1.18]}>
          <boxGeometry args={[0.46, 0.018, 0.24]} />
          <meshStandardMaterial color="#b98a43" emissive="#2b1b09" emissiveIntensity={0.2} roughness={0.82} />
        </mesh>
      ))}
      <mesh position={[PLACES.signalwerk.x, 0.035, PLACES.signalwerk.z + 1.15]}>
        <boxGeometry args={[2.2, 0.024, 0.82]} />
        <meshStandardMaterial color="#21383d" emissive="#0d2328" emissiveIntensity={0.22} roughness={0.78} />
      </mesh>
      <mesh position={[PLACES.signalwerk.x, 0.055, PLACES.signalwerk.z + 0.78]}>
        <boxGeometry args={[1.64, 0.025, 0.07]} />
        <meshStandardMaterial color="#c66d32" emissive="#3b1809" emissiveIntensity={0.25} roughness={0.82} />
      </mesh>
    </group>
  )
}

function DockWorker({ source, lodSources = [], resolved }) {
  const [lodIndex, setLodIndex] = useState(0)
  const selectedSource = lodSources[lodIndex] ?? source
  const model = useMemo(() => clone(selectedSource), [selectedSource])
  const group = useRef(null)
  const head = useMemo(() => model.getObjectByName('rig_head'), [model])
  const armL = useMemo(() => model.getObjectByName('rig_arm_l'), [model])
  const armR = useMemo(() => model.getObjectByName('rig_arm_r'), [model])
  const forearmL = useMemo(() => model.getObjectByName('rig_forearm_l'), [model])
  const forearmR = useMemo(() => model.getObjectByName('rig_forearm_r'), [model])
  const earL = useMemo(() => model.getObjectByName('rig_ear_l'), [model])
  const earR = useMemo(() => model.getObjectByName('rig_ear_r'), [model])
  const tail = useMemo(() => model.getObjectByName('rig_tail'), [model])
  const rest = useMemo(() => ({
    head: head?.rotation.clone(),
    armL: armL?.rotation.clone(),
    armR: armR?.rotation.clone(),
    forearmL: forearmL?.rotation.clone(),
    forearmR: forearmR?.rotation.clone(),
    earL: earL?.rotation.clone(),
    earR: earR?.rotation.clone(),
    tail: tail?.rotation.clone(),
  }), [armL, armR, earL, earR, forearmL, forearmR, head, tail])

  useEffect(() => {
    const root = model.getObjectByName('CHARACTER_353L_ROOT') || model
    root.position.set(0, 0, 0)
    root.scale.setScalar(1)
    root.updateMatrixWorld(true)
    const bounds = new Box3().setFromObject(root)
    const height = Math.max(bounds.max.y - bounds.min.y, 0.001)
    root.scale.setScalar(1.94 / height)
    root.updateMatrixWorld(true)
    const grounded = new Box3().setFromObject(root)
    root.position.y = -grounded.min.y
    model.traverse((object) => {
      if (!object.isMesh) return
      const originals = Array.isArray(object.material) ? object.material : [object.material]
      const copies = originals.map((original) => {
        const copy = original.clone()
        copy.color?.multiply(new Color('#bac8c4'))
        copy.roughness = Math.max(copy.roughness ?? 0.72, 0.82)
        return copy
      })
      object.material = Array.isArray(object.material) ? copies : copies[0]
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [model])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033)
    const distance = state.camera.position.distanceTo(group.current?.position ?? new Vector3(19.45, 0, 4.55))
    const nextLod = distance > 28 && lodSources[2] ? 2 : distance > 14 && lodSources[1] ? 1 : 0
    if (nextLod !== lodIndex) setLodIndex(nextLod)
    if (group.current) group.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.006
    if (head && rest.head) {
      const nod = resolved ? Math.sin(state.clock.elapsedTime * 2.1) * 0.055 : Math.sin(state.clock.elapsedTime * 0.75) * 0.018
      head.rotation.x = MathUtils.lerp(head.rotation.x, rest.head.x + nod, 1 - Math.exp(-dt * 5))
    }
    const effort = resolved ? 0 : 1
    if (armL && rest.armL) {
      armL.rotation.x = MathUtils.lerp(armL.rotation.x, rest.armL.x - effort * 0.62, 1 - Math.exp(-dt * 4.5))
      armL.rotation.z = MathUtils.lerp(armL.rotation.z, rest.armL.z - effort * 0.10, 1 - Math.exp(-dt * 4.5))
    }
    if (armR && rest.armR) {
      armR.rotation.x = MathUtils.lerp(armR.rotation.x, rest.armR.x - effort * 0.62, 1 - Math.exp(-dt * 4.5))
      armR.rotation.z = MathUtils.lerp(armR.rotation.z, rest.armR.z + effort * 0.10, 1 - Math.exp(-dt * 4.5))
    }
    if (forearmL && rest.forearmL) forearmL.rotation.x = MathUtils.lerp(forearmL.rotation.x, rest.forearmL.x - effort * 0.38, 1 - Math.exp(-dt * 5))
    if (forearmR && rest.forearmR) forearmR.rotation.x = MathUtils.lerp(forearmR.rotation.x, rest.forearmR.x - effort * 0.38, 1 - Math.exp(-dt * 5))
    if (earL && rest.earL) earL.rotation.x = rest.earL.x + Math.sin(state.clock.elapsedTime * 1.6) * 0.025
    if (earR && rest.earR) earR.rotation.x = rest.earR.x + Math.sin(state.clock.elapsedTime * 1.35 + 1.2) * 0.022
    if (tail && rest.tail) tail.rotation.y = rest.tail.y + Math.sin(state.clock.elapsedTime * 1.15) * 0.08
  })

  return (
    <group ref={group} position={[19.45, 0, 4.55]} rotation={[0, -0.42, 0]}>
      <primitive object={model} />
      <mesh castShadow position={[0, 1.23, 0]}>
        <cylinderGeometry args={[0.225, 0.305, 0.54, 12, 1, true]} />
        <meshStandardMaterial color="#d66a18" roughness={0.76} metalness={0.08} side={DoubleSide} />
      </mesh>
      <mesh castShadow position={[0, 1.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.276, 0.018, 8, 28]} />
        <meshStandardMaterial color="#dbe7df" roughness={0.42} metalness={0.35} />
      </mesh>
      <mesh castShadow position={[0, 2.075, 0.015]} scale={[1, 0.52, 1]}>
        <sphereGeometry args={[0.245, 24, 14]} />
        <meshStandardMaterial color="#e17a1d" roughness={0.60} metalness={0.10} emissive="#2a0b00" emissiveIntensity={0.12} />
      </mesh>
      <mesh castShadow position={[0, 2.015, 0.025]}>
        <cylinderGeometry args={[0.275, 0.275, 0.04, 24]} />
        <meshStandardMaterial color="#b95412" roughness={0.68} metalness={0.12} />
      </mesh>
    </group>
  )
}

function Level({ run, paused, wakeSequence, cinematicMode = false, reducedMotion = false, initialPosition, inputState, interactionPulse, onWakeComplete, onInteract, onPrompt, onPosition, onReady, onFootstep, cameraSensitivity = 0.75, voiceState, ktx2Loader }) {
  const { camera, gl } = useThree()
  const inputProbe = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('inputProbe') : null
  const configureTextures = useCallback((loader) => {
    loader.setKTX2Loader(ktx2Loader)
  }, [ktx2Loader])
  const gltf = useGLTF(MODEL_URL, '/draco/', true, configureTextures)
  const characterGltf = useGLTF(CHARACTER_MODEL_URL, '/draco/', true, configureTextures)
  const level = useMemo(() => clone(gltf.scene), [gltf.scene])
  const characterModel = useMemo(() => clone(characterGltf.scene), [characterGltf.scene])
  const character = useRef(null)
  const door = useRef(null)
  const cart = useRef(null)
  const controls = useRef(null)
  const animationMixer = useRef(null)
  const activeAnimation = useRef(null)
  const navigation = useRef({ blockers: [], walkable: [] })
  const groundRaycaster = useRef(new Raycaster())
  const cameraRaycaster = useRef(new Raycaster())
  const [dockLods, setDockLods] = useState([])
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
    wakeStarted: 0,
    wakeFinished: false,
    locomotion: 'Idle',
    gamepadButtons: [],
    idleSeconds: 0,
    cameraObstruction: null,
    turnUntil: 0,
    interactionUntil: 0,
  })
  const vectors = useRef({
    forward: new Vector3(),
    right: new Vector3(),
    direction: new Vector3(),
    next: new Vector3(),
    target: new Vector3(),
    followDelta: new Vector3(),
    cameraGoal: new Vector3(),
    cameraRay: new Vector3(),
    cameraSafe: new Vector3(),
    idleFocus: new Vector3(),
    idleCameraGoal: new Vector3(),
  })
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
    muzzleWide: characterModel.getObjectByName('rig_muzzle_wide'),
    muzzleRound: characterModel.getObjectByName('rig_muzzle_round'),
    nostrils: characterModel.getObjectByName('rig_nostrils'),
    eyelidL: characterModel.getObjectByName('rig_eyelid_l'),
    eyelidR: characterModel.getObjectByName('rig_eyelid_r'),
  }), [characterModel])
  const rigRest = useMemo(() => Object.fromEntries(
    Object.entries(rigs).map(([name, rig]) => [name, rig?.rotation.clone()]),
  ), [rigs])
  const authoredClips = useMemo(
    () => new Map(characterGltf.animations.map((clip) => [clip.name, clip])),
    [characterGltf.animations],
  )

  function playAuthoredClip(name, loop = true) {
    const mixer = animationMixer.current
    const clip = authoredClips.get(name)
    if (!mixer || !clip || activeAnimation.current?.name === name) return
    const nextAction = mixer.clipAction(clip)
    nextAction.reset().setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1)
    nextAction.clampWhenFinished = !loop
    nextAction.fadeIn(0.16).play()
    activeAnimation.current?.action?.fadeOut(0.16)
    activeAnimation.current = { name, action: nextAction }
  }

  useEffect(() => {
    if (!interactionPulse) return
    const clip = {
      connection: '353L_Laptop',
      door: '353L_Door',
      cart: '353L_Carry',
    }[interactionPulse.id]
    if (clip) {
      motion.current.interactionUntil = performance.now() + 1250
      playAuthoredClip(clip, false)
    }
  }, [interactionPulse?.serial])

  useEffect(() => {
    const blockout = level.getObjectByName('CHARACTER_353L_ROOT')
    if (blockout) blockout.visible = false
    const modelRoot = characterModel.getObjectByName('CHARACTER_353L_ROOT') || characterModel
    modelRoot.position.set(0, 0, 0)
    modelRoot.scale.setScalar(1)
    modelRoot.updateMatrixWorld(true)
    const initialBounds = new Box3().setFromObject(modelRoot)
    const initialHeight = Math.max(initialBounds.max.y - initialBounds.min.y, 0.001)
    // Canon scale: 353L is a strong adult humanoid donkey, not a 3.35-metre giant.
    modelRoot.scale.setScalar(2.15 / initialHeight)
    modelRoot.updateMatrixWorld(true)
    const groundedBounds = new Box3().setFromObject(modelRoot)
    modelRoot.position.y = -groundedBounds.min.y
    motion.current.baseY = 0
    const previewZone = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('preview') : null
    const previewHallway = previewZone === 'hall'
    const previewThreshold = previewZone === 'threshold'
    const previewAwning = previewZone === 'awning'
    const previewHarbor = previewZone === 'harbor'
    const previewKiosk = previewZone === 'kiosk'
    const previewConnection = previewZone === 'connection'
    const previewStation = previewZone === 'station'
    const previewSignalwerk = previewZone === 'signalwerk'
    const startsFree = run.phase === 'free' || previewZone
    const saved = initialPosition ?? WORLD_START
    const previewSpawn = PREVIEW_SPAWN[previewZone] ?? saved
    character.current.position.set(previewSpawn.x, motion.current.baseY, previewSpawn.z)
    if (!startsFree) {
      character.current.position.set(-3.1, 0.42, 1.55)
      character.current.rotation.set(0, 0, -1.46)
    }
    if (previewHarbor || previewKiosk) character.current.rotation.y = Math.PI
    motion.current.zone = placeFor(character.current.position)
    door.current = level.getObjectByName('door_pivot')
    cart.current = level.getObjectByName('cart_root')
    if (cart.current) motion.current.cartBaseZ = cart.current.position.z
    navigation.current = collectNavigationGeometry(level)
    animationMixer.current = new AnimationMixer(modelRoot)
    const maxAnisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    // Only the playable foreground pays for real-time shadow casting. Distant
    // skyline, cranes, containers and ship silhouettes receive light/fog but
    // no longer multiply the directional shadow pass.
    const detailedCaster = /(door|frame|cart|mattress|blanket|pillow|bed_|bedside|desk_|connection_|storage_|window_frame|radiator|lamp_|kiosk|awning|hall_|mailbox|facade)/
    level.traverse((object) => {
      if (!object.isMesh) return
      if (object.name === 'harbor_water' || object.name.startsWith('puddle_')) object.visible = false
      object.castShadow = detailedCaster.test(object.name)
      object.receiveShadow = !object.name.startsWith('char_eye')
      object.frustumCulled = true
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of materials) {
        // Waende beidseitig rendern. Im GLB zeigen die Wandflaechen nur nach
        // innen; ohne die naechste Zeile verschwinden sie, sobald die Kamera
        // hinter eine Wand rutscht - dann sieht man durch die Wand ins Zimmer.
        if (material && material.transparent !== true) material.side = DoubleSide
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
        if (material?.name === 'room_plaster_worn_hd_v2') {
          material.emissive?.set('#3a4649')
          material.emissiveIntensity = 0.22
          material.needsUpdate = true
        }
        if (material?.name === 'room_floor_worn_hd_v2') {
          material.emissive?.set('#242b2d')
          material.emissiveIntensity = 0.11
          material.needsUpdate = true
        }
        if (material?.name === 'hall_terrazzo_hd') {
          material.color.set('#aaa69c')
          material.emissive?.set('#3d3c39')
          material.emissiveIntensity = 0.28
          material.roughness = 0.84
          material.needsUpdate = true
        }
        if (material?.name === 'awning_paver') {
          material.color.set('#4b5353')
          material.emissive?.set('#283235')
          material.emissiveIntensity = 0.2
          material.roughness = 0.68
          material.needsUpdate = true
        }
        if (material?.name === 'harbor_asphalt_hd') {
          material.color.set('#a8afb0')
          material.emissive?.set('#263337')
          material.emissiveIntensity = 0.27
          material.roughness = 0.64
          material.metalness = 0.03
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
      if (previewHallway) camera.position.set(root.position.x - 2.4, 2.35, root.position.z + 0.78)
      if (previewAwning) camera.position.set(root.position.x - 4.8, 2.55, root.position.z)
      if (previewHarbor) camera.position.set(root.position.x + 3.3, 2.85, root.position.z - 7.8)
      if (previewKiosk) camera.position.set(root.position.x + 3.5, 3.2, root.position.z - 7.0)
      if (previewStation || previewSignalwerk) camera.position.set(root.position.x - 4.5, 2.85, root.position.z + 4.6)
      controls.current?.target.copy(root.position).add(new Vector3(0, 1.08, 0))
      controls.current?.update()
    }
    onReady()
    return () => animationMixer.current?.stopAllAction()
  }, [level, characterModel, gl, run.phase])

  useEffect(() => {
    let cancelled = false
    const idle = window.requestIdleCallback ?? ((callback) => window.setTimeout(callback, 450))
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
    const handle = idle(async () => {
      const loader = new GLTFLoader()
      loader.setMeshoptDecoder(MeshoptDecoder)
      loader.setKTX2Loader(ktx2Loader)
      try {
        const results = await Promise.all([
          Promise.resolve({ scene: characterGltf.scene }),
          loader.loadAsync('/models/353l-hi3d-character-v5-lod1.glb'),
          loader.loadAsync('/models/353l-hi3d-character-v5-lod2.glb'),
        ])
        if (!cancelled) setDockLods(results.map((entry) => entry.scene))
      } catch {
        if (!cancelled) setDockLods([])
      }
    })
    return () => { cancelled = true; cancelIdle(handle) }
  }, [characterGltf.scene, ktx2Loader])

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
    if (import.meta.env.DEV) {
      const debug = {
        paused,
        wakeSequence,
        wakeStarted: motion.current.wakeStarted,
        wakeFinished: motion.current.wakeFinished,
        character: root.position.toArray().map((value) => Number(value.toFixed(2))),
        camera: camera.position.toArray().map((value) => Number(value.toFixed(2))),
        target: controls.current?.target.toArray().map((value) => Number(value.toFixed(2))),
        zone: motion.current.zone,
        cameraObstruction: motion.current.cameraObstruction,
        animation: activeAnimation.current?.name ?? null,
        inputSource: motion.current.inputSource ?? 'idle',
      }
      window.__ISSO_DEBUG__ = debug
      const panel = document.querySelector('.realtime-world')
      if (panel) panel.dataset.debug = JSON.stringify(debug)
    }
    const dt = Math.min(delta, 0.033)
    motion.current.time += dt
    animationMixer.current?.update(dt)
    const { forward, right, direction, next, target, followDelta, cameraGoal, cameraRay, cameraSafe, idleFocus, idleCameraGoal } = vectors.current

    if (wakeSequence && !motion.current.wakeFinished) {
      if (!motion.current.wakeStarted) {
        motion.current.wakeStarted = state.clock.elapsedTime
        playAuthoredClip('353L_StandUp', false)
      }
      const elapsed = state.clock.elapsedTime - motion.current.wakeStarted
      const rise = MathUtils.smoothstep(elapsed, 0.65, 3.8)
      const sit = MathUtils.smoothstep(elapsed, 0.72, 2.25)
      root.position.x = MathUtils.lerp(-3.1, -1.1, rise)
      root.position.y = MathUtils.lerp(0.42, motion.current.baseY, rise)
      root.position.z = MathUtils.lerp(1.55, 0.7, rise)
      root.rotation.x = 0
      root.rotation.y = 0
      root.rotation.z = MathUtils.lerp(-1.46, 0, Math.max(sit * 0.72, rise))
      if (rigs.head) rigs.head.rotation.x = rigRest.head.x + Math.sin(elapsed * 2.2) * 0.035 * (1 - rise)
      if (rigs.earL) rigs.earL.rotation.x = rigRest.earL.x - 0.18 * MathUtils.smoothstep(elapsed, 0.15, 0.85)
      if (rigs.earR) rigs.earR.rotation.x = rigRest.earR.x + 0.12 * MathUtils.smoothstep(elapsed, 0.28, 1.05)
      const blink = elapsed < 0.48 ? 0.24 : elapsed < 0.72 ? 0.24 * (1 - MathUtils.smoothstep(elapsed, 0.48, 0.72)) : 0
      if (rigs.eyelidL) rigs.eyelidL.rotation.x = rigRest.eyelidL.x + blink
      if (rigs.eyelidR) rigs.eyelidR.rotation.x = rigRest.eyelidR.x + blink
      target.copy(root.position).add(new Vector3(0, MathUtils.lerp(0.62, 1.08, rise), 0))
      cameraGoal.set(
        MathUtils.lerp(-1.15, root.position.x, rise),
        MathUtils.lerp(1.18, 2.18, rise),
        MathUtils.lerp(4.15, 4.25, rise),
      )
      camera.position.lerp(cameraGoal, 1 - Math.exp(-dt * 3.6))
      controls.current?.target.lerp(target, 1 - Math.exp(-dt * 4.2))
      controls.current?.update()
      if (elapsed >= 4.15) {
        motion.current.wakeFinished = true
        onWakeComplete?.()
      }
      return
    }
    if (cinematicMode) {
      const orbit = reducedMotion ? 0.18 : Math.sin(state.clock.elapsedTime * 0.16) * 0.48
      const cinematicZone = placeFor(root.position)
      target.copy(root.position).add(new Vector3(0, run.phase === 'mattress' ? 0.66 : 1.08, 0))
      if (cinematicZone === 'harbor') cameraGoal.set(root.position.x - 4.6 + orbit, root.position.y + 2.35, root.position.z - 4.2)
      else if (cinematicZone === 'hallway') cameraGoal.set(root.position.x - 3.8, root.position.y + 2.05, root.position.z + orbit)
      else if (cinematicZone === 'room') cameraGoal.set(root.position.x + 2.6 + orbit, root.position.y + 1.45, Math.min(4.18, root.position.z + 2.4))
      else cameraGoal.set(root.position.x - 1.4 + orbit, root.position.y + 1.55, root.position.z + 4.35)
      camera.position.lerp(cameraGoal, 1 - Math.exp(-dt * (reducedMotion ? 14 : 1.8)))
      controls.current?.target.lerp(target, 1 - Math.exp(-dt * 3.2))
      controls.current?.update()
      return
    }
    camera.getWorldDirection(forward)
    forward.y = 0
    if (forward.lengthSq() > 0.0001) forward.normalize()
    // SCHRITT 5: Eingabe-Basis stabilisieren. Bewegung ist kamera-relativ; beim
    // Zonen-Schwenk dreht sich die Kamera und "vorwaerts" wuerde mitten im Lauf
    // kippen - 353L dreht sich um. Waehrend eines Schwenks frieren wir die
    // Richtung darum ein; sonst fuehren wir sie sanft nach (kein harter Sprung).
    if (!motion.current.moveForward) motion.current.moveForward = forward.clone()
    const moveForward = motion.current.moveForward
    if (motion.current.cameraTransition > 0) {
      forward.copy(moveForward)
    } else {
      moveForward.lerp(forward, 1 - Math.exp(-dt * 6))
      moveForward.y = 0
      if (moveForward.lengthSq() > 0.0001) moveForward.normalize()
      forward.copy(moveForward)
    }
    right.crossVectors(forward, UP).normalize()
    direction.set(0, 0, 0)
    const activeKeys = keys.current
    const hardwareGamepad = navigator.getGamepads?.().find(Boolean)
    const probeGamepad = inputProbe?.startsWith('controller-')
      ? {
          axes: inputProbe === 'controller-right' ? [0.82, 0] : [0, -0.86],
          buttons: Array.from({ length: 4 }, () => ({ pressed: false })),
        }
      : null
    const gamepad = hardwareGamepad ?? probeGamepad
    const pad = readGamepad(gamepad)
    const liveTouch = inputState?.current ?? { x: 0, y: 0, sprint: false }
    const touch = inputProbe === 'touch-right'
      ? { x: 0.82, y: 0, sprint: false }
      : inputProbe === 'touch-forward'
        ? { x: 0, y: 0.86, sprint: false }
        : liveTouch
    motion.current.inputSource = hardwareGamepad
      ? 'controller'
      : probeGamepad
        ? 'controller-probe'
        : Math.abs(touch.x) + Math.abs(touch.y) > 0 || touch.sprint
          ? inputProbe?.startsWith('touch-') ? 'touch-probe' : 'touch'
          : activeKeys.size > 0 ? 'keyboard' : 'idle'
    if (activeKeys.has('w') || activeKeys.has('arrowup')) direction.add(forward)
    if (activeKeys.has('s') || activeKeys.has('arrowdown')) direction.sub(forward)
    if (activeKeys.has('d') || activeKeys.has('arrowright')) direction.add(right)
    if (activeKeys.has('a') || activeKeys.has('arrowleft')) direction.sub(right)
    direction.addScaledVector(forward, pad.y + touch.y)
    direction.addScaledVector(right, pad.x + touch.x)
    if (gamepad) {
      const pressed = pad.buttons
      const previous = motion.current.gamepadButtons
      if (pressed[0] && !previous[0] && prompt.current && !paused) onInteract(prompt.current.id)
      if (pressed[2] && !previous[2] && prompt.current && !paused) onInteract(`${prompt.current.id}:silence`)
      if (pressed[3] && !previous[3]) onInteract('memory')
      motion.current.gamepadButtons = pressed
    }
    const moving = !paused && direction.lengthSq() > 0.01
    const sprinting = moving && (activeKeys.has('shift') || touch.sprint || pad.sprint)
    let desiredRotation = root.rotation.y
    let turnDelta = 0
    if (moving) {
      direction.normalize()
      desiredRotation = Math.atan2(direction.x, direction.z)
      turnDelta = MathUtils.euclideanModulo(desiredRotation - root.rotation.y + Math.PI, Math.PI * 2) - Math.PI
    }
    const interactionActive = performance.now() < motion.current.interactionUntil
    if (interactionActive) {
      // Modal and controller interactions keep their authored body performance.
    } else if (sprinting && !motion.current.wasSprinting) {
      playAuthoredClip('353L_AnimalRunTransition', false)
      motion.current.runTransitionUntil = state.clock.elapsedTime + 0.42
    } else if (moving && !sprinting && Math.abs(turnDelta) > 0.68 && state.clock.elapsedTime >= motion.current.turnUntil) {
      playAuthoredClip(turnDelta > 0 ? '353L_TurnLeft' : '353L_TurnRight', false)
      motion.current.turnUntil = state.clock.elapsedTime + 0.28
    } else if (state.clock.elapsedTime < motion.current.turnUntil) {
      // Let the authored hoof plant finish before blending back to the walk.
    } else if (moving && (!motion.current.runTransitionUntil || state.clock.elapsedTime >= motion.current.runTransitionUntil)) {
      playAuthoredClip(sprinting ? '353L_Run' : '353L_Walk')
    } else if (motion.current.moving) {
      playAuthoredClip('353L_Stop', false)
      motion.current.stopUntil = state.clock.elapsedTime + 0.5
    } else if (!motion.current.stopUntil || state.clock.elapsedTime >= motion.current.stopUntil) {
      playAuthoredClip('353L_Idle')
    }

    if (moving) {
      const desiredSpeed = sprinting ? 6.15 : 3.05
      motion.current.travelSpeed = MathUtils.lerp(
        motion.current.travelSpeed ?? 0,
        desiredSpeed,
        1 - Math.exp(-dt * 8.5),
      )
      next.copy(root.position).addScaledVector(direction, dt * motion.current.travelSpeed)
      root.position.copy(resolveMovement(root.position, next, navigation.current, run.doorOpen))
      groundMovement(root.position, navigation.current, groundRaycaster.current)
      root.rotation.y += turnDelta * (1 - Math.exp(-dt * 12))
      motion.current.turnLean = MathUtils.lerp(motion.current.turnLean, MathUtils.clamp(turnDelta * 0.46, -0.22, 0.22), 1 - Math.exp(-dt * 9))
    } else {
      motion.current.travelSpeed = MathUtils.lerp(motion.current.travelSpeed ?? 0, 0, 1 - Math.exp(-dt * 13))
      motion.current.turnLean = MathUtils.lerp(motion.current.turnLean, 0, 1 - Math.exp(-dt * 7))
    }
    motion.current.idleSeconds = moving || paused ? 0 : motion.current.idleSeconds + dt

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
    // The Hi3D worker body has a heavier silhouette than the old blockout.
    // Shorter joint arcs keep the jacket and boots planted while the root speed,
    // bob and cadence still communicate a brisk donkey walk/sprint.
    const step = stride * 0.24 * motion.current.pace
    const leftKnee = Math.max(0, -stride) * 0.12 * motion.current.pace
    const rightKnee = Math.max(0, stride) * 0.12 * motion.current.pace
    const breathing = Math.sin(motion.current.time * 1.55) * 0.012
    const bodyBob = moving && !reducedMotion
      ? (Math.abs(Math.sin(motion.current.stridePhase * 2)) - 0.5) * (0.025 + motion.current.pace * 0.025)
      : breathing * 0.35
    groundMovement(root.position, navigation.current, groundRaycaster.current)
    root.position.y += bodyBob
    if (camera.isPerspectiveCamera) {
      const zoneFov = motion.current.zone === 'hallway' ? 62 : motion.current.zone === 'room' ? 52 : 48
      camera.fov = MathUtils.lerp(camera.fov, zoneFov + (reducedMotion ? 0 : motion.current.sprint * 4.5), 1 - Math.exp(-dt * 5.5))
      camera.updateProjectionMatrix()
    }
    const voice = voiceState?.current
    const voiceLevel = voice?.active && voice.speaker === '353L' ? voice.level : 0
    const mouthLevel = voice?.active ? voice.mouth : 0
    const viseme = voice?.viseme ?? 'REST'
    const authoredLocomotion = authoredClips.has('353L_Walk')
    if (!authoredLocomotion) {
      if (rigs.legL) rigs.legL.rotation.x = MathUtils.lerp(rigs.legL.rotation.x, rigRest.legL.x + step, 1 - Math.exp(-dt * 14))
      if (rigs.legR) rigs.legR.rotation.x = MathUtils.lerp(rigs.legR.rotation.x, rigRest.legR.x + strideOpposite * 0.62 * motion.current.pace, 1 - Math.exp(-dt * 14))
      if (rigs.shinL) rigs.shinL.rotation.x = MathUtils.lerp(rigs.shinL.rotation.x, rigRest.shinL.x + leftKnee, 1 - Math.exp(-dt * 15))
      if (rigs.shinR) rigs.shinR.rotation.x = MathUtils.lerp(rigs.shinR.rotation.x, rigRest.shinR.x + rightKnee, 1 - Math.exp(-dt * 15))
      if (rigs.footL) rigs.footL.rotation.x = MathUtils.lerp(rigs.footL.rotation.x, rigRest.footL.x - step * 0.22 - leftKnee * 0.28, 1 - Math.exp(-dt * 17))
      if (rigs.footR) rigs.footR.rotation.x = MathUtils.lerp(rigs.footR.rotation.x, rigRest.footR.x + step * 0.22 - rightKnee * 0.28, 1 - Math.exp(-dt * 17))
      if (rigs.hips) {
        rigs.hips.rotation.z = MathUtils.lerp(rigs.hips.rotation.z, rigRest.hips.z + stride * 0.035 * motion.current.pace - motion.current.turnLean * 0.32, 1 - Math.exp(-dt * 10))
        rigs.hips.rotation.y = MathUtils.lerp(rigs.hips.rotation.y, rigRest.hips.y + stride * 0.025 * motion.current.pace, 1 - Math.exp(-dt * 10))
      }
      if (rigs.spine) {
        rigs.spine.rotation.x = MathUtils.lerp(rigs.spine.rotation.x, rigRest.spine.x - motion.current.pace * 0.045 - motion.current.sprint * 0.07 + breathing, 1 - Math.exp(-dt * 9))
        rigs.spine.rotation.z = MathUtils.lerp(rigs.spine.rotation.z, rigRest.spine.z + motion.current.turnLean * 0.42 - stride * 0.018 * motion.current.pace, 1 - Math.exp(-dt * 9))
      }
    } else {
      // Small additive corrections keep the bearing hoof flat during each stance phase.
      const leftPlant = Math.max(0, -stride)
      const rightPlant = Math.max(0, stride)
      if (rigs.footL) rigs.footL.rotation.x -= leftPlant * 0.075 * motion.current.pace
      if (rigs.footR) rigs.footR.rotation.x -= rightPlant * 0.075 * motion.current.pace
      if (rigs.hips) rigs.hips.rotation.z -= motion.current.turnLean * 0.18
    }
    if (rigs.head) {
      rigs.head.rotation.z = rigRest.head.z + Math.sin(motion.current.time * 1.1) * 0.018 + voiceLevel * 0.025
      rigs.head.rotation.x = MathUtils.lerp(rigs.head.rotation.x, rigRest.head.x - voiceLevel * 0.035, dt * 10)
    }
    if (rigs.earL) rigs.earL.rotation.x = rigRest.earL.x + Math.sin(motion.current.time * 1.7) * 0.035 - voiceLevel * 0.08
    if (rigs.earR) rigs.earR.rotation.x = rigRest.earR.x + Math.sin(motion.current.time * 1.5 + 1.4) * 0.03 + voiceLevel * 0.055
    const openShape = viseme === 'OPEN' ? 0.20 : viseme === 'ROUND' ? 0.13 : viseme === 'CLOSED' ? -0.025 : 0
    if (rigs.jaw) rigs.jaw.rotation.x = MathUtils.lerp(rigs.jaw.rotation.x, rigRest.jaw.x + mouthLevel * 0.13 + openShape, dt * 22)
    if (rigs.muzzleWide) rigs.muzzleWide.rotation.z = MathUtils.lerp(rigs.muzzleWide.rotation.z, rigRest.muzzleWide.z + (viseme === 'WIDE' || viseme === 'TEETH' ? 0.12 : 0), dt * 20)
    if (rigs.muzzleRound) rigs.muzzleRound.rotation.x = MathUtils.lerp(rigs.muzzleRound.rotation.x, rigRest.muzzleRound.x + (viseme === 'ROUND' ? 0.16 : 0), dt * 20)
    if (rigs.nostrils) rigs.nostrils.rotation.z = MathUtils.lerp(rigs.nostrils.rotation.z, rigRest.nostrils.z + (viseme === 'BREATH' ? 0.10 : 0), dt * 18)
    if (rigs.tail) rigs.tail.rotation.y = rigRest.tail.y + Math.sin(motion.current.time * 1.8) * 0.12

    const zone = placeFor(root.position)
    if (zone !== motion.current.zone) {
      motion.current.zone = zone
      motion.current.cameraTransition = reducedMotion ? 0 : zone === 'hallway' || zone === 'room'
        ? 1.35
        : zone === 'harbor'
          ? 1.7
          : 0
    }

    target.copy(root.position)
    target.y += 1.08
    const idleBlend = reducedMotion ? 0 : MathUtils.smoothstep(motion.current.idleSeconds, 11, 18)
    if (idleBlend > 0) {
      if (zone === 'room') idleFocus.set(-3.15, 1.15, -3.36)
      else if (zone === 'hallway') idleFocus.set(9.2, 2.0, 1.32)
      else if (zone === 'awning') idleFocus.set(14.4, 2.85, -2.5)
      else if (zone === 'station') idleFocus.set(PLACES.station.x, 2.2, PLACES.station.z)
      else if (zone === 'signalwerk') idleFocus.set(PLACES.signalwerk.x + 0.3, 2.3, PLACES.signalwerk.z)
      else idleFocus.set(23, 2.15, -4.8)
      target.lerp(idleFocus, idleBlend * 0.62)
    }
    if (controls.current) {
      controls.current.minDistance = zone === 'hallway' ? 1.55 : zone === 'room' ? 1.75 : 2.4
      controls.current.maxDistance = zone === 'hallway' ? 4.6 : zone === 'room' ? 6.4 : 10.5
      followDelta.copy(target).sub(controls.current.target).multiplyScalar(1 - Math.exp(-dt * 9))
      controls.current.target.add(followDelta)
      camera.position.add(followDelta)
      if (zone === 'hallway') {
        // A shoulder angle keeps both 353L and the opposite row of doors visible.
        // Looking straight down the corridor previously let the doorway/wainscot
        // fill the whole frame after the collision ray shortened the camera.
        const shoulderZ = root.position.z >= 0
          ? Math.min(0.82, root.position.z + 0.78)
          : Math.max(-0.82, root.position.z - 0.78)
        camera.position.z = MathUtils.lerp(camera.position.z, shoulderZ, 1 - Math.exp(-dt * 8))
      }
      controls.current.update()
    }

    if (idleBlend > 0 && controls.current) {
      if (zone === 'harbor') idleCameraGoal.set(root.position.x - 7.2, root.position.y + 4.1, root.position.z - 7.4)
      else if (zone === 'room') idleCameraGoal.set(root.position.x + 2.4, root.position.y + 2.9, root.position.z + 6.0)
      else idleCameraGoal.set(root.position.x - 5.2, root.position.y + 3.3, root.position.z + 5.6)
      camera.position.lerp(idleCameraGoal, (1 - Math.exp(-dt * 0.34)) * idleBlend)
      controls.current.update()
    }

    if (motion.current.cameraTransition > 0 && controls.current) {
      if (zone === 'hallway') cameraGoal.set(root.position.x - 2.4, root.position.y + 2.35, root.position.z + (root.position.z >= 0 ? 0.78 : -0.78))
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

    // SCHRITT 4: Kamera-Kollision als LETZTES Wort. Vorher lief sie VOR dem
    // Zonen-Schwenk, der die Kamera danach wieder zum Ziel schob - u.U. durch
    // die Wand. Jetzt clamped sie die endgueltige Kameraposition.
    // Camera collision and automatic occlusion correction use the actual exported meshes.
    // The desired orbit direction stays intact; only its safe distance is shortened.
    cameraRay.copy(camera.position).sub(target)
    const desiredCameraDistance = cameraRay.length()
    if (desiredCameraDistance > 0.001) {
      cameraRay.normalize()
      cameraRaycaster.current.set(target, cameraRay)
      cameraRaycaster.current.far = desiredCameraDistance
      const obstruction = cameraRaycaster.current
        .intersectObjects(level.children, true)
        .find((hit) => !/(floor|character|rain|water|puddle|hall_(door|frame|knob|light|mail|dado|baseboard|wainscot))/i.test(hit.object.name))
      motion.current.cameraObstruction = obstruction ? `${obstruction.object.name}@${obstruction.distance.toFixed(2)}` : null
      if (obstruction && obstruction.distance < desiredCameraDistance - 0.12) {
        const safeDistance = Math.max(0.72, obstruction.distance - 0.22)
        cameraSafe.copy(target).addScaledVector(cameraRay, safeDistance)
        camera.position.lerp(cameraSafe, 1 - Math.exp(-dt * 18))
        controls.current?.update()
      }
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
    motion.current.wasSprinting = sprinting
  })

  return (
    <>
      <primitive object={level} />
      <group ref={character}><primitive object={characterModel} /></group>
      <DockWorker source={characterGltf.scene} lodSources={dockLods} resolved={run.cartResolved} />
      <OrbitControls
        ref={controls}
        makeDefault
        enabled={!paused}
        onStart={() => { motion.current.idleSeconds = 0 }}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={cameraSensitivity}
        minDistance={1.75}
        maxDistance={10.5}
        minPolarAngle={0.28}
        maxPolarAngle={Math.PI - 0.34}
        target={[-1.1, 1.08, 0.7]}
      />
    </>
  )
}

function WorldLighting() {
  return (
    <>
      <ambientLight color="#b7c7cc" intensity={0.68} />
      <hemisphereLight args={['#a9c1c9', '#343839', 2.05]} />
      <directionalLight
        castShadow
        color="#c6d5da"
        intensity={2.05}
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
      {/* Die Fährbude bleibt kühl und grau; nur der Laptop ist die kleine warme Hoffnungsecke. */}
      <pointLight color="#a9c4cb" intensity={17} distance={10} decay={2} position={[0, 3.6, 3.8]} />
      <spotLight color="#a7bcc1" intensity={21} distance={12} decay={2} angle={0.78} penumbra={0.9} position={[-2.1, 3.8, -0.3]} />
      <pointLight color="#ff9a47" intensity={8.5} distance={3.2} decay={2} position={[-2.55, 1.28, -3.0]} />
      <pointLight color="#aabfc4" intensity={4.5} distance={5} decay={2} position={[5.35, 2.25, 0.35]} />
      <pointLight color="#d7b38b" intensity={7} distance={5.5} decay={2} position={[7.65, 2.12, -1.30]} />
      <pointLight color="#d7b38b" intensity={7} distance={5.5} decay={2} position={[10.35, 2.12, 1.30]} />
      <pointLight color="#d2a16d" intensity={5} distance={8} decay={2} position={[12, 2.75, 0]} />
      <pointLight color="#d9b083" intensity={7} distance={9} decay={2} position={[17.5, 3.8, 0]} />
      <pointLight color="#b8cbd0" intensity={15} distance={8} decay={2} position={[INTERACTIONS.cart.x, 3.8, INTERACTIONS.cart.z]} />
      <pointLight color="#8fc6d4" intensity={12} distance={9} decay={2} position={[19.5, 3.6, 7]} />
      <pointLight color="#ff923c" intensity={30} distance={14} decay={2} position={[23, 3.0, 5]} />
      <pointLight color="#9fc7d1" intensity={20} distance={13} decay={2} position={[PLACES.station.x, 4.6, PLACES.station.z]} />
      <pointLight color="#ffc078" intensity={9} distance={7} decay={2} position={[PLACES.station.x - 0.4, 3.1, PLACES.station.z]} />
      <pointLight color="#63b6cc" intensity={22} distance={14} decay={2} position={[PLACES.signalwerk.x + 0.2, 4.3, PLACES.signalwerk.z]} />
      <pointLight color="#ffad62" intensity={8} distance={7} decay={2} position={[PLACES.signalwerk.x, 2.8, PLACES.signalwerk.z]} />
      <pointLight color="#ffc882" intensity={7} distance={13} decay={2} position={[16.5, 3.4, 17.5]} />
      <pointLight color="#5cb9da" intensity={14} distance={16} decay={2} position={[0, 2.5, -3.5]} />
    </>
  )
}

function PerformanceProbe() {
  const samples = useRef([])
  useFrame((state, delta) => {
    const milliseconds = delta * 1000
    samples.current.push(milliseconds)
    if (samples.current.length > 180) samples.current.shift()
    if (samples.current.length < 15) return
    const sorted = [...samples.current].sort((a, b) => a - b)
    const averageMs = samples.current.reduce((sum, value) => sum + value, 0) / samples.current.length
    window.__ISSO_PERF__ = {
      fps: Number((1000 / averageMs).toFixed(1)),
      averageFrameMs: Number(averageMs.toFixed(2)),
      p95FrameMs: Number(sorted[Math.floor(sorted.length * 0.95)].toFixed(2)),
      samples: samples.current.length,
      renderer: state.gl.capabilities.isWebGL2 ? 'WebGL2' : 'WebGL1',
    }
    const panel = document.querySelector('.realtime-world')
    if (panel) panel.dataset.performance = JSON.stringify(window.__ISSO_PERF__)
  })
  return null
}

function WorldScene(props) {
  const [lost, setLost] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const lowMemory = (navigator.deviceMemory ?? 8) <= 4
  const effectiveQuality = lowMemory && props.renderQuality !== 'efficient' ? 'efficient' : props.renderQuality
  const [ktx2Loader, setKtx2Loader] = useState(null)
  const webglAvailable = useMemo(() => {
    const probe = document.createElement('canvas')
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'))
  }, [])
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  useEffect(() => () => ktx2Loader?.dispose(), [ktx2Loader])
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('force3dError')) {
    throw new Error('Intentional local 3D fallback check')
  }
  if (!webglAvailable) {
    return <section className="world-error"><div><span>◇</span><h2>3D ist in diesem Browser nicht verfügbar.</h2><p>Aktiviere Hardwarebeschleunigung oder öffne ISSO.TV in einem WebGL-fähigen Browser. Dein Spielstand bleibt lokal erhalten.</p></div></section>
  }
  return (
    <section className="realtime-world" aria-label="Echte frei begehbare 3D-Welt von Strammburg">
      <Canvas
        shadows={SHADOW_OPTIONS}
        frameloop={props.paused && !props.voiceActive && !props.wakeSequence && !props.cinematicMode && !props.interactionPulse ? 'demand' : 'always'}
        dpr={effectiveQuality === 'high' ? [1, 1.6] : effectiveQuality === 'efficient' ? [0.72, 1] : [0.9, 1.35]}
        camera={{ fov: 48, near: 0.08, far: 110, position: [0, 2.45, 7.2] }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.08
          gl.outputColorSpace = SRGBColorSpace
          gl.shadowMap.type = PCFShadowMap
          gl.setClearColor(new Color('#071117'))
          setKtx2Loader(new KTX2Loader().setTranscoderPath('/basis/').detectSupport(gl))
          gl.domElement.addEventListener('webglcontextlost', () => setLost(true), { once: true })
        }}
      >
        <fog attach="fog" args={['#12232b', 16, 78]} />
        <WorldLighting />
        <Rain />
        <HarborWater />
        <WetPatches />
        <SurfaceStoryDetails />
        <PerformanceProbe />
        {ktx2Loader && (
          <Suspense fallback={<LoadingModel />}>
            <Level {...props} ktx2Loader={ktx2Loader} />
          </Suspense>
        )}
        {effectiveQuality === 'auto' && <AdaptiveDpr />}
      </Canvas>
      {lost && <div className="webgl-warning">Die 3D-Verbindung wurde unterbrochen. Bitte einmal neu laden.</div>}
      {!online && <div className="runtime-notice">OFFLINE · Bereits geladene Welt und lokaler Spielstand bleiben verfügbar.</div>}
      {lowMemory && <div className="runtime-notice runtime-notice--memory">SPARSAMER 3D-MODUS · Wenig Gerätespeicher erkannt.</div>}
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
