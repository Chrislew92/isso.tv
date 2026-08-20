"""Print connected mesh islands and bounds from a Blender character source."""

import bpy


def main():
    mesh_object = max(
        (obj for obj in bpy.data.objects if obj.type == "MESH"),
        key=lambda obj: len(obj.data.vertices),
    )
    mesh = mesh_object.data
    adjacency = [[] for _ in mesh.vertices]
    for edge in mesh.edges:
        a, b = edge.vertices
        adjacency[a].append(b)
        adjacency[b].append(a)

    remaining = set(range(len(mesh.vertices)))
    components = []
    while remaining:
        seed = remaining.pop()
        stack = [seed]
        component = [seed]
        while stack:
            current = stack.pop()
            for neighbour in adjacency[current]:
                if neighbour in remaining:
                    remaining.remove(neighbour)
                    stack.append(neighbour)
                    component.append(neighbour)
        components.append(component)

    print(f"COMPONENT_COUNT={len(components)}")
    ranked = sorted(components, key=len, reverse=True)
    for index, component in enumerate(ranked[:80]):
        points = [mesh.vertices[vertex].co for vertex in component]
        minimum = tuple(round(min(point[axis] for point in points), 4) for axis in range(3))
        maximum = tuple(round(max(point[axis] for point in points), 4) for axis in range(3))
        print(f"COMPONENT={index} VERTICES={len(component)} MIN={minimum} MAX={maximum}")

    print("EXTREMITY_CANDIDATES")
    for index, component in enumerate(ranked):
        points = [mesh.vertices[vertex].co for vertex in component]
        minimum = tuple(min(point[axis] for point in points) for axis in range(3))
        maximum = tuple(max(point[axis] for point in points) for axis in range(3))
        center_x = (minimum[0] + maximum[0]) * 0.5
        is_foot = maximum[2] < 0.275
        is_hand = (
            minimum[2] > 0.42
            and maximum[2] < 0.82
            and abs(center_x) > 0.18
            and maximum[0] - minimum[0] < 0.24
        )
        if is_foot or is_hand:
            rounded_min = tuple(round(value, 4) for value in minimum)
            rounded_max = tuple(round(value, 4) for value in maximum)
            print(f"EXTREMITY={index} TYPE={'FOOT' if is_foot else 'HAND'} VERTICES={len(component)} MIN={rounded_min} MAX={rounded_max}")


if __name__ == "__main__":
    main()
