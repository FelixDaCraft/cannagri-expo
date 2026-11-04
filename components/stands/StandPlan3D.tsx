'use client'

// Plan 3D de L'Agronaute : le modèle de la salle (public/plan3d/salle.glb) et les stands,
// construits ici à partir de public/plan3d/plan.json et colorés selon leur statut en base.
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'

export type Stand3DStatus = 'available' | 'reserved' | 'sold' | 'blocked'

export interface Stand3D {
  id: number
  status: Stand3DStatus
}

interface PlanData {
  stands: { n: number; pied: [number, number][]; hauteur: number }[]
  sol: [number, number][]
  etiquettes: { texte: string; pos: [number, number]; h: number }[]
}

interface StandPlan3DProps {
  stands: Stand3D[]
  selectedId: number | null
  hiddenIds?: number[]
  onSelect: (id: number) => void
}

// à garder identique à STATUS_COLORS dans InteractiveStandPlan.tsx
export const STATUS_COLORS: Record<Stand3DStatus, string> = {
  available: '#5E8F62',
  reserved: '#C9A04A',
  sold: '#B5543C',
  blocked: '#9E9E9E',
}

type Vue = '3d' | 'dessus'

interface Scene3D {
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  standMeshes: Map<number, THREE.Mesh>
  standLabels: Map<number, HTMLDivElement>
  target: THREE.Vector3
  radius: number
  animateTo: (vue: Vue) => void
}

const COULEUR_INCONNU = '#CFCFCF'

export function StandPlan3D({ stands, selectedId, hiddenIds = [], onSelect }: StandPlan3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene3D | null>(null)
  const onSelectRef = useRef(onSelect)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vue, setVue] = useState<Vue>('3d')

  onSelectRef.current = onSelect

  // Construction de la scène, une seule fois
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let disposed = false
    let frame = 0

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const labelRenderer = new CSS2DRenderer()
    labelRenderer.domElement.style.position = 'absolute'
    labelRenderer.domElement.style.inset = '0'
    labelRenderer.domElement.style.pointerEvents = 'none'
    container.appendChild(labelRenderer.domElement)

    const scene = new THREE.Scene()
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8c8a84, 1.6))
    const sun = new THREE.DirectionalLight(0xfff4e0, 2.2)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.04
    scene.add(sun)

    const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 400)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minPolarAngle = 0
    controls.maxPolarAngle = THREE.MathUtils.degToRad(72)   // jamais sous le sol
    controls.screenSpacePanning = true

    const standMeshes = new Map<number, THREE.Mesh>()
    const standLabels = new Map<number, HTMLDivElement>()
    const target = new THREE.Vector3()
    let radius = 30
    // sur écran étroit (portrait), on cadre la zone des stands plutôt que toute la salle
    const cibleStands = new THREE.Vector3()
    let rayonStands = 20
    const etroit = () => camera.aspect < 1

    // direction « vers le spectateur » du plan dessiné de L'Agronaute
    const versVous = new THREE.Vector3(0.606, 0, 0.795).normalize()
    let anim: { from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null
    const positionVue = (v: Vue) => {
      const elev = v === '3d' ? THREE.MathUtils.degToRad(38) : THREE.MathUtils.degToRad(89.5)
      const c = etroit() ? cibleStands : target
      const r = etroit() ? (rayonStands * 1.4) / Math.max(camera.aspect, 0.45) : radius
      const d = r * (v === '3d' ? 2.3 : 2.5)
      const h = v === '3d' ? versVous.clone() : new THREE.Vector3(0, 0, 1)
      return c.clone().add(h.multiplyScalar(Math.cos(elev) * d)).add(new THREE.Vector3(0, Math.sin(elev) * d, 0))
    }
    const animateTo = (v: Vue) => {
      anim = { from: camera.position.clone(), to: positionVue(v), t: 0 }
      controls.target.copy(etroit() ? cibleStands : target)
    }

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      labelRenderer.setSize(w, h)
      camera.aspect = w / Math.max(h, 1)
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    resize()

    // contours noirs, comme le plan dessiné
    const contours = (obj: THREE.Object3D) => {
      obj.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        m.castShadow = true
        m.receiveShadow = true
        const lignes = new THREE.LineSegments(
          new THREE.EdgesGeometry(m.geometry, 35),
          new THREE.LineBasicMaterial({ color: 0x1d2b3a, transparent: true, opacity: 0.55 })
        )
        m.add(lignes)
      })
    }

    const charge = async () => {
      try {
        const [plan, gltf] = await Promise.all([
          fetch('/plan3d/plan.json').then((r) => {
            if (!r.ok) throw new Error('plan.json')
            return r.json() as Promise<PlanData>
          }),
          new GLTFLoader().loadAsync('/plan3d/salle.glb'),
        ])
        if (disposed) return
        contours(gltf.scene)
        scene.add(gltf.scene)

        // cadrage sur le sol
        const box = new THREE.Box3()
        plan.sol.forEach(([x, z]) => box.expandByPoint(new THREE.Vector3(x, 0, z)))
        box.getCenter(target)
        radius = box.getSize(new THREE.Vector3()).length() / 2
        const bs = new THREE.Box3()
        plan.stands.forEach((st) => st.pied.forEach(([x, z]) => bs.expandByPoint(new THREE.Vector3(x, 0, z))))
        bs.getCenter(cibleStands)
        rayonStands = bs.getSize(new THREE.Vector3()).length() / 2
        controls.target.copy(etroit() ? cibleStands : target)
        controls.minDistance = radius * 0.4
        controls.maxDistance = radius * 7
        camera.position.copy(positionVue('3d'))
        sun.position.copy(target).add(new THREE.Vector3(-radius, radius * 1.6, -radius * 0.6))
        sun.target.position.copy(target)
        scene.add(sun.target)
        const sc = sun.shadow.camera
        sc.left = sc.bottom = -radius * 1.2
        sc.right = sc.top = radius * 1.2
        sc.far = radius * 5
        sc.updateProjectionMatrix()

        // stands : un pavé par emplacement, numéro au-dessus
        for (const s of plan.stands) {
          const xs = s.pied.map((p) => p[0])
          const zs = s.pied.map((p) => p[1])
          const w = Math.max(...xs) - Math.min(...xs)
          const d = Math.max(...zs) - Math.min(...zs)
          const geo = new THREE.BoxGeometry(w * 0.96, s.hauteur, d * 0.96)
          const mat = new THREE.MeshStandardMaterial({ color: COULEUR_INCONNU, roughness: 0.7, transparent: true })
          const mesh = new THREE.Mesh(geo, mat)
          mesh.position.set((Math.max(...xs) + Math.min(...xs)) / 2, s.hauteur / 2, (Math.max(...zs) + Math.min(...zs)) / 2)
          mesh.castShadow = mesh.receiveShadow = true
          mesh.userData.standId = s.n
          mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x1d2b3a })))
          scene.add(mesh)
          standMeshes.set(s.n, mesh)

          const div = document.createElement('div')
          div.textContent = String(s.n)
          div.className = 'stand3d-label'
          const label = new CSS2DObject(div)
          label.position.set(0, s.hauteur / 2 + 0.35, 0)
          mesh.add(label)
          standLabels.set(s.n, div)
        }

        for (const e of plan.etiquettes) {
          const div = document.createElement('div')
          div.textContent = e.texte
          div.className = 'stand3d-zone'
          const label = new CSS2DObject(div)
          label.position.set(e.pos[0], e.h, e.pos[1])
          scene.add(label)
        }

        sceneRef.current = { camera, controls, standMeshes, standLabels, target, radius, animateTo }
        setLoading(false)
      } catch (e) {
        console.error('[StandPlan3D]', e)
        if (!disposed) setError('Le plan 3D n’a pas pu être chargé.')
      }
    }
    charge()

    // sélection au clic (un glissé pour tourner ne sélectionne rien)
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let down: { x: number; y: number } | null = null
    const pick = (ev: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect()
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)
      const hit = raycaster.intersectObjects(Array.from(standMeshes.values()), false)[0]
      return hit ? (hit.object.userData.standId as number) : null
    }
    const onDown = (ev: PointerEvent) => { down = { x: ev.clientX, y: ev.clientY } }
    const onUp = (ev: PointerEvent) => {
      if (!down) return
      const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y)
      down = null
      if (moved > 6) return
      const id = pick(ev)
      if (id !== null) onSelectRef.current(id)
    }
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerType !== 'mouse') return
      renderer.domElement.style.cursor = pick(ev) !== null ? 'pointer' : 'grab'
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)
    renderer.domElement.addEventListener('pointermove', onMove)

    const loop = () => {
      frame = requestAnimationFrame(loop)
      if (anim) {
        anim.t = Math.min(1, anim.t + 0.04)
        const k = 1 - Math.pow(1 - anim.t, 3)
        camera.position.lerpVectors(anim.from, anim.to, k)
        if (anim.t >= 1) anim = null
      }
      controls.update()
      renderer.render(scene, camera)
      labelRenderer.render(scene, camera)
    }
    loop()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointermove', onMove)
      controls.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        ;(Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose())
      })
      renderer.dispose()
      container.removeChild(renderer.domElement)
      container.removeChild(labelRenderer.domElement)
      sceneRef.current = null
    }
  }, [])

  // Couleurs, sélection et filtre : mis à jour sans reconstruire la scène
  useEffect(() => {
    const s3 = sceneRef.current
    if (!s3) return
    const statut = new Map(stands.map((s) => [s.id, s.status]))
    const caches = new Set(hiddenIds)
    s3.standMeshes.forEach((mesh, id) => {
      const st = statut.get(id)
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.color.set(st ? STATUS_COLORS[st] : COULEUR_INCONNU)
      mat.opacity = caches.has(id) ? 0.25 : 1
      const choisi = id === selectedId
      mat.emissive.set(choisi ? '#F4EAD5' : '#000000')
      mat.emissiveIntensity = choisi ? 0.35 : 0
      mesh.position.y = (mesh.geometry as THREE.BoxGeometry).parameters.height / 2 + (choisi ? 0.25 : 0)
      const label = s3.standLabels.get(id)
      if (label) label.dataset.selected = choisi ? 'true' : 'false'
    })
  }, [stands, selectedId, hiddenIds, loading])

  const changeVue = (v: Vue) => {
    setVue(v)
    sceneRef.current?.animateTo(v)
  }

  return (
    <div className="relative w-full h-[62vh] min-h-[420px] rounded-2xl overflow-hidden bg-[#F4EAD5]">
      <div ref={containerRef} className="absolute inset-0 touch-none" />
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-forest/70">{error}</div>
      )}
      <div className="absolute top-3 left-3 flex gap-2">
        {(['3d', 'dessus'] as Vue[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => changeVue(v)}
            aria-pressed={vue === v}
            className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-sm border transition-colors ${
              vue === v ? 'bg-forest text-cream border-forest' : 'bg-white/90 text-forest border-forest/20 hover:bg-white'
            }`}
          >
            {v === '3d' ? 'Vue 3D' : 'Vue de dessus'}
          </button>
        ))}
      </div>
      <p className="absolute bottom-3 left-3 right-3 pointer-events-none">
        <span className="inline-block text-xs text-forest/80 bg-white/85 rounded-lg px-2 py-1">
          Faites glisser pour tourner, pincez ou utilisez la molette pour zoomer, touchez un stand pour le choisir.
        </span>
      </p>
      <style jsx global>{`
        .stand3d-label {
          font: 700 13px/1 'Barlow Condensed', system-ui, sans-serif;
          color: #1d2b3a;
          background: rgba(244, 234, 213, 0.92);
          border: 1px solid rgba(29, 43, 58, 0.35);
          border-radius: 999px;
          padding: 3px 6px;
          pointer-events: none;
          user-select: none;
        }
        @media (max-width: 640px) {
          .stand3d-label {
            font-size: 11px;
            padding: 2px 4px;
          }
        }
        .stand3d-label[data-selected='true'] {
          background: #1d2b3a;
          color: #f4ead5;
        }
        .stand3d-zone {
          font: 700 12px/1 'Barlow Condensed', system-ui, sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(29, 43, 58, 0.75);
          pointer-events: none;
          user-select: none;
        }
      `}</style>
    </div>
  )
}

export default StandPlan3D
