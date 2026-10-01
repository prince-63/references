import reasonsForDeactivating from '@staticData/reasonsForDeactivating'
import DropdownPrimaryNormal from 'components/atom/Dropdown/DropdownPrimaryNormal'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {SVG_CROSS} from 'utils/SvgConstants'
import ListItemWithIcon from '../../alignersTracking/actionModals/components/ListItemWithIcon'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import LabelTitle from 'components/atom/Labels/LabelTitle'
import {setOpenDeactivateTreatmentPlanModal} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {IoWarningOutline} from 'react-icons/io5'
// import {useNavigate, useParams} from 'react-router-dom'
// import {useContext} from 'react'
// import {AuthContext} from 'context/AuthContext'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

const DeactivateTreatmentPlan = ({
  setReasonForDeactivating,
  reasonForDeactivating,
  otherRemarks,
  setOtherRemarks,
}: {
  refreshData?: () => void
  setReasonForDeactivating: (x: string) => void
  setOtherRemarks: (x: string) => void
  otherRemarks: string
  reasonForDeactivating: string
}) => {
  const {dispatchAction} = useDispatchAction()
  const {treatmentPlanList, treatmentPlan} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  // const navigate = useNavigate()
  // const activeTreatmentPlanId = treatmentPlanList.find((item) => {
  //   return item.status === 'ACTIVE' || item.status === 'PAUSED'
  // })?.treatment_plan_id

  // const {patientId} = useParams<{patientId: string}>()
  // const {userId} = useContext(AuthContext)

  const activeTreatmentPlanName = treatmentPlanList.find((item) => {
    return item.status === 'ACTIVE' || item.status === 'PAUSED'
  })?.plan_name

  const completedTreatmentPlanName = treatmentPlanList.find((item) => {
    return item.status === treatmentPlanStatusConstants.COMPLETE
  })?.plan_name

  // const completedTreatmentPlanId = treatmentPlanList.find((item) => {
  //   return item.status === treatmentPlanStatusConstants.COMPLETE
  // })?.treatment_plan_id

  const deactivationEffectsList = [
    {
      checked: false,
      value: 'Pause wear hour tracking (timer + manual) for the patient',
    },
    {
      checked: true,
      value: 'Notify the patient their treatment is paused',
    },
    {
      checked: true,
      value: 'Keep chat and treatment history accessible',
    },
    {
      checked: true,
      value: 'Auto-approve any pending aligner updates',
    },
  ]

  return (
    <ModalLayout className='md:w-[38rem]' isResponsive>
      <div className='flex flex-col gap-3'>
        <div className='flex justify-between items-center'>
          <div className='flex justify-center items-center w-10 h-10 bg-redSupport rounded-full'>
            <IoWarningOutline height={24} width={24} style={{color: 'red'}} />
          </div>
          <div
            className='cursor-pointer'
            onClick={() => {
              setReasonForDeactivating(reasonsForDeactivating[0].value)
              dispatchAction(setOpenDeactivateTreatmentPlanModal(false))
            }}
          >
            <CommonSVG svg={SVG_CROSS} width='47' height='47' />
          </div>
        </div>
        <div>
          <p className='text-2xl font-semibold '>
            Deactivate{' '}
            {capitalizeFirstLetter(
              activeTreatmentPlanName ??
                completedTreatmentPlanName ??
                treatmentPlan?.treatment_plan_name
            )}{' '}
            <span>?</span>
          </p>
          <p className='text-base font-normal text-textColor '>
            Are you sure you want to deactivate this plan? This plan will be moved to refinement and
            a new plan will have to be created.
          </p>
        </div>
        <div className='border border-textColor rounded-lg p-3 flex flex-col gap-2'>
          <p className='text-black font-medium text-base'>
            What happens when you deactivate a treatment?
          </p>
          <div className='flex flex-col gap-1'>
            {deactivationEffectsList.map((item, index) => (
              <ListItemWithIcon key={index} {...item} />
            ))}
          </div>
        </div>
        <DropdownPrimaryNormal
          name='reasonForDeactivating'
          label='Reason for deactivating treatment'
          isSearchable={false}
          classNameLabel='text-textColor text-lg font-medium'
          options={reasonsForDeactivating}
          className=''
          defaultValue={reasonsForDeactivating.find((item) => reasonForDeactivating === item.value)}
          setData={setReasonForDeactivating}
          required
        />
        <div>
          <LabelTitle title='Other remarks (if any)' className='!font-medium text-lg' />
          <textarea
            className='w-full px-2 h-[180px] border rounded focus:outline-none align-text-top pt-2'
            onChange={(e) => setOtherRemarks(e.target.value)}
            value={otherRemarks}
            placeholder='Add your custom remarks'
            maxLength={150}
          />
        </div>
        <div className='flex  gap-2 mt-2'>
          {/* <AntdButton
            text={'Deactivate treatment'}
            className='h-12 !bg-red w-full hover:!bg-red'
            loading={deactivatingTreatmentPlan}
            onClick={() => {
              dispatchAction(
                deactivateTreatmentPlan({
                  reason_for_deactivation: reasonForDeactivating,
                  treatment_plan_id:
                    activeTreatmentPlanId ??
                    completedTreatmentPlanId ??
                    treatmentPlan?.treatment_plan_id,
                  other_remarks: otherRemarks,
                })
              )
                .unwrap()
                .then(() => {
                  dispatchAction(
                    getLeadsProfileDetails({
                      patient_id: safeParseInt(patientId),
                      doctor_id: safeParseInt(userId),
                    })
                  )
                  dispatchAction(
                    getApiLeadsOverview({
                      data: {
                        patient_id: safeParseInt(patientId),
                        doctor_id: safeParseInt(userId),
                      },
                    })
                  ).then(() => {
                    dispatchAction(setOpenConfirmFinalizeModal(false))
                    dispatchAction(setOpenConfirmDeactivateTreatmentPlanModal(false))
                    dispatchAction(setSelectedTreatmentPlanId(null))

                    dispatchAction(setOpenDeactivateTreatmentPlanModal(false))

                    navigate(`${profileBasePath}/${patientId}/plans-list`, {replace: true})

                    refreshData && refreshData()
                  })
                })
            }}
          /> */}

          <button
            className='bg-redSupport text-red border border-red h-12 font-semibold text-base w-full rounded-lg'
            type='button'
            onClick={() => {
              dispatchAction(setOpenDeactivateTreatmentPlanModal(false))
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalLayout>
  )
}

export default DeactivateTreatmentPlan
