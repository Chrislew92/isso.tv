import { Box3, Raycaster, Vector3 } from 'three'

const BLOCKING = /(wall|door|frame|mattress|table|radiator|kiosk|facade|crate|container|bollard|cart_|mailbox|wainscot|storage|counter)/i
const WALKABLE = /(floor|paver|asphalt|platform|threshold|walkway|ground)/i
const COLLIDER_PADDING_Y = 0.08
const DOWN = new Vector3(0, -1, 0)

export function collectNavigationGeometry(root) {
  const blockers = []
  const walkable = []
  root.updateWorldMatrix(true, true)
  root.traverse((object) => {
    if (!object.isMesh || !object.visible) return
    if (WALKABLE.test(object.name)) walkable.push(object)
    if (!BLOCKING.test(object.name)) return
    const bounds = new Box3().setFromObject(object)
    if (!bounds.isEmpty()) blockers.push({ id: object.name, object, bounds })
  })
  return { blockers, walkable }
}

function overlapsXZ(point, bounds, radius) {
  return point.x + radius > bounds.min.x
    && point.x - radius < bounds.max.x
    && point.z + radius > bounds.min.z
    && point.z - radius < bounds.max.z
}

function isBlocked(point, blockers, radius, doorOpen) {
  return blockers.some((collider) => {
    if (doorOpen && /apartment_door/i.test(collider.id)) return false
    collider.object?.updateWorldMatrix(true, false)
    if (collider.object) collider.bounds.setFromObject(collider.object)
    const bodyBottom = point.y + COLLIDER_PADDING_Y
    const bodyTop = point.y + 1.92
    return bodyTop > collider.bounds.min.y
      && bodyBottom < collider.bounds.max.y
      && overlapsXZ(point, collider.bounds, radius)
  })
}

/** Ein einzelner X/Z-Slide-Schritt gegen die Wand-Boxen. */
function slideStep(current, desired, blockers, doorOpen, radius) {
  let resolved = current.clone()
  const xOnly = resolved.clone()
  xOnly.x = desired.x
  if (!isBlocked(xOnly, blockers, radius, doorOpen)) resolved = xOnly
  const zOnly = resolved.clone()
  zOnly.z = desired.z
  if (!isBlocked(zOnly, blockers, radius, doorOpen)) resolved = zOnly
  return resolved
}

/**
 * Capsule-like X/Z sliding against bounds extracted from visible world meshes.
 *
 * Wichtig: die Bewegung wird in Teilschritte zerlegt, die nie groesser als der
 * Koerperradius sind. Ohne das prueft die Kollision nur den Zielpunkt - und bei
 * einem grossen Schritt (Sprint, Framerate-Einbruch) liegt der schon HINTER der
 * Wand, sodass 353L glatt durchlaeuft. Mit Teilschritten kann keine Wand mehr
 * uebersprungen werden (kein Tunneling).
 */
export function resolveMovement(current, desired, navigation, doorOpen, radius = 0.27) {
  const blockers = navigation?.blockers ?? []
  const dx = desired.x - current.x
  const dz = desired.z - current.z
  const distance = Math.hypot(dx, dz)
  const maxStep = Math.max(radius * 0.75, 0.0001)
  const steps = Math.max(1, Math.ceil(distance / maxStep))
  const stepX = dx / steps
  const stepZ = dz / steps
  let resolved = current.clone()
  // WICHTIG: jeder Teilschritt geht von der ZULETZT AUFGELOESTEN Position aus,
  // nicht absolut interpoliert. Sonst zielt ein Teilschritt in einem Sprung auf
  // einen Punkt knapp HINTER der Wand (der nicht mehr ueberlappt) und 353L
  // springt durch. Inkrementell kann kein Teilschritt die Wand ueberspringen.
  for (let i = 0; i < steps; i += 1) {
    const target = resolved.clone()
    target.x = resolved.x + stepX
    target.z = resolved.z + stepZ
    resolved = slideStep(resolved, target, blockers, doorOpen, radius)
  }
  resolved.y = desired.y
  return resolved
}

/** Keeps hooves on exported floors and safely crosses small thresholds/steps. */
export function groundMovement(position, navigation, raycaster = new Raycaster()) {
  if (!navigation?.walkable?.length) return position
  const origin = position.clone().add(new Vector3(0, 1.25, 0))
  raycaster.set(origin, DOWN)
  raycaster.far = 2.2
  const hit = raycaster.intersectObjects(navigation.walkable, false)[0]
  if (!hit) return position
  const step = hit.point.y - position.y
  if (step > 0.34 || step < -0.58) return position
  position.y = hit.point.y
  return position
}

export function buildNavigationGraph() {
  return {
    room: ['hallway'],
    hallway: ['room', 'awning'],
    awning: ['hallway', 'harbor'],
    harbor: ['awning', 'station', 'signalwerk'],
    station: ['harbor'],
    signalwerk: ['harbor'],
  }
}

export function placeFor(position) {
  if (position.x < 4.25) return 'room'
  if (position.x < 10.7) return 'hallway'
  if (position.x > 33 && position.z < 0) return 'station'
  if (position.x > 24 && position.z < -8) return 'signalwerk'
  if (position.x < 15) return 'awning'
  return 'harbor'
}
