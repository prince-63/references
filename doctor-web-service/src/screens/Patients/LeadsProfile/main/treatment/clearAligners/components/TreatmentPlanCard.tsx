import Tag from 'components/tags/Tag'
import {AllTreatmentPlanListItem} from '../../types/treatmentPlan.types'
import hasValue from 'utils/hasValue'
import {useNavigate, useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {
  getBracesTreatmentPlan,
  getTreatmentPlan,
  setTreatmentPlan,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {Divider} from 'antd'
import LabelValuePair from 'components/atom/Labels/LabelValuePair'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import formatAligners from '../../viewTreatmentPlan/helpers/formatAligners'
import dayjs from 'dayjs'
import When from 'components/when/When'
import getTreatmentPlanStatusTagClassName, {
  MappedTreatmentPlanStatus,
} from '@utils/getTreatmentPlanStatusTagClassName'
import getTreatmentPlanStatus from '@utils/getTreatmentPlanStatus'
import cn from '@utils/cn'
import InfoCard from '../../../alignersTracking/components/InfoCard'
import moment from 'moment'
import ArrowRightDownIcon from 'assets/icons/ArrowRightDownIcon'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import getLinkedTreatmentPlanStatus from '../helpers/getLinkedTreatmentPlanStatus'
import Spinner from 'components/spinner/Spinner'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useAllUserPlan from '@hooks/useAllUserPlan'

const TreatmentPlanCard = ({
  treatmentPlan,
  patientIdFromOrder,
  showRequestStlFilesSection,
}: {
  treatmentPlan: AllTreatmentPlanListItem
  patientIdFromOrder?: number
  showRequestStlFilesSection: boolean
}) => {
  const navigate = useNavigate()
  const {userId} = useContext(AuthContext)
  const {patientId: patientIdFromParams} = useParams()
  const patientId = patientIdFromOrder ?? patientIdFromParams
  const {dispatchAction} = useDispatchAction()
  const {orderId: orderIdFromParams} = useParams()
  const {isOrganization, isPractice, isDesignLabUser, isCustomer, isVendor} = useAllUserPlan()
  const treatmentPlanStatus = treatmentPlan.treatment_status
  const orderId = orderIdFromParams ?? treatmentPlan?.order_id
  const {order} = userOrderDetails()
  const handleClickForOrgAndPractice = async (status: MappedTreatmentPlanStatus) => {
    if (status === 'Draft') {
      await dispatchAction(
        getTreatmentPlan({
          aligner_treatment_id: String(treatmentPlan.aligner_treatment_id),
        })
      )
    }

    const queryParams = new URLSearchParams()
    if (hasValue(orderId)) queryParams.append('order_id', String(orderId))
    if (treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT) {
      if (hasValue(treatmentPlan.approved_by_patient_at)) {
        queryParams.append('sendToPatient', 'true')
      }
    } else if (treatmentPlanStatus === treatmentPlanStatusConstants.DEACTIVATED) {
      queryParams.append('deactivate', 'true')
    }

    const queryString = queryParams.toString()
    const basePath = `/leads-profile/${patientId}/treatment/${treatmentPlan.aligner_treatment_id}`

    if (isPractice || isCustomer) {
      return navigate(`${basePath}/viewTreatmentPlan${queryString ? `?${queryString}` : ''}`)
    } else {
      if (
        treatmentPlanStatus === treatmentPlanStatusConstants.DRAFT &&
        !hasValue(treatmentPlan.approved_by_patient_at) &&
        status === 'Draft'
      ) {
        // TODO
        // if (isOrganization && treatmentPlan?.created_by_me) {
        //   return navigate(
        //     `/plan/${patientId}/setup-treatment-plan/${treatmentPlan.aligner_treatment_id}${
        //       queryString ? `?${queryString}` : ''
        //     }`
        //   )
        // }
        return navigate(`${basePath}/setupTreatmentPlan${queryString ? `?${queryString}` : ''}`)
      }
    }
    // if (isOrganization && hasValue(order?.purchase_order_details) && order?.is_purchase_order) {
    //TODO: test this condition
    if (isOrganization && !treatmentPlan?.created_by_me) {
      return navigate(
        `/plan/${patientId}/view-treatment-plan/${treatmentPlan.aligner_treatment_id}${
          queryString ? `?${queryString}` : ''
        }`
      )
    }
    navigate(`${basePath}/viewTreatmentPlan${queryString ? `?${queryString}` : ''}`)
  }
  const {getTreatmentPlanLoading: loading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const handleClick = async (status: MappedTreatmentPlanStatus) => {
    if (isOrganization || isPractice || isDesignLabUser || isCustomer || isVendor) {
      await handleClickForOrgAndPractice(status)
      return
    }
    const queryParamsDraft = new URLSearchParams({
      draft: 'true',
    }).toString()

    const queryParamsSendToPatient = new URLSearchParams({
      sendToPatient: 'true',
    }).toString()

    const queryParamsDeactivate = new URLSearchParams({
      deactivate: 'true',
    }).toString()

    if (treatmentPlan.treatment_type === treatmentTypeMain.ALIGNERS) {
      if (treatmentPlan.treatment_status === treatmentPlanStatusConstants.DRAFT) {
        dispatchAction(
          getTreatmentPlan({
            aligner_treatment_id: String(treatmentPlan.aligner_treatment_id),
          })
        )
      }
      if (
        treatmentPlan.treatment_status === treatmentPlanStatusConstants.DRAFT &&
        !hasValue(treatmentPlan.approved_by_patient_at)
      ) {
        navigate(
          `/leads-profile/${patientId}/treatment/${treatmentPlan.aligner_treatment_id}/setupTreatmentPlan?${queryParamsDraft}`
        )
      } else if (
        treatmentPlan.treatment_status === treatmentPlanStatusConstants.DRAFT &&
        hasValue(treatmentPlan.approved_by_patient_at)
      ) {
        navigate(
          `/leads-profile/${patientId}/treatment/${treatmentPlan.aligner_treatment_id}/viewTreatmentPlan?${queryParamsSendToPatient}`
        )
      } else if (treatmentPlan.treatment_status === treatmentPlanStatusConstants.ACTIVE) {
        navigate(
          `/leads-profile/${patientId}/treatment/${treatmentPlan.aligner_treatment_id}/viewTreatmentPlan`
        )
      } else {
        navigate(
          `/leads-profile/${patientId}/treatment/${treatmentPlan.aligner_treatment_id}/viewTreatmentPlan?${queryParamsDeactivate}`
        )
      }
    } else {
      dispatchAction(
        getBracesTreatmentPlan({
          doctorId: safeParseInt(userId),
          bracesJourneyId: safeParseInt(treatmentPlan.braces_treatment_id),
        })
      )
      if (treatmentPlan.treatment_status === treatmentPlanStatusConstants.DRAFT) {
        await dispatchAction(
          getBracesTreatmentPlan({
            doctorId: safeParseInt(userId),
            bracesJourneyId: treatmentPlan.braces_treatment_id ?? 0,
          })
        )
        navigate(
          `/leads-profile/${patientId}/treatment/braces/old/setupTreatmentPlanBraces?bracesJourneyId=${treatmentPlan.braces_treatment_id}`
        )
      } else {
        navigate(
          `/leads-profile/${patientId}/treatment/braces/${treatmentPlan.braces_treatment_id}/viewTreatmentPlanBraces?bracesJourneyId=${treatmentPlan.braces_treatment_id}&new=false&isUpdate=true&bracesTreatmentStage=ACTIVE`
        )
      }
    }
  }
  const status = getTreatmentPlanStatus({
    treatmentPlan,
    isPurchaseOrder: order?.is_purchase_order,
  })

  const stlFileStatus = treatmentPlan.stl_file_metadata?.status

  return (
    <div
      className={cn(
        'border border-[#735bf2] rounded-lg w-full flex flex-col cursor-pointer',
        !showRequestStlFilesSection && 'border-none'
      )}
    >
      <div
        className='border border-mediumGray rounded-lg w-full flex flex-col  cursor-pointer'
        onClick={() => {
          handleClick(status as MappedTreatmentPlanStatus)
        }}
      >
        <When isTrue={stlFileStatus === 'STL_FILES_REQUESTED'}>
          <InfoCard
            className='border-none bg-orangeSupport2 text-sm font-normal rounded-b-none mb-1'
            infoIconColor='#BE8901'
            titleClassName='text-black text-sm font-medium'
            title={`STL files requested on  ${moment(
              treatmentPlan?.stl_file_metadata?.requested_at
            ).format('DD-MMM-YYYY')}`}
            showButton={false}
          />
        </When>
        <When isTrue={stlFileStatus === 'APPROVED'}>
          <InfoCard
            className='border-none bg-orangeSupport2 text-sm font-normal rounded-b-none mb-1'
            infoIconColor='#BE8901'
            titleClassName='text-black text-sm font-medium'
            title={`STL files approved on  ${moment(
              treatmentPlan?.stl_file_metadata?.approved_on
            ).format('DD-MMM-YYYY')}`}
            showButton={false}
          />
        </When>
        <When isTrue={stlFileStatus === 'STL_FILES_UPLOADED'}>
          <InfoCard
            className='border-none bg-orangeSupport2 text-sm font-normal rounded-b-none mb-1'
            infoIconColor='#BE8901'
            titleClassName='text-black text-sm font-medium'
            title={`STL files uploaded on  ${moment(
              treatmentPlan?.stl_file_metadata?.uploaded_on
            ).format('DD-MMM-YYYY')}`}
            showButton={false}
          />
        </When>

        <div className='p-2'>
          <div className='flex  flex-col  text-textColor text-sm '>
            <div className='text-sm text-textColor font-normal'>
              {treatmentPlan.treatment_type === treatmentTypeMain.ALIGNERS ? 'ALIGNER' : 'BRACES'}{' '}
              TREATMENT PLAN
            </div>
            <div className='flex justify-between items-center gap-1'>
              <div>
                <p className='text-black font-semibold text-lg'>
                  {treatmentPlan.treatment_plan_tag_name}
                </p>
                <p className=''>{treatmentPlan.treatment_name}</p>
              </div>
              <div className='flex gap-4'>
                <Tag
                  value={status}
                  className={`${getTreatmentPlanStatusTagClassName(status)} w-fit text-sm `}
                />
                <When isTrue={!loading}>
                  <button type='button'>
                    <CaretRightIcon color='#666666' width='16' height='16' />
                  </button>
                </When>
                <When isTrue={loading}>
                  <Spinner loading size={16} color='#666666' />
                </When>
              </div>
            </div>
          </div>
          <When isTrue={treatmentPlan.initiator_status === treatmentPlanStatusConstants.RE_PLAN}>
            <InfoCard
              className='border border-red bg-redSupport text-sm font-normal mt-2'
              titleClassName='text-black text-base font-semibold'
              title={`Re-plan requested  ${
                hasValue(treatmentPlan.treatment_plan_metadata?.replan_requested_on)
                  ? 'on ' +
                    dayjs(treatmentPlan.treatment_plan_metadata?.replan_requested_on).format(
                      'DD-MMM-YYYY'
                    )
                  : ''
              }`}
              content={treatmentPlan.treatment_plan_metadata?.replan_reason ?? ''}
              showButton={true}
              infoIconColor='red'
              showArrowIcon={false}
              buttonText='View details'
              buttonClassName='border-red bg-transparent text-red'
              onClick={() => {
                if (isOrganization && hasValue(order?.purchase_order_details)) {
                  const queryParams = new URLSearchParams()
                  if (hasValue(orderId)) queryParams.append('order_id', String(orderId))

                  const queryString = queryParams.toString()
                  return navigate(
                    `/plan/${patientId}/view-treatment-plan/${treatmentPlan.aligner_treatment_id}${
                      queryString ? `?${queryString}` : ''
                    }`
                  )
                }
                dispatchAction(setTreatmentPlan({}))
                navigate(
                  `/leads-profile/${patientId}/treatment/new/setupTreatmentPlan?order_id=${orderId}`
                )
              }}
            />
          </When>
          <Divider className='my-3' />
          <div className='flex flex-col md:flex-row md:gap-12 gap-2'>
            <When isTrue={treatmentPlan.treatment_type === treatmentTypeMain.ALIGNERS}>
              <LabelValuePair
                className='flex-row md:flex-col gap-2 items-center md:items-baseline md:gap-1'
                labelClassName='text-base md:text-sm'
                label='Total aligners'
                value={treatmentPlan?.total_aligner}
              />
              <LabelValuePair
                className='flex-row md:flex-col gap-2 items-center md:items-baseline md:gap-1'
                labelClassName='text-base md:text-sm'
                label='Upper jaw'
                value={
                  hasValue(treatmentPlan?.upper_jaw_details?.range) ? (
                    <div>
                      {formatAligners(treatmentPlan?.upper_jaw_details?.range ?? []).map(
                        (range, index) => (
                          <p key={index}>{range}</p>
                        )
                      )}
                    </div>
                  ) : (
                    <div className='text-textColor'>Not added</div>
                  )
                }
              />
              <LabelValuePair
                className='flex-row md:flex-col gap-2 items-center md:items-baseline md:gap-1'
                labelClassName='text-base md:text-sm'
                label='Lower jaw'
                value={
                  hasValue(treatmentPlan?.lower_jaw_details?.range) ? (
                    <div>
                      {formatAligners(treatmentPlan?.lower_jaw_details?.range ?? []).map(
                        (range, index) => (
                          <p key={index}>{range}</p>
                        )
                      )}
                    </div>
                  ) : (
                    <div className='text-textColor'>Not added</div>
                  )
                }
              />
            </When>
            <LabelValuePair
              className='flex-row md:flex-col gap-2 items-center md:items-baseline md:gap-1'
              labelClassName='text-base md:text-sm'
              label='Created on'
              value={
                treatmentPlan.treatment_type === treatmentTypeMain.ALIGNERS
                  ? dayjs(treatmentPlan.created_at).format('DD-MMM-YYYY')
                  : treatmentPlan?.braces_treatment_created_on &&
                    dayjs(treatmentPlan?.braces_treatment_created_on?.split('[')[0]).format(
                      'DD-MMM-YYYY'
                    )
              }
            />
            {/* TODO: UPDATE CONDITION */}
            <When isTrue={isOrganization && hasValue(order?.purchase_order_details)}>
              <LabelValuePair
                className='flex-row md:flex-col gap-2 items-center md:items-baseline md:gap-1'
                labelClassName='text-base md:text-sm'
                label={
                  <div className='flex gap-2'>
                    <ArrowRightDownIcon
                      className={treatmentPlan?.purchase_order ? 'transform -rotate-90' : ''}
                      width='16'
                      height='16'
                    />
                    {!treatmentPlan?.purchase_order ? 'Received from lab' : 'Sent to practice'}
                  </div>
                }
                value={(() => {
                  const status = getLinkedTreatmentPlanStatus({
                    treatmentPlan,
                    isPurchaseOrder: !treatmentPlan?.created_by_me,
                  })
                  return (
                    <div>
                      <When isTrue={status !== 'Draft' && status !== 'Archived'}>
                        <Tag
                          value={status}
                          className={`${getTreatmentPlanStatusTagClassName(status)} w-fit text-sm `}
                        />
                      </When>
                      <When isTrue={status === 'Draft' || status === 'Archived'}>
                        <p>-</p>
                      </When>
                    </div>
                  )
                })()}
              />
            </When>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TreatmentPlanCard
