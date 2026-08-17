import bpy
import math
import sys
from pathlib import Path
from mathutils import Matrix, Vector


def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)


def bounds(objects):
    points = []
    for obj in objects:
        if obj.type == 'MESH':
            points.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    minimum = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    maximum = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return minimum, maximum


def import_mesh(source):
    before = set(bpy.data.objects)
    bpy.ops.wm.obj_import(filepath=str(source))
    imported = [obj for obj in bpy.data.objects if obj not in before and obj.type == 'MESH']
    for obj in imported:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = imported[0]
    if len(imported) > 1:
        bpy.ops.object.join()
    mesh = bpy.context.view_layer.objects.active
    mesh.name = '353L_Master_Mesh'

    # TripoSR exports image-up as Y. Stand the body upright and turn its face toward -Y,
    # the same forward axis as the existing Strammburg level.
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    mesh.data.transform(Matrix.Rotation(math.radians(-90), 4, 'X'))
    mesh.data.transform(Matrix.Rotation(math.radians(-90), 4, 'Z'))
    mesh.data.update()
    vertices = [vertex.co.copy() for vertex in mesh.data.vertices]
    local_min = Vector((min(v.x for v in vertices), min(v.y for v in vertices), min(v.z for v in vertices)))
    local_max = Vector((max(v.x for v in vertices), max(v.y for v in vertices), max(v.z for v in vertices)))
    mesh.scale = (3.35 / (local_max.z - local_min.z),) * 3
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    vertices = [vertex.co.copy() for vertex in mesh.data.vertices]
    local_min = Vector((min(v.x for v in vertices), min(v.y for v in vertices), min(v.z for v in vertices)))
    local_max = Vector((max(v.x for v in vertices), max(v.y for v in vertices), max(v.z for v in vertices)))
    center = (local_min + local_max) * 0.5
    mesh.location = (-center.x, -center.y, -local_min.z)
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

    texture_path = source.with_name('texture.png')
    image = bpy.data.images.load(str(texture_path))
    image.name = '353L_Master_Texture_2K'
    material = bpy.data.materials.new('353L_Master_Material')
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get('Principled BSDF')
    bsdf.inputs['Roughness'].default_value = 0.74
    bsdf.inputs['Specular IOR Level'].default_value = 0.28
    texture = nodes.new('ShaderNodeTexImage')
    texture.image = image
    links.new(texture.outputs['Color'], bsdf.inputs['Base Color'])
    mesh.data.materials.clear()
    mesh.data.materials.append(material)
    for polygon in mesh.data.polygons:
        polygon.use_smooth = True
    return mesh


def edit_bone(armature, name, head, tail, parent=None, deform=True):
    bone = armature.edit_bones.new(name)
    bone.head = head
    bone.tail = tail
    bone.use_deform = deform
    if parent:
        bone.parent = parent
    return bone


def build_armature():
    data = bpy.data.armatures.new('353L_Master_Rig')
    rig = bpy.data.objects.new('CHARACTER_353L_ROOT', data)
    bpy.context.collection.objects.link(rig)
    rig.show_in_front = True
    rig['character_id'] = '353L'
    rig['canon'] = 'adult_humanoid_donkey_petrol_jacket_orange_patch'

    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    root = edit_bone(data, 'rig_root', (0, 0, 0.02), (0, 0, 0.35), deform=False)
    hips = edit_bone(data, 'rig_hips', (0, 0, 1.18), (0, 0, 1.52), root)
    spine = edit_bone(data, 'rig_spine', (0, 0, 1.52), (0, 0, 2.27), hips)
    neck = edit_bone(data, 'rig_neck', (0, 0, 2.27), (0, -0.01, 2.55), spine)
    head = edit_bone(data, 'rig_head', (0, -0.01, 2.55), (0, -0.02, 3.18), neck)
    edit_bone(data, 'rig_ear_l', (-0.12, -0.01, 3.02), (-0.24, -0.03, 3.34), head)
    edit_bone(data, 'rig_ear_r', (0.12, -0.01, 3.02), (0.24, -0.03, 3.34), head)

    for side, sign in (('l', -1), ('r', 1)):
        thigh = edit_bone(data, f'rig_leg_{side}', (0.22 * sign, 0, 1.36), (0.23 * sign, 0, 0.77), hips)
        shin = edit_bone(data, f'rig_shin_{side}', (0.23 * sign, 0, 0.77), (0.23 * sign, -0.05, 0.21), thigh)
        edit_bone(data, f'rig_foot_{side}', (0.23 * sign, -0.05, 0.21), (0.23 * sign, -0.34, 0.08), shin)
        arm = edit_bone(data, f'rig_arm_{side}', (0.48 * sign, 0, 2.22), (0.61 * sign, -0.01, 1.58), spine)
        forearm = edit_bone(data, f'rig_forearm_{side}', (0.61 * sign, -0.01, 1.58), (0.57 * sign, -0.05, 0.95), arm)
        edit_bone(data, f'rig_hand_{side}', (0.57 * sign, -0.05, 0.95), (0.56 * sign, -0.08, 0.70), forearm)

    bpy.ops.object.mode_set(mode='OBJECT')
    return rig


def bind_by_distance(mesh, rig):
    mesh.parent = rig
    modifier = mesh.modifiers.new(name='353L_Master_Skin', type='ARMATURE')
    modifier.object = rig
    groups = {
        bone.name: mesh.vertex_groups.new(name=bone.name)
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
        distances = []
        point = vertex.co
        for name, start, vector, length_squared in segments:
            factor = max(0.0, min(1.0, (point - start).dot(vector) / length_squared))
            closest = start + vector * factor
            distance_squared = (point - closest).length_squared
            distances.append((name, distance_squared))
        distances.sort(key=lambda item: item[1])
        selected = distances[:3]
        weighted = [(name, 1.0 / (distance_squared + 0.0036)) for name, distance_squared in selected]
        total = sum(weight for _, weight in weighted)
        for name, weight in weighted:
            groups[name].add([vertex.index], weight / total, 'REPLACE')


def bind(mesh, rig):
    proxy = mesh.copy()
    proxy.data = mesh.data.copy()
    proxy.name = '353L_Rigging_Proxy'
    bpy.context.collection.objects.link(proxy)
    proxy.data.remesh_voxel_size = 0.045
    proxy.data.use_remesh_preserve_volume = True
    bpy.ops.object.select_all(action='DESELECT')
    proxy.select_set(True)
    bpy.context.view_layer.objects.active = proxy
    bpy.ops.object.voxel_remesh()

    bpy.ops.object.select_all(action='DESELECT')
    proxy.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    proxy_groups = {group.name for group in proxy.vertex_groups}
    required = {bone.name for bone in rig.data.bones if bone.use_deform}
    if not required.issubset(proxy_groups):
        bpy.data.objects.remove(proxy, do_unlink=True)
        bind_by_distance(mesh, rig)
        return

    for group in list(mesh.vertex_groups):
        mesh.vertex_groups.remove(group)
    for name in sorted(required):
        mesh.vertex_groups.new(name=name)
    bpy.ops.object.select_all(action='DESELECT')
    mesh.select_set(True)
    bpy.context.view_layer.objects.active = mesh
    transfer = mesh.modifiers.new(name='353L_Weight_Transfer', type='DATA_TRANSFER')
    transfer.object = proxy
    transfer.use_vert_data = True
    transfer.data_types_verts = {'VGROUP_WEIGHTS'}
    transfer.vert_mapping = 'POLYINTERP_NEAREST'
    transfer.layers_vgroup_select_src = 'ALL'
    transfer.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.modifier_apply(modifier=transfer.name)

    mesh.parent = rig
    skin = mesh.modifiers.new(name='353L_Master_Skin', type='ARMATURE')
    skin.object = rig
    bpy.data.objects.remove(proxy, do_unlink=True)


def save_and_export(repo_root, mesh, rig):
    source_dir = repo_root / 'assets' / 'source'
    model_dir = repo_root / 'public' / 'models'
    source_dir.mkdir(parents=True, exist_ok=True)
    model_dir.mkdir(parents=True, exist_ok=True)
    blend_path = source_dir / '353l-master-character-v3.blend'
    glb_path = model_dir / '353l-master-character-v3.glb'
    bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
    bpy.ops.object.select_all(action='DESELECT')
    rig.select_set(True)
    mesh.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format='GLB',
        use_selection=True,
        export_apply=False,
        export_yup=True,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False,
        export_extras=True,
    )
    print(f'BLEND={blend_path}')
    print(f'GLB={glb_path}')
    print(f'VERTICES={len(mesh.data.vertices)}')
    print(f'POLYGONS={len(mesh.data.polygons)}')


def main():
    args = sys.argv[sys.argv.index('--') + 1:]
    source = Path(args[0]).resolve()
    repo_root = Path(args[1]).resolve()
    reset_scene()
    mesh = import_mesh(source)
    rig = build_armature()
    bind(mesh, rig)
    save_and_export(repo_root, mesh, rig)


if __name__ == '__main__':
    main()
