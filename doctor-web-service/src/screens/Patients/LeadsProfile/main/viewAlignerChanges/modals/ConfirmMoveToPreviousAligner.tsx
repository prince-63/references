import AntdButton from 'components/atom/Buttons/AntdButton'
import ButtonOutlinedRed from 'components/atom/Buttons/ButtonOutlinedRed'
import ModalLayout from 'components/modal/ModalLayout'
import InputDateFormik from 'components/atom/Inputs/InputDateFormik'
import {useFormik} from 'formik'
import InputTextArea from 'components/atom/Inputs/InputTextArea'
import * as Yup from 'yup'
import apiHelper from '@utils/apiHelper'
import {URL_MOVE_TO_PREVIOUS_ALIGNER} from 'redux/Endpoints/apiEndpoints'
import HttpMethod from '@constants/httpMethods.constants'
import {IAlignerUpdateDetails} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {useParams} from 'react-router-dom'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import dayjs from 'dayjs'
import useDispatchAction from '@hooks/useDispatchAction'
import {getAlignerUpdateDetails} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import {Dispatch, SetStateAction, useContext} from 'react'
import {getPatientTimeline} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {AuthContext} from 'context/AuthContext'
import patientOverviewAlignerActionFilterConstantsConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import CounterClockWiseIcon from 'assets/icons/CounterClockWiseIcon'
import ListItemWithIcon from '../../alignersTracking/actionModals/components/ListItemWithIcon'
import InfoCard from '../../alignersTracking/components/InfoCard'

const list = [
  {
    checked: true,
    value: 'Clears patient tracking data for the current aligner.',
  },
  {
    checked: true,
    value: 'The patient will need to make the aligner change again',
  },
]

const ConfirmMoveToPreviousAligner = ({
  setIsConfirmMoveToPreviousAlignerModalOpen,
  alignerUpdateDetails,
  selectedFilter,
  alignerJourneyId,
  setMoveToPreviousAlignerSuccess,
}: {
  setIsConfirmMoveToPreviousAlignerModalOpen: Dispatch<SetStateAction<boolean>>
  selectedFilter?: keyof typeof patientOverviewAlignerActionFilterConstantsConstants
  alignerJourneyId?: string
  setMoveToPreviousAlignerSuccess: Dispatch<SetStateAction<boolean>>
  alignerUpdateDetails:
    | IAlignerUpdateDetails
    | {
        previous_aligner_details: {
          jaw_type?: string | null
          sr_no?: number | null
        }
        aligner_action_id?: number
      }
}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {patientId} = useParams()
  const alignerName = `${capitalizeFirstLetter(
    alignerUpdateDetails.previous_aligner_details.jaw_type ?? ''
  )} ${alignerUpdateDetails.previous_aligner_details.sr_no}`
  const formik = useFormik({
    initialValues: {
      newEndDate: '',
      reasonForMovingBackToPreviousAligner: '',
    },
    validationSchema: Yup.object({
      newEndDate: Yup.string().required('Please enter a value in the field'),
    }),
    onSubmit: async (values) => {
      if (!alignerJourneyId) return
      formik.setSubmitting(true)
      await apiHelper(URL_MOVE_TO_PREVIOUS_ALIGNER, HttpMethod.POST, {
        aligner_journey_id: parseInt(alignerJourneyId),
        previous_aligner_sr_no: alignerUpdateDetails.previous_aligner_details.sr_no,
        previous_aligner_new_end_date: values.newEndDate,
        reason: values.reasonForMovingBackToPreviousAligner,
      }).then(async () => {
        if (alignerUpdateDetails.aligner_action_id) {
          dispatchAction(
            getAlignerUpdateDetails({
              aligner_action_id: alignerUpdateDetails.aligner_action_id,
            })
          )
        } else {
          dispatchAction(
            getPatientTimeline({
              doctor_id: parseInt(userId as string),
              patient_id: parseInt(patientId as string),
              filter: selectedFilter ?? 'CURRENT_ALIGNER',
            })
          )
        }
        formik.setSubmitting(false)
        setIsConfirmMoveToPreviousAlignerModalOpen(false)
        setMoveToPreviousAlignerSuccess(true)
      })
    },
  })

  return (
    <ModalLayout className='md:w-[38rem]' isResponsive>
      <div className='flex justify-between items-center'>
        <div className='rounded-full p-3 bg-redSupport'>
          <CounterClockWiseIcon width='24' height='24' />
        </div>
      </div>
      <div className='mt-4'>
        <div className='text-black text-2xl font-semibold'>Revert aligner change?</div>
        <p className='text-base text-textColor'>
          Your patient will move back to{' '}
          <span className='font-semibold text-black'>{alignerName}</span> once confirmed.
        </p>
      </div>
      <div className='border border-mediumGray rounded-lg p-3 mt-2'>
        <div className='flex flex-col gap-1'>
          <p className='text-textColor font-medium'>What this will do:</p>
          {list.map((item, index) => (
            <ListItemWithIcon key={index} {...item} className='text-black' />
          ))}
        </div>
      </div>
      <InfoCard
        {...{
          title: 'Reverting will update the aligner schedule. ',
          className: 'bg-redSupport mt-4 border border-red',
          titleClassName: 'text-black font-medium',
          showButton: false,
          infoIconColor: '#F45045',
          infoIconClassName: 'items-start',
          content:
            " You'll need to set a new end date for the previous aligner. The aligner table will adjust accordingly.",
        }}
      />
      <div className='flex flex-col gap-3 mt-4'>
        <div className='w-full'>
          <InputDateFormik
            {...{
              name: 'newEndDate',
              label: `New end date for ${alignerName}`,
              className: ' py-3',
              required: true,
              classNameLabel: 'font-medium',
              minDate: dayjs(),
              onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                formik?.setFieldValue('newEndDate', dateString)
              },
            }}
            dateValue={formik?.values?.newEndDate}
            formik={formik}
          />
        </div>
        <InputTextArea
          className='border border-mediumGray rounded-lg p-2'
          name='reasonForMovingBackToPreviousAligner'
          formik={formik}
          label='Reason for reverting (optional)'
          placeholder='Add a reason'
        />
      </div>
      <div className='mt-7 flex md:gap-8 md:flex-row flex-col-reverse gap-4'>
        <ButtonOutlinedRed
          text='Go back'
          className='!h-12 text-md !font-semibold bg-redSupport'
          onClick={() => {
            setIsConfirmMoveToPreviousAlignerModalOpen(false)
          }}
        />
        <AntdButton
          text={'Confirm revert'}
          className='h-12 !bg-red w-full hover:!bg-red'
          onClick={() => {
            formik.handleSubmit()
          }}
          isLoading={formik.isSubmitting}
        />
      </div>
    </ModalLayout>
  )
}

export default ConfirmMoveToPreviousAligner
