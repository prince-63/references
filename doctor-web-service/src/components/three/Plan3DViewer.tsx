/* eslint-disable react/no-unknown-property */
import React, {Suspense, useMemo} from 'react'
import {Canvas, useLoader} from '@react-three/fiber'
import {Bounds, OrbitControls, useGLTF} from '@react-three/drei'
import {PLYLoader} from 'three/examples/jsm/loaders/PLYLoader.js'
import * as THREE from 'three'

export type Plan3DViewerProps = {
  url: string
  color?: string
  className?: string
  style?: React.CSSProperties
  height?: number | string
  backgroundColor?: string
}

function GLBModel({url, color}: {url: string; color?: string}) {
  const {scene} = useGLTF(url)
  const material = useMemo(() => {
    if (!color) return null
    const c = new THREE.Color(color)
    // @ts-ignore
    c.convertSRGBToLinear?.()
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.12,
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  }, [color])
  if (material) {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = material
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }
  return <primitive object={scene} />
}

function PLYModel({url, color}: {url: string; color?: string}) {
  const geometry = useLoader(PLYLoader, url)
  const mat = useMemo(() => {
    const c = new THREE.Color(color || '#9ca3af')
    // @ts-ignore
    c.convertSRGBToLinear?.()
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.12,
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  }, [color])
  const geo = useMemo(() => {
    if (!geometry) return undefined
    geometry.computeVertexNormals?.()
    return geometry
  }, [geometry])
  if (!geo) return null
  return <mesh geometry={geo} material={mat} castShadow receiveShadow />
}

export default function Plan3DViewer({
  url,
  color = '#F1E5AC',
  className,
  style,
  height = 600,
  backgroundColor = '#453B6A',
}: Plan3DViewerProps) {
  const isGLB = /\.(glb|gltf)(\?|#|$)/i.test(url)
  const isPLY = /\.(ply)(\?|#|$)/i.test(url)

  return (
    <div className={className} style={{width: '100%', height, ...(style || {})}}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{position: [1.5, 1.2, 1.8], fov: 50}}
        onCreated={({gl, scene}) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.9
          // three r150+: output encoding replaced by outputColorSpace
          // @ts-ignore
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.shadowMap.enabled = true
          // Reduced-intensity purple
          scene.background = new THREE.Color(backgroundColor)
        }}
      >
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
            {isGLB && <GLBModel url={url} color={color} />}
            {isPLY && <PLYModel url={url} color={color} />}
          </Bounds>
          {/* Simple ground to catch shadows */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.15} />
          </mesh>
        </Suspense>
        <OrbitControls enableDamping dampingFactor={0.1} makeDefault />
      </Canvas>
    </div>
  )
}

useGLTF.preload?.('')
