import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {
  createTreatmentPlan,
  getTreatmentPlan,
  setOpenExistingActiveTreatmentPlanModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import {Formik, FormikProps} from 'formik'
import {useNavigate, useParams} from 'react-router-dom'
import PlayCircleIcon from 'assets/icons/PlayCircleIcon'
import {Divider} from 'antd'
import uploadTreatmentPlanConstants from '@constants/uploadTreatmentPlan.constants'
import clsx from 'clsx'
import {IVideoFile, VideoPositionKey} from '../../types/treatmentPlan.types'
import {ReactNode, useState} from 'react'
import ActiveRadioIcon from 'assets/icons/ActiveRadioIcon'
import {
  ApiGetData,
  getFirstLetterCapitalOfWord,
  openDocument,
  safeParseInt,
} from 'utils/ConstFunctions'
import ReactPlayer from 'react-player'
import {unReviewableExtension} from './CommonVideoView'
import PdfIconNew from 'assets/icons/PdfIconNew'
import When from 'components/when/When'
import LinkSimpleIcon from 'assets/icons/LinkSimpleIcon'
import formatAlignersForModal from '../../viewTreatmentPlan/helpers/formatAlignersForModal'
import hasValue from 'utils/hasValue'
import ClipBoardTextIcon from 'assets/icons/ClipBoardTextIcon'
import ClockClockwiseIcon from 'assets/icons/ClockClockwiseIcon'
import {useMediaQuery} from 'react-responsive'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import moment from 'moment'

const SendToPatientConfirmModal = ({
  setShowSendToPatientModal,
}: {
  setShowSendToPatientModal: (sendToPatientModal: boolean) => void
}) => {
  const {patientId, userId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {treatmentPlan, createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const videoFileUrls: Record<VideoPositionKey, IVideoFile | null> = treatmentPlan.video_files ?? {
    SINGLE_VIDEO: null,
    TOP: null,
    BOTTOM: null,
    RIGHT: null,
    LEFT: null,
    FRONT: null,
  }
  const isMobile = useMediaQuery({query: '(max-width: 768px)'})
  const {treatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const handleSubmit = async (values: {
    link_display_patient: boolean
    video_display_to_patient: boolean
  }) => {
    const {aligner_details_meta_data, filesToSave, otherFilesToSave, video_files_to_save} =
      treatmentPlan
    const hasActivePlan =
      treatmentPlanList &&
      treatmentPlanList.some(
        (item) =>
          item.status === treatmentPlanStatusConstants.ACTIVE ||
          item.status === treatmentPlanStatusConstants.PAUSED ||
          item.status === treatmentPlanStatusConstants.COMPLETE
      )
    if (hasActivePlan) {
      return dispatchAction(setOpenExistingActiveTreatmentPlanModal(true))
    }

    dispatchAction(
      createTreatmentPlan({
        details: {
          aligner_treatment_details: aligner_details_meta_data,
          treatment_plan_id: treatmentPlan?.treatment_plan_id,
          treatment_sub_type: treatmentTypeMain.ALIGNERS,
          production_lab_details: treatmentPlan.production_lab_details,
          days_to_wear_each_aligner: treatmentPlan.days_to_wear_each_aligner,
          recommended_hours_to_wear_aligners: treatmentPlan.recommended_hours_to_wear_aligners,
          treatment_planning_software: treatmentPlan.treatment_planning_software,
          treatment_planning_link: treatmentPlan.treatment_planning_link,
          remarks: treatmentPlan.remarks,
          doctor_id: treatmentPlan.doctor_id,
          patient_id: treatmentPlan.patient_id,
          status: treatmentPlanStatusConstants.DRAFT,
          approved_by_patient_at: moment().format('YYYY-MM-DD'),
          treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
          order_status_changed_at: treatmentPlan?.order_status_changed_at,
          treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
          video_display_to_patient: values.video_display_to_patient,
          link_display_patient:
            treatmentPlan.treatment_plan_upload_type === 'TREATMENT_PLANNING_LINK'
              ? values.link_display_patient
              : false,
        },
        other_files: otherFilesToSave,
        files: filesToSave,
        video_files: video_files_to_save ?? {},
        pdf_file: treatmentPlan.pdf_file_to_save,
      })
    )
      .unwrap()
      .then(() => {
        dispatchAction(setShowSendToPatientModal(false))
        const postData: ApiGetData = {
          data: {
            patient_id: safeParseInt(patientId),
            doctor_id: safeParseInt(userId),
          },
        }
        dispatchAction(getApiLeadsOverview(postData))
        dispatchAction(
          getLeadsProfileDetails({
            patient_id: safeParseInt(patientId),
            doctor_id: safeParseInt(userId),
          })
        )
        navigate(`/leads-profile/${patientId}/treatment`, {replace: true})
      })
      .catch(() => {})
  }
  return (
    <Formik
      initialValues={{link_display_patient: true, video_display_to_patient: true}}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formik) => {
        return (
          <ModalLayout
            isResponsive={isMobile}
            className={clsx(
              'w-[600px] overflow-y-scroll',
              treatmentPlan.treatment_plan_upload_type !== 'DO_NOT_UPLOAD' && 'max-h-[98%]'
            )}
          >
            <form className='flex flex-col p-2' onSubmit={formik.handleSubmit}>
              <div className='text-center md:text-start'>
                <p className='font-semibold text-2xl text-black'>Confirm treatment plan details</p>
                <p className='text-textColor text-base mt-1'>
                  Confirm if you would like to share the treatment plan preview with the
                  patient?{' '}
                </p>
              </div>
              <div className='overflow-y-scroll'>
                <div className='font-semibold text-lg mt-3'>
                  {treatmentPlan.treatment_plan_tag_name}
                </div>
                <div className='flex flex-col gap-3'>
                  <When isTrue={treatmentPlan.treatment_plan_upload_type !== 'DO_NOT_UPLOAD'}>
                    <BorderedCard title='Treatment preview' icon={<PlayCircleIcon />}>
                      <div className='font-medium text-sm text-textColor'>Treatment plan</div>
                      {treatmentPlan.treatment_plan_upload_type === 'TREATMENT_PLANNING_LINK' ? (
                        <a
                          href={treatmentPlan?.treatment_planning_link}
                          target='_blank'
                          rel='noreferrer'
                          className='!no-underline text-[#735BF2] text-base'
                        >
                          <div className='flex items-center gap-1 font-semibold'>
                            <LinkSimpleIcon width='22' height='22' color='#735BF2' />
                            <p>View link</p>
                          </div>
                        </a>
                      ) : (
                        <VideoView
                          pdfUrl={treatmentPlan?.pdf_files ? treatmentPlan?.pdf_files[0]?.url : ''}
                          videoFileUrls={videoFileUrls}
                          videoKey={treatmentPlan.treatment_plan_upload_type}
                        />
                      )}

                      <ShowDataToPatient formik={formik} />
                    </BorderedCard>{' '}
                  </When>
                  <BorderedCard title='Treatment Overview' icon={<ClipBoardTextIcon />}>
                    <TitleValue
                      title='Upper jaw range'
                      value={
                        hasValue(treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range) ? (
                          <div className='flex gap-1'>
                            {formatAlignersForModal(
                              treatmentPlan?.aligner_details_meta_data?.upper_jaw?.range ?? []
                            )}
                          </div>
                        ) : null
                      }
                    />
                    <TitleValue
                      title='Lower jaw range'
                      value={
                        hasValue(treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range) ? (
                          <div className='flex gap-1'>
                            {formatAlignersForModal(
                              treatmentPlan?.aligner_details_meta_data?.lower_jaw?.range ?? []
                            )}
                          </div>
                        ) : null
                      }
                    />
                    <TitleValue
                      title='Aligner brand'
                      value={treatmentPlan.production_lab_details.brand_name}
                    />
                  </BorderedCard>

                  <BorderedCard title='Wear Instructions' icon={<ClockClockwiseIcon />}>
                    <TitleValue
                      title='Days to wear each aligner'
                      value={`${treatmentPlan.days_to_wear_each_aligner} ${
                        treatmentPlan.days_to_wear_each_aligner == 1 ? 'day' : 'days'
                      }`}
                    />
                    <TitleValue
                      title='Recommended daily wear hours'
                      value={`${treatmentPlan.recommended_hours_to_wear_aligners} ${
                        treatmentPlan.recommended_hours_to_wear_aligners == 1 ? 'hour' : 'hours'
                      }`}
                    />
                  </BorderedCard>
                </div>
              </div>
              <div className='flex  gap-2 mt-2'>
                <button
                  className='bg-primarySupport text-primaryColor border border-primaryColor h-14 font-semibold text-base w-full rounded'
                  type='button'
                  onClick={() => {
                    setShowSendToPatientModal(false)
                    if (!treatmentPlan?.treatment_plan_id) return
                    dispatchAction(
                      getTreatmentPlan({
                        aligner_treatment_id: treatmentPlan?.treatment_plan_id?.toString() ?? '',
                      })
                    )
                  }}
                >
                  Cancel
                </button>
                <AntdButton
                  className='bg-primaryColor text-white h-14 font-semibold text-base w-full hover:!bg-primaryColor hover:!text-white'
                  isLoading={createTreatmentPlanLoading}
                  text='Confirm'
                  htmlType='submit'
                  disabled={createTreatmentPlanLoading}
                />
              </div>
            </form>
          </ModalLayout>
        )
      }}
    </Formik>
  )
}

export default SendToPatientConfirmModal

const VideoView = ({
  videoKey,
  videoFileUrls,
  pdfUrl,
}: {
  videoKey: keyof typeof uploadTreatmentPlanConstants | null | undefined
  videoFileUrls: Record<VideoPositionKey, IVideoFile | null>
  pdfUrl: string | undefined
}) => {
  const renderVideo = (key: string, video: IVideoFile | null) => (
    <div className={clsx(key === 'Single Video' ? 'w-full' : 'w-14')} key={key}>
      <p className='w-full text-sm font-medium text-textColor'>
        {getFirstLetterCapitalOfWord(key)}
      </p>
      <div className='w-12 h-12 rounded-lg border border-mediumGray overflow-hidden'>
        <ReactPlayer
          url={video?.url || ''}
          playing={false}
          controls={true}
          width='48px'
          height='48px'
          light={unReviewableExtension.includes(video?.extension ?? '')}
          className='rounded-lg'
        />
      </div>
    </div>
  )

  if (!videoFileUrls || !videoKey) return null

  if (videoKey === uploadTreatmentPlanConstants.UPLOAD_SINGLE_VIDEO) {
    const video = videoFileUrls.SINGLE_VIDEO
    return <div className='grid gap-4'>{video && renderVideo('Single Video', video)}</div>
  }

  if (videoKey === uploadTreatmentPlanConstants.UPLOAD_MULTIPLE_VIDEOS) {
    return (
      <div className='flex gap-2'>
        {Object.entries(videoFileUrls)
          .filter(([key, value]) => key !== 'SINGLE_VIDEO' && value)
          .map(([key, video]) => renderVideo(key, video))}
      </div>
    )
  }

  if (videoKey === uploadTreatmentPlanConstants.UPLOAD_PDF) {
    return (
      <button
        type='button'
        className='border border-mediumGray w-12 h-12 rounded-lg'
        onClick={() => openDocument(pdfUrl ?? '')}
      >
        <PdfIconNew />
      </button>
    )
  }

  return null
}

interface ShowDataToPatientProps {
  formik: FormikProps<{link_display_patient: boolean; video_display_to_patient: boolean}>
}

const ShowDataToPatient: React.FC<ShowDataToPatientProps> = ({formik}) => {
  const [value, setValue] = useState('SHOW_TO_PATIENT')
  return (
    <div className='w-full flex flex-col items-center gap-2'>
      {options.map((option) => (
        <button
          type='button'
          key={option.label}
          className={clsx(
            'w-full flex justify-start items-center gap-2 border p-2 rounded-lg',
            value === option.value ? ' border-primaryColor' : 'border-mediumGray'
          )}
          onClick={() => {
            setValue(option.value)
            formik.setFieldValue(
              'link_display_patient',

              option.value === 'SHOW_TO_PATIENT' ? true : false
            )
            formik.setFieldValue(
              'video_display_to_patient',

              option.value === 'SHOW_TO_PATIENT' ? true : false
            )
          }}
        >
          <div>
            {value === option.value ? (
              <ActiveRadioIcon />
            ) : (
              <div
                className={clsx(
                  'w-[17px] h-[17px] rounded-full flex justify-start border border-mediumGray mr-1'
                )}
              ></div>
            )}
          </div>
          <div>
            <div className='text-start font-medium'>{option.label}</div>
            <div className='text-start font-medium text-sm text-textColor'>{option.subTitle}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

const options = [
  {
    label: 'Show to patient',
    value: 'SHOW_TO_PATIENT',
    subTitle: 'The patient will be able to view this treatment plan preview.',
  },
  {
    label: 'Don’t show to patient',
    value: 'DO_NOT_SHOW_TO_PATIENT',
    subTitle: 'Keep the treatment plan hidden from patient.',
  },
]

const BorderedCard = ({
  children,
  icon,
  title,
}: {
  children: ReactNode
  icon: ReactNode
  title: string
}) => {
  return (
    <div
      className={'rounded-lg w-full md:px-4 px-2 py-3 border border-mediumGray flex flex-col gap-2'}
    >
      <div className='flex gap-1'>
        {icon}
        <div className='font-medium text-[13px] uppercase text-textColor'>{title}</div>
      </div>
      <Divider className='m-1' />
      {children}
    </div>
  )
}

const TitleValue = ({title, value}: {title: string; value: string | number | ReactNode | null}) => {
  return (
    <div className='w-full flex justify-between'>
      <div className='text-textColor text-sm font-medium w-1/2'>{title}</div>
      <div className='flex justify-end text-end text-sm font-medium w-1/2'>{value ?? '-'}</div>
    </div>
  )
}
