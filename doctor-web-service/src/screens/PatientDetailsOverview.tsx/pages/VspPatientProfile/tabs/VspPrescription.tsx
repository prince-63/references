import {useCallback, useEffect, useState, useContext, useRef} from 'react'
import {useParams} from 'react-router-dom'
import {Spin, Modal, message} from 'antd'
import Spinner from 'components/spinner/Spinner'
import TabSectionCard from '../../CustomerPatientProfile/components/TabSectionCard'
import EmptyState from '../../CustomerPatientProfile/components/EmptyState'
import dayjs from 'dayjs'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getVspPrescriptionsByPatient,
  createVspPrescription,
} from 'redux/Slices/AppSlice/VSP/prescriptions.slice'
import {Plus, FileText, FilesIcon} from 'lucide-react'
import CollapseCardWithBorder from '../../CustomerPatientProfile/components/CollapseCardWithBorder'
import {VspPrescriptionForm} from 'screens/VSP/CreateOrder/components/VspPrescriptionForm'
import {Formik, FormikHelpers} from 'formik'
import * as Yup from 'yup'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'

interface PrescriptionFormValues {
  surgery_type: string
  prescription_mode: string
  treatment_plan: string
  tentative_surgery_date: string
  earliest_treatment_plan_date: string
  others_description: string
}

const validationSchema = Yup.object().shape({
  surgery_type: Yup.string().required('Surgery type is required'),
  prescription_mode: Yup.string().required('Prescription mode is required'),
  treatment_plan: Yup.string(),
  tentative_surgery_date: Yup.string().required('Tentative surgery date is required'),
  earliest_treatment_plan_date: Yup.string().required('Earliest treatment plan date is required'),
})

type VspPrescriptionData = {
  id: number
  order_id: string
  prescription_mode: string
  is_single_jaw: boolean
  is_bi_jaw: boolean
  is_undecided: boolean
  is_genioplasty: boolean
  is_others: boolean
  others_description?: string
  treatment_plan?: string
  tentative_surgery_date?: string
  earliest_treatment_plan_by_date?: string
  status: string
  created_at?: string
  updated_at?: string
}

const VspPrescription = () => {
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const [prescriptions, setPrescriptions] = useState<VspPrescriptionData[]>([])
  const [loading, setLoading] = useState(false)
  const [isPrescriptionFormOpen, setIsPrescriptionFormOpen] = useState(false)
  const submitRef = useRef<(() => void) | null>(null)
  const fetchPrescriptions = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    try {
      const response = await dispatchAction(
        getVspPrescriptionsByPatient({patient_id: patientId})
      ).unwrap()
      setPrescriptions(Array.isArray(response) ? (response as any[]) : [])
    } catch (error) {
      console.error('Failed to fetch VSP prescriptions', error)
    } finally {
      setLoading(false)
    }
  }, [patientId, dispatchAction])

  useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  const getSurgeryTypes = (rx: VspPrescriptionData) => {
    const types: string[] = []
    if (rx.is_single_jaw) types.push('Single Jaw')
    if (rx.is_bi_jaw) types.push('Bi-Jaw')
    if (rx.is_undecided) types.push('Undecided')
    if (rx.is_genioplasty) types.push('Genioplasty')
    if (rx.is_others && rx.others_description) types.push(rx.others_description)
    else if (rx.is_others) types.push('Others')
    return types.length > 0 ? types.join(', ') : '-'
  }

  const isNeededByUrgent = (date?: string) => {
    if (!date) return false
    return dayjs(date).isBefore(dayjs().add(14, 'day'))
  }

  const extraActionButtons = (
    <button
      onClick={() => setIsPrescriptionFormOpen(true)}
      className='flex items-center gap-1 bg-primaryColor text-white border-primaryColor px-2 py-1.5 rounded-lg border text-sm font-semibold transition-colors uppercase tracking-wide'
      style={{whiteSpace: 'nowrap'}}
    >
      <Plus size={20} />
      <span>Add Prescription</span>
    </button>
  )

  const handleSubmit = async (
    values: PrescriptionFormValues,
    {setSubmitting, resetForm}: FormikHelpers<PrescriptionFormValues>
  ) => {
    try {
      if (!patientId || !userId) {
        setSubmitting(false)
        return
      }

      const prescriptionRequest = {
        prescription_mode: values.prescription_mode,
        is_single_jaw: values.surgery_type === 'single_jaw',
        is_bi_jaw: values.surgery_type === 'bi_jaw',
        is_undecided: values.surgery_type === 'undecided',
        is_genioplasty: values.surgery_type === 'genioplasty',
        is_others: values.surgery_type === 'others',
        treatment_plan: values.treatment_plan,
        tentative_surgery_date: values.tentative_surgery_date,
        earliest_treatment_plan_by_date: values.earliest_treatment_plan_date,
        patient_id: safeParseInt(patientId),
        others_description: values.others_description,
      }

      const result = await dispatchAction(createVspPrescription(prescriptionRequest))
      if (result.payload) {
        message.success('Prescription added successfully')
        setIsPrescriptionFormOpen(false)
        resetForm()
        fetchPrescriptions()
      }
    } catch (error) {
      console.error('Error adding prescription:', error)
      message.error('Failed to add prescription')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <TabSectionCard title='Surgical Prescription' extraActionButtons={extraActionButtons}>
        <Spin indicator={<Spinner loading />} spinning={loading}>
          {!loading && prescriptions.length === 0 ? (
            <EmptyState
              title='No Prescription Added'
              subTitle='No surgical prescription has been submitted for this case.'
            />
          ) : (
            <div className='flex flex-col gap-4'>
              {prescriptions.map((rx, index) => {
                const urgent = isNeededByUrgent(rx.earliest_treatment_plan_by_date)

                return (
                  <CollapseCardWithBorder
                    key={rx.id}
                    title={
                      <div className='flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4'>
                        <div className='flex gap-3 md:gap-4 items-center'>
                          <div className='flex justify-center rounded-2xl items-center w-12 h-12 md:w-16 md:h-16 shrink-0 bg-primaryColor'>
                            <FilesIcon color='#fff' size={20} />
                          </div>
                          <div>
                            <div className='font-semibold text-gray-900 text-sm md:text-base'>
                              Prescription #{index + 1}
                            </div>
                            <div className='text-xs md:text-sm font-medium text-slate-400 tracking-[0.14em]'>
                              {rx.created_at
                                ? dayjs(rx.created_at).format('MMM DD, YYYY • hh:mm A')
                                : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                    position='end'
                    defaultOpen={true}
                  >
                    <div className='w-full flex flex-col gap-6 mt-4'>
                      {/* Top cards row */}
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        {/* Surgery Types */}
                        <div className='rounded-xl border border-gray-200 bg-gray-50 px-5 py-4'>
                          <div className='text-[11px] tracking-wider text-gray-400 font-semibold uppercase'>
                            Surgery Types
                          </div>
                          <div className='mt-2 text-base font-bold text-gray-900'>
                            {getSurgeryTypes(rx)}
                          </div>
                        </div>

                        {/* Surgery Date */}
                        <div className='rounded-xl border border-gray-200 bg-gray-50 px-5 py-4'>
                          <div className='text-[11px] tracking-wider text-gray-400 font-semibold uppercase'>
                            Surgery Date
                          </div>
                          <div className='mt-2 text-base font-bold text-gray-900'>
                            {rx.tentative_surgery_date
                              ? dayjs(rx.tentative_surgery_date).format('MMM D, YYYY')
                              : '-'}
                          </div>
                        </div>

                        {/* Needed By */}
                        <div
                          className={`rounded-xl border px-5 py-4 ${
                            urgent ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div
                            className={`text-[11px] tracking-wider font-semibold uppercase ${
                              urgent ? 'text-red-400' : 'text-gray-400'
                            }`}
                          >
                            Needed By
                          </div>
                          <div
                            className={`mt-2 text-base font-bold ${
                              urgent ? 'text-red-600' : 'text-gray-900'
                            }`}
                          >
                            {rx.earliest_treatment_plan_by_date
                              ? dayjs(rx.earliest_treatment_plan_by_date).format('MMM D, YYYY')
                              : '-'}
                          </div>
                        </div>
                      </div>

                      {/* Treatment Plan Notes */}
                      {rx.treatment_plan && (
                        <div>
                          <div className='text-[11px] tracking-wider text-gray-400 font-semibold uppercase mb-3'>
                            Detailed Treatment Plan Notes
                          </div>
                          <div className='rounded-xl border border-gray-200 bg-white px-5 py-4'>
                            <div className='text-sm text-gray-700 leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_li]:my-1 [&_p]:my-1'>
                              <div dangerouslySetInnerHTML={{__html: rx.treatment_plan}} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapseCardWithBorder>
                )
              })}
            </div>
          )}
        </Spin>
      </TabSectionCard>

      <Modal
        title={
          <div className='flex items-center gap-2'>
            <FileText size={20} className='text-primaryColor' />
            <span>Add Prescription</span>
          </div>
        }
        open={isPrescriptionFormOpen}
        onCancel={() => setIsPrescriptionFormOpen(false)}
        onOk={() => {
          if (submitRef.current) {
            submitRef.current()
          }
        }}
        okText='Submit'
        width={700}
        destroyOnClose
        styles={{body: {maxHeight: '70vh', overflowY: 'auto', padding: '16px'}}}
      >
        <Formik<PrescriptionFormValues>
          initialValues={{
            surgery_type: '',
            prescription_mode: 'CREATE_NEW',
            treatment_plan: '',
            tentative_surgery_date: '',
            earliest_treatment_plan_date: '',
            others_description: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({submitForm, isSubmitting}) => {
            submitRef.current = submitForm
            return (
              <div className='relative'>
                <Spin spinning={isSubmitting}>
                  <VspPrescriptionForm />
                </Spin>
              </div>
            )
          }}
        </Formik>
      </Modal>
    </>
  )
}

export default VspPrescription
