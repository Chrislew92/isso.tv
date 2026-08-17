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

    # Apartment: deliberately open ceiling and camera-facing wall, but fully volumetric.
    box('room_floor', (0, 0, -0.11), (9.0, 8.0, 0.22), mats['wood'], world, 0.03)
    box('room_wall_back', (0, 4.0, 2.0), (9.0, 0.22, 4.0), mats['plaster'], world, 0.04)
    box('room_wall_left', (-4.5, 0, 2.0), (0.22, 8.0, 4.0), mats['plaster'], world, 0.04)
    box('room_wall_front_a', (-2.7, -4.0, 2.0), (3.6, 0.18, 4.0), mats['plaster_dark'], world, 0.03)
    box('room_wall_front_b', (2.8, -4.0, 2.0), (3.4, 0.18, 4.0), mats['plaster_dark'], world, 0.03)
    box('room_wall_door_a', (4.45, 2.55, 2.0), (0.2, 2.9, 4.0), mats['plaster'], world, 0.03)
    box('room_wall_door_b', (4.45, -2.55, 2.0), (0.2, 2.9, 4.0), mats['plaster'], world, 0.03)

    box('mattress', (-2.25, -1.5, 0.22), (2.5, 3.25, 0.42), mats['fabric'], world, 0.15)
    box('blanket', (-2.2, -1.58, 0.47), (2.35, 2.7, 0.16), mats['blanket'], world, 0.08, rotation=(0, 0, math.radians(3)))
    box('pillow', (-2.2, -2.55, 0.61), (1.4, 0.72, 0.24), mats['pillow'], world, 0.12)
    box('desk_top', (-2.2, 2.65, 1.04), (2.45, 1.05, 0.16), mats['desk'], world, 0.05)
    for x in (-3.18, -1.22):
        for y in (2.28, 3.02):
            box(f'desk_leg_{x}_{y}', (x, y, 0.52), (0.12, 0.12, 1.04), mats['desk'], world, 0.025)
    box('connection_base', (-2.2, 2.58, 1.18), (1.08, 0.72, 0.1), mats['device'], world, 0.04)
    screen = box('connection_screen', (-2.2, 2.91, 1.55), (1.08, 0.08, 0.66), mats['screen'], world, 0.04, rotation=(math.radians(-8), 0, 0))
    screen['interaction'] = 'connection'
    cylinder('hoof_button', (-1.46, 2.27, 1.2), 0.24, 0.12, mats['orange'], world, 28, rotation=(math.radians(90), 0, 0))
    box('rain_window', (0.2, 3.88, 2.25), (2.5, 0.06, 1.72), mats['window'], world, 0.03)

    door_pivot = empty('door_pivot', (4.42, -0.82, 0), world)
    door = box('apartment_door', (4.32, 0, 1.38), (0.18, 1.65, 2.76), mats['door'], door_pivot, 0.05)
    door['interaction'] = 'door'
    box('door_handle', (4.15, -0.55, 1.32), (0.18, 0.38, 0.10), mats['metal'], door_pivot, 0.035)

    # Connected hall and exterior: no loading cut or fake background.
    box('hall_floor', (8.0, 0, -0.10), (7.0, 3.2, 0.2), mats['stone'], world, 0.02)
    box('hall_wall_a', (8.0, 1.62, 1.65), (7.0, 0.18, 3.3), mats['plaster_dark'], world, 0.03)
    box('hall_wall_b', (8.0, -1.62, 1.65), (7.0, 0.18, 3.3), mats['plaster_dark'], world, 0.03)
    box('harbor_ground', (30, 0, -0.16), (42, 30, 0.28), mats['asphalt'], world, 0.02)
    box('awning', (12.0, 0, 3.2), (5.2, 5.2, 0.18), mats['metal_dark'], world, 0.04)
    for x in (10.0, 14.0):
        for y in (-2.0, 2.0):
            cylinder(f'awning_post_{x}_{y}', (x, y, 1.55), 0.085, 3.1, mats['metal'], world, 16)

    # Brick facade with readable depth and a warm exit.
    box('facade', (11.0, 5.0, 3.5), (7.5, 0.5, 7.0), mats['brick'], world, 0.05)
    for row in range(8):
        for col in range(9):
            offset = 0.38 if row % 2 else 0
            x = 7.6 + col * 0.82 + offset
            box(f'brick_{row}_{col}', (x, 4.72, 0.42 + row * 0.78), (0.72, 0.08, 0.32), mats['brick_alt' if (row + col) % 3 else 'brick'], world, 0.018)

    # Kiosk, cart and working harbor.
    box('kiosk_body', (23, -7.2, 1.65), (5.2, 4.2, 3.3), mats['kiosk'], world, 0.12)
    box('kiosk_roof', (23, -7.2, 3.45), (5.8, 4.8, 0.22), mats['metal_dark'], world, 0.08)
    box('kiosk_window', (23, -5.06, 2.0), (2.8, 0.08, 1.45), mats['warm_glass'], world, 0.025)
    cart_root = empty('cart_root', (19, -3.1, 0), world)
    cart = box('return_cart', (19, -3.1, 0.62), (1.65, 0.9, 0.18), mats['metal'], cart_root, 0.04)
    cart['interaction'] = 'cart'
    box('return_crates', (19, -3.1, 1.15), (1.38, 0.78, 0.85), mats['orange'], cart_root, 0.07)
    for x in (-0.62, 0.62):
        for y in (-0.34, 0.34):
            cylinder(f'cart_wheel_{x}_{y}', (19 + x, -3.1 + y, 0.38), 0.19, 0.13, mats['rubber'], cart_root, 18, rotation=(math.radians(90), 0, 0))

    # Station and Signalwerk are already real geometry in the same navigable world.
    box('station_shell', (39, 4.5, 2.25), (6.0, 8.5, 4.5), mats['station'], world, 0.15)
    box('station_entry', (35.92, 4.5, 1.5), (0.10, 2.2, 2.5), mats['window'], world, 0.03)
    station_marker = empty('interaction_station', (35.5, 4.5, 0), world)
    station_marker['interaction'] = 'station'
    box('signalwerk_shell', (31.5, 11.0, 2.25), (8.0, 6.5, 4.5), mats['signalwerk'], world, 0.15)
    box('signalwerk_entry', (27.42, 11.0, 1.55), (0.10, 2.1, 2.6), mats['warm_glass'], world, 0.03)
    signal_marker = empty('interaction_signalwerk', (27.0, 11.0, 0), world)
    signal_marker['interaction'] = 'signalwerk'

    # Harbor water, bollards and two sculptural cranes.
    box('harbor_water', (30, -18.0, -0.28), (52, 8.0, 0.18), mats['water'], world, 0.01)
    for x in range(15, 48, 4):
        cylinder(f'bollard_{x}', (x, -13.0, 0.32), 0.16, 0.64, mats['metal_dark'], world, 18)
    for index, x in enumerate((26, 38)):
        cylinder(f'crane_tower_{index}', (x, -16.0, 5.0), 0.28, 10.0, mats['metal_dark'], world, 18)
        arm = box(f'crane_arm_{index}', (x + 2.4, -16.0, 9.1), (5.2, 0.28, 0.28), mats['metal_dark'], world, 0.06, rotation=(0, math.radians(-18), 0))
        cylinder(f'crane_cable_{index}', (x + 4.2, -16.0, 6.3), 0.025, 4.3, mats['metal'], world, 10)

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
        'wood': material('floor_wood', (0.085, 0.045, 0.025), 0.0, 0.78),
        'desk': material('desk_wood', (0.18, 0.085, 0.032), 0.0, 0.62),
        'fabric': material('mattress_fabric', (0.028, 0.038, 0.052), 0.0, 0.96),
        'blanket': material('blanket_navy', (0.015, 0.032, 0.055), 0.0, 1.0),
        'pillow': material('pillow_navy', (0.022, 0.035, 0.05), 0.0, 1.0),
        'plaster': material('plaster_worn', (0.145, 0.14, 0.13), 0.0, 0.96),
        'plaster_dark': material('plaster_shadow', (0.075, 0.075, 0.072), 0.0, 0.98),
        'door': material('apartment_door', (0.065, 0.043, 0.026), 0.0, 0.78),
        'window': material('rain_glass', (0.08, 0.24, 0.32), 0.18, 0.12),
        'stone': material('hall_stone', (0.095, 0.095, 0.09), 0.0, 0.88),
        'asphalt': material('wet_asphalt', (0.025, 0.038, 0.044), 0.22, 0.23),
        'brick': material('brick_old', (0.16, 0.055, 0.028), 0.0, 0.9),
        'brick_alt': material('brick_old_alt', (0.105, 0.032, 0.018), 0.0, 0.94),
        'kiosk': material('kiosk_petrol', (0.025, 0.12, 0.13), 0.0, 0.76),
        'warm_glass': material('warm_glass', (0.42, 0.17, 0.035), 0.08, 0.18, (0.55, 0.15, 0.02)),
        'station': material('station_steel', (0.09, 0.115, 0.13), 0.35, 0.48),
        'signalwerk': material('signalwerk_blue', (0.04, 0.11, 0.15), 0.18, 0.48),
        'water': material('harbor_water', (0.018, 0.075, 0.105), 0.38, 0.12),
        'puddle': material('puddle', (0.035, 0.085, 0.11), 0.3, 0.08),
        'lamp': material('lamp_warm', (1.0, 0.45, 0.12), 0.0, 0.22, (1.0, 0.24, 0.025)),
    }
    build_level(mats)
    add_metadata()
    export_project(repo_root)


if __name__ == '__main__':
    main()
