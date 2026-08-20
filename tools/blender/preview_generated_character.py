import bpy
import math
import sys
from pathlib import Path
from mathutils import Vector


def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)


def look_at(camera, point):
    camera.rotation_euler = (Vector(point) - camera.location).to_track_quat('-Z', 'Y').to_euler()


def imported_bounds(objects):
    points = []
    for obj in objects:
        if obj.type != 'MESH':
            continue
        points.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    minimum = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    maximum = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return minimum, maximum


def import_and_normalize(source):
    before = set(bpy.data.objects)
    if source.suffix.lower() == '.obj':
        bpy.ops.wm.obj_import(filepath=str(source))
    else:
        bpy.ops.import_scene.gltf(filepath=str(source))
    imported = [
        obj for obj in bpy.data.objects
        if obj not in before
        and not any(collection.name == 'glTF_not_exported' for collection in obj.users_collection)
    ]
    roots = [obj for obj in imported if obj.parent not in imported]
    root = bpy.data.objects.new('CHARACTER_353L_ROOT', None)
    bpy.context.collection.objects.link(root)
    for obj in roots:
        world = obj.matrix_world.copy()
        obj.parent = root
        obj.matrix_world = world

    minimum, maximum = imported_bounds(imported)
    print(f'RAW_BOUNDS_MIN={tuple(round(v, 4) for v in minimum)}')
    print(f'RAW_BOUNDS_MAX={tuple(round(v, 4) for v in maximum)}')
    print(f'RAW_DIMENSIONS={tuple(round(v, 4) for v in (maximum - minimum))}')
    dimensions = maximum - minimum
    if dimensions.y > dimensions.x and dimensions.y > dimensions.z:
        root.rotation_euler.x = math.radians(-90)
    elif dimensions.x > dimensions.z:
        root.rotation_euler.y = math.radians(90)
    bpy.context.view_layer.update()
    minimum, maximum = imported_bounds(imported)
    scale = 3.35 / max(maximum.z - minimum.z, 0.001)
    root.scale = (scale, scale, scale)
    bpy.context.view_layer.update()
    minimum, maximum = imported_bounds(imported)
    center = (minimum + maximum) * 0.5
    root.location += Vector((-center.x, -center.y, -minimum.z))
    bpy.context.view_layer.update()
    return root, imported


def apply_external_texture(objects, source):
    texture_path = source.with_name('texture.png')
    if source.suffix.lower() != '.obj' or not texture_path.exists():
        return
    image = bpy.data.images.load(str(texture_path))
    material = bpy.data.materials.new('353l_baked_texture')
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Roughness'].default_value = 0.72
    texture = material.node_tree.nodes.new('ShaderNodeTexImage')
    texture.image = image
    material.node_tree.links.new(texture.outputs['Color'], bsdf.inputs['Base Color'])
    for obj in objects:
        if obj.type != 'MESH':
            continue
        obj.data.materials.clear()
        obj.data.materials.append(material)
        for polygon in obj.data.polygons:
            polygon.use_smooth = True


def add_stage():
    bpy.ops.mesh.primitive_plane_add(size=18, location=(0, 0, -0.025))
    floor = bpy.context.object
    floor.name = 'preview_floor'
    mat = bpy.data.materials.new('preview_floor_material')
    mat.diffuse_color = (0.018, 0.024, 0.028, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (0.018, 0.024, 0.028, 1)
    bsdf.inputs['Roughness'].default_value = 0.78
    floor.data.materials.append(mat)

    for name, location, energy, color, size in (
        ('key', (-4.5, -4.0, 6.2), 1150, (1.0, 0.58, 0.32), 4.0),
        ('fill', (4.0, -2.0, 3.8), 900, (0.28, 0.68, 1.0), 3.2),
        ('rim', (0.0, 4.2, 5.6), 1250, (1.0, 0.24, 0.08), 3.0),
    ):
        data = bpy.data.lights.new(name, type='AREA')
        data.energy = energy
        data.color = color
        data.shape = 'DISK'
        data.size = size
        light = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(light)
        light.location = location
        light.rotation_euler = (Vector((0, 0, 1.6)) - light.location).to_track_quat('-Z', 'Y').to_euler()


def render_views(output_dir):
    camera_data = bpy.data.cameras.new('preview_camera')
    camera = bpy.data.objects.new('preview_camera', camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    camera_data.lens = 58

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 600
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = 'RGBA'
    scene.world.color = (0.004, 0.007, 0.009)

    views = {
        'front': (0, -7.0, 2.25),
        'right': (7.0, 0, 2.25),
        'back': (0, 7.0, 2.25),
        'left': (-7.0, 0, 2.25),
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    for name, location in views.items():
        camera.location = location
        look_at(camera, (0, 0, 1.65))
        scene.render.filepath = str(output_dir / f'353l-generated-{name}.png')
        bpy.ops.render.render(write_still=True)


def apply_walk_pose():
    rig = next((obj for obj in bpy.data.objects if obj.type == 'ARMATURE'), None)
    if not rig:
        return
    for name, angle in (
        # Restrained leg pose for the automated deformation check. Arm swing
        # stays locked until the fused scan clothing receives manual weights.
        ('rig_leg_l', 0.15),
        ('rig_leg_r', -0.15),
        ('rig_head', 0.02),
    ):
        bone = rig.pose.bones.get(name)
        if bone:
            bone.rotation_mode = 'XYZ'
            bone.rotation_euler.x = angle
    bpy.context.view_layer.update()


def attach_hooves_for_pose():
    rig = next((obj for obj in bpy.data.objects if obj.type == 'ARMATURE'), None)
    if not rig:
        return
    for hoof_name, bone_name in (
        ('353L_FRONT_HOOF_L', 'rig_hand_l'),
        ('353L_FRONT_HOOF_R', 'rig_hand_r'),
        ('353L_REAR_HOOF_L', 'rig_foot_l'),
        ('353L_REAR_HOOF_R', 'rig_foot_r'),
    ):
        hoof = bpy.data.objects.get(hoof_name)
        if not hoof or bone_name not in rig.pose.bones:
            continue
        world = hoof.matrix_world.copy()
        hoof.parent = rig
        hoof.parent_type = 'BONE'
        hoof.parent_bone = bone_name
        hoof.matrix_world = world
    bpy.context.view_layer.update()


def main():
    args = sys.argv[sys.argv.index('--') + 1:]
    source = Path(args[0]).resolve()
    output_dir = Path(args[1]).resolve()
    reset_scene()
    _, imported = import_and_normalize(source)
    apply_external_texture(imported, source)
    if len(args) > 2 and args[2].lower() == 'pose':
        attach_hooves_for_pose()
        apply_walk_pose()
    add_stage()
    render_views(output_dir)
    print(f'PREVIEW_DIR={output_dir}')


if __name__ == '__main__':
    main()
