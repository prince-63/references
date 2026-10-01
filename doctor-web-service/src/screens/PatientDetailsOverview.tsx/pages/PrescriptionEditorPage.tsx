import React, {useMemo, useState} from 'react'
import {useParams, useNavigate, useSearchParams, useLocation} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import getColorPalette from 'utils/getColorPalette'
import {EmbeddedPrescriptionForm} from 'screens/Orders/Steps/EmbeddedPrescriptionForm'
import CaseFilesViewerSidebar from 'screens/PatientDetailsOverview.tsx/components/CaseFilesViewerSidebar'
import BorderedCard from 'components/BorderedCard/BorderedCard'
import {useMediaQuery} from 'react-responsive'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useProfileBasePath from '@hooks/useProfileBasePath'

export default function PrescriptionEditorPage() {
  const {patientId, prescriptionId} = useParams<{patientId: string; prescriptionId?: string}>()
  const [searchParams] = useSearchParams()
  const {isPractice} = useAllUserPlan()
  const isEdit = Boolean(prescriptionId)
  const nav = useNavigate()
  const location = useLocation()
  const profileBasePath = useProfileBasePath()
  const pal = getColorPalette()
  const {data} = useSelector((s: RootState) => s.apiGetLeadsProfileDetails)
  const {serviceConfig} = useSelector((s: RootState) => s.serviceConfiguration)
  const {postLoading} = useSelector((s: RootState) => s.apiPrescription)

  const pid = patientId || data?.patient_details?.id?.toString() || ''
  const [submitForm, setSubmitForm] = useState<(() => void) | null>(null)
  const templateParam = searchParams.get('template') === 'ORTHO' ? 'ORTHO' : 'ALIGNER'
  const returnToPath = (location.state as {returnTo?: string} | null)?.returnTo

  const onFormSuccess = useMemo<(() => void) | undefined>(() => {
    if (!pid) return undefined
    const fallbackRoute = `${profileBasePath}/${pid}/details/prescriptions`
    const nextRoute = returnToPath || fallbackRoute
    return () => nav(nextRoute)
  }, [pid, returnToPath, nav])

  // ✅ Detect screen size
  const isMobile = useMediaQuery({maxWidth: 768}) // true for mobile view
  const columnHeightClass = isMobile ? 'h-[50dvh]' : 'h-[70dvh]'

  return (
    <div className={`w-full  flex flex-col p-4  gap-4 overflow-hidden  ${columnHeightClass}`}>
      {/* Header */}
      <div className='flex items-center justify-between shrink-0'>
        <h1 className='text-lg font-semibold text-gray-900'>
          {isEdit ? 'Edit Prescription' : 'Add Prescription'}
        </h1>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => nav(-1)}
            className='px-3 py-2 rounded border text-gray-700 hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={() => {
              if (postLoading) return
              submitForm?.()
            }}
            className='px-4 py-2 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed'
            style={{
              background: pal.primaryColor,
              border: `1px solid ${pal.primaryColor}`,
            }}
            disabled={postLoading}
          >
            {postLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        className={`flex-1 min-h-0 h-full grid ${
          isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-[minmax(0,1fr)_420px]'
        } ${isPractice && serviceConfig.PLANNING && '!w-full !grid-cols-1'} gap-4`}
      >
        <BorderedCard
          cardClassName={`h-full min-h-0 flex-1 p-0 gap-0 ${isPractice && serviceConfig.PLANNING && 'border-none'}`}
          contentClassName='flex-1 min-h-0 flex'
        >
          <EmbeddedPrescriptionForm
            prescriptionId={isEdit ? Number(prescriptionId) : undefined}
            patientId={pid}
            mode={isEdit ? 'edit' : 'add'}
            onSuccess={onFormSuccess}
            setSubmitForm={setSubmitForm}
            template={templateParam}
            iframeClassName={`block flex-1 w-full h-full min-h-0 border-0 pb-0 md:pb-10`}
          />
        </BorderedCard>

        {!isMobile && !(isPractice && serviceConfig.PLANNING) && (
          <div
            className={`bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col min-h-0 h-full`}
          >
            <div className='flex-1 min-h-0 overflow-auto p-2'>
              <CaseFilesViewerSidebar />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
