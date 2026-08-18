import bpy
import math
import sys
from pathlib import Path
from mathutils import Vector


def clean_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def material(name, color, metallic=0.0, roughness=0.65, emission=None):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    if emission:
        bsdf.inputs['Emission Color'].default_value = (*emission, 1.0)
        bsdf.inputs['Emission Strength'].default_value = 2.0
    return mat


def image_material(name, image_path, roughness=0.72, uv_scale=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = nodes.get('Principled BSDF')
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Specular IOR Level'].default_value = 0.32
    texture = nodes.new('ShaderNodeTexImage')
    texture.image = bpy.data.images.load(str(image_path), check_existing=True)
    texture.interpolation = 'Linear'
    texture.extension = 'REPEAT'
    if uv_scale:
        coordinates = nodes.new('ShaderNodeTexCoord')
        mapping = nodes.new('ShaderNodeMapping')
        mapping.vector_type = 'POINT'
        mapping.inputs['Scale'].default_value = (*uv_scale, 1.0)
        links.new(coordinates.outputs['UV'], mapping.inputs['Vector'])
        links.new(mapping.outputs['Vector'], texture.inputs['Vector'])
    links.new(texture.outputs['Color'], bsdf.inputs['Base Color'])
    return mat


def apply_material(obj, mat):
    if len(obj.data.materials):
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def smooth(obj):
    if hasattr(obj.data, 'polygons'):
        for polygon in obj.data.polygons:
            polygon.use_smooth = True


def bevel(obj, width=0.08, segments=3):
    modifier = obj.modifiers.new(name='soft_edges', type='BEVEL')
    modifier.width = width
    modifier.segments = segments
    modifier.limit_method = 'ANGLE'


def box(name, location, dimensions, mat, parent=None, bevel_width=0.05, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel_width:
        bevel(obj, min(bevel_width, min(dimensions) * 0.22), 3)
    apply_material(obj, mat)
    if parent:
        world = obj.matrix_world.copy()
        obj.parent = parent
        obj.matrix_world = world
    return obj


def sphere(name, location, scale, mat, parent=None, segments=32, rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    smooth(obj)
    apply_material(obj, mat)
    if parent:
        world = obj.matrix_world.copy()
        obj.parent = parent
        obj.matrix_world = world
    return obj


def cylinder(name, location, radius, depth, mat, parent=None, vertices=24, rotation=(0, 0, 0), radius_top=None):
    if radius_top is None or abs(radius_top - radius) < 0.0001:
        bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=radius_top, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    bevel(obj, min(radius * 0.18, 0.07), 3)
    smooth(obj)
    apply_material(obj, mat)
    if parent:
        world = obj.matrix_world.copy()
        obj.parent = parent
        obj.matrix_world = world
    return obj


def empty(name, location=(0, 0, 0), parent=None):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.empty_display_type = 'PLAIN_AXES'
    obj.empty_display_size = 0.15
    obj.location = location
    if parent:
        obj.parent = parent
    return obj


def merge_static(prefix, merged_name):
    """Bake modifiers and batch repeated non-interactive detail meshes."""
    objects = [
        obj for obj in bpy.context.scene.objects
        if obj.type == 'MESH' and obj.name.startswith(prefix)
    ]
    if len(objects) < 2:
        return objects[0] if objects else None

    for obj in objects:
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        for modifier in list(obj.modifiers):
            bpy.ops.object.modifier_apply(modifier=modifier.name)

    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    objects[0].name = merged_name
    return objects[0]


def text_mesh(name, body, location, size, mat, parent=None, rotation=(0, 0, 0), extrude=0.012):
    curve = bpy.data.curves.new(f'{name}_curve', type='FONT')
    curve.body = body
    curve.align_x = 'CENTER'
    curve.align_y = 'CENTER'
    curve.size = size
    curve.extrude = extrude
    curve.bevel_depth = max(0.002, extrude * 0.22)
    curve.resolution_u = 3
    curve.bevel_resolution = 1
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = rotation
    apply_material(obj, mat)
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target='MESH')
    obj = bpy.context.view_layer.objects.active
    # glTF's Y-up conversion otherwise exposes the extruded font's mirrored back
    # from the street-facing camera side. Bake one local horizontal correction.
    obj.scale.x = -1
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if parent:
        world_matrix = obj.matrix_world.copy()
        obj.parent = parent
        obj.matrix_world = world_matrix
    return obj


def ear_mesh(name, location, side, mat, parent):
    width = 0.2
    depth = 0.13
    height = 1.05
    verts = [
        (-width, -depth, 0), (width, -depth, 0), (width, depth, 0), (-width, depth, 0),
        (-width * 0.52, -depth * 0.68, height * 0.78), (width * 0.52, -depth * 0.68, height * 0.78),
        (width * 0.52, depth * 0.68, height * 0.78), (-width * 0.52, depth * 0.68, height * 0.78),
        (0, 0, height),
    ]
    faces = [
        (0, 1, 2, 3), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0),
        (4, 7, 8), (7, 6, 8), (6, 5, 8), (5, 4, 8),
    ]
    mesh = bpy.data.meshes.new(f'{name}_mesh')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler[1] = side * math.radians(7)
    obj.rotation_euler[2] = side * math.radians(6)
    bevel(obj, 0.07, 4)
    smooth(obj)
    apply_material(obj, mat)
    obj.parent = parent
    return obj


def build_character(mats):
    root = empty('CHARACTER_353L_ROOT', (-1.1, -0.7, 0))
    root['character_id'] = '353L'
    root['canon'] = 'adult_humanoid_donkey_petrol_jacket_orange_patch'

    hips = empty('rig_hips', (0, 0, 1.02), root)
    spine = empty('rig_spine', (0, 0, 0.38), hips)
    neck = empty('rig_neck', (0, 0, 0.93), spine)
    head_pivot = empty('rig_head', (0, -0.01, 0.34), neck)

    sphere('char_hips', (-1.1, -0.7, 1.08), (0.53, 0.38, 0.5), mats['trousers'], hips)
    cylinder('char_jacket_torso', (-1.1, -0.7, 1.75), 0.62, 1.36, mats['jacket'], spine, 32, radius_top=0.48)
    cylinder('char_neck', (-1.1, -0.7, 2.48), 0.25, 0.48, mats['fur'], neck, 28)
    sphere('char_head', (-1.1, -0.71, 2.91), (0.46, 0.48, 0.62), mats['fur'], head_pivot)
    sphere('char_muzzle', (-1.1, -1.14, 2.73), (0.38, 0.52, 0.29), mats['muzzle'], head_pivot)
    sphere('char_eye_l', (-1.31, -1.12, 3.03), (0.07, 0.045, 0.075), mats['eye'], head_pivot, 20, 12)
    sphere('char_eye_r', (-0.89, -1.12, 3.03), (0.07, 0.045, 0.075), mats['eye'], head_pivot, 20, 12)
    sphere('char_eye_glint_l', (-1.326, -1.159, 3.055), (0.018, 0.012, 0.018), mats['glint'], head_pivot, 12, 8)
    sphere('char_eye_glint_r', (-0.906, -1.159, 3.055), (0.018, 0.012, 0.018), mats['glint'], head_pivot, 12, 8)
    sphere('char_nostril_l', (-1.25, -1.61, 2.76), (0.045, 0.025, 0.035), mats['hoof'], head_pivot, 16, 10)
    sphere('char_nostril_r', (-0.95, -1.61, 2.76), (0.045, 0.025, 0.035), mats['hoof'], head_pivot, 16, 10)
    ear_mesh('rig_ear_l', (-1.34, -0.72, 3.36), -1, mats['fur'], head_pivot)
    ear_mesh('rig_ear_r', (-0.86, -0.72, 3.36), 1, mats['fur'], head_pivot)

    belt = box('char_belt', (-1.1, -1.055, 1.22), (1.05, 0.13, 0.16), mats['leather'], hips, 0.035)
    box('char_buckle', (-1.1, -1.14, 1.22), (0.24, 0.08, 0.2), mats['metal'], hips, 0.025)
    box('char_device', (-0.62, -1.12, 1.23), (0.28, 0.18, 0.38), mats['device'], hips, 0.045)
    box('char_patch', (-1.57, -1.08, 2.02), (0.22, 0.055, 0.31), mats['orange'], spine, 0.025)
    box('char_lapel_l', (-1.27, -1.22, 2.02), (0.22, 0.05, 0.54), mats['jacket_dark'], spine, 0.02, rotation=(0, math.radians(-12), math.radians(-8)))
    box('char_lapel_r', (-0.93, -1.22, 2.02), (0.22, 0.05, 0.54), mats['jacket_dark'], spine, 0.02, rotation=(0, math.radians(12), math.radians(8)))

    for side, sx in [('l', -1), ('r', 1)]:
        x = -1.1 + sx * 0.62
        arm = empty(f'rig_arm_{side}', (sx * 0.62, -0.03, 0.8), spine)
        forearm = empty(f'rig_forearm_{side}', (0, 0, -0.61), arm)
        cylinder(f'char_upperarm_{side}', (x, -0.73, 1.77), 0.17, 0.85, mats['jacket'], arm, 24)
        cylinder(f'char_forearm_{side}', (x, -0.73, 1.12), 0.145, 0.66, mats['fur'], forearm, 24, radius_top=0.12)
        sphere(f'char_forehoof_{side}', (x, -0.79, 0.75), (0.2, 0.23, 0.23), mats['hoof'], forearm, 24, 16)
        # A fine center groove makes the forehoof read as a hoof rather than a hand.
        box(f'char_hoof_groove_{side}', (x, -1.015, 0.75), (0.026, 0.025, 0.22), mats['hoof_groove'], forearm, 0.005)

        leg = empty(f'rig_leg_{side}', (sx * 0.28, 0, 0), hips)
        shin = empty(f'rig_shin_{side}', (0, 0, -0.57), leg)
        cylinder(f'char_thigh_{side}', (-1.1 + sx * 0.28, -0.7, 0.76), 0.21, 0.76, mats['trousers'], leg, 24, radius_top=0.18)
        cylinder(f'char_shin_{side}', (-1.1 + sx * 0.28, -0.7, 0.28), 0.18, 0.54, mats['trousers'], shin, 24, radius_top=0.15)
        box(f'char_boot_{side}', (-1.1 + sx * 0.28, -0.82, 0.10), (0.43, 0.68, 0.28), mats['boot'], shin, 0.09)

    tail_pivot = empty('rig_tail', (0, 0.34, 0.16), hips)
    cylinder('char_tail', (-1.1, -0.35, 1.05), 0.055, 0.72, mats['fur'], tail_pivot, 16, rotation=(math.radians(62), 0, 0), radius_top=0.035)
    sphere('char_tail_tip', (-1.1, -0.03, 0.78), (0.12, 0.14, 0.18), mats['fur_dark'], tail_pivot, 20, 12)
    return root


def build_level(mats):
    world = empty('WORLD_ROOT')

    # Apartment: a generous but believable first flat. The camera-facing wall stays open.
    # The right-hand door remains at x=4.45 so the connected world and triggers stay stable.
    box('room_floor', (-0.65, 0, -0.11), (10.3, 9.6, 0.22), mats['wood'], world, 0.03)
    box('room_wall_back', (-0.65, 4.8, 2.0), (10.3, 0.22, 4.0), mats['plaster'], world, 0.04)
    box('room_wall_left', (-5.8, 0, 2.0), (0.22, 9.6, 4.0), mats['plaster'], world, 0.04)
    # The fourth wall is intentionally open: this is a playable cinematic set, and a solid
    # camera-side wall would cut between 353L and the player while crossing the room.
    box('room_wall_door_a', (4.45, 2.82, 2.0), (0.2, 3.96, 4.0), mats['plaster'], world, 0.03)
    box('room_wall_door_b', (4.45, -2.82, 2.0), (0.2, 3.96, 4.0), mats['plaster'], world, 0.03)

    # Narrow floorboards, skirting and a quiet rug replace the large blockout floor plane.
    for index, x in enumerate((-5.40, -4.66, -3.92, -3.18, -2.44, -1.70, -0.96, -0.22, 0.52, 1.26, 2.00, 2.74, 3.48, 4.22)):
        box(f'room_floorboard_{index}', (x, 0, 0.018), (0.70, 9.38, 0.036), mats['wood_alt' if index % 3 == 1 else 'wood'], world, 0.012)
    box('room_skirting_back', (-0.65, 4.62, 0.13), (10.05, 0.13, 0.25), mats['paint'], world, 0.018)
    box('room_skirting_left', (-5.63, 0, 0.13), (0.13, 9.25, 0.25), mats['paint'], world, 0.018)
    box('room_rug', (-3.00, -1.35, 0.055), (4.15, 4.35, 0.07), mats['rug'], world, 0.035, rotation=(0, 0, math.radians(-2)))

    box('bed_platform', (-3.10, -1.55, 0.18), (2.74, 3.48, 0.28), mats['bed_frame'], world, 0.08)
    box('mattress', (-3.10, -1.55, 0.43), (2.54, 3.28, 0.34), mats['linen'], world, 0.14)
    box('blanket', (-3.05, -1.37, 0.64), (2.36, 2.18, 0.14), mats['blanket'], world, 0.075, rotation=(0, 0, math.radians(2)))
    box('blanket_fold', (-3.05, -0.45, 0.75), (2.36, 0.34, 0.12), mats['blanket_alt'], world, 0.055, rotation=(0, 0, math.radians(2)))
    box('pillow', (-3.05, -2.63, 0.70), (1.42, 0.73, 0.23), mats['pillow'], world, 0.12)

    # One small bedside piece, one lamp and a book: readable, but not cluttered.
    box('bedside_body', (-1.02, -2.55, 0.39), (0.82, 0.72, 0.76), mats['bed_frame'], world, 0.07)
    box('bedside_drawer', (-1.02, -2.92, 0.49), (0.66, 0.035, 0.25), mats['desk'], world, 0.018)
    cylinder('bedside_lamp_stem', (-1.02, -2.55, 1.02), 0.035, 0.52, mats['metal'], world, 16)
    cylinder('bedside_lamp_shade', (-1.02, -2.55, 1.34), 0.25, 0.34, mats['lamp_shade'], world, 28, radius_top=0.13)
    box('bedside_book', (-0.79, -2.50, 0.83), (0.34, 0.46, 0.055), mats['orange'], world, 0.016, rotation=(0, 0, math.radians(-8)))

    box('desk_top', (-3.15, 3.36, 1.04), (2.45, 1.05, 0.16), mats['desk'], world, 0.05)
    for x in (-4.13, -2.17):
        for y in (2.99, 3.73):
            box(f'desk_leg_{x}_{y}', (x, y, 0.52), (0.12, 0.12, 1.04), mats['desk'], world, 0.025)
    box('connection_base', (-3.15, 3.29, 1.18), (1.08, 0.72, 0.1), mats['device'], world, 0.04)
    screen = box('connection_screen', (-3.15, 3.62, 1.55), (1.08, 0.08, 0.66), mats['screen'], world, 0.04, rotation=(math.radians(-8), 0, 0))
    screen['interaction'] = 'connection'
    cylinder('hoof_button', (-2.41, 2.98, 1.2), 0.24, 0.12, mats['orange'], world, 28, rotation=(math.radians(90), 0, 0))
    box('rain_window', (0.65, 4.68, 2.25), (3.2, 0.06, 1.72), mats['window'], world, 0.03)

    # Proper window casing, sill and radiator make the apartment feel constructed.
    box('window_frame_left', (-1.02, 4.53, 2.25), (0.12, 0.18, 1.96), mats['paint'], world, 0.018)
    box('window_frame_right', (2.32, 4.53, 2.25), (0.12, 0.18, 1.96), mats['paint'], world, 0.018)
    box('window_frame_top', (0.65, 4.53, 3.20), (3.46, 0.18, 0.12), mats['paint'], world, 0.018)
    box('window_frame_bottom', (0.65, 4.53, 1.31), (3.46, 0.18, 0.12), mats['paint'], world, 0.018)
    box('window_mullion', (0.65, 4.50, 2.25), (0.075, 0.16, 1.80), mats['paint'], world, 0.014)
    box('window_sill', (0.65, 4.35, 1.25), (3.66, 0.42, 0.13), mats['paint'], world, 0.025)
    for index, x in enumerate((-0.72, -0.38, -0.04, 0.30, 0.64, 0.98, 1.32, 1.66, 2.00)):
        box(f'radiator_fin_{index}', (x, 4.35, 0.66), (0.18, 0.18, 0.78), mats['radiator'], world, 0.045)
    box('radiator_pipe', (2.28, 4.35, 0.34), (0.10, 0.10, 0.62), mats['radiator'], world, 0.03)

    # Minimal wall graphic and closed storage keep the room intentional and clean.
    box('wall_print_frame', (-5.64, 1.25, 2.32), (0.08, 1.42, 1.08), mats['metal_dark'], world, 0.025)
    box('wall_print_paper', (-5.58, 1.25, 2.32), (0.025, 1.24, 0.90), mats['paper'], world, 0.008)
    box('wall_print_signal', (-5.555, 1.25, 2.32), (0.018, 0.16, 0.62), mats['orange'], world, 0.004, rotation=(math.radians(18), 0, 0))
    box('storage_body', (3.45, 3.50, 0.92), (1.38, 1.02, 1.84), mats['storage'], world, 0.075)
    box('storage_door_l', (3.10, 2.97, 0.94), (0.56, 0.035, 1.54), mats['storage_front'], world, 0.022)
    box('storage_door_r', (3.80, 2.97, 0.94), (0.56, 0.035, 1.54), mats['storage_front'], world, 0.022)
    cylinder('storage_handle_l', (3.32, 2.93, 0.96), 0.025, 0.18, mats['metal'], world, 12, rotation=(math.radians(90), 0, 0))
    cylinder('storage_handle_r', (3.58, 2.93, 0.96), 0.025, 0.18, mats['metal'], world, 12, rotation=(math.radians(90), 0, 0))

    door_pivot = empty('door_pivot', (4.42, -0.82, 0), world)
    door = box('apartment_door', (4.32, 0, 1.38), (0.18, 1.65, 2.76), mats['door'], door_pivot, 0.05)
    door['interaction'] = 'door'
    box('door_handle', (4.15, -0.55, 1.32), (0.18, 0.38, 0.10), mats['metal'], door_pivot, 0.035)
    box('apartment_door_frame_top', (4.24, 0, 2.86), (0.26, 2.06, 0.18), mats['hall_trim'], world, 0.025)
    box('apartment_door_frame_a', (4.24, 0.96, 1.46), (0.26, 0.16, 2.98), mats['hall_trim'], world, 0.025)
    box('apartment_door_frame_b', (4.24, -0.96, 1.46), (0.26, 0.16, 2.98), mats['hall_trim'], world, 0.025)

    # Connected hall and exterior: no loading cut or fake background.
    box('hall_floor', (8.0, 0, -0.10), (7.0, 3.2, 0.2), mats['hall_floor'], world, 0.02)
    box('hall_wall_a', (8.0, 1.62, 1.65), (7.0, 0.18, 3.3), mats['plaster_dark'], world, 0.03)
    box('hall_wall_b', (8.0, -1.62, 1.65), (7.0, 0.18, 3.3), mats['plaster_dark'], world, 0.03)
    for side, y in (('a', 1.49), ('b', -1.49)):
        box(f'hall_wainscot_{side}', (8.0, y, 0.72), (7.0, 0.12, 1.42), mats['hall_wainscot'], world, 0.025)
        box(f'hall_dado_{side}', (8.0, y - (0.04 if y > 0 else -0.04), 1.47), (7.0, 0.13, 0.11), mats['hall_trim'], world, 0.02)
        box(f'hall_baseboard_{side}', (8.0, y - (0.05 if y > 0 else -0.05), 0.13), (7.0, 0.14, 0.24), mats['hall_trim'], world, 0.025)
        for door_index, x in enumerate((6.25, 9.25)):
            inset = 0.07 if y > 0 else -0.07
            facing = 0.13 if y > 0 else -0.13
            box(f'hall_door_{side}_{door_index}', (x, y - inset, 1.18), (1.02, 0.10, 2.30), mats['hall_door'], world, 0.055)
            box(f'hall_door_panel_{side}_{door_index}', (x, y - facing, 1.20), (0.72, 0.035, 1.58), mats['hall_door_panel'], world, 0.035)
            box(f'hall_frame_top_{side}_{door_index}', (x, y - facing, 2.44), (1.26, 0.12, 0.14), mats['hall_trim'], world, 0.022)
            for frame_side, dx in (('l', -0.58), ('r', 0.58)):
                box(f'hall_frame_{frame_side}_{side}_{door_index}', (x + dx, y - facing, 1.22), (0.14, 0.12, 2.58), mats['hall_trim'], world, 0.022)
            sphere(f'hall_knob_{side}_{door_index}', (x + 0.34, y - (0.22 if y > 0 else -0.22), 1.12), (0.065, 0.055, 0.065), mats['brass'], world, 18, 10)
            box(f'hall_light_slit_{side}_{door_index}', (x, y - (0.205 if y > 0 else -0.205), 0.055), (0.78, 0.025, 0.025), mats['light_slit'], world, 0.006)

    for row in range(2):
        for col in range(3):
            x = 4.95 + col * 0.46
            z = 1.12 + row * 0.42
            box(f'hall_mailbox_{row}_{col}', (x, 1.37, z), (0.40, 0.18, 0.34), mats['mailbox'], world, 0.035)
            box(f'hall_mail_slot_{row}_{col}', (x, 1.265, z + 0.07), (0.25, 0.015, 0.025), mats['brass'], world, 0.004)

    for index, x in enumerate((5.35, 7.25, 9.15, 11.05)):
        box(f'hall_ceiling_rib_{index}', (x, 0, 3.10), (0.14, 3.02, 0.14), mats['hall_trim'], world, 0.025)
    for index, (x, y) in enumerate(((7.65, 1.36), (10.35, -1.36))):
        box(f'hall_sconce_plate_{index}', (x, y, 2.08), (0.32, 0.10, 0.42), mats['brass'], world, 0.04)
        sphere(f'hall_sconce_bulb_{index}', (x, y - (0.16 if y > 0 else -0.16), 2.12), (0.14, 0.12, 0.18), mats['lamp'], world, 20, 12)
    box('hall_threshold_top', (11.42, 0, 3.00), (0.30, 3.12, 0.24), mats['hall_trim'], world, 0.035)
    box('hall_threshold_a', (11.42, 1.48, 1.48), (0.30, 0.24, 3.00), mats['hall_trim'], world, 0.035)
    box('hall_threshold_b', (11.42, -1.48, 1.48), (0.30, 0.24, 3.00), mats['hall_trim'], world, 0.035)
    # The first exterior beat: a sheltered, constructed threshold instead of an empty slab.
    box('harbor_ground', (30, 0, -0.16), (42, 30, 0.28), mats['asphalt'], world, 0.02)
    box('awning_apron', (13.2, -0.25, 0.015), (7.2, 5.5, 0.07), mats['paver'], world, 0.025)
    box('awning', (12.0, 0, 3.2), (5.2, 5.2, 0.18), mats['awning_roof'], world, 0.04)
    box('awning_underside', (12.0, 0, 3.08), (4.92, 4.92, 0.08), mats['awning_underside'], world, 0.025)
    for index, y in enumerate((-2.38, -2.04, -1.70, -1.36, -1.02, -0.68, -0.34, 0, 0.34, 0.68, 1.02, 1.36, 1.70, 2.04, 2.38)):
        box(f'awning_roof_rib_{index}', (12.0, y, 3.33), (5.0, 0.055, 0.075), mats['awning_trim'], world, 0.014)
    box('awning_beam_front', (12.0, -2.22, 2.94), (5.0, 0.16, 0.22), mats['awning_trim'], world, 0.03)
    box('awning_beam_back', (12.0, 2.22, 2.94), (5.0, 0.16, 0.22), mats['awning_trim'], world, 0.03)
    box('awning_gutter', (12.0, -2.58, 3.14), (5.25, 0.16, 0.20), mats['drain'], world, 0.045)
    cylinder('awning_downpipe', (14.48, -2.58, 1.55), 0.075, 3.10, mats['drain'], world, 18)
    for x in (10.0, 14.0):
        for y in (-2.0, 2.0):
            cylinder(f'awning_post_{x}_{y}', (x, y, 1.55), 0.12, 3.1, mats['awning_trim'], world, 18)
            cylinder(f'awning_post_base_{x}_{y}', (x, y, 0.10), 0.23, 0.20, mats['metal_dark'], world, 20)
    for index, x in enumerate((10.85, 13.15)):
        cylinder(f'awning_lamp_mount_{index}', (x, 0, 2.88), 0.035, 0.32, mats['metal_dark'], world, 14)
        # Small industrial pendants keep the sheltered exit readable without
        # filling the camera with oversized glowing spheres.
        cylinder(
            f'awning_lamp_shade_{index}',
            (x, 0, 2.75),
            0.22,
            0.16,
            mats['metal_dark'],
            world,
            20,
            radius_top=0.075,
        )
        sphere(f'awning_lamp_{index}', (x, 0, 2.66), (0.085, 0.085, 0.07), mats['lamp'], world, 18, 10)

    # Drainage and curb language visually explain where the dry route continues.
    box('harbor_drain_channel', (17.2, 2.42, 0.018), (10.4, 0.34, 0.055), mats['drain'], world, 0.018)
    for index, x in enumerate((12.4, 13.2, 14.0, 14.8, 15.6, 16.4, 17.2, 18.0, 18.8, 19.6, 20.4, 21.2)):
        box(f'harbor_drain_grate_{index}', (x, 2.42, 0.055), (0.055, 0.27, 0.035), mats['metal'], world, 0.008)
    box('harbor_walkway_curb', (17.2, 2.72, 0.13), (10.4, 0.22, 0.26), mats['curb'], world, 0.035)

    # Brick facade with readable depth and a warm exit.
    box('facade', (11.0, 5.0, 3.5), (7.5, 0.5, 7.0), mats['brick'], world, 0.05)
    for row in range(13):
        for col in range(11):
            offset = 0.31 if row % 2 else 0
            x = 7.45 + col * 0.66 + offset
            box(f'brick_{row}_{col}', (x, 4.72, 0.24 + row * 0.51), (0.58, 0.08, 0.27), mats['brick_alt' if (row + col) % 3 else 'brick'], world, 0.014)

    # A maintenance door and warm workshop windows give the building a lived-in face.
    box('facade_service_door', (9.0, 4.58, 1.37), (1.22, 0.15, 2.74), mats['hall_door'], world, 0.055)
    box('facade_service_frame_top', (9.0, 4.48, 2.82), (1.52, 0.14, 0.17), mats['hall_trim'], world, 0.025)
    box('facade_service_frame_l', (8.32, 4.48, 1.42), (0.16, 0.14, 2.94), mats['hall_trim'], world, 0.025)
    box('facade_service_frame_r', (9.68, 4.48, 1.42), (0.16, 0.14, 2.94), mats['hall_trim'], world, 0.025)
    sphere('facade_service_knob', (9.38, 4.38, 1.25), (0.07, 0.055, 0.07), mats['brass'], world, 18, 10)
    for window_index, x in enumerate((11.35, 13.35)):
        box(f'facade_window_{window_index}', (x, 4.57, 1.92), (1.52, 0.12, 1.68), mats['warm_glass'], world, 0.035)
        box(f'facade_window_top_{window_index}', (x, 4.45, 2.82), (1.78, 0.14, 0.15), mats['hall_trim'], world, 0.022)
        box(f'facade_window_bottom_{window_index}', (x, 4.39, 1.04), (1.82, 0.32, 0.16), mats['curb'], world, 0.028)
        box(f'facade_window_l_{window_index}', (x - 0.84, 4.45, 1.92), (0.14, 0.14, 1.88), mats['hall_trim'], world, 0.022)
        box(f'facade_window_r_{window_index}', (x + 0.84, 4.45, 1.92), (0.14, 0.14, 1.88), mats['hall_trim'], world, 0.022)
        box(f'facade_window_mullion_{window_index}', (x, 4.42, 1.92), (0.09, 0.12, 1.68), mats['hall_trim'], world, 0.016)
    box('facade_pier_lightbox', (11.35, 4.48, 3.58), (3.25, 0.16, 0.70), mats['kiosk_lightbox'], world, 0.055)
    text_mesh(
        'facade_pier_label',
        'PIER 17',
        (11.35, 4.365, 3.58),
        0.42,
        mats['metal_dark'],
        world,
        rotation=(math.radians(-90), 0, 0),
        extrude=0.016,
    )

    # Kiosk, cart and working harbor.
    box('kiosk_body', (23, -7.2, 1.65), (5.2, 4.2, 3.3), mats['kiosk'], world, 0.12)
    box('kiosk_roof', (23, -7.2, 3.45), (5.8, 4.8, 0.22), mats['awning_roof'], world, 0.08)
    box('kiosk_roof_fascia', (23, -4.76, 3.40), (5.82, 0.18, 0.44), mats['kiosk_frame'], world, 0.035)
    box('kiosk_window', (23, -5.06, 2.0), (3.15, 0.08, 1.45), mats['warm_glass'], world, 0.025)
    box('kiosk_window_top', (23, -4.92, 2.82), (3.52, 0.18, 0.16), mats['kiosk_frame'], world, 0.025)
    box('kiosk_window_bottom', (23, -4.78, 1.18), (3.62, 0.54, 0.18), mats['kiosk_counter'], world, 0.045)
    box('kiosk_window_l', (21.36, -4.92, 2.0), (0.16, 0.18, 1.70), mats['kiosk_frame'], world, 0.025)
    box('kiosk_window_r', (24.64, -4.92, 2.0), (0.16, 0.18, 1.70), mats['kiosk_frame'], world, 0.025)
    box('kiosk_window_mullion', (23, -4.88, 2.0), (0.10, 0.15, 1.45), mats['kiosk_frame'], world, 0.018)
    box('kiosk_lightbox', (23, -4.66, 3.15), (3.72, 0.12, 0.52), mats['kiosk_lightbox'], world, 0.045)
    text_mesh(
        'kiosk_name_label',
        'NACHTKIOSK',
        (23, -4.585, 3.15),
        0.28,
        mats['metal_dark'],
        world,
        rotation=(math.radians(90), 0, 0),
        extrude=0.012,
    )
    for paper_index, x in enumerate((21.92, 22.28, 23.72, 24.08)):
        box(f'kiosk_paper_{paper_index}', (x, -4.69, 1.76 + (paper_index % 2) * 0.38), (0.25, 0.035, 0.30), mats['paper' if paper_index % 2 else 'orange'], world, 0.012, rotation=(0, 0, math.radians(-3 + paper_index * 2)))
    box('kiosk_side_door', (25.62, -7.55, 1.38), (0.12, 1.22, 2.76), mats['hall_door'], world, 0.05)
    box('kiosk_side_handle', (25.72, -7.16, 1.28), (0.12, 0.28, 0.09), mats['brass'], world, 0.025)

    # Newspaper rack and waste sorting make the kiosk foreground readable from gameplay distance.
    box('kiosk_rack_body', (20.65, -4.82, 0.78), (0.90, 0.50, 1.50), mats['kiosk_frame'], world, 0.055)
    for shelf_index, z in enumerate((0.45, 0.78, 1.11)):
        box(f'kiosk_rack_shelf_{shelf_index}', (20.65, -4.53, z), (0.76, 0.08, 0.24), mats['paper' if shelf_index != 1 else 'orange'], world, 0.015, rotation=(math.radians(9), 0, 0))
    for bin_index, (x, color) in enumerate(((25.35, 'container_blue'), (26.05, 'container_orange'))):
        box(f'kiosk_bin_{bin_index}', (x, -4.90, 0.57), (0.58, 0.66, 1.12), mats[color], world, 0.09)
        box(f'kiosk_bin_lid_{bin_index}', (x, -4.90, 1.16), (0.62, 0.70, 0.14), mats['metal_dark'], world, 0.045)
    cart_root = empty('cart_root', (19, -3.1, 0), world)
    cart = box('return_cart', (19, -3.1, 0.62), (1.65, 0.9, 0.18), mats['metal'], cart_root, 0.04)
    cart['interaction'] = 'cart'
    for crate_index, (x, z) in enumerate(((18.68, 0.96), (19.12, 0.96), (18.90, 1.34))):
        box(f'return_crate_{crate_index}', (x, -3.1, z), (0.40, 0.68, 0.36), mats['crate_wood' if crate_index != 2 else 'orange'], cart_root, 0.05)
    for rail_index, x in enumerate((18.18, 19.82)):
        cylinder(f'cart_side_rail_{rail_index}', (x, -3.1, 1.10), 0.035, 1.18, mats['metal'], cart_root, 12)
    cylinder('cart_handle', (18.10, -3.1, 1.55), 0.045, 0.82, mats['metal'], cart_root, 14, rotation=(0, math.radians(90), 0))
    for x in (-0.62, 0.62):
        for y in (-0.34, 0.34):
            cylinder(f'cart_wheel_{x}_{y}', (19 + x, -3.1 + y, 0.38), 0.19, 0.13, mats['rubber'], cart_root, 18, rotation=(math.radians(90), 0, 0))

    # Station and Signalwerk are already real geometry in the same navigable world.
    box('station_shell', (39, 4.5, 2.25), (6.0, 8.5, 4.5), mats['station'], world, 0.15)
    box('station_roof_cap', (39, 4.5, 4.64), (6.55, 9.02, 0.28), mats['awning_roof'], world, 0.08)
    box('station_entry', (35.92, 4.5, 1.5), (0.10, 2.2, 2.5), mats['window'], world, 0.03)
    box('station_entry_canopy', (35.45, 4.5, 3.02), (1.08, 3.45, 0.20), mats['awning_roof'], world, 0.055)
    box('station_entry_lightbox', (35.34, 4.5, 3.48), (0.10, 2.28, 0.42), mats['kiosk_lightbox'], world, 0.035)
    for post_index, y in enumerate((3.15, 5.85)):
        cylinder(f'station_canopy_post_{post_index}', (35.18, y, 1.48), 0.075, 2.96, mats['awning_trim'], world, 16)
    for mullion_index, y in enumerate((3.58, 4.50, 5.42)):
        box(f'station_glass_mullion_{mullion_index}', (35.82, y, 1.53), (0.12, 0.09, 2.62), mats['station_trim'], world, 0.018)
    for panel_index, z in enumerate((0.46, 1.38, 2.30, 3.22, 4.14)):
        box(f'station_cladding_band_{panel_index}', (36.02, 1.10, z), (0.12, 2.30, 0.12), mats['station_trim'], world, 0.018)
    station_marker = empty('interaction_station', (35.5, 4.5, 0), world)
    station_marker['interaction'] = 'station'
    box('signalwerk_shell', (31.5, 11.0, 2.25), (8.0, 6.5, 4.5), mats['signalwerk'], world, 0.15)
    box('signalwerk_roof_cap', (31.5, 11.0, 4.64), (8.50, 7.02, 0.28), mats['station_trim'], world, 0.08)
    box('signalwerk_entry', (27.42, 11.0, 1.55), (0.10, 2.1, 2.6), mats['warm_glass'], world, 0.03)
    box('signalwerk_entry_frame_top', (27.32, 11.0, 3.03), (0.13, 2.48, 0.18), mats['awning_trim'], world, 0.025)
    for frame_index, y in enumerate((9.86, 12.14)):
        box(f'signalwerk_entry_frame_{frame_index}', (27.32, y, 1.54), (0.13, 0.16, 3.10), mats['awning_trim'], world, 0.025)
    for strip_index, y in enumerate((8.25, 9.15, 12.85, 13.75)):
        box(f'signalwerk_vertical_strip_{strip_index}', (27.38, y, 2.25), (0.14, 0.16, 4.05), mats['station_trim'], world, 0.024)
    box('signalwerk_signal_panel', (27.30, 8.95, 3.42), (0.12, 1.16, 0.58), mats['screen'], world, 0.025)
    signal_marker = empty('interaction_signalwerk', (27.0, 11.0, 0), world)
    signal_marker['interaction'] = 'signalwerk'

    # Tall practical lights establish human scale and pull the eye through the wet yard.
    for light_index, (x, y) in enumerate(((15.0, -1.2), (24.5, 2.8), (31.0, -4.0))):
        cylinder(f'harbor_light_post_{light_index}', (x, y, 2.55), 0.065, 5.10, mats['metal_dark'], world, 16)
        box(f'harbor_light_arm_{light_index}', (x + 0.28, y, 5.04), (0.62, 0.10, 0.10), mats['metal_dark'], world, 0.025)
        box(f'harbor_light_head_{light_index}', (x + 0.57, y, 4.94), (0.42, 0.24, 0.18), mats['lamp_shade'], world, 0.045)

    # Harbor water, bollards and two sculptural cranes.
    box('harbor_water', (30, -18.0, -0.28), (52, 8.0, 0.18), mats['water'], world, 0.01)
    box('dock_edge_curb', (30, -13.72, 0.16), (42, 0.38, 0.32), mats['curb'], world, 0.045)
    box('dock_safety_line', (30, -13.35, 0.025), (42, 0.10, 0.035), mats['marking'], world, 0.008)
    for x in range(15, 48, 4):
        cylinder(f'bollard_{x}', (x, -13.0, 0.32), 0.16, 0.64, mats['metal_dark'], world, 18)
        cylinder(f'bollard_cap_{x}', (x, -13.0, 0.68), 0.21, 0.14, mats['metal_dark'], world, 18)
    for index, x in enumerate((24, 34)):
        for leg_index, (dx, dy) in enumerate(((-0.72, -0.62), (0.72, -0.62), (-0.72, 0.62), (0.72, 0.62))):
            cylinder(f'crane_leg_{index}_{leg_index}', (x + dx, -16.0 + dy, 4.35), 0.16, 8.7, mats['crane'], world, 16)
        for brace_index, z in enumerate((1.8, 3.5, 5.2, 6.9)):
            box(f'crane_crossbar_{index}_{brace_index}', (x, -16.0, z), (1.72, 1.55, 0.14), mats['crane'], world, 0.035)
        box(f'crane_cab_{index}', (x + 0.48, -16.0, 7.65), (1.35, 1.18, 1.25), mats['crane_cab'], world, 0.10)
        box(f'crane_cab_window_{index}', (x + 1.18, -16.0, 7.78), (0.05, 0.88, 0.68), mats['window'], world, 0.02)
        arm = box(f'crane_arm_{index}', (x + 2.4, -16.0, 9.1), (5.2, 0.28, 0.28), mats['crane'], world, 0.06, rotation=(0, math.radians(-18), 0))
        box(f'crane_counterweight_{index}', (x - 1.45, -16.0, 8.62), (1.35, 1.0, 0.90), mats['crane_counterweight'], world, 0.10)
        cylinder(f'crane_cable_{index}', (x + 4.2, -16.0, 6.3), 0.025, 4.3, mats['metal'], world, 10)

    # A working harbor needs parallax and a readable far bank. The compact
    # service vessel sits inside the water strip; the warehouses remain beyond
    # the playable edge and dissolve naturally into the runtime fog.
    box('workboat_hull', (16.8, -18.55, 0.34), (8.8, 1.78, 0.86), mats['ship_hull'], world, 0.16)
    cylinder(
        'workboat_bow',
        (22.05, -18.55, 0.34),
        0.88,
        1.72,
        mats['ship_hull'],
        world,
        8,
        rotation=(0, math.radians(90), 0),
        radius_top=0.08,
    )
    box('workboat_rubrail', (17.1, -17.62, 0.63), (9.45, 0.10, 0.18), mats['rubber'], world, 0.025)
    box('workboat_signal_stripe', (17.25, -17.555, 0.46), (8.85, 0.045, 0.09), mats['marking'], world, 0.012)
    box('workboat_deck', (17.1, -18.55, 0.91), (7.3, 1.50, 0.24), mats['ship_deck'], world, 0.055)
    box('workboat_cabin', (15.4, -18.55, 1.74), (2.75, 1.42, 1.54), mats['ship_cabin'], world, 0.11)
    box('workboat_cabin_roof', (15.4, -18.55, 2.58), (3.05, 1.66, 0.18), mats['ship_hull'], world, 0.065)
    for window_index, x in enumerate((14.65, 15.40, 16.15)):
        box(f'ship_window_{window_index}', (x, -17.815, 1.88), (0.48, 0.055, 0.50), mats['ship_window'], world, 0.025)
    cylinder('workboat_mast', (15.05, -18.55, 3.55), 0.055, 2.0, mats['metal_dark'], world, 14)
    box('workboat_mast_arm', (15.35, -18.55, 4.22), (0.72, 0.08, 0.08), mats['metal_dark'], world, 0.018)
    sphere('workboat_marker_light', (15.70, -18.55, 4.22), (0.075, 0.075, 0.075), mats['signal_light'], world, 14, 8)
    cylinder('workboat_exhaust', (13.72, -18.55, 2.92), 0.10, 0.72, mats['metal_dark'], world, 16)
    for rail_index, x in enumerate((13.6, 14.8, 18.6, 19.8, 21.0)):
        cylinder(f'workboat_rail_post_{rail_index}', (x, -17.70, 1.35), 0.025, 0.68, mats['metal'], world, 10)
    box('workboat_rail_top', (17.3, -17.70, 1.68), (7.95, 0.045, 0.045), mats['metal'], world, 0.008)
    box('workboat_rescue_case', (18.65, -17.66, 1.18), (0.58, 0.10, 0.38), mats['orange'], world, 0.035)

    far_bank = (
        (7.0, -23.0, 2.0, 11.0, 4.0, 'skyline'),
        (18.5, -23.4, 2.65, 9.5, 5.3, 'skyline_alt'),
        (29.0, -23.2, 1.75, 10.0, 3.5, 'skyline'),
        (39.0, -23.6, 3.35, 7.2, 6.7, 'skyline_alt'),
        (47.0, -23.1, 2.15, 7.8, 4.3, 'skyline'),
    )
    for bank_index, (x, y, z, width, height, material_name) in enumerate(far_bank):
        box(f'skyline_block_{bank_index}', (x, y, z), (width, 1.45, height), mats[material_name], world, 0.08)
        box(f'skyline_roofline_{bank_index}', (x, y + 0.02, height + 0.12), (width + 0.25, 1.58, 0.24), mats['skyline_roof'], world, 0.035)
    for chimney_index, (x, height) in enumerate(((3.4, 6.2), (22.2, 7.0), (36.8, 8.2), (42.1, 8.9), (49.2, 6.4))):
        cylinder(f'skyline_chimney_{chimney_index}', (x, -23.25, height * 0.5), 0.14, height, mats['skyline_roof'], world, 12)
    for window_index, (x, z) in enumerate(((3.8, 2.4), (6.4, 2.4), (15.8, 3.3), (18.0, 3.3), (20.2, 3.3), (27.3, 2.0), (31.0, 2.0), (37.4, 4.3), (39.2, 4.3), (41.0, 4.3), (45.6, 2.6), (48.0, 2.6))):
        box(f'skyline_window_{window_index}', (x, -22.64, z), (0.50, 0.055, 0.24), mats['skyline_window'], world, 0.014)

    # Stacked containers anchor the horizon without filling the playable foreground.
    for container_index, (x, y, z, color) in enumerate(((30, -10.8, 1.25, 'container_blue'), (36.5, -11.0, 1.25, 'container_teal'), (33.2, -11.2, 3.72, 'container_orange'))):
        box(f'container_{container_index}', (x, y, z), (5.8, 2.35, 2.40), mats[color], world, 0.10)
        for rib_index in range(9):
            rib_x = x - 2.5 + rib_index * 0.62
            box(f'container_rib_{container_index}_{rib_index}', (rib_x, y - 1.20, z), (0.07, 0.06, 2.08), mats['container_rib'], world, 0.014)

    for i, (x, y, sx, sy) in enumerate(((17, 2, 3, 1.2), (22, 4, 4, 1.4), (28, -2, 3.5, 1.0), (33, -7, 4.2, 1.3))):
        sphere(f'puddle_{i}', (x, y, 0.005), (sx, sy, 0.018), mats['puddle'], world, 28, 10)

    # Warm practical lamp bulbs.
    for i, (x, y, z) in enumerate(((2.2, 3.5, 3.3), (11.8, 0, 3.0), (23, -5.0, 3.0), (34.8, 4.5, 3.4), (27.3, 11, 3.3))):
        sphere(f'lamp_bulb_{i}', (x, y, z), (0.09, 0.09, 0.12), mats['lamp'], world, 16, 10)
    return world


def add_metadata():
    scene = bpy.context.scene
    scene['project'] = 'ISSO.TV V3 Master Edition'
    scene['world'] = 'Strammburg'
    scene['build'] = 'vertical-slice-v1'
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0


def export_project(repo_root):
    source_dir = repo_root / 'assets' / 'source'
    model_dir = repo_root / 'public' / 'models'
    source_dir.mkdir(parents=True, exist_ok=True)
    model_dir.mkdir(parents=True, exist_ok=True)
    blend_path = source_dir / 'isso-v3-vertical-slice-v1.blend'
    glb_path = model_dir / 'isso-v3-vertical-slice-v1.glb'
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False,
        export_extras=True,
    )
    print(f'BLEND={blend_path}')
    print(f'GLB={glb_path}')


def main():
    repo_root = Path(sys.argv[sys.argv.index('--') + 1]).resolve() if '--' in sys.argv else Path.cwd()
    clean_scene()
    oak = image_material('floor_oak_hd', repo_root / 'assets' / 'textures' / 'room-oak-hd-v1-runtime.jpg', 0.70)
    terrazzo = image_material(
        'hall_terrazzo_hd',
        repo_root / 'assets' / 'textures' / 'hall-terrazzo-hd-v1-runtime.jpg',
        0.82,
        (12.0, 6.0),
    )
    harbor_asphalt = image_material(
        'harbor_asphalt_hd',
        repo_root / 'assets' / 'textures' / 'harbor-asphalt-hd-v1-runtime.jpg',
        0.42,
        (18.0, 12.0),
    )
    mats = {
        'fur': material('fur_warm_grey_brown', (0.20, 0.155, 0.12), 0.0, 0.9),
        'fur_dark': material('fur_dark', (0.075, 0.052, 0.038), 0.0, 0.95),
        'muzzle': material('muzzle_soft', (0.46, 0.35, 0.25), 0.0, 0.87),
        'eye': material('eye_near_black', (0.018, 0.012, 0.009), 0.0, 0.22),
        'glint': material('eye_glint', (0.92, 0.78, 0.52), 0.0, 0.12, (0.4, 0.25, 0.08)),
        'jacket': material('jacket_petrol', (0.022, 0.17, 0.19), 0.0, 0.72),
        'jacket_dark': material('jacket_petrol_dark', (0.012, 0.075, 0.085), 0.0, 0.8),
        'trousers': material('trousers_dark', (0.018, 0.022, 0.025), 0.0, 0.82),
        'hoof': material('forehoof', (0.035, 0.026, 0.019), 0.0, 0.56),
        'hoof_groove': material('hoof_groove', (0.006, 0.004, 0.003), 0.0, 0.92),
        'boot': material('boots_worn', (0.027, 0.022, 0.018), 0.0, 0.65),
        'leather': material('belt_leather', (0.105, 0.055, 0.025), 0.0, 0.78),
        'metal': material('metal_worn', (0.19, 0.22, 0.23), 0.72, 0.34),
        'metal_dark': material('metal_dark', (0.055, 0.068, 0.075), 0.78, 0.42),
        'rubber': material('rubber', (0.012, 0.014, 0.015), 0.0, 0.94),
        'orange': material('signal_orange', (0.95, 0.16, 0.025), 0.0, 0.52, (0.15, 0.012, 0.001)),
        'device': material('device_case', (0.035, 0.048, 0.052), 0.42, 0.46),
        'screen': material('connection_screen', (0.025, 0.19, 0.21), 0.18, 0.25, (0.02, 0.18, 0.2)),
        'wood': oak,
        'wood_alt': oak,
        'desk': material('desk_wood', (0.19, 0.092, 0.038), 0.0, 0.58),
        'bed_frame': material('bed_frame_oak', (0.075, 0.042, 0.025), 0.0, 0.76),
        'fabric': material('mattress_fabric', (0.028, 0.038, 0.052), 0.0, 0.96),
        'linen': material('clean_linen', (0.26, 0.285, 0.29), 0.0, 0.92),
        'blanket': material('blanket_navy', (0.015, 0.032, 0.055), 0.0, 1.0),
        'blanket_alt': material('blanket_fold_petrol', (0.018, 0.08, 0.09), 0.0, 0.96),
        'pillow': material('pillow_navy', (0.022, 0.035, 0.05), 0.0, 1.0),
        'rug': material('room_rug_warm', (0.16, 0.115, 0.075), 0.0, 0.98),
        'paint': material('trim_warm_white', (0.48, 0.46, 0.42), 0.0, 0.72),
        'paper': material('print_warm_paper', (0.42, 0.40, 0.36), 0.0, 0.88),
        'radiator': material('radiator_painted_steel', (0.32, 0.34, 0.33), 0.18, 0.64),
        'storage': material('storage_dark_oak', (0.055, 0.037, 0.026), 0.0, 0.76),
        'storage_front': material('storage_front', (0.11, 0.072, 0.045), 0.0, 0.67),
        'lamp_shade': material('lamp_shade_warm', (0.34, 0.20, 0.09), 0.0, 0.76, (0.18, 0.065, 0.012)),
        'plaster': material('plaster_worn', (0.21, 0.205, 0.19), 0.0, 0.94),
        'plaster_dark': material('plaster_shadow', (0.075, 0.075, 0.072), 0.0, 0.98),
        'door': material('apartment_door', (0.065, 0.043, 0.026), 0.0, 0.78),
        'window': material('rain_glass', (0.08, 0.24, 0.32), 0.18, 0.12),
        'stone': material('hall_stone', (0.095, 0.095, 0.09), 0.0, 0.88),
        'hall_floor': terrazzo,
        'hall_wainscot': material('hall_wainscot_petrol', (0.028, 0.095, 0.095), 0.0, 0.84),
        'hall_door': material('hall_door_smoked_oak', (0.095, 0.050, 0.027), 0.0, 0.76),
        'hall_door_panel': material('hall_door_inset', (0.055, 0.030, 0.019), 0.0, 0.82),
        'hall_trim': material('hall_trim_dark', (0.075, 0.086, 0.083), 0.24, 0.54),
        'mailbox': material('mailbox_painted_steel', (0.10, 0.12, 0.12), 0.55, 0.46),
        'brass': material('hall_brass', (0.42, 0.245, 0.075), 0.78, 0.31),
        'light_slit': material('hall_door_light', (0.45, 0.19, 0.045), 0.0, 0.25, (0.72, 0.24, 0.045)),
        'asphalt': harbor_asphalt,
        'paver': material('awning_paver', (0.11, 0.115, 0.11), 0.0, 0.70),
        'curb': material('harbor_curb', (0.23, 0.24, 0.23), 0.0, 0.72),
        'drain': material('harbor_drain', (0.055, 0.068, 0.07), 0.72, 0.38),
        'marking': material('dock_marking_aged', (0.58, 0.33, 0.055), 0.0, 0.64),
        'awning_roof': material('awning_roof_petrol_metal', (0.025, 0.095, 0.105), 0.62, 0.35),
        'awning_underside': material('awning_underside', (0.105, 0.115, 0.11), 0.22, 0.66),
        'awning_trim': material('awning_structure', (0.08, 0.095, 0.095), 0.72, 0.32),
        'brick': material('brick_old', (0.16, 0.055, 0.028), 0.0, 0.9),
        'brick_alt': material('brick_old_alt', (0.105, 0.032, 0.018), 0.0, 0.94),
        'kiosk': material('kiosk_petrol', (0.025, 0.12, 0.13), 0.0, 0.76),
        'kiosk_frame': material('kiosk_frame', (0.055, 0.072, 0.075), 0.68, 0.36),
        'kiosk_counter': material('kiosk_counter', (0.19, 0.10, 0.045), 0.0, 0.58),
        'kiosk_lightbox': material('kiosk_lightbox', (0.44, 0.25, 0.065), 0.08, 0.28, (0.48, 0.15, 0.018)),
        'crate_wood': material('crate_wood', (0.22, 0.12, 0.052), 0.0, 0.82),
        'container_blue': material('container_blue', (0.045, 0.12, 0.16), 0.58, 0.46),
        'container_teal': material('container_teal', (0.025, 0.16, 0.16), 0.58, 0.45),
        'container_orange': material('container_orange', (0.42, 0.10, 0.025), 0.48, 0.50),
        'container_rib': material('container_rib', (0.035, 0.045, 0.045), 0.68, 0.38),
        'crane': material('crane_weathered', (0.37, 0.17, 0.035), 0.62, 0.48),
        'crane_cab': material('crane_cab', (0.075, 0.085, 0.08), 0.48, 0.50),
        'crane_counterweight': material('crane_counterweight', (0.09, 0.095, 0.09), 0.18, 0.76),
        'ship_hull': material('workboat_hull_weathered', (0.025, 0.07, 0.09), 0.62, 0.40),
        'ship_deck': material('workboat_deck', (0.16, 0.095, 0.045), 0.48, 0.58),
        'ship_cabin': material('workboat_cabin', (0.27, 0.29, 0.27), 0.16, 0.68),
        'ship_window': material('workboat_window', (0.25, 0.12, 0.035), 0.12, 0.20, (0.34, 0.09, 0.015)),
        'signal_light': material('workboat_marker_light', (0.75, 0.055, 0.018), 0.08, 0.18, (0.7, 0.025, 0.006)),
        'skyline': material('far_bank_blueblack', (0.018, 0.038, 0.047), 0.16, 0.86),
        'skyline_alt': material('far_bank_slate', (0.03, 0.05, 0.057), 0.18, 0.82),
        'skyline_roof': material('far_bank_roof', (0.012, 0.022, 0.026), 0.42, 0.70),
        'skyline_window': material('far_bank_window', (0.30, 0.13, 0.035), 0.0, 0.32, (0.24, 0.055, 0.008)),
        'warm_glass': material('warm_glass', (0.42, 0.17, 0.035), 0.08, 0.18, (0.55, 0.15, 0.02)),
        'station': material('station_steel', (0.09, 0.115, 0.13), 0.35, 0.48),
        'station_trim': material('station_trim', (0.035, 0.052, 0.058), 0.68, 0.34),
        'signalwerk': material('signalwerk_blue', (0.04, 0.11, 0.15), 0.18, 0.48),
        'water': material('harbor_water', (0.018, 0.075, 0.105), 0.38, 0.12),
        'puddle': material('puddle', (0.035, 0.085, 0.11), 0.3, 0.08),
        'lamp': material('lamp_warm', (1.0, 0.45, 0.12), 0.0, 0.22, (1.0, 0.24, 0.025)),
    }
    build_level(mats)
    for prefix, merged_name in (
        ('brick_', 'facade_masonry_details'),
        ('awning_roof_rib_', 'awning_roof_ribs'),
        ('harbor_drain_grate_', 'harbor_drain_grates'),
        ('container_rib_', 'container_ribs'),
        ('room_floorboard_', 'room_floorboards'),
        ('radiator_fin_', 'radiator_fins'),
        ('hall_ceiling_rib_', 'hall_ceiling_ribs'),
        ('station_cladding_band_', 'station_cladding_bands'),
        ('kiosk_paper_', 'kiosk_papers'),
        ('ship_window_', 'workboat_windows'),
        ('skyline_window_', 'far_bank_windows'),
    ):
        merge_static(prefix, merged_name)
    add_metadata()
    export_project(repo_root)


if __name__ == '__main__':
    main()
