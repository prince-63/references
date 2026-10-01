import {lazy, useEffect, useMemo, useRef, useState} from 'react'
import {getStorageType} from 'utils/storage'
const ExoViewer = lazy(() => import('components/three/ExoViewer'))
import {classifyMeshName, sortRoles} from 'components/three/utils/classifyMesh'

const Show3dPlanningLink = ({link}: {link: string}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [iframeSrc, setIframeSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const lastLoadedLink = getStorageType().getItem('treatmentPlanLink')

    if (lastLoadedLink !== link) {
      getStorageType().setItem('treatmentPlanLink', link)
      setIframeSrc(link)
    } else {
      // Use the stored link to avoid reload
      setIframeSrc(lastLoadedLink)
    }
  }, [link])

  const isStlLink = useMemo(() => {
    if (!iframeSrc) return false
    try {
      const url = new URL(iframeSrc, window.location.origin)
      const pathname = url.pathname || ''
      return /\.stl$/i.test(pathname)
    } catch {
      // Fallback check when URL constructor fails (relative or custom scheme)
      return /\.stl(\?|#|$)/i.test(iframeSrc)
    }
  }, [iframeSrc])

  const isGlbOrPlyLink = useMemo(() => {
    if (!iframeSrc) return false
    try {
      const url = new URL(iframeSrc, window.location.origin)
      const pathname = url.pathname || ''
      return /\.(glb|gltf|ply)$/i.test(pathname)
    } catch {
      return /\.(glb|gltf|ply)(\?|#|$)/i.test(iframeSrc)
    }
  }, [iframeSrc])

  if (!iframeSrc) return null

  // Use unified ExoViewer for STL/GLB/GLTF/PLY
  if (isStlLink || isGlbOrPlyLink) {
    // Support multiple links separated by comma/space/newline
    const parts = iframeSrc.split(/[\s,]+/).filter(Boolean)
    const meshes = parts.map((u, idx) => {
      const clean = u.split('?')[0].split('#')[0]
      const lower = clean.toLowerCase()
      const type: any = lower.endsWith('.stl')
        ? 'stl'
        : lower.endsWith('.ply')
          ? 'ply'
          : lower.endsWith('.gltf')
            ? 'gltf'
            : 'glb'
      const role = classifyMeshName(clean)
      const name = role !== 'unknown' ? role : `mesh-${idx + 1}`
      // color hints per role (optional)
      const color =
        role === 'upper'
          ? '#F1E5AC'
          : role === 'lower'
            ? '#F1E5AC'
            : role === 'bite'
              ? '#F1E5AC'
              : '#F1E5AC'
      return {id: `${role}-${idx}`, name, visible: true, color, url: u, type, role}
    })
    // Order: upper, lower, bite, unknown
    const ordered = meshes.sort((a: any, b: any) => sortRoles(a.role, b.role))
    return (
      <div className='relative'>
        {isLoading && (
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
            <div className='text-sm text-gray-500'>Loading 3D model…</div>
          </div>
        )}
        <ExoViewer
          height={600}
          initialMeshes={ordered.map(({id, name, visible, color, url, type}) => ({
            id,
            name,
            visible,
            color,
            url,
            type,
          }))}
          onClose={() => setIsLoading(false)}
        />
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      width='100%'
      height='600'
      scrolling='no'
      frameBorder='no'
      allow='autoplay'
      src={iframeSrc}
    />
  )
}

export default Show3dPlanningLink
