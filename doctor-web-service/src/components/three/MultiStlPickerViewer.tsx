import React, {lazy, useEffect, useMemo, useRef, useState} from 'react'
import {MeshItem} from './ExoViewer'
const ExoViewer = lazy(() => import('./ExoViewer'))
import {classifyMeshName, sortRoles} from './utils/classifyMesh'
type MultiStlPickerViewerProps = {
  height?: number | string
  backgroundColor?: string
}

export default function MultiStlPickerViewer({
  height = 600,
  backgroundColor = '#453B6A',
}: MultiStlPickerViewerProps) {
  const [files, setFiles] = useState<File[]>([])
  const [urls, setUrls] = useState<{file: File; url: string}[]>([])

  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // Create URLs for files
    const list = files.map((f) => ({file: f, url: URL.createObjectURL(f)}))
    setUrls(list)
    return () => {
      // Cleanup any previously created URLs
      list.forEach(({url}) => URL.revokeObjectURL(url))
    }
  }, [files])

  const meshes: MeshItem[] = useMemo(() => {
    const items = urls.map(({file, url}, idx) => {
      const role = classifyMeshName(file.name)
      const name = role !== 'unknown' ? role : file.name || `mesh-${idx + 1}`
      const color = '#F1E5AC' // golden default
      return {
        id: `${role}-${idx}-${file.name}`,
        name,
        visible: true,
        color,
        url,
        type: 'stl' as const,
        opacity: 1,
      }
    }) as (MeshItem & {role?: any})[]
    // Keep upper, lower, bite first
    items.sort((a: any, b: any) => sortRoles(classifyMeshName(a.name), classifyMeshName(b.name)))
    return items
  }, [urls])

  return (
    <div className='w-full'>
      <div className='mb-3 flex items-center gap-2'>
        <input
          ref={inputRef}
          type='file'
          accept='.stl'
          multiple
          onChange={(e) => {
            const list = Array.from(e.target.files || [])
            setFiles(list)
          }}
        />
        {files.length > 0 && (
          <button
            className='px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs'
            onClick={() => {
              setFiles([])
              if (inputRef.current) inputRef.current.value = ''
            }}
          >
            Clear
          </button>
        )}
      </div>
      <ExoViewer height={height} backgroundColor={backgroundColor} initialMeshes={meshes} />
    </div>
  )
}
