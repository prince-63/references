import {useLocation, useNavigate, useParams, useSearchParams} from 'react-router-dom'
import TabSectionCard from '../components/TabSectionCard'
import {useCallback, useEffect} from 'react'
import {
  getApiDataPrescriptionByPatient,
  PrescriptionData,
  resetPrescriptionState,
} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'
import EmptyState from '../components/EmptyState'
import CollapseCardWithBorder from '../components/CollapseCardWithBorder'
import dayjs from 'dayjs'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {BookCheckIcon} from 'lucide-react'
import Page from 'components/page/Page'
import {EmbeddedPrescriptionForm} from 'screens/Orders/Steps/EmbeddedPrescriptionForm'
import useAllUserPlan from '@hooks/useAllUserPlan'

const getPrescriptionDisplayName = (
  prescription: PrescriptionData & {prescriptionNumber?: number}
) => {
  const formData = prescription?.data
  if (formData && typeof formData === 'object') {
    const firstTextFieldEntry = Object.entries(formData).find(
      ([key, value]) =>
        /^textfield_/i.test(key) && typeof value === 'string' && value.trim().length > 0
    )
    if (firstTextFieldEntry) {
      return firstTextFieldEntry[1].trim()
    }
  }

  return `Prescription ${prescription.prescriptionNumber ?? ''}`.trim()
}

const CustomerPrescription = () => {
  const {patientId} = useParams()
  const {isPractice} = useAllUserPlan()
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const orderIdFromUrl = searchParams.get('order_id') || undefined
  const {orderList} = useSelector((state: RootState) => state.customerPatientProfile)
  const {prescriptionsByPatient, getByPatientLoading} = useSelector(
    (state: RootState) => state.apiPrescription
  )
  const navigate = useNavigate()
  const location = useLocation()

  const sortedPrescriptions = [...prescriptionsByPatient]
    .sort((a: any, b: any) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
    .map((prescription: any, index: number, arr: any[]) => ({
      ...prescription,
      prescriptionNumber: arr.length - index,
    }))

  const fetchPrescriptionsByPatient = useCallback(() => {
    dispatchAction(
      getApiDataPrescriptionByPatient({
        patientId: safeParseInt(patientId),
        orderId: orderIdFromUrl ?? null,
      })
    )
  }, [dispatchAction, orderIdFromUrl, patientId])

  useEffect(() => {
    fetchPrescriptionsByPatient()
  }, [fetchPrescriptionsByPatient])

  const handleOpenAddModal = () => {
    if (!patientId) return
    dispatchAction(resetPrescriptionState())
    const returnTo = `${location.pathname}${location.search}`
    navigate(`/profile/${patientId}/details/prescriptions/new?template=ALIGNER`, {
      state: {returnTo},
    })
  }

  return (
    <Page loading={getByPatientLoading}>
      <TabSectionCard
        title='Prescription Log'
        buttonText={orderList?.length <= 1 && isPractice ? 'Prescription' : undefined}
        onClick={() => {
          handleOpenAddModal()
        }}
      >
        {sortedPrescriptions.length === 0 ? (
          <EmptyState title='No Prescription Added' />
        ) : (
          <div className='flex flex-col gap-4'>
            {sortedPrescriptions.map((prescription: any, index: number) => {
              const prescriptionName = getPrescriptionDisplayName(prescription)
              return (
                <CollapseCardWithBorder
                  title={
                    <div className='flex justify-between'>
                      <div className='flex gap-4 items-center'>
                        <div className='flex justify-center rounded-2xl items-center w-16 h-16 bg-primaryColor '>
                          <BookCheckIcon color='#fff' />
                        </div>
                        <div className=''>
                          <div className='text-base font-semibold'>{prescriptionName}</div>
                          <div className='text-sm font-medium text-slate-400 tracking-[0.14em]'>
                            {prescription?.created_at
                              ? dayjs(prescription.created_at).format('MMM DD, YYYY • hh:mm A')
                              : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  position='end'
                  defaultOpen={index === 0}
                  key={prescription.prescription_id ?? index}
                >
                  <div className='mt-4 h-[65vh] min-h-[420px] max-h-[760px] w-full max-w-full overflow-hidden rounded-lg border border-gray-200'>
                    <EmbeddedPrescriptionForm
                      prescriptionId={safeParseInt(prescription.prescription_id)}
                      patientId={String(patientId ?? '')}
                      mode='view'
                      iframeClassName='block h-full w-full min-h-0 border-0'
                      initialData={prescription}
                    />
                  </div>
                </CollapseCardWithBorder>
              )
            })}
          </div>
        )}
      </TabSectionCard>
    </Page>
  )
}

export default CustomerPrescription
