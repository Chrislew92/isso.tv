import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, Html, OrbitControls, useGLTF } from '@react-three/drei'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import {
  ACESFilmicToneMapping,
  Box3,
  Color,
  MathUtils,
  PCFShadowMap,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { INTERACTIONS } from '../game/canon.js'

const MODEL_URL = '/models/isso-v3-vertical-slice-v1.glb'
const CHARACTER_MODEL_URL = '/models/353l-master-character-v3.glb'
const UP = new Vector3(0, 1, 0)
const SHADOW_OPTIONS = { enabled: true, type: PCFShadowMap }

const targets = {
  connection: { ...INTERACTIONS.connection, point: new Vector3(-2.2, 0, -2.65), radius: 2.25 },
  door: { ...INTERACTIONS.door, point: new Vector3(4.15, 0, 0.8), radius: 2.1 },
  cart: { ...INTERACTIONS.cart, point: new Vector3(19, 0, 3.1), radius: 2.8 },
  station: { ...INTERACTIONS.station, point: new Vector3(35.5, 0, -4.5), radius: 3.4 },
  signalwerk: { ...INTERACTIONS.signalwerk, point: new Vector3(27, 0, -11), radius: 3.4 },
}

function clampMovement(current, desired, doorOpen) {
  const next = desired
  if (!doorOpen && current.x < 4.0 && next.x > 3.65) next.x = 3.65
  if (next.x < 4.25) {
    next.x = Math.max(-4.05, Math.min(3.7, next.x))
    next.z = Math.max(-3.45, Math.min(3.45, next.z))
  } else if (next.x < 10.7) {
    next.x = Math.max(4.25, next.x)
    next.z = Math.max(-1.25, Math.min(1.25, next.z))
  } else {
    next.x = Math.max(10.7, Math.min(49.5, next.x))
    next.z = Math.max(-13.7, Math.min(13.7, next.z))
  }
  return next
}

function placeFor(position) {
  if (position.x < 4.25) return 'room'
  if (position.x < 10.7) return 'hallway'
  if (position.x > 33 && position.z < 0) return 'station'
  if (position.x > 24 && position.z < -8) return 'signalwerk'
  if (position.x < 15) return 'awning'
  return 'harbor'
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
  return (
    <Html center>
      <div className="three-loader"><span>353L</span><small>ECHTES 3D WIRD GELADEN</small></div>
    </Html>
  )
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

function Level({ run, paused, onInteract, onPrompt, onPosition, onReady }) {
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
  const motion = useRef({ moving: false, time: 0, emoteUntil: 0, doorAngle: 0, cartShift: 0, cartBaseZ: 0 })
  const vectors = useRef({
    forward: new Vector3(),
    right: new Vector3(),
    direction: new Vector3(),
    next: new Vector3(),
    target: new Vector3(),
    followDelta: new Vector3(),
  })
  const { camera } = useThree()

  const rigs = useMemo(() => ({
    armL: characterModel.getObjectByName('rig_arm_l'),
    armR: characterModel.getObjectByName('rig_arm_r'),
    legL: characterModel.getObjectByName('rig_leg_l'),
    legR: characterModel.getObjectByName('rig_leg_r'),
    head: characterModel.getObjectByName('rig_head'),
    earL: characterModel.getObjectByName('rig_ear_l'),
    earR: characterModel.getObjectByName('rig_ear_r'),
    tail: characterModel.getObjectByName('rig_tail'),
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
    character.current.scale.setScalar(3.35 / initialHeight)
    character.current.updateMatrixWorld(true)
    const groundedBounds = new Box3().setFromObject(character.current)
    character.current.position.set(-1.1, -groundedBounds.min.y, 0.7)
    door.current = level.getObjectByName('door_pivot')
    cart.current = level.getObjectByName('cart_root')
    if (cart.current) motion.current.cartBaseZ = cart.current.position.z
    level.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = object.name.startsWith('char_') || object.name.includes('door') || object.name.includes('cart')
      object.receiveShadow = !object.name.startsWith('char_eye')
      object.frustumCulled = true
    })
    characterModel.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      object.frustumCulled = true
    })
    const root = character.current
    if (root) {
      controls.current?.target.copy(root.position).add(new Vector3(0, 1.55, 0))
      controls.current?.update()
    }
    onReady()
  }, [level, characterModel])

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
    const { forward, right, direction, next, target, followDelta } = vectors.current
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

    if (moving) {
      direction.normalize()
      const speed = activeKeys.has('shift') ? 4.25 : 3.05
      next.copy(root.position).addScaledVector(direction, dt * speed)
      root.position.copy(clampMovement(root.position, next, run.doorOpen))
      const desiredRotation = Math.atan2(direction.x, direction.z)
      root.rotation.y = MathUtils.lerp(root.rotation.y, desiredRotation, 1 - Math.exp(-dt * 12))
    }

    const step = moving ? Math.sin(motion.current.time * (activeKeys.has('shift') ? 11 : 8.5)) * 0.45 : 0
    const emote = performance.now() < motion.current.emoteUntil
    if (rigs.legL) rigs.legL.rotation.x = MathUtils.lerp(rigs.legL.rotation.x, rigRest.legL.x + step, dt * 12)
    if (rigs.legR) rigs.legR.rotation.x = MathUtils.lerp(rigs.legR.rotation.x, rigRest.legR.x - step, dt * 12)
    if (rigs.armL) rigs.armL.rotation.x = MathUtils.lerp(rigs.armL.rotation.x, rigRest.armL.x - step * 0.62 - (emote ? 0.75 : 0), dt * 12)
    if (rigs.armR) rigs.armR.rotation.x = MathUtils.lerp(rigs.armR.rotation.x, rigRest.armR.x + step * 0.62 + (emote ? 0.22 : 0), dt * 12)
    if (rigs.head) rigs.head.rotation.z = rigRest.head.z + Math.sin(motion.current.time * 1.1) * 0.018
    if (rigs.earL) rigs.earL.rotation.x = rigRest.earL.x + Math.sin(motion.current.time * 1.7) * 0.035
    if (rigs.earR) rigs.earR.rotation.x = rigRest.earR.x + Math.sin(motion.current.time * 1.5 + 1.4) * 0.03
    if (rigs.tail) rigs.tail.rotation.y = rigRest.tail.y + Math.sin(motion.current.time * 1.8) * 0.12

    target.copy(root.position)
    target.y += 1.55
    if (controls.current) {
      followDelta.copy(target).sub(controls.current.target).multiplyScalar(1 - Math.exp(-dt * 9))
      controls.current.target.add(followDelta)
      camera.position.add(followDelta)
      controls.current.update()
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
        minDistance={3.7}
        maxDistance={9.5}
        minPolarAngle={0.76}
        maxPolarAngle={1.34}
        target={[-1.1, 1.55, 0.7]}
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
        intensity={2.2}
        position={[18, 24, 10]}
        shadow-mapSize-width={768}
        shadow-mapSize-height={768}
        shadow-camera-far={75}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
      />
      <pointLight color="#ffd6ae" intensity={28} distance={11} decay={2} position={[0, 3.4, 4.2]} />
      <pointLight color="#ff9c45" intensity={19} distance={9} decay={2} position={[2.2, 3.3, -3.5]} />
      <pointLight color="#ffad55" intensity={24} distance={12} decay={2} position={[12, 3.0, 0]} />
      <pointLight color="#ff923c" intensity={30} distance={14} decay={2} position={[23, 3.0, 5]} />
      <pointLight color="#5cb9da" intensity={14} distance={16} decay={2} position={[0, 2.5, -3.5]} />
    </>
  )
}

export default function RealtimeWorld(props) {
  const [lost, setLost] = useState(false)
  return (
    <section className="realtime-world" aria-label="Echte frei begehbare 3D-Welt von Strammburg">
      <Canvas
        shadows={SHADOW_OPTIONS}
        frameloop={props.paused ? 'demand' : 'always'}
        dpr={[0.75, 1]}
        camera={{ fov: 48, near: 0.08, far: 110, position: [0, 3.0, 6.5] }}
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
        <Suspense fallback={<LoadingModel />}>
          <Level {...props} />
        </Suspense>
        <AdaptiveDpr />
      </Canvas>
      {lost && <div className="webgl-warning">Die 3D-Verbindung wurde unterbrochen. Bitte einmal neu laden.</div>}
    </section>
  )
}

useGLTF.preload(MODEL_URL)
useGLTF.preload(CHARACTER_MODEL_URL)
