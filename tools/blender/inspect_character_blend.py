import bpy
from mathutils import Vector

mesh = bpy.data.objects.get('353L_Master_Mesh')
rig = bpy.data.objects.get('CHARACTER_353L_ROOT')
print(f'MESH_PARENT={mesh.parent.name if mesh.parent else None}')
print(f'MESH_MATRIX={mesh.matrix_world}')
print(f'RIG_MATRIX={rig.matrix_world}')
print(f'MODIFIERS={[(m.name, m.type) for m in mesh.modifiers]}')
raw = [mesh.matrix_world @ Vector(corner) for corner in mesh.bound_box]
print(f'RAW_MIN={tuple(round(min(p[i] for p in raw), 4) for i in range(3))}')
print(f'RAW_MAX={tuple(round(max(p[i] for p in raw), 4) for i in range(3))}')
evaluated = mesh.evaluated_get(bpy.context.evaluated_depsgraph_get())
points = [evaluated.matrix_world @ vertex.co for vertex in evaluated.data.vertices]
print(f'EVAL_MIN={tuple(round(min(p[i] for p in points), 4) for i in range(3))}')
print(f'EVAL_MAX={tuple(round(max(p[i] for p in points), 4) for i in range(3))}')
for bone in rig.pose.bones:
    print(f'BONE={bone.name} MATRIX={bone.matrix}')
