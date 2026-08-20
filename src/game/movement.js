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

/** Capsule-like X/Z sliding against bounds extracted from visible world meshes. */
export function resolveMovement(current, desired, navigation, doorOpen, radius = 0.27) {
  let resolved = current.clone()
  const blockers = navigation?.blockers ?? []
  const xOnly = resolved.clone()
  xOnly.x = desired.x
  if (!isBlocked(xOnly, blockers, radius, doorOpen)) resolved = xOnly
  const zOnly = resolved.clone()
  zOnly.z = desired.z
  if (!isBlocked(zOnly, blockers, radius, doorOpen)) resolved = zOnly
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
