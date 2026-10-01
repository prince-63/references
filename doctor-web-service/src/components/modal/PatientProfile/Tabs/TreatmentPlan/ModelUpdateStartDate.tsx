import {FC, useContext} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import {ERROR_START_DATE_REQUIRED} from '../../../../../utils/MessageConstant'
import {useDispatch, useSelector} from 'react-redux'
import CommonSVG from '../../../../atom/SVG/CommonSVG'
import {SVG_CALENDER_PRIMARY, SVG_CROSS, SVG_INFO_PRIMARY} from '../../../../../utils/SvgConstants'
import BackGroundSVG from '../../../../atom/SVG/BackGroundSVG'
import InputDateFormik from '../../../../atom/Inputs/InputDateFormik'
import {ApiGetData, safeParseInt} from '../../../../../utils/ConstFunctions'
import {postApiDataTreatmentPlanEditAlignersDetails} from '../../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlanEditAlignersDetailsSlice'
import {useParams} from 'react-router'
import {AxiosError} from 'axios'
import {postApiDataTreatmentPlan} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import actionTypes from '@constants/actionTypes'
import {ActionItem} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {RootState} from 'redux/store'
import dayjs from 'dayjs'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {AuthContext} from 'context/AuthContext'
interface props {
  handleOnClose: (option: ActionItem) => void
  setSuccess: (value: boolean) => void
  setSuccessTitle?: (value: string) => void
  patientId?: string | number
  alignerJourneyId?: string | number
}
const schema = Yup.object().shape({
  newStartDate: Yup.string().required(ERROR_START_DATE_REQUIRED),
})

const ModelUpdateStartDate: FC<props> = (props) => {
  const {
    handleOnClose,
    setSuccess,
    setSuccessTitle,
    patientId,
    alignerJourneyId: alignerIdProp,
  } = props
  const params = useParams()
  const patientUserId = (patientId ?? params.patientId)?.toString()
  const alignerJourneyId = (alignerIdProp ?? params.alignerJourneyId)?.toString()
  const dispatch = useDispatch()
  const {data: dataTreatmentPlan}: any = useSelector((state: RootState) => state.apiTreatmentPlan)
  const {userId} = useContext(AuthContext)

  const getLeadsDetails = () => {
    const postData = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
    }
    dispatch(getLeadsProfileDetails(postData) as any)
  }

  const formik = useFormik({
    initialValues: {
      newStartDate: dataTreatmentPlan?.aligner_journeys[0]?.first_aligner_start_date,
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      formik.setSubmitting(true)
      if (!alignerJourneyId || !patientUserId) {
        formik.setSubmitting(false)
        return
      }
      const postData: ApiGetData = {
        data: {
          aligner_journey_id: safeParseInt(alignerJourneyId),
          start_date: values.newStartDate,
        },
      }
      dispatch(postApiDataTreatmentPlanEditAlignersDetails(postData) as any)
        .unwrap()
        .then(() => {
          formik.setSubmitting(false)
          const postData: ApiGetData = {
            data: {
              patient_id: patientUserId,
              alignerJourneyId: alignerJourneyId,
            },
          }
          dispatch(postApiDataTreatmentPlan(postData) as any)
            .unwrap()
            .then(() => {
              setSuccessTitle && setSuccessTitle('New start date updated successfully')
              handleOnClose(actionTypes.UPDATE_START_DATE)
              getLeadsDetails()
              setSuccess(true)
            })
        })
        .catch((error: AxiosError) => {
          console.error(error)
        })
    },
  })

  return (
    <div
      className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40'
      tabIndex={-1}
    >
      <form
        className='bg-white w-auto h-auto rounded-lg p-6 shadow-lg  min-w-[37%]'
        onSubmit={formik.handleSubmit}
      >
        <div className='flex justify-between items-center'>
          <BackGroundSVG
            svg={SVG_CALENDER_PRIMARY}
            height='30'
            width='30'
            className='w-16 h-16 bg-primarySupport rounded-full '
          />
          <div
            onClick={() => handleOnClose(actionTypes.UPDATE_START_DATE)}
            className=' rounded-full cursor-pointer'
          >
            <CommonSVG svg={SVG_CROSS} width='40' height='40' />
          </div>
        </div>
        <div className='mt-4'>
          <div className='text-black text-2xl font-semibold '>Update Start Date</div>
          <div className='w-auto h-5 text-textColor text-base font-normal mt-2'>
            Set a different date for start of treatment
          </div>
        </div>
        <div className='mt-10'>
          <InputDateFormik
            {...{
              name: 'newStartDate',
              label: 'Start Date',
              className: 'w-full h-14 rounded-lg border border-mediumGray mt-1 py-3',
              classNameLabel: 'text-textColor text-base font-medium',
              required: false,
              minDate: dayjs(),
              maxDate: dayjs().add(6, 'months'),
              onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                formik?.setFieldValue('newStartDate', dateString)
              },
            }}
            dateValue={formik?.values?.newStartDate}
            formik={formik}
          />
        </div>
        <div className='w-full h-14 pl-4 pr-6 py-4 bg-primarySupport rounded-lg flex-col justify-start items-start gap-2.5 inline-flex mt-6'>
          <div className='justify-center items-center gap-2 inline-flex'>
            <CommonSVG svg={SVG_INFO_PRIMARY} height='24' width='24' />
            <div className='text-primaryColor text-base font-semibold'>
              Patient will be informed about the new start date
            </div>
          </div>
        </div>
        <div className='mt-6'>
          <AntdButton
            text='Update start date'
            className={'bg-primaryColor text-white h-12 font-semibold text-base w-full'}
            htmlType='submit'
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
          />
        </div>
      </form>
    </div>
  )
}

export default ModelUpdateStartDate
