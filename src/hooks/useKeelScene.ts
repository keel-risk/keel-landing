// Three.js hero scene: a price sphere floating at a waterline, and a tapering
// stack of liquidity plates below it (the keel). Purely decorative: no reading
// is encoded in the geometry, so nothing here can be mistaken for data.
import { useEffect, type RefObject } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

const STORY = ['#6ee7ff', '#5b8cff', '#8b6bff', '#f06bd8']

function storyColour(t: number): THREE.Color {
  const stops = STORY.map((h) => new THREE.Color(h))
  const x = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1)
  const i = Math.floor(x)
  return stops[i].clone().lerp(stops[i + 1], x - i)
}

export function useKeelScene(host: RefObject<HTMLDivElement | null>, reduceMotion: boolean) {
  useEffect(() => {
    const el = host.current
    if (!el) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    el.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-hidden', 'true')

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
    const camBase = new THREE.Vector3(6.2, 2.4, 8.2)
    const target = new THREE.Vector3(0, -0.55, 0)

    const rig = new THREE.Group()
    scene.add(rig)

    // Price sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 96, 96),
      new THREE.MeshPhysicalMaterial({
        color: '#a8d2ff',
        metalness: 0.35,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        iridescence: 1,
        iridescenceIOR: 1.35,
        iridescenceThicknessMinimum: 220,
        iridescenceThicknessMaximum: 680,
      }),
    )
    sphere.position.y = 1.45
    rig.add(sphere)

    // Waterline: a hairline disc and ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.35, 2.36, 160),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.22, side: THREE.DoubleSide }),
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.78
    rig.add(ring)
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(2.35, 160),
      new THREE.MeshBasicMaterial({ color: '#8fb4ff', transparent: true, opacity: 0.035, side: THREE.DoubleSide }),
    )
    disc.rotation.x = -Math.PI / 2
    disc.position.y = 0.78
    rig.add(disc)

    // Liquidity plates, tapering like a keel
    const plates: THREE.Mesh[] = []
    const COUNT = 11
    for (let i = 0; i < COUNT; i++) {
      const t = i / (COUNT - 1)
      const w = 3.3 - t * 2.35
      const d = 1.9 - t * 1.15
      const geo = new RoundedBoxGeometry(w, 0.11, d, 4, 0.05)
      const c = storyColour(t)
      const mat = new THREE.MeshPhysicalMaterial({
        color: c,
        emissive: c,
        emissiveIntensity: 0.32,
        metalness: 0.05,
        roughness: 0.35,
        clearcoat: 0.8,
        iridescence: 0.55,
        iridescenceIOR: 1.25,
        transparent: true,
        opacity: 0.92 - t * 0.32,
      })
      const m = new THREE.Mesh(geo, mat)
      m.position.y = 0.48 - i * 0.33
      rig.add(m)
      plates.push(m)
    }

    // Soft contact light under the sphere
    const glowTex = (() => {
      const c = document.createElement('canvas')
      c.width = c.height = 128
      const g = c.getContext('2d')!
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
      grd.addColorStop(0, 'rgba(160,190,255,0.55)')
      grd.addColorStop(1, 'rgba(160,190,255,0)')
      g.fillStyle = grd
      g.fillRect(0, 0, 128, 128)
      return new THREE.CanvasTexture(c)
    })()
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.6),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false }),
    )
    contact.rotation.x = -Math.PI / 2
    contact.position.y = 0.79
    rig.add(contact)

    const key = new THREE.DirectionalLight('#ffffff', 1.4)
    key.position.set(4, 6, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight('#9c8bff', 1.1)
    rim.position.set(-6, 2, -4)
    scene.add(rim)
    scene.add(new THREE.AmbientLight('#ffffff', 0.25))

    const pointer = new THREE.Vector2(0, 0)
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1)
    }
    if (!reduceMotion) window.addEventListener('pointermove', onMove, { passive: true })

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = w / h
      // Wide frames: look left of the stack so it sits clear of the reading card.
      target.x = w >= 1024 ? -1.9 : 0
      // Narrow screens: pull back so the stack still fits.
      camera.position.copy(camBase).multiplyScalar(w < 640 ? 1.35 : 1)
      camera.lookAt(target)
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    const t0 = performance.now()
    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !reduceMotion && !raf) raf = requestAnimationFrame(tick)
    })
    io.observe(el)

    const pose = (t: number) => {
      rig.rotation.y = -0.5 + t * 0.12
      sphere.position.y = 1.45 + Math.sin(t * 1.1) * 0.06
      plates.forEach((p, i) => {
        p.position.x = Math.sin(t * 0.9 + i * 0.55) * 0.05
        p.rotation.y = Math.sin(t * 0.5 + i * 0.35) * 0.06
      })
      const cx = camBase.x + pointer.x * 0.5
      const cy = camBase.y - pointer.y * 0.35
      camera.position.x += (cx * (el.clientWidth < 640 ? 1.35 : 1) - camera.position.x) * 0.04
      camera.position.y += (cy * (el.clientWidth < 640 ? 1.35 : 1) - camera.position.y) * 0.04
      camera.lookAt(target)
    }

    function tick() {
      raf = 0
      if (!visible) return
      pose((performance.now() - t0) / 1000)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }

    if (reduceMotion) {
      pose(2.2)
      renderer.render(scene, camera)
      ro.disconnect()
      const ro2 = new ResizeObserver(() => {
        resize()
        renderer.render(scene, camera)
      })
      ro2.observe(el)
      return () => {
        ro2.disconnect()
        io.disconnect()
        renderer.dispose()
        env.dispose()
        pmrem.dispose()
        el.removeChild(renderer.domElement)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      ro.disconnect()
      io.disconnect()
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const m = o.material as THREE.Material
          m.dispose()
        }
      })
      glowTex.dispose()
      env.dispose()
      pmrem.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [host, reduceMotion])
}
