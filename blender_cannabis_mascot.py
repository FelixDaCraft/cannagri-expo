# Blender Python Script - Cannabis Mascot 3D Character
# Run this in Blender: Edit > Preferences > Add-ons, or paste in Scripting tab

import bpy
import math
from mathutils import Vector

# ============================================
# CLEANUP - Supprimer tous les objets existants
# ============================================
def cleanup_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # Supprimer les matériaux orphelins
    for mat in bpy.data.materials:
        if mat.users == 0:
            bpy.data.materials.remove(mat)

cleanup_scene()

# ============================================
# MATÉRIAUX CARTOON
# ============================================
def create_toon_material(name, color, emission=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    # Clear default nodes
    nodes.clear()

    # Shader to RGB for toon effect
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (400, 0)

    mix_shader = nodes.new('ShaderNodeMixShader')
    mix_shader.location = (200, 0)

    diffuse = nodes.new('ShaderNodeBsdfDiffuse')
    diffuse.location = (0, 100)
    diffuse.inputs['Color'].default_value = (*color, 1.0)

    emission_node = nodes.new('ShaderNodeEmission')
    emission_node.location = (0, -100)
    emission_node.inputs['Color'].default_value = (*color, 1.0)
    emission_node.inputs['Strength'].default_value = emission

    links.new(diffuse.outputs['BSDF'], mix_shader.inputs[1])
    links.new(emission_node.outputs['Emission'], mix_shader.inputs[2])
    links.new(mix_shader.outputs['Shader'], output.inputs['Surface'])

    mix_shader.inputs['Fac'].default_value = 0.3

    return mat

# Créer les matériaux
mat_pot = create_toon_material("Pot_Terracotta", (0.76, 0.38, 0.24))
mat_leaf = create_toon_material("Leaf_Green", (0.15, 0.35, 0.15))
mat_leaf_dark = create_toon_material("Leaf_DarkGreen", (0.08, 0.22, 0.08))
mat_skin = create_toon_material("Skin_Cream", (0.95, 0.9, 0.8))
mat_black = create_toon_material("Black", (0.02, 0.02, 0.02))
mat_white = create_toon_material("White", (1.0, 1.0, 1.0))
mat_smoke = create_toon_material("Smoke", (0.9, 0.88, 0.8), emission=0.2)
mat_halo = create_toon_material("Halo", (0.95, 0.92, 0.8), emission=0.1)

# ============================================
# POT EN TERRE CUITE
# ============================================
def create_pot():
    # Corps principal du pot (forme trapézoïdale)
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=1.2, depth=1.5, location=(0, 0, -1.5))
    pot_body = bpy.context.active_object
    pot_body.name = "Pot_Body"

    # Passer en edit mode pour modifier la forme
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='DESELECT')

    # Sélectionner les vertices du haut
    bpy.ops.object.mode_set(mode='OBJECT')

    for v in pot_body.data.vertices:
        if v.co.z > 0.5:
            v.co.x *= 1.3
            v.co.y *= 1.3
        if v.co.z < -0.5:
            v.co.x *= 0.85
            v.co.y *= 0.85

    # Rebord du pot
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.55,
        minor_radius=0.15,
        location=(0, 0, -0.75)
    )
    rim = bpy.context.active_object
    rim.name = "Pot_Rim"

    # Joindre le rebord au pot
    pot_body.select_set(True)
    bpy.context.view_layer.objects.active = pot_body
    bpy.ops.object.join()

    # Appliquer le matériau
    pot_body.data.materials.append(mat_pot)

    # Subdivision pour lisser
    bpy.ops.object.modifier_add(type='SUBSURF')
    pot_body.modifiers["Subdivision"].levels = 2

    return pot_body

pot = create_pot()

# ============================================
# TIGE
# ============================================
def create_stem():
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.2, depth=1.0, location=(0, 0, -0.2))
    stem = bpy.context.active_object
    stem.name = "Stem"
    stem.data.materials.append(mat_leaf_dark)
    return stem

stem = create_stem()

# ============================================
# TÊTE - FEUILLE DE CANNABIS
# ============================================
def create_leaf_head():
    # Créer la feuille principale (forme de base)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=1.0, location=(0, 0, 1.2))
    head = bpy.context.active_object
    head.name = "Head_Base"

    # Aplatir un peu
    head.scale = (1.0, 0.4, 1.2)
    bpy.ops.object.transform_apply(scale=True)

    # Créer les pointes de la feuille
    leaf_points = []
    num_points = 7
    for i in range(num_points):
        angle = math.pi/2 + (i - num_points//2) * 0.4
        x = math.cos(angle) * 0.3
        z = 1.2 + math.sin(angle) * 1.0 + (0.3 if i == num_points//2 else 0)

        # Hauteur variable pour les pointes
        height = 0.8 if i == num_points//2 else 0.5 + abs(i - num_points//2) * -0.1

        bpy.ops.mesh.primitive_cone_add(
            vertices=8,
            radius1=0.15,
            radius2=0.02,
            depth=height,
            location=(x, 0, z + height/2)
        )
        point = bpy.context.active_object
        point.name = f"Leaf_Point_{i}"

        # Rotation pour pointer vers l'extérieur
        point.rotation_euler = (0, (i - num_points//2) * -0.15, 0)
        leaf_points.append(point)

    # Sélectionner tout et joindre
    bpy.ops.object.select_all(action='DESELECT')
    head.select_set(True)
    for p in leaf_points:
        p.select_set(True)
    bpy.context.view_layer.objects.active = head
    bpy.ops.object.join()

    head.data.materials.append(mat_leaf)

    # Subdivision
    bpy.ops.object.modifier_add(type='SUBSURF')
    head.modifiers["Subdivision"].levels = 2

    return head

head = create_leaf_head()

# ============================================
# YEUX ET BOUCHE (EXPRESSION ÉNERVÉE)
# ============================================
def create_face():
    face_parts = []

    # Œil gauche
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(-0.3, 0.35, 1.1))
    eye_l = bpy.context.active_object
    eye_l.name = "Eye_Left"
    eye_l.scale = (1, 0.5, 0.8)
    eye_l.data.materials.append(mat_white)
    face_parts.append(eye_l)

    # Pupille gauche
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(-0.3, 0.42, 1.1))
    pupil_l = bpy.context.active_object
    pupil_l.name = "Pupil_Left"
    pupil_l.data.materials.append(mat_black)
    face_parts.append(pupil_l)

    # Œil droit
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(0.3, 0.35, 1.1))
    eye_r = bpy.context.active_object
    eye_r.name = "Eye_Right"
    eye_r.scale = (1, 0.5, 0.8)
    eye_r.data.materials.append(mat_white)
    face_parts.append(eye_r)

    # Pupille droite
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(0.3, 0.42, 1.1))
    pupil_r = bpy.context.active_object
    pupil_r.name = "Pupil_Right"
    pupil_r.data.materials.append(mat_black)
    face_parts.append(pupil_r)

    # Sourcils (en colère)
    bpy.ops.mesh.primitive_cube_add(size=0.3, location=(-0.3, 0.4, 1.35))
    brow_l = bpy.context.active_object
    brow_l.name = "Brow_Left"
    brow_l.scale = (1.5, 0.3, 0.2)
    brow_l.rotation_euler = (0, 0, 0.4)
    brow_l.data.materials.append(mat_leaf_dark)
    face_parts.append(brow_l)

    bpy.ops.mesh.primitive_cube_add(size=0.3, location=(0.3, 0.4, 1.35))
    brow_r = bpy.context.active_object
    brow_r.name = "Brow_Right"
    brow_r.scale = (1.5, 0.3, 0.2)
    brow_r.rotation_euler = (0, 0, -0.4)
    brow_r.data.materials.append(mat_leaf_dark)
    face_parts.append(brow_r)

    # Bouche (grimace)
    bpy.ops.mesh.primitive_cube_add(size=0.5, location=(0, 0.4, 0.7))
    mouth = bpy.context.active_object
    mouth.name = "Mouth"
    mouth.scale = (1.2, 0.3, 0.4)
    mouth.data.materials.append(mat_black)
    face_parts.append(mouth)

    # Dents
    for i in range(6):
        x = -0.2 + i * 0.08
        bpy.ops.mesh.primitive_cube_add(size=0.08, location=(x, 0.48, 0.75))
        tooth = bpy.context.active_object
        tooth.name = f"Tooth_{i}"
        tooth.scale = (1, 0.5, 1.5)
        tooth.data.materials.append(mat_white)
        face_parts.append(tooth)

    return face_parts

face = create_face()

# ============================================
# BRAS MUSCLÉS
# ============================================
def create_arm(side='left'):
    arm_parts = []
    x_mult = -1 if side == 'left' else 1

    # Bras supérieur
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.25, depth=1.0, location=(x_mult * 1.0, 0, 0.5))
    upper_arm = bpy.context.active_object
    upper_arm.name = f"Upper_Arm_{side}"
    upper_arm.rotation_euler = (0, x_mult * 0.8, 0)
    upper_arm.data.materials.append(mat_black)
    arm_parts.append(upper_arm)

    # Avant-bras
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.22, depth=0.8, location=(x_mult * 1.8, 0, 1.0))
    forearm = bpy.context.active_object
    forearm.name = f"Forearm_{side}"
    forearm.rotation_euler = (0, x_mult * -0.5, 0)
    forearm.data.materials.append(mat_black)
    arm_parts.append(forearm)

    # Poing
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(x_mult * 2.2, 0, 1.5))
    fist = bpy.context.active_object
    fist.name = f"Fist_{side}"
    fist.scale = (1.0, 0.8, 1.2)
    fist.data.materials.append(mat_skin)
    arm_parts.append(fist)

    # Doigts du poing
    for i in range(4):
        z_offset = 1.4 + i * 0.08
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.08, depth=0.25, location=(x_mult * 2.4, 0.15, z_offset))
        finger = bpy.context.active_object
        finger.name = f"Finger_{side}_{i}"
        finger.rotation_euler = (1.57, 0, 0)
        finger.data.materials.append(mat_skin)
        arm_parts.append(finger)

    # Pouce
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.07, depth=0.2, location=(x_mult * 2.1, 0.2, 1.35))
    thumb = bpy.context.active_object
    thumb.name = f"Thumb_{side}"
    thumb.rotation_euler = (0.5, x_mult * 0.5, 0)
    thumb.data.materials.append(mat_skin)
    arm_parts.append(thumb)

    # Appliquer subdivision à chaque partie
    for part in arm_parts:
        part.select_set(True)
        bpy.context.view_layer.objects.active = part
        bpy.ops.object.modifier_add(type='SUBSURF')
        part.modifiers["Subdivision"].levels = 1
        part.select_set(False)

    return arm_parts

left_arm = create_arm('left')
right_arm = create_arm('right')

# ============================================
# JAMBES
# ============================================
def create_leg(side='left'):
    leg_parts = []
    x_mult = -1 if side == 'left' else 1

    # Jambe
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.15, depth=0.6, location=(x_mult * 0.5, 0, -2.3))
    leg = bpy.context.active_object
    leg.name = f"Leg_{side}"
    leg.rotation_euler = (0, x_mult * 0.3, 0)
    leg.data.materials.append(mat_black)
    leg_parts.append(leg)

    # Pied/Chaussure
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.3, location=(x_mult * 0.6, 0.1, -2.7))
    foot = bpy.context.active_object
    foot.name = f"Foot_{side}"
    foot.scale = (1.2, 1.5, 0.6)
    foot.data.materials.append(mat_pot)  # Même couleur que le pot
    leg_parts.append(foot)

    return leg_parts

left_leg = create_leg('left')
right_leg = create_leg('right')

# ============================================
# HALO / CERCLE DERRIÈRE
# ============================================
def create_halo():
    bpy.ops.mesh.primitive_circle_add(vertices=64, radius=2.5, fill_type='NGON', location=(0, -0.5, 0.5))
    halo = bpy.context.active_object
    halo.name = "Halo_Background"
    halo.data.materials.append(mat_halo)
    return halo

halo = create_halo()

# ============================================
# FUMÉE / VAPEUR
# ============================================
def create_smoke_puffs():
    smoke_parts = []
    positions = [
        (-1.8, 0, 2.0),
        (1.8, 0, 2.0),
        (-0.8, 0, -2.5),
        (0.8, 0, -2.5),
        (-2.5, 0, 1.5),
        (2.5, 0, 1.5),
    ]

    for i, pos in enumerate(positions):
        # Créer plusieurs sphères pour effet de fumée
        for j in range(3):
            offset = (j * 0.15, j * 0.1, j * 0.2)
            bpy.ops.mesh.primitive_uv_sphere_add(
                radius=0.15 + j * 0.08,
                location=(pos[0] + offset[0], pos[1] + offset[1], pos[2] + offset[2])
            )
            puff = bpy.context.active_object
            puff.name = f"Smoke_{i}_{j}"
            puff.data.materials.append(mat_smoke)
            smoke_parts.append(puff)

    return smoke_parts

smoke = create_smoke_puffs()

# ============================================
# CONFIGURATION CAMÉRA ET ÉCLAIRAGE
# ============================================
def setup_camera_and_lights():
    # Caméra
    bpy.ops.object.camera_add(location=(0, 8, 0))
    camera = bpy.context.active_object
    camera.name = "Camera_Main"
    camera.rotation_euler = (1.5708, 0, 3.14159)  # Face au personnage
    bpy.context.scene.camera = camera

    # Lumière principale (Key Light)
    bpy.ops.object.light_add(type='SUN', location=(3, 3, 5))
    key_light = bpy.context.active_object
    key_light.name = "Key_Light"
    key_light.data.energy = 3.0

    # Lumière de remplissage (Fill Light)
    bpy.ops.object.light_add(type='AREA', location=(-3, 2, 2))
    fill_light = bpy.context.active_object
    fill_light.name = "Fill_Light"
    fill_light.data.energy = 100.0

    # Lumière de contour (Rim Light)
    bpy.ops.object.light_add(type='SPOT', location=(0, -3, 3))
    rim_light = bpy.context.active_object
    rim_light.name = "Rim_Light"
    rim_light.data.energy = 500.0
    rim_light.rotation_euler = (-0.5, 0, 0)

setup_camera_and_lights()

# ============================================
# PARAMÈTRES DE RENDU
# ============================================
def setup_render_settings():
    scene = bpy.context.scene

    # Utiliser Eevee pour rendu rapide style cartoon
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if bpy.app.version >= (4, 2, 0) else 'BLENDER_EEVEE'

    # Résolution
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080

    # Fond transparent
    scene.render.film_transparent = True

    # Activer Ambient Occlusion
    scene.eevee.use_gtao = True

    # Bloom pour effet cartoon
    scene.eevee.use_bloom = True
    scene.eevee.bloom_intensity = 0.1

setup_render_settings()

# ============================================
# ORGANISER LA SCÈNE
# ============================================
def organize_scene():
    # Créer des collections
    if "Character" not in bpy.data.collections:
        char_collection = bpy.data.collections.new("Character")
        bpy.context.scene.collection.children.link(char_collection)

    if "Lights" not in bpy.data.collections:
        lights_collection = bpy.data.collections.new("Lights")
        bpy.context.scene.collection.children.link(lights_collection)

    # Déplacer les objets dans les collections appropriées
    for obj in bpy.data.objects:
        if obj.type == 'LIGHT' or obj.type == 'CAMERA':
            if obj.name not in bpy.data.collections["Lights"].objects:
                try:
                    bpy.data.collections["Lights"].objects.link(obj)
                    bpy.context.scene.collection.objects.unlink(obj)
                except:
                    pass
        elif obj.type == 'MESH':
            if obj.name not in bpy.data.collections["Character"].objects:
                try:
                    bpy.data.collections["Character"].objects.link(obj)
                    bpy.context.scene.collection.objects.unlink(obj)
                except:
                    pass

organize_scene()

# ============================================
# FINALISATION
# ============================================
# Sélectionner tous les objets du personnage et recentrer l'origine
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        obj.select_set(True)

# Mettre à jour la vue
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for region in area.regions:
            if region.type == 'WINDOW':
                override = {'area': area, 'region': region}
                bpy.ops.view3d.view_all(override)
                break

print("=" * 50)
print("CANNABIS MASCOT 3D - CRÉATION TERMINÉE!")
print("=" * 50)
print("Le personnage a été créé avec:")
print("- Pot en terre cuite")
print("- Tête en forme de feuille")
print("- Expression énervée (yeux, sourcils, bouche)")
print("- Bras musclés avec poings")
print("- Jambes avec chaussures")
print("- Halo de fond")
print("- Effets de fumée")
print("- Éclairage 3 points")
print("- Paramètres de rendu cartoon")
print("=" * 50)
print("Appuyez sur F12 pour faire un rendu!")
print("=" * 50)
