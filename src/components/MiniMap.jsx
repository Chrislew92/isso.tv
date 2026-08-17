import { PLACES } from '../game/canon.js'

const MAP_BOUNDS = { minX: -5, maxX: 43, minZ: -15, maxZ: 16 }

function point(x, z) {
  return {
    left: `${((x - MAP_BOUNDS.minX) / (MAP_BOUNDS.maxX - MAP_BOUNDS.minX)) * 100}%`,
    top: `${((z - MAP_BOUNDS.minZ) / (MAP_BOUNDS.maxZ - MAP_BOUNDS.minZ)) * 100}%`,
  }
}

const markers = [PLACES.room, PLACES.harbor, PLACES.station, PLACES.signalwerk]

export default function MiniMap({ position = { x: -0.8, z: -0.7 } }) {
  return (
    <section className="mini-map" aria-label="Karte von Strammburg">
      <div className="mini-map__head">
        <span>KARTE</span>
        <small>STRAMMBURG / HAFENRAND</small>
      </div>
      <div className="mini-map__field">
        <span className="map-line map-line--harbor" />
        <span className="map-line map-line--rail" />
        <span className="map-water">ELBE</span>
        {markers.map((place) => (
          <span key={place.id} className={`map-marker map-marker--${place.id}`} style={point(place.x, place.z)}>
            <i />
            <b>{place.short}</b>
          </span>
        ))}
        <span className="map-player" style={point(position.x, position.z)} aria-label="Deine Position">
          <i />
        </span>
      </div>
    </section>
  )
}
