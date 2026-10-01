/* eslint-disable react/no-unknown-property */
import React, {Suspense, useEffect, useMemo} from 'react'
import * as THREE from 'three'
import {Canvas, useLoader} from '@react-three/fiber'
import {Bounds, OrbitControls} from '@react-three/drei'
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js'

export type PlanStlViewerProps = {
  url: string
  height?: number | string
  color?: string
  className?: string
  onReady?: () => void
  backgroundColor?: string
}

function STLMesh({
  url,
  color = '#4f46e5',
  onReady,
}: {
  url: string
  color?: string
  onReady?: () => void
}) {
  const geometry = useLoader(STLLoader, url)
  // Ensure normals exist for correct lighting from all directions
  useMemo(() => {
    geometry.computeVertexNormals?.()
    return geometry
  }, [geometry])
  const material = useMemo(() => {
    const base = new THREE.Color(color)
    // Ensure consistent SRGB workflow
    // @ts-ignore three < r160
    base.convertSRGBToLinear?.()
    return new THREE.MeshStandardMaterial({
      color: base,
      emissive: base,
      emissiveIntensity: 0.12,
      roughness: 0.8,
      metalness: 0,
      // Render both sides so the model keeps same appearance when rotated
      side: THREE.DoubleSide,
    })
  }, [color])
  useEffect(() => {
    onReady?.()
  }, [onReady])
  return (
    <mesh
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {/* STL often Y-up; rotate to Z-up */}
    </mesh>
  )
}

export default function PlanStlViewer({
  url,
  height = 600,
  color = '#F1E5AC',
  className,
  onReady,
  backgroundColor = '#453B6A',
}: PlanStlViewerProps) {
  const hStyle = typeof height === 'number' ? `${height}px` : height
  return (
    <div className={className} style={{width: '100%', height: hStyle}}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{position: [1.5, 1.2, 1.8], fov: 50}}
        onCreated={({gl, scene}) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 0.9
          // @ts-ignore
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.shadowMap.enabled = true
          // Reduced-intensity purple for better contrast with the model
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
            <STLMesh url={url} color={color} onReady={onReady} />
          </Bounds>
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
