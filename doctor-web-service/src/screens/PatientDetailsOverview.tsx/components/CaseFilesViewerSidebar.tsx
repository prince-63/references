import React, {lazy, useEffect, useMemo, useState} from 'react'
import {Minimize2} from 'lucide-react'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {getAllCaseRecord} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {CaseRecordResponse} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import {CaseRecordsForm} from 'screens/CaseRecords/components'
import {MeshItem} from 'components/three/ExoViewer'
const ExoViewer = lazy(() => import('components/three/ExoViewer'))
import {safeParseInt} from 'utils/ConstFunctions'
import getColorPalette from 'utils/getColorPalette'
import {useSearchParams} from 'react-router-dom'

type CaseFilesViewerSidebarProps = {
  selectClassName?: string
}

export default function CaseFilesViewerSidebar({selectClassName}: CaseFilesViewerSidebarProps) {
  const {patientId} = useParams<{patientId: string}>()
  const {dispatchAction} = useDispatchAction()
  const pal = getColorPalette()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const {allCaseRecords: allCaseRecordsRaw, loadingGetAll} = useSelector(
    (state: RootState) => state.caseRecord
  )
  const records: CaseRecordResponse[] = useMemo(() => {
    const list = (allCaseRecordsRaw ?? []).map((r) => ({
      ...r,
      case_record_id: safeParseInt((r as any).case_record_id),
    }))
    return list.sort((a, b) => (b.case_record_id || 0) - (a.case_record_id || 0))
  }, [allCaseRecordsRaw])

  const [selectedId, setSelectedId] = useState<string>('')
  const [inlineMeshes, setInlineMeshes] = useState<MeshItem[] | null>(null)
  const [inlineTempUrls, setInlineTempUrls] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!patientId) return
    dispatchAction(getAllCaseRecord({patient_id: safeParseInt(patientId), orderId: orderId}))
  }, [patientId])

  // Default selected remains null until user chooses from dropdown

  const selected = useMemo(() => {
    const idNum = safeParseInt(selectedId)
    if (!idNum) return undefined
    return records.find((r) => safeParseInt((r as any).case_record_id) === idNum)
  }, [records, selectedId])

  // If inline viewer closes, ensure fullscreen overlay is also closed
  useEffect(() => {
    if (!inlineMeshes && isFullscreen) {
      setIsFullscreen(false)
    }
  }, [inlineMeshes, isFullscreen])

  // Exit fullscreen on Escape key
  useEffect(() => {
    if (!isFullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  // Revoke any temp URLs on unmount to avoid leaks
  useEffect(() => {
    return () => {
      inlineTempUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  return (
    <div className='flex flex-col gap-3 h-full min-h-0'>
      {/* Header */}
      <div className='px-3 md:px-4 pt-3'>
        <h3 className='text-base md:text-lg font-semibold text-gray-900'>Select Case Records</h3>
      </div>
      {/* Dropdown */}
      <div className='flex items-center gap-2 p-2'>
        <select
          className={selectClassName ?? 'w-full sm:w-[20rem] border rounded px-3 py-2 text-sm'}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value=''>Select a case record</option>
          {records.length === 0 && (
            <option value='' disabled>
              No case records
            </option>
          )}
          {records.map((r) => (
            <option key={r.case_record_id} value={String(r.case_record_id)}>
              Case Record #{r.case_record_id}
            </option>
          ))}
        </select>
      </div>

      {/* Inline Details (no modal). Shows either 3D viewer or record details */}
      <div className='rounded border border-gray-200 p-3 min-h-[12rem] flex-1 overflow-auto'>
        {loadingGetAll ? (
          <p className='text-gray-500 text-sm'>Loading case records…</p>
        ) : !selected ? (
          <p className='text-gray-500 text-sm'></p>
        ) : inlineMeshes ? (
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <div className='text-base font-semibold text-gray-900'>3D Viewer</div>
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  className='px-3 py-1.5 text-sm rounded text-white'
                  style={{background: pal.primaryColor, border: `1px solid ${pal.primaryColor}`}}
                  onClick={() => setIsFullscreen(true)}
                >
                  Full screen
                </button>
                <button
                  type='button'
                  className='px-2 py-1 text-sm rounded border'
                  onClick={() => {
                    // Close viewer and restore selection view
                    setInlineMeshes(null)
                    inlineTempUrls.forEach((u) => URL.revokeObjectURL(u))
                    setInlineTempUrls([])
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            <div className='h-[60vh] min-h-[360px]'>
              <ExoViewer
                height={'100%'}
                backgroundColor={'#453B6A'}
                initialMeshes={inlineMeshes}
                onClose={() => {
                  setInlineMeshes(null)
                  inlineTempUrls.forEach((u) => URL.revokeObjectURL(u))
                  setInlineTempUrls([])
                }}
              />
            </div>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            <div className='text-base font-semibold text-gray-900'>
              Case Record #{selected.case_record_id}
            </div>
            {/* Render full record inline in view mode */}
            <CaseRecordsForm
              hideSectionHeader
              hideChiefComplaint
              patientId={safeParseInt(patientId || '')}
              isEditMode={false}
              caseRecordId={selected.case_record_id}
              // Enable inline 3D viewer only here. Other contexts remain unchanged.
              onUploadingChange={undefined}
              useInlineViewer
              onOpenInlineViewer={({meshes, tempUrls}) => {
                setInlineMeshes(meshes)
                setInlineTempUrls(tempUrls)
              }}
            />
          </div>
        )}
      </div>
      {isFullscreen && inlineMeshes && (
        <div className='fixed inset-0 z-[1000] bg-[#453B6A]'>
          {/* Header top middle minimize button */}
          <div className='absolute top-3 left-1/2 -translate-x-1/2 z-[1100]'>
            <button
              type='button'
              aria-label='Minimize (Esc)'
              title='Minimize (Esc)'
              className='flex items-center gap-2 rounded px-4 py-2 bg-white text-[#453B6A] shadow-xl border border-white/80'
              onClick={() => setIsFullscreen(false)}
            >
              <Minimize2 className='w-5 h-5' />
              <span className='text-sm font-semibold'>Minimize</span>
            </button>
          </div>
          <div className='w-full h-full'>
            <ExoViewer
              height={'100%'}
              backgroundColor={'#453B6A'}
              initialMeshes={inlineMeshes}
              onClose={() => {
                setIsFullscreen(false)
                setInlineMeshes(null)
                inlineTempUrls.forEach((u) => URL.revokeObjectURL(u))
                setInlineTempUrls([])
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
