import {ConfigProvider} from 'antd'
import Anchor from 'antd/es/anchor/Anchor'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {IMAGE_APP_LOGO} from 'utils/ImageConst'
import {SVG_PLUS_PRIMARY} from 'utils/SvgConstants'
import SummaryBox from './components/SummaryBox'
import PatientDetails from './components/PatientDetails'
import {useNavigate, useParams} from 'react-router-dom'
import {useEffect} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {getSummaryData, ISummaryResponse} from 'redux/Slices/AppSlice/Summary/summary'
import {safeParseInt} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import CaseInfoSummary from './components/CaseInfoSummary'
import PreTreatmentPhotos from './components/PreTreatmentPhotos'
import hasValue from 'utils/hasValue'
import TreatmentPlanSummary from './components/TreatmentPlanSummary'
import BracesTreatmentPlanSummary from './components/BracesTreatmentPlanSummary'
import AlignerTrackingSummary from './components/AlignerTrackingSummary'
import AppointmentTrackingSummary from './components/AppointmentTrackingSummary'
import PaymentSummary from './components/PaymentSummary'
import moment from 'moment'
import When from 'components/when/When'
import Spinner from 'components/spinner/Spinner'
import leftArrow from '../../assets/icons/iconArrowLeft.svg'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useProfileBasePath from '@hooks/useProfileBasePath'

const Summary = () => {
  const {patientId} = useParams()
  const {dispatchAction} = useDispatchAction()
  const {summaryData, summaryLoading} = useSelector((state: RootState) => state.Summary)

  // Cast deeply nested optional objects to any to avoid TS narrowing to never when null unions are inferred
  const bracesJourneyDetails: any = (summaryData as any)?.braces_journey_details
  const appointmentDetails: any = (summaryData as any)?.appointment_details

  useEffect(() => {
    dispatchAction(getSummaryData({patient_id: safeParseInt(patientId)}))
  }, [patientId])

  const anchorItems = [
    {
      key: '1',
      href: '#patient_details',
      title: 'Patient details',
      show: summaryData?.patient_details !== null,
    },
    {
      key: '2',
      href: '#case_info',
      title: 'Case information',
      show: summaryData?.case_information_request?.metadata !== null,
    },
    {
      key: '3',
      href: '#pre_treatement_summary',
      title: 'Pre-treatment photos',
      show: hasValue(summaryData?.pre_treatment_photos?.files),
    },
    {
      key: '4',
      href: '#treatment_plan_summary',
      title: 'Aligners treatment plan',
      show: hasValue(summaryData?.aligner_treatment_response),
    },
    {
      key: '5',
      href: '#braces_treatment_plan_summary',
      title: 'Braces treatment plan',
      show: hasValue(bracesJourneyDetails),
    },
    {
      key: '6',
      href: '#aligner_tracking',
      title: 'Aligner tracking',
      show: hasValue(summaryData?.aligner_journey_details),
    },
    {
      key: '6',
      href: '#appointment_tracking',
      title: 'Appointment tracking',
      show: hasValue(appointmentDetails) && hasValue((appointmentDetails as any)?.appointments),
    },
    {
      key: '7',
      href: '#payment_info_summary',
      title: 'Payment info',
      show: hasValue(summaryData?.treatment_payments_details),
    },
  ]
  return (
    <div>
      {summaryLoading && (
        <div className='flex flex-col justify-center items-center gap-5 min-h-[40vh] w-full'>
          <Spinner loading />
        </div>
      )}
      {!summaryLoading && (
        <div className='flex flex-col md:h-screen'>
          <div className='flex flex-col h-screen'>
            <SummaryHeader
              bracesTreatmentPlanId={
                hasValue(bracesJourneyDetails)
                  ? (bracesJourneyDetails as any)?.braces_journey_id
                  : null
              }
            />

            <div className='flex flex-1 flex-col md:flex-row overflow-hidden'>
              <div className='w-full md:w-1/4 md:inline-block hidden overflow-y-auto min-h-[400px]'>
                <SummarySidebar anchorItems={anchorItems} />
              </div>
              <div className='w-full md:w-3/4 overflow-y-auto'>
                <SummaryList summaryData={summaryData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Summary

const SummaryHeader = ({
  bracesTreatmentPlanId,
}: {
  bracesTreatmentPlanId: number | null | undefined
}) => {
  const {patientId, bracesJourneyId} = useParams()

  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const onClick = (e: any) => {
    e.preventDefault()
    navigate(`${profileBasePath}/${patientId}/bracesNotes/${bracesJourneyId}`)
  }

  return (
    <div className='w-full min-h-[64px] flex justify-between items-center md:px-12 px-4 border-b bg-white border-mediumGray'>
      <div className='flex items-center md:gap-6 gap-1'>
        <button
          type='button'
          onClick={() => {
            navigate(`${profileBasePath}/${patientId}`)
          }}
          className='rounded-full bg-lightGray min-w-8 min-h-8 w-8 h-8 flex items-center justify-center'
        >
          <img src={leftArrow} alt='' width={16} />
        </button>
        <img src={IMAGE_APP_LOGO} alt='logo' className='md:w-[159px] w-[99px]' />
      </div>
      <When isTrue={hasValue(bracesTreatmentPlanId)}>
        <button
          onClick={(e) => onClick(e)}
          className='flex md:gap-2 gap-1 items-center border border-primaryColor w-fit md:px-6  px-2 md:py-2 py-1 rounded-lg bg-primarySupport'
        >
          <CommonSVG svg={SVG_PLUS_PRIMARY} width='16.9' height='15' />
          <p className='text-primaryColor font-semibold md:text-[16px] text-xs'>
            Create appointment{' '}
          </p>
        </button>
      </When>
    </div>
  )
}

const SummarySidebar = ({
  anchorItems,
}: {
  anchorItems: {
    key: string
    href: string
    title: string
    show: boolean
  }[]
}) => {
  const visibleItems = anchorItems.filter((item) => item.show)

  return (
    <div className=' md:w-1/4 h-full md:flex hidden'>
      <div className='w-[222px] m-10'>
        <div className='text-xs uppercase font-semibold mb-4'>Table of contents</div>
        <ConfigProvider
          theme={{
            components: {
              Anchor: {
                fontSize: 14,
                colorText: '#666666 ',
                colorPrimary: 'black',
                fontFamily: 'Figtree',
              },
            },
          }}
        >
          <Anchor
            className='text-sm text-textColor'
            items={visibleItems.map(
              ({key, href, title}: {key: string; href: string; title: string}) => ({
                key,
                href,
                title,
              })
            )}
          />
        </ConfigProvider>
      </div>
    </div>
  )
}

const SummaryList = ({summaryData}: {summaryData: ISummaryResponse}) => {
  const today = moment().format('DD MMMM YYYY')
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {isPractice} = useAllUserPlan()
  const isManual = dataLeadsOverview?.tracking?.type === 'MANUAL'
  const appointmentDetails: any = (summaryData as any)?.appointment_details
  return (
    <div className='h-full overflow-y-scroll md:flex flex-col item-center justify-center md:p-10 p-4'>
      <div className='md:block text-2xl font-semibold mb-4 hidden'>
        Treatment 1 summary - {today}
      </div>
      <div className='text-2xl font-semibold mb-4 md:hidden'>Treatment summary </div>
      <div className='h-full '>
        <SummaryBox
          title='Patient details'
          id='patient_details'
          className={'bg-lightGray'}
          isShow={summaryData?.patient_details !== null}
        >
          <PatientDetails patient_details={summaryData?.patient_details} />
        </SummaryBox>
        <When isTrue={!isPractice}>
          <SummaryBox
            title='Case information'
            id='case_info'
            className={'bg-secondarySupport'}
            isShow={summaryData?.case_information_request?.metadata !== null}
          >
            <CaseInfoSummary
              caseInformation={summaryData?.case_information_request?.metadata}
              files={summaryData?.case_information_request?.files}
            />
          </SummaryBox>
        </When>
        <SummaryBox
          title=''
          id='pre_treatement_summary'
          isShow={hasValue(summaryData?.pre_treatment_photos?.files)}
        >
          <PreTreatmentPhotos files={summaryData?.pre_treatment_photos?.files} />
        </SummaryBox>

        <SummaryBox
          title='Aligners treatment plan'
          id='treatment_plan_summary'
          className={'bg-primarySupport'}
          isShow={hasValue(summaryData?.aligner_treatment_response)}
        >
          <TreatmentPlanSummary treatmentPlan={summaryData?.aligner_treatment_response} />
        </SummaryBox>

        <SummaryBox
          title='Braces treatment plan'
          id='braces_treatment_plan_summary'
          className={'bg-primarySupport'}
          isShow={hasValue(summaryData?.braces_journey_details)}
        >
          <BracesTreatmentPlanSummary bracesTreatmentPlan={summaryData?.braces_journey_details} />
        </SummaryBox>

        <SummaryBox
          title='Aligner tracking'
          id='aligner_tracking'
          className={'bg-tertiarySupport'}
          isShow={hasValue(summaryData?.aligner_journey_details)}
        >
          <AlignerTrackingSummary
            alignerTracking={summaryData?.aligner_journey_details}
            isManual={isManual}
          />
        </SummaryBox>

        <SummaryBox
          title='Appointment tracking'
          id='appointment_tracking'
          className={'bg-tertiarySupport'}
          isShow={
            hasValue(summaryData?.appointment_details) &&
            hasValue((appointmentDetails as any)?.appointments)
          }
        >
          <AppointmentTrackingSummary appointment_details={summaryData?.appointment_details} />
        </SummaryBox>

        <SummaryBox
          title='Payment information'
          id='payment_info_summary'
          className={'bg-orangeSupport'}
          isShow={hasValue(summaryData?.treatment_payments_details)}
        >
          <PaymentSummary payment_details={summaryData?.treatment_payments_details} />
        </SummaryBox>
        <div className='h-4'></div>
      </div>
    </div>
  )
}
