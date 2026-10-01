import React from 'react'
import {useLocation, useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import When from 'components/when/When'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {RootState} from 'redux/store'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {shouldShowButton} from '../helpers/shouldShowButton'
import hasValue from 'utils/hasValue'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import getColorPalette from 'utils/getColorPalette'

interface TreatmentPlanActionsProps {
  isPurchasedPlanReceived: boolean
  treatmentStatus: keyof typeof treatmentPlanStatusConstants
  handleOnClick: (treatmentPlanStatus?: keyof typeof treatmentPlanStatusConstants) => Promise<any>
  handleDeleteDraft: () => void
  handleEditClick: () => void
  styleVariant?: 'default' | 'customerPlanCard'
}

const TreatmentPlanActions: React.FC<TreatmentPlanActionsProps> = ({
  isPurchasedPlanReceived,
  treatmentStatus,
  handleOnClick,
  handleDeleteDraft,
  handleEditClick,
  styleVariant = 'default',
}) => {
  const {createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const {treatmentId} = useParams()
  const location = useLocation()
  const isPlansListPage =
    location.pathname.includes('plans-list') || location.pathname.includes('plans')
  const {
    isAlignerCompanyOrg,
    isGrowthPlanUser,
    isPractice,
    isDesignLabUser,
    isCustomer,
    isVendor,
    isStarterPlanUser,
    isEnterprisePlanUser,
  } = useAllUserPlan()

  const {permissionChecks} = useFeatureAccess()
  const planButtonsPermissions = permissionChecks?.patientProfileActions
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const colorPalette = getColorPalette()
  const isCustomerPlanCardVariant = styleVariant === 'customerPlanCard'

  const getUserType = () => {
    if (isAlignerCompanyOrg) {
      return 'ORG'
    } else if (isGrowthPlanUser) {
      return 'GROWTH_ORG'
    } else if (isCustomer) {
      return 'CUSTOMER'
    } else if (isPractice) {
      return 'CONNECTED_PRACTICE'
    } else if (isDesignLabUser || isVendor) {
      return 'LAB_ADMIN'
    }
    return 'ORG'
  }

  return (
    <div className='flex flex-col-reverse md:flex-row justify-between gap-2 w-full'>
      <div className='flex flex-col-reverse md:flex-row gap-2 md:self-auto md:ml-auto md:justify-end w-full'>
        {/* Deactivate treatment */}
        {/* <When
          isTrue={
            !isDeactivated &&
            ((shouldShowButton({
              status: treatmentStatus,
              userType: getUserType(),
              buttonType: 'DEACTIVATE',
            }) &&
              planButtonsPermissions?.deactivatePlan?.isViewable) )
          }
        >
          <AntdButton
            onClick={(e) => {
              e.stopPropagation()
              handleOnClick(treatmentPlanStatusConstants.DEACTIVATED)
            }}
            className='!bg-redSupport !text-red hover:!bg-redSupport hover:!text-red border !border-red h-12 font-semibold text-base'
            isLoading={createTreatmentPlanLoading}
            text='Deactivate treatment'
            disabled={createTreatmentPlanLoading}
          />
        </When> */}

        {/* Delete draft */}
        <When
          isTrue={
            shouldShowButton({
              status: treatmentStatus,
              userType: getUserType(),
              buttonType: 'DELETE_DRAFT',
            }) &&
            (hasValue(treatmentId) || isPlansListPage) &&
            planButtonsPermissions?.deleteDraft?.isViewable
          }
        >
          <AntdButton
            onClick={() => {
              handleDeleteDraft()
            }}
            className='md:w-fit w-full border !bg-red !text-white h-12 font-semibold text-base hover:!bg-red'
            isLoading={createTreatmentPlanLoading}
            text='Delete Draft'
            disabled={createTreatmentPlanLoading}
          />
        </When>

        {/* Save as draft */}
        <When
          isTrue={
            shouldShowButton({
              status: treatmentStatus,
              userType: getUserType(),
              buttonType: 'SAVE_AS_DRAFT',
            }) &&
            !hasValue(treatmentId) &&
            !isPlansListPage &&
            planButtonsPermissions?.saveAsDraft?.isViewable
          }
        >
          <AntdButton
            onClick={(e) => {
              e.stopPropagation()
              handleOnClick(treatmentPlanStatusConstants.DRAFT)
            }}
            className='md:w-fit w-full border !bg-white !border-mediumGray !text-textColor hover:!text-white h-12 font-semibold text-base '
            isLoading={createTreatmentPlanLoading}
            text='Save as draft'
            disabled={createTreatmentPlanLoading}
          />
        </When>

        {/* Edit plan */}
        <When
          isTrue={
            shouldShowButton({
              status: treatmentStatus,
              userType: getUserType(),
              buttonType: 'EDIT_PLAN',
            }) &&
            (hasValue(treatmentId) || isPlansListPage) &&
            (planButtonsPermissions?.editPlan?.isViewable || isStarterPlanUser)
          }
        >
          <AntdButton
            onClick={(e) => {
              e.stopPropagation()
              handleEditClick()
            }}
            className='md:w-fit w-full border !bg-white !border-mediumGray !text-textColor hover:!text-white h-12 font-semibold text-base '
            isLoading={createTreatmentPlanLoading}
            text='Edit Plan'
            disabled={createTreatmentPlanLoading}
          />
        </When>

        {/* Request revision */}
        <When
          isTrue={
            shouldShowButton({
              status: treatmentStatus,
              userType: getUserType(),
              buttonType: 'REQUEST_REPLAN',
            }) &&
            (planButtonsPermissions?.requestRevision?.isViewable || isStarterPlanUser)
          }
        >
          <AntdButton
            onClick={(e) => {
              e.stopPropagation()
              handleOnClick(treatmentPlanStatusConstants.RE_PLAN)
            }}
            className={
              isCustomerPlanCardVariant
                ? 'h-12 rounded-xl border !bg-white !font-semibold !text-[11px] !uppercase !tracking-[0.14em] transition-all duration-200 hover:!bg-white hover:!opacity-95 hover:shadow-sm'
                : '!bg-redSupport !text-red hover:!bg-redSupport hover:!text-red border !border-red h-12 font-semibold text-base'
            }
            style={
              isCustomerPlanCardVariant
                ? {
                    borderColor: colorPalette.orange,
                    color: colorPalette.orange,
                  }
                : undefined
            }
            type={isCustomerPlanCardVariant ? 'default' : undefined}
            isLoading={createTreatmentPlanLoading}
            text='Request revision'
            disabled={createTreatmentPlanLoading}
          />
        </When>

        {/* Send for approval */}
        <When
          isTrue={
            shouldShowButton({
              status: treatmentStatus,
              userType: getUserType(),
              buttonType: 'SEND_FOR_APPROVAL',
            }) && planButtonsPermissions?.submitForApproval?.isViewable
          }
        >
          <AntdButton
            onClick={(e) => {
              e.stopPropagation()
              handleOnClick(treatmentPlanStatusConstants.SENT_FOR_APPROVAL)
            }}
            className='md:w-fit w-full border !bg-primaryColor !text-white h-12 font-semibold text-base'
            disabled={createTreatmentPlanLoading}
            text='Send for approval'
          />
        </When>

        {/* Approve */}
        <When
          isTrue={
            shouldShowButton({
              status: treatmentStatus,
              userType: getUserType(),
              buttonType: 'APPROVE',
            }) &&
            planButtonsPermissions?.approvePlan?.isViewable &&
            (isPurchasedPlanReceived || (isPractice && serviceConfig?.PLANNING)) &&
            (!(serviceConfig?.PLANNING && isEnterprisePlanUser) ||
              (isPractice && serviceConfig?.PLANNING))
          }
        >
          <AntdButton
            onClick={(e) => {
              e.stopPropagation()
              handleOnClick(treatmentPlanStatusConstants.APPROVED)
            }}
            className={
              isCustomerPlanCardVariant
                ? 'md:w-fit w-full h-12 rounded-xl border !font-semibold !text-[11px] !uppercase !tracking-[0.14em] !bg-[var(--approve-btn-color)] !border-[var(--approve-btn-color)] !text-white transition-all duration-200 hover:!bg-[var(--approve-btn-color)] hover:!border-[var(--approve-btn-color)] hover:!text-white hover:shadow-sm'
                : 'md:w-fit w-full border !bg-primaryColor !text-white h-12 font-semibold text-base'
            }
            style={
              isCustomerPlanCardVariant
                ? {
                    '--approve-btn-color': colorPalette.tertiaryColor,
                  }
                : undefined
            }
            type={isCustomerPlanCardVariant ? 'default' : undefined}
            isLoading={createTreatmentPlanLoading}
            text='Approve'
            disabled={createTreatmentPlanLoading}
          />
        </When>
      </div>
    </div>
  )
}

export default TreatmentPlanActions
