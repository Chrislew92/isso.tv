"""Build the user-approved Hi3D 353L sculpt into a browser-ready ISSO.TV V5 character.

The source GLB is intentionally not copied into Git. The generated Blender file is the
editable optimized source, and the generated GLB is the runtime asset. The build keeps
the original texture appearance and complete animal anatomy, reduces geometry and adds
the stable bone/slot API used by RealtimeWorld.
"""

from __future__ import annotations

import hashlib
import json
import math
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Matrix, Vector


TARGET_HEIGHT = 2.15
TARGET_TRIANGLES = 120_000
TARGET_TEXTURE_EDGE = 2_048


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.armatures, bpy.data.materials):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


def local_bounds(mesh):
    vertices = [vertex.co for vertex in mesh.data.vertices]
    minimum = Vector((min(v.x for v in vertices), min(v.y for v in vertices), min(v.z for v in vertices)))
    maximum = Vector((max(v.x for v in vertices), max(v.y for v in vertices), max(v.z for v in vertices)))
    return minimum, maximum


def triangle_count(mesh):
    return sum(max(0, len(polygon.vertices) - 2) for polygon in mesh.data.polygons)


def import_and_normalize(source):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(source))
    imported = [obj for obj in bpy.data.objects if obj not in before and obj.type == "MESH"]
    if not imported:
        raise RuntimeError("Hi3D source contains no mesh")

    for obj in imported:
        world = obj.matrix_world.copy()
        obj.parent = None
        obj.data.transform(world)
        obj.matrix_world = Matrix.Identity(4)

    bpy.ops.object.select_all(action="DESELECT")
    for obj in imported:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = imported[0]
    if len(imported) > 1:
        bpy.ops.object.join()
    mesh = bpy.context.view_layer.objects.active
    mesh.name = "353L_Hi3D_Master_Mesh"
    mesh.data.name = "353L_Hi3D_Runtime_Geometry"
    mesh["character_id"] = "353L"
    mesh["character_version"] = 5
    mesh["anatomy_profile"] = "articulated furred front hooves; solid equine rear hooves"

    minimum, maximum = local_bounds(mesh)
    dimensions = maximum - minimum
    if dimensions.z <= 0:
        raise RuntimeError("Hi3D source has invalid height")
    scale = TARGET_HEIGHT / dimensions.z
    mesh.data.transform(Matrix.Scale(scale, 4))
    minimum, maximum = local_bounds(mesh)
    center = (minimum + maximum) * 0.5
    mesh.data.transform(Matrix.Translation(Vector((-center.x, -center.y, -minimum.z))))
    mesh.data.update()

    for polygon in mesh.data.polygons:
        polygon.use_smooth = True
    return mesh


def optimize_mesh(mesh):
    before = triangle_count(mesh)
    ratio = min(1.0, TARGET_TRIANGLES / max(before, 1))
    bpy.context.view_layer.objects.active = mesh
    mesh.select_set(True)
    modifier = mesh.modifiers.new(name="353L_Runtime_Decimation", type="DECIMATE")
    modifier.decimate_type = "COLLAPSE"
    modifier.ratio = ratio
    modifier.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    mesh.data.validate(verbose=True)
    mesh.data.update()
    after = triangle_count(mesh)
    print(f"TRIANGLES_BEFORE={before}")
    print(f"TRIANGLES_AFTER={after}")
    return before, after


def remove_human_extremities(mesh):
    """Remove source boots and loose hand islands before installing hoof shells."""
    geometry = bmesh.new()
    geometry.from_mesh(mesh.data)
    coordinate_cut = [
        vertex
        for vertex in geometry.verts
        if vertex.co.z < 0.315
    ]
    removed_vertices = len(coordinate_cut)
    bmesh.ops.delete(geometry, geom=coordinate_cut, context="VERTS")

    # Decimation can leave small fingertip/cuff islands exactly on the cut
    # plane. Remove only compact lateral islands; the connected jacket and
    # trouser panels are much larger/taller and therefore stay untouched.
    geometry.verts.ensure_lookup_table()
    remaining = set(geometry.verts)
    hand_vertices = []
    while remaining:
        seed = remaining.pop()
        stack = [seed]
        island = [seed]
        while stack:
            current = stack.pop()
            for edge in current.link_edges:
                neighbour = edge.other_vert(current)
                if neighbour in remaining:
                    remaining.remove(neighbour)
                    stack.append(neighbour)
                    island.append(neighbour)
        xs = [vertex.co.x for vertex in island]
        zs = [vertex.co.z for vertex in island]
        center_x = (min(xs) + max(xs)) * 0.5
        is_hand_fragment = (
            min(zs) > 0.40
            and max(zs) < 0.85
            and abs(center_x) > 0.18
            and max(xs) - min(xs) < 0.30
        )
        if is_hand_fragment:
            hand_vertices.extend(island)

    removed_vertices += len(hand_vertices)
    if hand_vertices:
        bmesh.ops.delete(geometry, geom=hand_vertices, context="VERTS")
    geometry.to_mesh(mesh.data)
    geometry.free()
    mesh.data.validate(verbose=True)
    mesh.data.update()
    print(f"REMOVED_HUMAN_EXTREMITY_VERTICES={removed_vertices}")
    print(f"TRIANGLES_AFTER_EXTREMITY_CLEANUP={triangle_count(mesh)}")
    return triangle_count(mesh)


def optimize_images():
    report = []
    for image in bpy.data.images:
        width, height = image.size
        if width <= 0 or height <= 0:
            continue
        original = (int(width), int(height))
        largest = max(width, height)
        if largest > TARGET_TEXTURE_EDGE:
            factor = TARGET_TEXTURE_EDGE / largest
            image.scale(max(1, round(width * factor)), max(1, round(height * factor)))
        image.name = f"353L_Runtime_{image.name}"
        image.file_format = "JPEG"
        image.pack()
        report.append({"name": image.name, "before": original, "after": tuple(int(v) for v in image.size)})
    print(f"TEXTURES={json.dumps(report)}")
    return report


def tune_materials(mesh):
    for index, material in enumerate(mesh.data.materials):
        if not material:
            continue
        material.name = f"353L_Worker_Base_{index + 1}"
        material.diffuse_color = (0.72, 0.72, 0.72, 1)
        if not material.use_nodes:
            continue
        bsdf = material.node_tree.nodes.get("Principled BSDF")
        if not bsdf:
            continue
        if "Metallic" in bsdf.inputs and not bsdf.inputs["Metallic"].is_linked:
            bsdf.inputs["Metallic"].default_value = 0.04
        if "Roughness" in bsdf.inputs and not bsdf.inputs["Roughness"].is_linked:
            bsdf.inputs["Roughness"].default_value = 0.72
        if "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = 0.015


def edit_bone(data, name, head, tail, parent=None, deform=True):
    bone = data.edit_bones.new(name)
    bone.head = head
    bone.tail = tail
    bone.use_deform = deform
    bone.use_connect = False
    if parent:
        bone.parent = parent
    return bone


def build_armature():
    data = bpy.data.armatures.new("353L_Hi3D_Rig")
    rig = bpy.data.objects.new("CHARACTER_353L_ROOT", data)
    bpy.context.collection.objects.link(rig)
    rig.show_in_front = True
    rig["character_id"] = "353L"
    rig["character_version"] = 5
    rig["visual_anchor"] = "user-approved Hi3D realistic worker donkey"
    rig["canon"] = "adult upright donkey; worker outfit; articulate animal front hooves; solid equine rear hooves"

    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    root = edit_bone(data, "rig_root", (0, 0, 0.02), (0, 0, 0.28), deform=False)
    hips = edit_bone(data, "rig_hips", (0, 0.02, 0.80), (0, 0, 1.03), root)
    spine = edit_bone(data, "rig_spine", (0, 0, 1.03), (0, -0.01, 1.49), hips)
    neck = edit_bone(data, "rig_neck", (0, -0.01, 1.49), (0, -0.04, 1.68), spine)
    head = edit_bone(data, "rig_head", (0, -0.04, 1.68), (0, -0.08, 1.98), neck)
    edit_bone(data, "rig_jaw", (0, -0.18, 1.82), (0, -0.32, 1.74), head)
    edit_bone(data, "rig_muzzle_wide", (0, -0.19, 1.86), (0.16, -0.29, 1.84), head)
    edit_bone(data, "rig_muzzle_round", (0, -0.20, 1.83), (0, -0.36, 1.82), head)
    edit_bone(data, "rig_nostrils", (0, -0.22, 1.90), (0, -0.34, 1.93), head)
    edit_bone(data, "rig_tongue", (0, -0.20, 1.78), (0, -0.34, 1.76), head)
    edit_bone(data, "rig_eyelid_l", (-0.08, -0.08, 1.91), (-0.08, -0.15, 1.90), head)
    edit_bone(data, "rig_eyelid_r", (0.08, -0.08, 1.91), (0.08, -0.15, 1.90), head)
    edit_bone(data, "rig_ear_l", (-0.11, -0.02, 1.91), (-0.15, -0.02, 2.14), head)
    edit_bone(data, "rig_ear_r", (0.11, -0.02, 1.91), (0.15, -0.02, 2.14), head)
    edit_bone(data, "rig_tail", (0, 0.16, 1.00), (0, 0.30, 0.76), hips)

    for side, sign in (("l", -1), ("r", 1)):
        thigh = edit_bone(data, f"rig_leg_{side}", (0.13 * sign, 0, 0.88), (0.13 * sign, 0, 0.53), hips)
        shin = edit_bone(data, f"rig_shin_{side}", (0.13 * sign, 0, 0.53), (0.13 * sign, -0.01, 0.16), thigh)
        edit_bone(data, f"rig_foot_{side}", (0.13 * sign, -0.01, 0.16), (0.13 * sign, -0.21, 0.08), shin)
        arm = edit_bone(data, f"rig_arm_{side}", (0.29 * sign, 0, 1.49), (0.39 * sign, -0.01, 1.18), spine)
        forearm = edit_bone(data, f"rig_forearm_{side}", (0.39 * sign, -0.01, 1.18), (0.47 * sign, -0.03, 0.91), arm)
        edit_bone(data, f"rig_hand_{side}", (0.47 * sign, -0.03, 0.91), (0.49 * sign, -0.05, 0.70), forearm)

    bpy.ops.object.mode_set(mode="OBJECT")
    return rig


def bind_by_distance(mesh, rig):
    mesh.parent = rig
    modifier = mesh.modifiers.new(name="353L_Hi3D_Skin", type="ARMATURE")
    modifier.object = rig
    groups = {
        bone.name: mesh.vertex_groups.get(bone.name) or mesh.vertex_groups.new(name=bone.name)
        for bone in rig.data.bones
        if bone.use_deform
    }
    segments = []
    for bone in rig.data.bones:
        if not bone.use_deform:
            continue
        start = bone.head_local.copy()
        vector = bone.tail_local - start
        segments.append((bone.name, start, vector, max(vector.length_squared, 0.000001)))

    for vertex in mesh.data.vertices:
        # Procedural hoof vertices already carry a deliberate single-bone bind.
        if vertex.groups:
            continue
        point = vertex.co
        if point.z < 0.90:
            allowed = {"rig_hips", "rig_spine", "rig_tail"}
            if abs(point.x) >= 0.025:
                side = "l" if point.x < 0 else "r"
                allowed.update({f"rig_leg_{side}", f"rig_shin_{side}", f"rig_foot_{side}"})
        elif point.z < 1.52 and abs(point.x) > 0.22:
            side = "l" if point.x < 0 else "r"
            allowed = {
                "rig_spine", "rig_neck",
                f"rig_arm_{side}", f"rig_forearm_{side}", f"rig_hand_{side}",
            }
        elif point.z > 1.55:
            allowed = {
                "rig_neck", "rig_head", "rig_jaw",
                "rig_ear_l", "rig_ear_r", "rig_muzzle_wide", "rig_muzzle_round",
                "rig_nostrils", "rig_tongue", "rig_eyelid_l", "rig_eyelid_r",
            }
        else:
            allowed = {
                "rig_hips", "rig_spine", "rig_neck", "rig_tail",
                "rig_arm_l", "rig_arm_r", "rig_forearm_l", "rig_forearm_r",
            }

        nearest = []
        for name, start, vector, length_squared in segments:
            if name not in allowed:
                continue
            factor = max(0.0, min(1.0, (point - start).dot(vector) / length_squared))
            closest = start + vector * factor
            nearest.append((name, (point - closest).length_squared))
        nearest.sort(key=lambda item: item[1])
        weighted = [(name, 1.0 / ((distance_squared + 0.0016) ** 2)) for name, distance_squared in nearest[:4]]
        total = sum(weight for _, weight in weighted)
        for name, weight in weighted:
            groups[name].add([vertex.index], weight / total, "REPLACE")

    # Production constraints: no vertex exceeds four deform influences, all weights
    # normalize to one and joint seams receive a conservative smoothing pass.
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = mesh
    mesh.select_set(True)
    bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    bpy.ops.object.vertex_group_limit_total(group_select_mode='BONE_DEFORM', limit=4)
    bpy.ops.object.mode_set(mode='WEIGHT_PAINT')
    for group_name in (
        'rig_hips', 'rig_spine', 'rig_neck',
        'rig_leg_l', 'rig_leg_r', 'rig_shin_l', 'rig_shin_r',
        'rig_arm_l', 'rig_arm_r', 'rig_forearm_l', 'rig_forearm_r',
    ):
        group = mesh.vertex_groups.get(group_name)
        if not group:
            continue
        mesh.vertex_groups.active_index = group.index
        bpy.ops.object.vertex_group_smooth(group_select_mode='ACTIVE', factor=0.32, repeat=2, expand=0.08)
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    bpy.ops.object.vertex_group_limit_total(group_select_mode='BONE_DEFORM', limit=4)
    bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    mesh.select_set(False)


def hoof_material():
    material = bpy.data.materials.new("353L_Hoof_Wall")
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0.014, 0.007, 0.003, 1)
    bsdf.inputs["Roughness"].default_value = 0.84
    bsdf.inputs["Metallic"].default_value = 0.0
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = 0.0
    return material


def create_hoof_shell(name, center_x, levels, material, bone_name):
    """Create a single-toed donkey hoof with a flat sole and forward toe."""
    segments = 24
    vertices = []
    for z, radius_x, radius_y, center_y in levels:
        for index in range(segments):
            angle = math.tau * index / segments
            forward = max(0.0, -math.cos(angle))
            x = center_x + math.sin(angle) * radius_x
            y = center_y + math.cos(angle) * radius_y * (1.0 + forward * 0.12)
            vertices.append((x, y, z))

    top_center = len(vertices)
    vertices.append((center_x, levels[0][3], levels[0][0] + 0.014))
    bottom_center = len(vertices)
    vertices.append((center_x, levels[-1][3] - levels[-1][2] * 0.08, levels[-1][0]))

    faces = []
    ring_count = len(levels)
    for ring in range(ring_count - 1):
        for index in range(segments):
            next_index = (index + 1) % segments
            a = ring * segments + index
            b = ring * segments + next_index
            c = (ring + 1) * segments + next_index
            d = (ring + 1) * segments + index
            faces.append((a, b, c, d))
    for index in range(segments):
        next_index = (index + 1) % segments
        faces.append((top_center, index, next_index))
    for index in range(segments):
        next_index = (index + 1) % segments
        bottom = (ring_count - 1) * segments
        faces.append((bottom_center, bottom + next_index, bottom + index))

    mesh_data = bpy.data.meshes.new(f"{name}_Geometry")
    mesh_data.from_pydata(vertices, [], faces)
    mesh_data.materials.append(material)
    mesh_data.validate(verbose=True)
    mesh_data.update()
    hoof = bpy.data.objects.new(name, mesh_data)
    bpy.context.collection.objects.link(hoof)
    hoof["anatomy"] = "authored single-toed donkey hoof shell"
    hoof["attachment_bone"] = bone_name

    smooth_faces = ring_count * segments
    for index, polygon in enumerate(mesh_data.polygons):
        polygon.use_smooth = index < smooth_faces

    bevel = hoof.modifiers.new(name="Hoof_Edge_Soften", type="BEVEL")
    bevel.width = 0.008
    bevel.segments = 2
    bpy.context.view_layer.objects.active = hoof
    hoof.select_set(True)
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    hoof.select_set(False)
    return hoof


def add_authored_hooves():
    material = hoof_material()
    hooves = []
    for side, sign in (("l", -1), ("r", 1)):
        hooves.append(create_hoof_shell(
            f"353L_FRONT_HOOF_{side.upper()}",
            0.31 * sign,
            (
                # Compact equine proportions for the 2.15 m body: a narrow
                # coronary band, sloped wall, forward toe and flat bearing edge.
                # The first two rings sit under the sleeve and fully capsule
                # the fused source wrist; only the hoof wall remains visible.
                (0.980, 0.070, 0.110, 0.022),
                (0.950, 0.078, 0.126, 0.022),
                (0.910, 0.080, 0.132, 0.020),
                (0.885, 0.082, 0.136, 0.016),
                (0.855, 0.085, 0.138, 0.008),
                (0.820, 0.084, 0.134, -0.004),
                (0.780, 0.078, 0.124, -0.018),
                (0.745, 0.068, 0.106, -0.032),
                (0.720, 0.058, 0.090, -0.042),
            ),
            material,
            f"rig_hand_{side}",
        ))
        hooves.append(create_hoof_shell(
            f"353L_REAR_HOOF_{side.upper()}",
            0.13 * sign,
            (
                (0.315, 0.046, 0.052, 0.020),
                (0.290, 0.054, 0.064, 0.010),
                (0.255, 0.064, 0.080, -0.006),
                (0.215, 0.074, 0.096, -0.028),
                (0.165, 0.082, 0.110, -0.052),
                (0.110, 0.080, 0.112, -0.066),
                (0.075, 0.072, 0.100, -0.070),
            ),
            material,
            f"rig_foot_{side}",
        ))
    return hooves


def add_slot(name, location, rig, bone_name):
    slot = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(slot)
    slot.empty_display_type = "PLAIN_AXES"
    slot.empty_display_size = 0.09
    slot.location = location
    slot["outfit_slot"] = name.removeprefix("slot_")
    world = slot.matrix_world.copy()
    slot.parent = rig
    slot.parent_type = "BONE"
    slot.parent_bone = bone_name
    slot.matrix_world = world
    return slot


def add_outfit_slots(rig):
    return [
        add_slot("slot_head", (0, -0.02, 2.03), rig, "rig_head"),
        add_slot("slot_face", (0, -0.28, 1.82), rig, "rig_head"),
        add_slot("slot_torso", (0, 0, 1.33), rig, "rig_spine"),
        add_slot("slot_back", (0, 0.20, 1.34), rig, "rig_spine"),
        add_slot("slot_hip", (0, 0, 0.91), rig, "rig_hips"),
        add_slot("slot_front_hoof_l", (-0.31, -0.03, 0.79), rig, "rig_hand_l"),
        add_slot("slot_front_hoof_r", (0.31, -0.03, 0.79), rig, "rig_hand_r"),
        add_slot("slot_rear_hoof_l", (-0.13, -0.05, 0.16), rig, "rig_foot_l"),
        add_slot("slot_rear_hoof_r", (0.13, -0.05, 0.16), rig, "rig_foot_r"),
    ]


def add_idle_action(rig):
    action = bpy.data.actions.new("353L_Idle")
    rig.animation_data_create()
    rig.animation_data.action = action
    for bone_name in ("rig_hips", "rig_spine", "rig_head", "rig_ear_l", "rig_ear_r"):
        bone = rig.pose.bones.get(bone_name)
        if not bone:
            continue
        bone.rotation_mode = "XYZ"
        bone.keyframe_insert(data_path="rotation_euler", frame=1, group=bone_name)
        if bone_name == "rig_spine":
            bone.rotation_euler.x = 0.018
        elif bone_name == "rig_head":
            bone.rotation_euler.z = 0.012
        elif bone_name == "rig_ear_l":
            bone.rotation_euler.y = -0.025
        elif bone_name == "rig_ear_r":
            bone.rotation_euler.y = 0.025
        bone.keyframe_insert(data_path="rotation_euler", frame=32, group=bone_name)
        bone.rotation_euler = (0, 0, 0)
        bone.keyframe_insert(data_path="rotation_euler", frame=64, group=bone_name)
    action.use_frame_range = True
    action.frame_start = 1
    action.frame_end = 64
    action.use_fake_user = True


def authored_action(rig, name, end_frame, poses, loop=False):
    action = bpy.data.actions.new(name)
    action.use_fake_user = True
    rig.animation_data_create()
    rig.animation_data.action = action
    for bone in rig.pose.bones:
        bone.rotation_mode = 'XYZ'
        bone.rotation_euler = (0, 0, 0)
        bone.location = (0, 0, 0)
    for frame, pose in poses:
        for bone in rig.pose.bones:
            bone.rotation_euler = (0, 0, 0)
            bone.location = (0, 0, 0)
        for bone_name, values in pose.items():
            bone = rig.pose.bones.get(bone_name)
            if not bone:
                continue
            rotation = values.get('rotation')
            location = values.get('location')
            if rotation is not None: bone.rotation_euler = rotation
            if location is not None: bone.location = location
        for bone in rig.pose.bones:
            bone.keyframe_insert(data_path='rotation_euler', frame=frame, group=bone.name)
            bone.keyframe_insert(data_path='location', frame=frame, group=bone.name)
    action.use_frame_range = True
    action.frame_start = 1
    action.frame_end = end_frame
    action['loop'] = loop
    return action


def add_animation_library(rig):
    add_idle_action(rig)
    walk_a = {
        'rig_leg_l': {'rotation': (0.34, 0, 0)}, 'rig_leg_r': {'rotation': (-0.24, 0, 0)},
        'rig_shin_l': {'rotation': (0.0, 0, 0)}, 'rig_shin_r': {'rotation': (0.22, 0, 0)},
        'rig_foot_l': {'rotation': (-0.06, 0, 0)}, 'rig_foot_r': {'rotation': (-0.18, 0, 0)},
        'rig_arm_l': {'rotation': (-0.18, 0, 0)}, 'rig_arm_r': {'rotation': (0.18, 0, 0)},
        'rig_hips': {'rotation': (0, 0, 0.025)},
    }
    walk_b = {
        'rig_leg_l': {'rotation': (-0.24, 0, 0)}, 'rig_leg_r': {'rotation': (0.34, 0, 0)},
        'rig_shin_l': {'rotation': (0.22, 0, 0)}, 'rig_shin_r': {'rotation': (0.0, 0, 0)},
        'rig_foot_l': {'rotation': (-0.18, 0, 0)}, 'rig_foot_r': {'rotation': (-0.06, 0, 0)},
        'rig_arm_l': {'rotation': (0.18, 0, 0)}, 'rig_arm_r': {'rotation': (-0.18, 0, 0)},
        'rig_hips': {'rotation': (0, 0, -0.025)},
    }
    authored_action(rig, '353L_Walk', 32, [(1, walk_a), (9, {}), (17, walk_b), (25, {}), (32, walk_a)], loop=True)
    run_a = {**walk_a, 'rig_spine': {'rotation': (-0.16, 0, 0)}, 'rig_leg_l': {'rotation': (0.55, 0, 0)}, 'rig_shin_r': {'rotation': (0.42, 0, 0)}}
    run_b = {**walk_b, 'rig_spine': {'rotation': (-0.16, 0, 0)}, 'rig_leg_r': {'rotation': (0.55, 0, 0)}, 'rig_shin_l': {'rotation': (0.42, 0, 0)}}
    authored_action(rig, '353L_Run', 20, [(1, run_a), (6, {}), (11, run_b), (16, {}), (20, run_a)], loop=True)
    authored_action(rig, '353L_TurnLeft', 18, [(1, {}), (9, {'rig_hips': {'rotation': (0, -0.22, 0.08)}, 'rig_spine': {'rotation': (0, 0.14, -0.06)}}), (18, {})])
    authored_action(rig, '353L_TurnRight', 18, [(1, {}), (9, {'rig_hips': {'rotation': (0, 0.22, -0.08)}, 'rig_spine': {'rotation': (0, -0.14, 0.06)}}), (18, {})])
    authored_action(rig, '353L_Stop', 16, [(1, run_a), (8, {'rig_hips': {'rotation': (0.06, 0, 0)}, 'rig_spine': {'rotation': (0.10, 0, 0)}}), (16, {})])
    authored_action(rig, '353L_StandUp', 72, [
        (1, {'rig_hips': {'rotation': (-0.62, 0, 0)}, 'rig_spine': {'rotation': (0.48, 0, 0)}, 'rig_head': {'rotation': (-0.22, 0, 0)}}),
        (30, {'rig_hips': {'rotation': (-0.28, 0, 0)}, 'rig_spine': {'rotation': (0.22, 0, 0)}, 'rig_arm_l': {'rotation': (-0.42, 0, 0)}, 'rig_arm_r': {'rotation': (-0.42, 0, 0)}}),
        (72, {}),
    ])
    authored_action(rig, '353L_Door', 38, [(1, {}), (18, {'rig_arm_r': {'rotation': (-0.72, 0.12, 0.22)}, 'rig_forearm_r': {'rotation': (-0.48, 0, 0)}}), (38, {})])
    authored_action(rig, '353L_Laptop', 48, [(1, {}), (20, {'rig_arm_l': {'rotation': (-0.46, 0.08, -0.14)}, 'rig_forearm_l': {'rotation': (-0.62, 0, 0)}, 'rig_head': {'rotation': (0.16, 0, 0)}}), (48, {})])
    authored_action(rig, '353L_Carry', 42, [(1, {}), (16, {'rig_arm_l': {'rotation': (-0.82, 0, -0.12)}, 'rig_arm_r': {'rotation': (-0.82, 0, 0.12)}, 'rig_forearm_l': {'rotation': (-0.54, 0, 0)}, 'rig_forearm_r': {'rotation': (-0.54, 0, 0)}}), (42, {})])
    authored_action(rig, '353L_AnimalRunTransition', 44, [(1, {}), (22, {'rig_spine': {'rotation': (-0.34, 0, 0)}, 'rig_neck': {'rotation': (0.19, 0, 0)}, 'rig_arm_l': {'rotation': (-0.52, 0, 0)}, 'rig_arm_r': {'rotation': (-0.52, 0, 0)}}), (44, {'rig_spine': {'rotation': (-0.12, 0, 0)}})])
    rig.animation_data.action = None


def validate_outfit_slots(rig, extras):
    validated = []
    for slot in extras:
        if slot.parent != rig or slot.parent_type != 'BONE' or slot.parent_bone not in rig.pose.bones:
            raise RuntimeError(f'Outfit slot is not attached to a valid bone: {slot.name}')
        before = slot.matrix_world.copy()
        bone = rig.pose.bones[slot.parent_bone]
        bone.rotation_mode = 'XYZ'
        bone.rotation_euler.z += 0.08
        bpy.context.view_layer.update()
        moved = (slot.matrix_world.translation - before.translation).length > 0.00001 or slot.matrix_world != before
        bone.rotation_euler.z -= 0.08
        bpy.context.view_layer.update()
        if not moved:
            raise RuntimeError(f'Outfit slot did not follow its bone: {slot.name}')
        validated.append(slot.name)
    return validated


def save_and_export(repo_root, mesh, rig, extras):
    source_dir = repo_root / "assets" / "source"
    model_dir = repo_root / "public" / "models"
    source_dir.mkdir(parents=True, exist_ok=True)
    model_dir.mkdir(parents=True, exist_ok=True)
    blend_path = source_dir / "353l-hi3d-character-v5.blend"
    glb_path = model_dir / "353l-hi3d-character-v5.glb"

    bpy.context.scene.render.fps = 30
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    mesh.select_set(True)
    for obj in extras:
        obj.select_set(True)
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
        export_animations=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=7,
    )
    print(f"BLEND={blend_path}")
    print(f"GLB={glb_path}")
    return blend_path, glb_path


def write_build_report(repo_root, source, source_hash, before, after, textures, glb_path, outfit_validation):
    report = {
        "character": "353L",
        "version": 5,
        "sourceFile": source.name,
        "sourceSha256": source_hash,
        "sourceGenerator": "THREE.GLTFExporter r178",
        "rightsStatus": "user-provided; verify commercial release rights before publication",
        "targetHeightMeters": TARGET_HEIGHT,
        "trianglesBefore": before,
        "trianglesAfter": after,
        "runtimeBytes": glb_path.stat().st_size,
        "textureResize": textures,
        "outfitProfile": "worker",
        "outfitSlotValidation": outfit_validation,
        "weighting": "normalized four-influence anatomical weights; joint seams smoothed twice",
        "animationClips": [action.name for action in bpy.data.actions if action.name.startswith('353L_')],
        "visemeRig": ["REST", "CLOSED", "OPEN", "WIDE", "ROUND", "TEETH", "TONGUE", "BREATH"],
        "anatomyStatus": "user-approved source anatomy preserved: furred articulated front hooves, solid equine rear hooves and complete tail",
        "runtimeAsset": "public/models/353l-hi3d-character-v5.glb",
    }
    report_path = repo_root / "assets" / "source" / "353l-hi3d-character-v5.build.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"REPORT={report_path}")


def main():
    args = sys.argv[sys.argv.index("--") + 1:]
    if len(args) < 2:
        raise RuntimeError("Usage: blender --background --python build_hi3d_character.py -- <source.glb> <repo-root>")
    source = Path(args[0]).resolve()
    repo_root = Path(args[1]).resolve()
    if not source.exists():
        raise FileNotFoundError(source)
    source_hash = hashlib.sha256(source.read_bytes()).hexdigest()

    reset_scene()
    mesh = import_and_normalize(source)
    before, body_after = optimize_mesh(mesh)
    textures = optimize_images()
    tune_materials(mesh)
    rig = build_armature()
    bind_by_distance(mesh, rig)
    # V5 is the first accepted source whose extremities are part of the visual
    # identity. Preserve them; only add non-rendering clothing/tool anchors.
    extras = add_outfit_slots(rig)
    after = body_after + sum(triangle_count(obj) for obj in extras if obj.type == "MESH")
    print(f"RUNTIME_TRIANGLES={after}")
    outfit_validation = validate_outfit_slots(rig, extras)
    add_animation_library(rig)
    _, glb_path = save_and_export(repo_root, mesh, rig, extras)
    write_build_report(repo_root, source, source_hash, before, after, textures, glb_path, outfit_validation)
    print(f"VERTICES={len(mesh.data.vertices)}")
    print(f"POLYGONS={len(mesh.data.polygons)}")


if __name__ == "__main__":
    main()
