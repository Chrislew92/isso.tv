"""Print front-head vertex distributions used to build a conservative jaw group."""

import bpy


mesh = bpy.data.objects.get("353L_Master_Mesh")
vertices = [vertex.co.copy() for vertex in mesh.data.vertices]
head = [co for co in vertices if co.z > 2.35]
front_head = [co for co in head if co.y < -0.12]


def percentile(values, position):
    ordered = sorted(values)
    return ordered[min(len(ordered) - 1, round((len(ordered) - 1) * position))]


print(f"VERTICES={len(vertices)} HEAD={len(head)} FRONT_HEAD={len(front_head)}")
for axis, values in (
    ("x", [co.x for co in front_head]),
    ("y", [co.y for co in front_head]),
    ("z", [co.z for co in front_head]),
):
    print(f"{axis.upper()}_P05={percentile(values, .05):.4f} P25={percentile(values, .25):.4f} P50={percentile(values, .5):.4f} P75={percentile(values, .75):.4f} P95={percentile(values, .95):.4f}")

for y_limit in (-0.20, -0.25, -0.30, -0.35, -0.40):
    for z_low, z_high in ((2.42, 2.62), (2.48, 2.70), (2.52, 2.76), (2.58, 2.82)):
        selected = [co for co in vertices if abs(co.x) < .34 and co.y < y_limit and z_low < co.z < z_high]
        print(f"REGION y<{y_limit:.2f} z={z_low:.2f}:{z_high:.2f} count={len(selected)}")
