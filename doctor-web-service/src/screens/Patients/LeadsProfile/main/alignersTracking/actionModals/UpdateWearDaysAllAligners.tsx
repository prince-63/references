import {FC, useContext} from 'react'
import {Modal, Radio} from 'antd'
import {Formik, Form} from 'formik'
import * as Yup from 'yup'
import FormikInput from 'components/atom/Inputs/FormikInput'
import AntdButton from 'components/atom/Buttons/AntdButton'
import cn from '@utils/cn'
import useDispatchAction from '@hooks/useDispatchAction'
import {ApiGetData, safeParseInt} from 'utils/ConstFunctions'
import {useParams} from 'react-router-dom'
import {postApiDataTreatmentPlan} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import {postApiDataStatusProductionLabUpdate} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/StatusProductionLabUpdateSlice'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {getPatientTimeline} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {AuthContext} from 'context/AuthContext'
interface UpdateWearDaysAllAlignersProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  alignerJourneyId: string
}

const wearDayOptions = ['7', '10', '15', '21']

const validationSchema = Yup.object({
  selected: Yup.string().required(),
  custom: Yup.string().when('selected', {
    is: (val: string) => val === 'custom',
    then: (schema) =>
      schema
        .required('Please enter custom days')
        .matches(/^\d+$/, 'Must be a number')
        .test('min', 'Must be at least 1', (val) => !val || parseInt(val, 10) > 0),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const UpdateWearDaysAllAligners: FC<UpdateWearDaysAllAlignersProps> = ({
  open,
  onCancel,
  onConfirm,
  alignerJourneyId,
}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {data: dataTreatmentPlan}: any = useSelector((state: RootState) => state.apiTreatmentPlan)
  const {loading: loadingStatusProductionLabUpdate} = useSelector(
    (state: RootState) => state.apiStatusProductionLabUpdate
  )
  const {patientId} = useParams()
  const currentAlignerNo = dataTreatmentPlan?.aligner_journeys[0]?.current_aligner_no
  const alignerNos = dataTreatmentPlan?.aligner_journeys[0]?.aligners
    ?.filter((aligner: any) => aligner.sr_no >= currentAlignerNo)
    ?.map((aligner: any) => aligner.sr_no)
  const selectedFilter = useSelector((state: RootState) => state.leadsProfile.selectedFilter)
  return (
    <Formik
      initialValues={{selected: '7', custom: ''}}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        const days =
          values.selected === 'custom' ? parseInt(values.custom, 10) : parseInt(values.selected, 10)
        if (alignerJourneyId) {
          const postData = {
            aligner_journey_id: parseInt(alignerJourneyId),
            aligner_nos: alignerNos,
            wear_days: days,
          }
          dispatchAction(postApiDataStatusProductionLabUpdate(postData))
            .unwrap()
            .then(() => {
              const postData: ApiGetData = {
                data: {
                  patient_id: patientId,
                  alignerJourneyId: alignerJourneyId,
                },
              }
              dispatchAction(postApiDataTreatmentPlan(postData))
              dispatchAction(
                getPatientTimeline({
                  doctor_id: safeParseInt(userId),
                  patient_id: safeParseInt(patientId),
                  filter: selectedFilter.key,
                })
              )
              onConfirm()
            })
            .catch(() => {
              // setButtonUpdateDetailsText(TEXT_UPDATE_WEAR_DAYS)
            })
        }
      }}
    >
      {({values, setFieldValue, handleSubmit}) => (
        <Modal
          open={open}
          title={<div className='text-2xl font-bold'>Update wear days for all aligners</div>}
          onCancel={onCancel}
          footer={
            <div className='flex justify-between gap-2 w-full'>
              <button
                type='button'
                onClick={onCancel}
                className={cn(
                  'flex-1 h-11 px-4 rounded-lg border border-primaryColor bg-primarySupport',
                  'text-primaryColor font-medium w-1/2'
                )}
              >
                Cancel
              </button>
              <AntdButton
                key='submit'
                text={'Confirm'}
                htmlType='submit'
                loading={loadingStatusProductionLabUpdate}
                disabled={
                  loadingStatusProductionLabUpdate ||
                  (values.selected === 'custom' && !values.custom)
                }
                className='h-11 w-1/2 bg-primaryColor text-center'
                onClick={() => handleSubmit()}
              />
            </div>
          }
          destroyOnClose
        >
          <Form onSubmit={handleSubmit}>
            <div style={{marginBottom: 16, color: '#888'}}>
              This will update the end date for the current and all upcoming aligners, shifting the
              overall treatment timeline.
            </div>
            <Radio.Group
              value={values.selected}
              onChange={(e) => {
                setFieldValue('selected', e.target.value)
              }}
              style={{display: 'flex', flexDirection: 'column', gap: 8}}
            >
              {wearDayOptions.map((opt) => (
                <Radio key={opt} value={opt}>
                  {opt} days
                </Radio>
              ))}
              <Radio value={'custom'}>Custom days</Radio>
              {values.selected === 'custom' && (
                <FormikInput name='custom' type='number' min={1} placeholder='Enter days' />
              )}
            </Radio.Group>
          </Form>
        </Modal>
      )}
    </Formik>
  )
}

export default UpdateWearDaysAllAligners
