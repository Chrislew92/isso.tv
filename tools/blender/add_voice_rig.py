"""Add a conservative deforming jaw and stronger realtime material to 353L."""

from __future__ import annotations

import bpy
import sys
from pathlib import Path


def add_jaw_bone(rig):
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    previous = rig.data.edit_bones.get("rig_jaw")
    if previous:
        rig.data.edit_bones.remove(previous)
    jaw = rig.data.edit_bones.new("rig_jaw")
    jaw.head = (0, -0.22, 2.66)
    jaw.tail = (0, -0.49, 2.54)
    jaw.parent = rig.data.edit_bones.get("rig_head")
    jaw.use_deform = True
    bpy.ops.object.mode_set(mode="OBJECT")


def smoothstep(edge0, edge1, value):
    factor = max(0.0, min(1.0, (value - edge0) / (edge1 - edge0)))
    return factor * factor * (3.0 - 2.0 * factor)


def add_jaw_weights(mesh):
    old = mesh.vertex_groups.get("rig_jaw")
    if old:
        mesh.vertex_groups.remove(old)
    jaw_group = mesh.vertex_groups.new(name="rig_jaw")
    groups = list(mesh.vertex_groups)
    affected = 0

    for vertex in mesh.data.vertices:
        co = vertex.co
        front = smoothstep(-0.22, -0.39, co.y)
        lower = 1.0 - smoothstep(2.48, 2.69, co.z)
        center = 1.0 - smoothstep(0.24, 0.40, abs(co.x))
        weight = min(0.92, front * lower * center * 0.92)
        if weight < 0.025:
            continue

        memberships = [(groups[item.group], item.weight) for item in vertex.groups if groups[item.group] != jaw_group]
        for group, old_weight in memberships:
            group.add([vertex.index], old_weight * (1.0 - weight), "REPLACE")
        jaw_group.add([vertex.index], weight, "REPLACE")
        affected += 1

    print(f"JAW_VERTICES={affected}")


def tune_material(mesh):
    for material in mesh.data.materials:
        if not material or not material.use_nodes:
            continue
        bsdf = material.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            continue
        bsdf.inputs["Roughness"].default_value = 0.69
        bsdf.inputs["Specular IOR Level"].default_value = 0.34
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = 0.025
        if "Sheen Weight" in bsdf.inputs:
            bsdf.inputs["Sheen Weight"].default_value = 0.08


def save_and_export(repo_root, rig, mesh):
    blend_path = repo_root / "assets" / "source" / "353l-master-character-v3.blend"
    glb_path = repo_root / "public" / "models" / "353l-master-character-v3.glb"
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    mesh.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        use_selection=True,
        export_apply=False,
        export_yup=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=True,
    )
    print(f"BLEND={blend_path}")
    print(f"GLB={glb_path}")


def main():
    repo_root = Path(sys.argv[sys.argv.index("--") + 1]).resolve()
    rig = bpy.data.objects.get("CHARACTER_353L_ROOT")
    mesh = bpy.data.objects.get("353L_Master_Mesh")
    if not rig or not mesh:
        raise RuntimeError("353L master rig or mesh is missing")
    add_jaw_bone(rig)
    add_jaw_weights(mesh)
    tune_material(mesh)
    save_and_export(repo_root, rig, mesh)


if __name__ == "__main__":
    main()
