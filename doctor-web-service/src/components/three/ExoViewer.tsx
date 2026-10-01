/* eslint-disable react/no-unknown-property */
import React, {Suspense, useEffect, useMemo, useState} from 'react'
import * as THREE from 'three'
import {Canvas, useLoader, useThree} from '@react-three/fiber'
import {Bounds, OrbitControls} from '@react-three/drei'
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js'
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import getBrandConfig from 'utils/getBrandConfig'

export type MeshItem = {
  id: string
  name: string
  visible: boolean
  color: string
  url?: string
  type?: 'stl' | 'ply' | 'glb' | 'gltf'
  opacity?: number
}

export type ExoViewerProps = {
  initialMeshes: MeshItem[]
  height?: number | string
  onClose?: () => void
  backgroundColor?: string
}

// Removed custom useFov hook (it used useThree outside <Canvas/>). We'll control FOV via
// camera instance exposed from inside Canvas using ThreeApiBridge.

function STLMesh({
  url,
  color,
  visible,
  opacity,
}: {
  url: string
  color: string
  visible: boolean
  opacity: number
}) {
  const geo = useLoader(STLLoader, url)
  const mat = useMemo(() => {
    const c = new THREE.Color(color)
    // @ts-ignore
    c.convertSRGBToLinear?.()
    const o = Math.max(0, Math.min(1, opacity))
    const m = new THREE.MeshStandardMaterial({
      color: c,
      // Keep a subtle self-tint so very light gold doesn't wash out to white
      emissive: c,
      emissiveIntensity: 0.12,
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide,
      opacity: o,
      transparent: o < 1,
      depthWrite: o === 1,
    })
    return m
  }, [color, opacity])
  // Ensure normals for lighting consistency
  useMemo(() => {
    geo.computeVertexNormals?.()
    return geo
  }, [geo])
  return (
    <mesh
      geometry={geo}
      material={mat}
      castShadow
      receiveShadow
      visible={visible && opacity > 0}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  )
}

function PLYMesh({
  url,
  color,
  visible,
  opacity,
}: {
  url: string
  color: string
  visible: boolean
  opacity: number
}) {
  const geo = useLoader(PLYLoader, url)
  const mat = useMemo(() => {
    const c = new THREE.Color(color)
    // @ts-ignore
    c.convertSRGBToLinear?.()
    const o = Math.max(0, Math.min(1, opacity))
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.12,
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide,
      opacity: o,
      transparent: o < 1,
      depthWrite: o === 1,
    })
  }, [color, opacity])
  geo.computeVertexNormals?.()
  return (
    <mesh geometry={geo} material={mat} castShadow receiveShadow visible={visible && opacity > 0} />
  )
}

function GLTFMesh({
  url,
  color,
  visible,
  opacity,
}: {
  url: string
  color: string
  visible: boolean
  opacity: number
}) {
  const gltf = useLoader(GLTFLoader, url)
  const mat = useMemo(() => {
    const c = new THREE.Color(color)
    // @ts-ignore
    c.convertSRGBToLinear?.()
    const o = Math.max(0, Math.min(1, opacity))
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.12,
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide,
      opacity: o,
      transparent: o < 1,
      depthWrite: o === 1,
    })
  }, [color, opacity])
  const scene = useMemo(() => gltf.scene.clone(true), [gltf])
  useMemo(() => {
    scene.traverse((o: any) => {
      if (o.isMesh) {
        o.material = mat
        o.castShadow = true
        o.receiveShadow = true
      }
    })
  }, [scene, mat])
  return <primitive object={scene} visible={visible && opacity > 0} />
}

function ViewerScene({meshes, fitToken}: {meshes: MeshItem[]; fitToken: number}) {
  const groupRef = React.useRef<THREE.Group>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const controls = useThree((s: any) => s.controls)
  // Adjust camera to fit content whenever FOV or fitToken changes
  useEffect(() => {
    if (!groupRef.current) return
    const box = new THREE.Box3().setFromObject(groupRef.current)
    if (!box.isEmpty()) {
      const size = new THREE.Vector3()
      box.getSize(size)
      const center = new THREE.Vector3()
      box.getCenter(center)
      const vFov = ((camera.fov || 50) * Math.PI) / 180
      const aspect = camera.aspect || 1
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
      const distY = size.y / (2 * Math.tan(vFov / 2))
      const distX = size.x / (2 * Math.tan(hFov / 2))
      const distance = Math.max(distX, distY) + size.z * 0.5
      // Keep current direction but move to new distance from center
      const dir = new THREE.Vector3().subVectors(
        camera.position,
        controls?.target ?? new THREE.Vector3()
      )
      dir.normalize().multiplyScalar(distance)
      camera.position.copy(center.clone().add(dir))
      ;(controls?.target || new THREE.Vector3()).copy?.(center)
      camera.updateProjectionMatrix()
      controls?.update?.()
    }
  }, [fitToken, camera, controls])
  return (
    <>
      <ambientLight intensity={0.35} />
      <hemisphereLight args={[0xffffff, 0x444444, 0.35]} />
      <directionalLight
        position={[3, 6, 5]}
        intensity={0.65}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Suspense fallback={null}>
        <Bounds fit clip margin={1.2}>
          <group ref={groupRef}>
            {meshes.map((m) => {
              if (!m.url) return null
              const o = m.opacity ?? 1
              if (m.type === 'stl')
                return (
                  <STLMesh key={m.id} url={m.url} color={m.color} visible={m.visible} opacity={o} />
                )
              if (m.type === 'ply')
                return (
                  <PLYMesh key={m.id} url={m.url} color={m.color} visible={m.visible} opacity={o} />
                )
              return (
                <GLTFMesh key={m.id} url={m.url} color={m.color} visible={m.visible} opacity={o} />
              )
            })}
          </group>
        </Bounds>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.15} />
        </mesh>
      </Suspense>
      <OrbitControls enableDamping dampingFactor={0.1} makeDefault />
    </>
  )
}

export default function ExoViewer({
  initialMeshes,
  height = 600,
  backgroundColor = '#453B6A',
}: ExoViewerProps) {
  const [meshes, setMeshes] = useState<MeshItem[]>(() =>
    initialMeshes.map((m: any) => ({...m, opacity: m.opacity ?? m.intensity ?? 1}))
  )
  const hStyle = typeof height === 'number' ? `${height}px` : height
  const [api, setApi] = useState<{camera: THREE.PerspectiveCamera; controls?: any} | null>(null)
  // Global intensity multiplier (0..1) applied to all meshes
  const [fov, setFov] = useState<number>(1)
  const [fitToken, setFitToken] = useState<number>(0)

  // Toggle mesh visibility
  const handleToggle = (id: string) => {
    setMeshes((m) => m.map((it) => (it.id === id ? {...it, visible: !it.visible} : it)))
  }
  // Add Mesh feature removed per request

  // Preset views using camera/controls from Canvas
  const setView = (pos: [number, number, number]) => {
    if (!api) return
    const {camera, controls} = api
    camera.position.set(...pos)
    // Align controls target to origin before refit so direction is well-defined
    if (controls?.target) controls.target.set(0, 0, 0)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    controls?.update?.()
    // After setting orientation, refit the object inside the view box
    setFitToken((t) => t + 1)
  }

  // Initialize FOV from camera when available
  useEffect(() => {
    if (api?.camera) {
      setFov((api.camera as THREE.PerspectiveCamera).fov)
    }
  }, [api])

  const brand = getBrandConfig()

  return (
    <div className='relative w-full' style={{height: hStyle, backgroundColor}}>
      {/* Top-left branding */}
      <div className='absolute top-3 left-3 z-20'>
        <div className='bg-white text-[#453B6A] rounded-md px-3 py-1 text-sm font-semibold shadow'>
          {brand?.name}
        </div>
      </div>
      <div className='flex w-full h-full'>
        {/* 70% Canvas area (100% on mobile) */}
        <div className='relative w-full md:w-[70%]' style={{height: '100%'}}>
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{position: [1.5, 1.2, 1.8], fov: 1}}
            onCreated={({gl, scene}) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping
              // Reduce exposure slightly so very light gold (#F1E5AC) doesn't clip to white
              gl.toneMappingExposure = 0.9
              // @ts-ignore
              gl.outputColorSpace = THREE.SRGBColorSpace
              gl.shadowMap.enabled = true
              // Slightly darker/less saturated purple backdrop
              scene.background = new THREE.Color(backgroundColor)
            }}
          >
            <ThreeApiBridge onReady={setApi} />
            <ViewerScene meshes={meshes} fitToken={fitToken} />
          </Canvas>

          {/* Mobile overlay controls (FOV + Default view + view dots) with bottom-right branding */}
          <div className='md:hidden absolute right-2 bottom-2 z-10 text-white space-y-2 flex flex-col items-center text-center'>
            <div className='flex items-center gap-2 justify-center'>
              <span className='text-xs'>FOV</span>
              <input
                type='range'
                min={1}
                max={90}
                value={fov}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setFov(v)
                  if (api?.camera) {
                    const cam = api.camera as THREE.PerspectiveCamera
                    cam.fov = v
                    cam.updateProjectionMatrix()
                    api.controls?.update?.()
                  }
                  setFitToken((t) => t + 1)
                }}
                className='w-28'
              />
              <span className='text-xs w-6 text-right'>{Math.round(fov)}°</span>
            </div>

            <button
              type='button'
              className='text-sm text-white text-center w-full'
              onClick={(e) => {
                e.preventDefault()
                setFitToken((t) => t + 1)
              }}
            >
              Default view
            </button>
            <div className='grid grid-cols-3 gap-2 justify-items-center'>
              <ViewDot onClick={() => setView([2, 2, 2])} />
              <ViewDot onClick={() => setView([-2, 2, 2])} />
              <ViewDot onClick={() => setView([2, -2, 2])} />
              <ViewDot onClick={() => setView([2, 2, -2])} />
              <ViewDot onClick={() => setView([0, 0, 3])} />
              <ViewDot onClick={() => setView([3, 0, 0])} />
            </div>
            <div className='text-center text-white/70 text-[10px]'>v1.0</div>
          </div>
        </div>

        {/* 30% Options panel (hidden on mobile) */}
        <div className='h-full hidden md:block' style={{width: '30%', backgroundColor}}>
          <div className='h-full flex flex-col text-white relative'>
            {/* FOV at top */}
            <div className='px-3 pt-3'>
              <div className='flex items-center gap-2 w-4/5 mx-auto'>
                <span className='text-xs whitespace-nowrap'>FOV</span>
                <input
                  type='range'
                  min={1}
                  max={90}
                  value={fov}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setFov(v)
                    if (api?.camera) {
                      const cam = api.camera as THREE.PerspectiveCamera
                      cam.fov = v
                      cam.updateProjectionMatrix()
                      api.controls?.update?.()
                    }
                    setFitToken((t) => t + 1)
                  }}
                  className='w-full'
                />
                <span className='text-xs w-8 text-right'>{Math.round(fov)}°</span>
              </div>
            </div>

            {/* Mesh controls (scrollable) - 20% narrower (80% width) */}
            <div className='overflow-auto flex-1 px-3 w-4/5 mx-auto'>
              {[...meshes]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((m) => (
                  <div key={m.id} className='w-full p-2'>
                    {/* Name row */}
                    <div className='text-xs mb-1'>
                      <span className='truncate capitalize'>{m.name}</span>
                    </div>
                    {/* Slider + eye toggle in one row */}
                    <div className='flex items-center gap-2'>
                      <input
                        type='range'
                        min={0}
                        max={100}
                        value={Math.round((m.opacity ?? 1) * 100)}
                        onChange={(e) => {
                          const val = Number(e.target.value) / 100
                          setMeshes((arr) =>
                            arr.map((x) => (x.id === m.id ? {...x, opacity: val} : x))
                          )
                        }}
                        className='flex-1'
                        style={{accentColor: '#f59e0b'}}
                      />
                      <button
                        type='button'
                        onClick={(e) => {
                          e.preventDefault()
                          handleToggle(m.id)
                        }}
                        className='px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 shrink-0'
                        aria-label={m.visible ? 'Hide mesh' : 'Show mesh'}
                      >
                        {m.visible ? '👁️' : '🚫'}
                      </button>
                    </div>
                  </div>
                ))}
              <div className='flex gap-4 py-2'>
                <button
                  type='button'
                  className='text-[11px] underline'
                  onClick={(e) => {
                    e.preventDefault()
                    setMeshes((arr) => arr.map((m) => ({...m, visible: false})))
                  }}
                >
                  Hide All
                </button>
                <button
                  type='button'
                  className='text-[11px] underline'
                  onClick={(e) => {
                    e.preventDefault()
                    setMeshes((arr) => arr.map((m) => ({...m, visible: true})))
                  }}
                >
                  Show All
                </button>
              </div>

              {/* Default view moved below Hide/Show All */}
              <button
                type='button'
                className='mt-2 block w-full text-sm text-white text-center'
                onClick={(e) => {
                  e.preventDefault()
                  setFitToken((t) => t + 1)
                }}
              >
                Default view
              </button>

              {/* Six preset views directly under Default view */}
              <div className='mt-2 grid grid-cols-3 gap-2 place-items-center'>
                <ViewDot onClick={() => setView([2, 2, 2])} />
                <ViewDot onClick={() => setView([-2, 2, 2])} />
                <ViewDot onClick={() => setView([2, -2, 2])} />
                <ViewDot onClick={() => setView([2, 2, -2])} />
                <ViewDot onClick={() => setView([0, 0, 3])} />
                <ViewDot onClick={() => setView([3, 0, 0])} />
              </div>
            </div>

            {/* Default view at bottom with six preset angles */}
            <div className='px-3 pb-3 space-y-2'>
              <div className='text-center text-white/70 text-[10px]'>v1.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toolbar buttons removed as requested

function ViewDot({onClick}: {onClick?: () => void}) {
  return (
    <button
      type='button'
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
      className='w-6 h-6 rounded-md bg-gray-300 hover:bg-gray-400'
    />
  )
}

// Bridge component to expose camera/controls safely via callback
function ThreeApiBridge({
  onReady,
}: {
  onReady: (api: {camera: THREE.PerspectiveCamera; controls?: any}) => void
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const controls = useThree((s: any) => s.controls)
  useEffect(() => {
    onReady({camera, controls})
  }, [camera, controls, onReady])
  return null
}
