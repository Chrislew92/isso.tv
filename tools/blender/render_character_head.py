"""Render a repeatable close-up for character art and facial-rig checks."""

from __future__ import annotations

import bpy
import sys
from pathlib import Path
from mathutils import Vector


def look_at(camera, point):
    camera.rotation_euler = (Vector(point) - camera.location).to_track_quat("-Z", "Y").to_euler()


def add_area(name, location, energy, color, size):
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.color = color
    data.shape = "DISK"
    data.size = size
    light = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(light)
    light.location = location
    look_at(light, (0, 0, 2.72))


def main():
    args = sys.argv[sys.argv.index("--") + 1:]
    output = Path(args[0]).resolve()
    output.parent.mkdir(parents=True, exist_ok=True)

    if len(args) > 1 and args[1] == "jaw-open":
        rig = bpy.data.objects.get("CHARACTER_353L_ROOT")
        jaw = rig.pose.bones.get("rig_jaw") if rig else None
        if jaw:
            jaw.rotation_mode = "XYZ"
            jaw.rotation_euler.x = 0.28
            bpy.context.view_layer.update()

    add_area("portrait_key", (-2.2, -2.7, 4.1), 850, (1.0, 0.68, 0.46), 2.2)
    add_area("portrait_fill", (2.5, -1.5, 3.3), 620, (0.38, 0.72, 1.0), 2.5)
    add_area("portrait_rim", (0, 2.2, 3.6), 900, (1.0, 0.24, 0.08), 1.8)

    camera_data = bpy.data.cameras.new("portrait_camera")
    camera_data.lens = 76
    camera = bpy.data.objects.new("portrait_camera", camera_data)
    bpy.context.collection.objects.link(camera)
    camera.location = (0, -3.35, 2.82)
    look_at(camera, (0, -0.06, 2.76))

    scene = bpy.context.scene
    scene.camera = camera
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.render.resolution_x = 900
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(output)
    scene.world.color = (0.006, 0.012, 0.016)
    scene.view_settings.look = "AgX - Medium High Contrast"
    bpy.ops.render.render(write_still=True)
    print(f"HEAD_PREVIEW={output}")


if __name__ == "__main__":
    main()
