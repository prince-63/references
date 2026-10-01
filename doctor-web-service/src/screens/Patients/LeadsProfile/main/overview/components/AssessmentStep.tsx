import {Collapse, ConfigProvider, Divider} from 'antd'
import CheckedCircleIcon from 'assets/icons/CheckedCircleIcon'
import FileIcon from 'assets/icons/FileIcon'
import DropdownRightArrow from 'assets/icons/VIewStatsIcon copy'
import InfoCard from 'components/instruction/InfoCard'
import When from 'components/when/When'
import {useNavigate, useParams} from 'react-router-dom'
import getColorPalette from 'utils/getColorPalette'
import InvitePatientInfoCard from './InvitePatientInfoCard'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import ExpandIcon from 'assets/icons/ExpandIcon'
import cn from '@utils/cn'
import CaseSubmittedOn from './CaseSubmittedOn'
import {SendCaseCard} from './SendCaseCard'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import ClipBoardIcon from 'assets/icons/ClipBoardIcon'
import {useEffect} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {getAllCaseRecord} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import orderStatusConstants from '@constants/orderStatus.constants'
import InfoIcon from 'assets/icons/InfoIcon'
import moment from 'moment'
import useAllUserPlan from '@hooks/useAllUserPlan'
const CaseRecordDropdownContent = () => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()

  const {caseRecordData} = useSelector((state: RootState) => state.caseRecord)

  useEffect(() => {
    if (!patientId) return
    dispatchAction(getAllCaseRecord({patient_id: safeParseInt(patientId)}))
  }, [dispatchAction, patientId])

  return (
    <div>
      <DropdownRadioCaseRecord
        title='Pre treatment photos'
        subTitle='Intra-oral and extra-oral photos of patients before treatment.'
        isChecked={(caseRecordData && caseRecordData?.pre_treatment_files.length > 0) ?? false}
        count={caseRecordData?.pre_treatment_files.length ?? 0}
      />
      <Divider className='m-0' />
      <DropdownRadioCaseRecord
        title='Scan files'
        subTitle='Intraoral scan files used for treatment planning.'
        isChecked={(caseRecordData && caseRecordData?.scan_files.length > 0) ?? false}
        count={caseRecordData?.scan_files.length ?? 0}
      />
      <Divider className='m-0' />
      <DropdownRadioCaseRecord
        title='X-rays/OPG'
        subTitle='Dental X-ray and Orthopantomogram (OPG) images.'
        isChecked={(caseRecordData && caseRecordData?.xray_files.length > 0) ?? false}
        count={caseRecordData?.xray_files.length ?? 0}
      />
    </div>
  )
}

const getAssessmentCollapse = [
  {
    key: '1',
    label: (
      <div className='flex md:items-center items-start gap-2'>
        <div className='bg-primarySupport p-4 rounded-lg w-fit'>
          <FileIcon />
        </div>
        <div className='text-base text-textColor'>
          <p className='flex gap-1 items-center text-black font-semibold'>
            <div> Case records</div>{' '}
            <p className='text-textColor font-normal text-sm'>(Recommended) </p>
          </p>
          <p className='text-textColor font-normal text-sm'>
            Case-related records for this patient. These will be visible in the case form.
          </p>
        </div>
      </div>
    ),
    children: <CaseRecordDropdownContent />,
  },
]

const AssessmentStep = () => {
  const {isOrganization, isPractice} = useAllUserPlan()
  const {gettingStartedStepData} = useSelector((state: RootState) => state.GettingStartedOverview)
  const invited_patient = gettingStartedStepData?.invited_patient
  const navigate = useNavigate()
  const {patientId} = useParams()

  return (
    <div className='w-full flex flex-col gap-3'>
      <div className='text-xl font-semibold '>Assessment</div>
      <CaseSubmittedOn />

      <div className='flex flex-col gap-3'>
        <When isTrue={!hasValue(gettingStartedStepData?.order_id)}>
          <InfoCard
            title={
              isOrganization
                ? 'Awaiting case from practice'
                : 'What’s Next? Submit a Case or Add Records'
            }
            subTitle={
              isOrganization
                ? 'Once the practice sends a case, you’ll be able to process it.'
                : 'Send the case to the lab now or add case records and send case later.'
            }
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
          />
        </When>
        <When
          isTrue={
            isPractice &&
            (gettingStartedStepData?.order_status === null ||
              gettingStartedStepData?.order_status === 'DRAFT')
          }
        >
          <SendCaseCard />
        </When>
        <When
          isTrue={
            isOrganization &&
            gettingStartedStepData?.order_status !== null &&
            gettingStartedStepData?.order_status !== 'DRAFT' &&
            gettingStartedStepData?.order_status !== 'CANCELLED'
          }
        >
          <InfoCard
            title={'You have received a new order!'}
            subTitle={
              'What’s next? - Create and send treatment plans by creating manually or a purchase order.'
            }
            color={getColorPalette().secondaryColor}
            className='bg-secondarySupport border-secondaryColor'
            classNameButton='bg-secondarySupport border-secondaryColor text-secondaryColor'
            buttonText='View details'
            onClick={() => {
              navigate(`/orders/${gettingStartedStepData?.order_id}`)
            }}
          />

          <When isTrue={hasValue(gettingStartedStepData?.assessment?.purchase_order_id)}>
            <div className='flex items-center justify-between p-4 border border-mediumGray rounded-lg '>
              <div className='flex items-center gap-5'>
                <div className='flex items-center justify-center bg-primarySupport rounded-lg w-12 h-12'>
                  <ClipBoardIcon color={getColorPalette().primaryColor} />
                </div>
                <div className='flex flex-col items-start'>
                  <div className='text-xs uppercase text-textColor font-semibold'>
                    Purchase order status
                  </div>
                  <div className='font-semibold'>
                    {gettingStartedStepData?.assessment?.purchase_order_treatment_plan_count === 0
                      ? 'In progress'
                      : `${gettingStartedStepData?.assessment?.purchase_order_treatment_plan_count} treatment plans received`}
                  </div>
                  <div className='text-sm text-textColor font-normal'>
                    {gettingStartedStepData?.assessment?.purchase_order_treatment_plan_count === 0
                      ? 'We will notify you once the organization takes action on the order.'
                      : 'Clone them from the purchase order and send them for approval.'}
                  </div>
                </div>
              </div>

              <button
                className='rounded-lg bg-primaryColor flex gap-2 items-center py-1 px-3 text-white  font-semibold justify-center'
                onClick={() => {
                  navigate(`/orders/${gettingStartedStepData?.assessment?.purchase_order_id}`)
                }}
              >
                <div>View order</div>
                <CaretRightIcon color={getColorPalette().primaryColor} />
              </button>
            </div>
          </When>
        </When>

        <When isTrue={gettingStartedStepData?.order_status === orderStatusConstants?.CANCELLED}>
          <div className='flex justify-between items-center bg-redSupport border border-red p-4 rounded-lg'>
            <div className='flex gap-2 items-center'>
              <InfoIcon color='red' width='20' height='20' />
              <div>
                <div className='font-semibold'>Order cancelled</div>
                <div className='font-medium text-textColor text-sm'>
                  This order was cancelled on{' '}
                  {moment(gettingStartedStepData?.assessment?.cancelled_on).format('DD-MMM-YYYY')}.
                </div>
              </div>
            </div>
            <div className='flex gap-2 items-center'>
              <button
                className={cn(
                  'text-red bg-redSupport border border-red px-3 py-2 rounded-lg font-semibold flex gap-2 items-center'
                )}
                onClick={() => navigate(`/orders/${gettingStartedStepData?.order_id}`)}
              >
                <div>View details</div>
                <CaretRightIcon color={'red'} />
              </button>

              {isPractice && (
                <button
                  className={cn(
                    'bg-red text-white py-2 px-4 flex items-center gap-2 rounded-lg font-semibold '
                  )}
                  onClick={() => {
                    navigate('/orders/create-order', {
                      state: {
                        patientId: patientId,
                      },
                    })
                  }}
                >
                  <div>Create order</div>
                  <CaretRightIcon color={'white'} />
                </button>
              )}
            </div>
          </div>
        </When>

        <div>
          <ConfigProvider
            theme={{
              components: {
                Collapse: {
                  contentPadding: 0,
                },
              },
            }}
          >
            <Collapse
              expandIconPosition='end'
              size='large'
              items={getAssessmentCollapse}
              style={{
                margin: 0,
                padding: 0,
              }}
              className='collapse-no-spacing'
              expandIcon={({isActive}) => (
                <ExpandIcon className={cn(!isActive && 'pt-8')} {...{isActive}} />
              )}
              defaultActiveKey={['1']}
            />
          </ConfigProvider>
        </div>
        <When isTrue={isPractice && !invited_patient}>
          <InvitePatientInfoCard />
        </When>
      </div>
    </div>
  )
}

export default AssessmentStep

const DropdownRadioCaseRecord = ({
  title,
  subTitle,
  isChecked,
  count,
}: {
  title: string
  subTitle: string
  isChecked: boolean
  count: number
}) => {
  const navigate = useNavigate()
  const {patientId} = useParams()
  return (
    <div
      className='flex items-center justify-between p-3 cursor-pointer'
      onClick={() => {
        navigate(`/case-records/${patientId}`)
      }}
    >
      <div className='flex items-center md:gap-3 gap-2'>
        {isChecked ? (
          <CheckedCircleIcon color='#00B383' />
        ) : (
          <div className='min-w-5 w-5 h-5 rounded-full border border-grayDisabled'></div>
        )}

        <div className='text-base text-textColor'>
          <p className='flex gap-1 items-center text-black font-semibold'>
            <div> {title}</div> <p className='text-textColor font-normal text-sm'>(Recommended) </p>
          </p>
          <p className='text-textColor font-normal text-sm'>
            {isChecked ? `${count} files added.` : subTitle}
          </p>
        </div>
      </div>
      <div>
        <DropdownRightArrow color='#666' />
      </div>
    </div>
  )
}
