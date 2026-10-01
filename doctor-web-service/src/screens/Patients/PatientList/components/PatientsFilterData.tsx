import {Divider, Popover} from 'antd'
import {useContext} from 'react'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import When from 'components/when/When'
import clsx from 'clsx'
import useActiveProfile from '@hooks/useActiveProfile'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {
  getPatientsList,
  getPatientsListForOrg,
  RequestPatientList,
  RequestPatientListForOrg,
  setAllResetFilter,
  setBrandName,
  setCustomerOrPractice,
  setCustomerOrPracticeForOrg,
  setPracticeFilter,
  setPracticeLocation,
  setPracticeLocationForOrg,
} from 'redux/Slices/AppSlice/PatientsList/patientsList.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import FilterWithSearchBox from './FilterWithSearchBox'
import FilterWithRadioAndSearch from './FilterWithRadioAndSearch'
import practiceRadiosList from '../types/practiceRadiosList'
import AntdButton from 'components/atom/Buttons/AntdButton'
import hasValue from 'utils/hasValue'
import FilterWithRadioAndSearchForOrg from './FilterWithRadioAndSearchForOrg'
import brandListRadiosList from '../types/brandListRadiosList'
import rolesConstants from '@constants/roles.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import FilterIcon from 'assets/icons/FilterIcon'

const PatientsFilterData = ({activeFilter}: {activeFilter: string}) => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const {activeProfile} = useActiveProfile()
  const {
    isAlignerCompanyOrg,
    isPractice,
    isGrowthPlanUser,
    isDesignLabUser,
    isVendor,
    isEnterprisePlanUser,
  } = useAllUserPlan()

  const {
    statusFilter,
    globalFilter,
    practiceLocation,
    brandName,
    customerOrPractice,
    patient_type,
    practice_filter,
    treatment_type_filter,
    customerOrPracticeForOrg,
    practiceLocationForOrg,
  } = useSelector((state: RootState) => state.patientsList)
  const {loadingPatients} = useSelector((state: RootState) => state.patientsList)
  const {permissionChecks} = useFeatureAccess()
  const {isStarterPlanUser} = useAllUserPlan()
  const practicePermissions = permissionChecks?.practiceManagement?.practiceManagement?.isEditable
  const practiceLocationAccess =
    permissionChecks?.practiceLocation?.practiceLocationDetails?.isEditable

  const {practiceLocationsList} = useSelector((state: RootState) => state.calendar)
  const {activePractices} = useSelector((state: RootState) => state.practices)
  const {data} = useSelector((state: RootState) => state.apiProductionList)
  const role = (activeProfile?.roles ?? []).map((role) => role.name)
  const {dataActiveCustomerList} = useSelector((state: RootState) => state.customers)

  const patientListAccessForLabs = isDesignLabUser || isVendor

  const callFilter = () => {
    if (isAlignerCompanyOrg || isPractice || isGrowthPlanUser) {
      const payload: RequestPatientListForOrg = {
        page_number: 0,
        doctor_id: safeParseInt(userId),
        search: null,
        practice_location_ids: practiceLocationForOrg ? [practiceLocationForOrg] : [],
        practice_profile_ids: customerOrPracticeForOrg ? [customerOrPracticeForOrg] : [],
        filter_by_app_invite_status: statusFilter ?? 'ALL',
        filter_by_global_status: globalFilter,
        doctor_role: role[0],
        patient_type: patient_type,
        practice_filter: practice_filter,
        treatment_type_filter: treatment_type_filter,
        customer_or_practice_role:
          activeFilter === 'PRACTICE'
            ? rolesConstants.CONSULTING_ORTHODONTIST
            : rolesConstants?.CUSTOMER,
      }
      dispatchAction(getPatientsListForOrg({payload}))
    } else {
      const payload: RequestPatientList = {
        page_number: 1,
        doctor_id: safeParseInt(userId),
        search: null,
        practice_location: hasValue(practiceLocation) ? [practiceLocation] : [],
        filter_by_treatment_type: brandName,
        filter_by_practice_name: customerOrPractice === 'ASSIGNED' ? '' : customerOrPractice,
        filter_by_app_invite_status: statusFilter ?? 'ALL',
        filter_by_global_status: globalFilter,
        filter_by_role: activeFilter === 'PRACTICE' ? 'CONSULTING_ORTHODONTIST' : activeFilter,
      }
      dispatchAction(getPatientsList({payload}))
    }
  }

  const handleResetFilters = () => {
    dispatchAction(setAllResetFilter('ALL'))

    if (isAlignerCompanyOrg || isPractice || isGrowthPlanUser) {
      const payload: RequestPatientListForOrg = {
        page_number: 0,
        doctor_id: safeParseInt(userId),
        search: null,
        practice_location_ids: [],
        practice_profile_ids: [],
        filter_by_app_invite_status: 'ALL',
        filter_by_global_status: 'ALL',
        doctor_role: role[0],
        patient_type: 'ALL',
        practice_filter: 'ALL',
        treatment_type_filter: 'ALL',
        customer_or_practice_role:
          activeFilter === 'PRACTICE'
            ? rolesConstants.CONSULTING_ORTHODONTIST
            : rolesConstants?.CUSTOMER,
      }
      dispatchAction(getPatientsListForOrg({payload}))
    } else {
      const payload: RequestPatientList = {
        page_number: 1,
        doctor_id: safeParseInt(userId),
        search: null,
        practice_location: [],
        filter_by_treatment_type: '',
        filter_by_practice_name: '',
        filter_by_app_invite_status: 'ALL',
        filter_by_global_status: 'ALL',
        filter_by_role: activeFilter === 'PRACTICE' ? 'CONSULTING_ORTHODONTIST' : activeFilter,
      }
      dispatchAction(getPatientsList({payload}))
    }
  }

  return (
    <Popover
      content={
        <div className='flex p-4 flex-col gap-3'>
          <div className=' font-figtree text-sm font-semibold '>Filter by</div>

          {isAlignerCompanyOrg || isPractice || isGrowthPlanUser ? (
            <div>
              <When isTrue={activeFilter === 'PRACTICE' && (isPractice || isGrowthPlanUser)}>
                <div className='flex flex-col max-h-64  overflow-y-scroll dropdownRadio'>
                  <div className='text-textColor font-figtree text-sm font-medium '>
                    Practice Location
                  </div>
                  <FilterWithSearchBox
                    needValue={true}
                    items={practiceLocationsList ?? []}
                    className='text-black w-[240px]'
                    selectedItems={practiceLocationForOrg ?? ''}
                    onclick={(items) => {
                      dispatchAction(setPracticeLocationForOrg(items))
                    }}
                  />
                </div>
                <Divider className='m-0' />
              </When>
              <When isTrue={isAlignerCompanyOrg}>
                <div className='flex flex-col max-h-74 overflow-y-scroll dropdownRadio'>
                  <div className='text-textColor font-figtree text-sm font-medium '>
                    {activeFilter === 'PRACTICE' ? 'Practice' : 'Customer'}
                  </div>
                  <FilterWithRadioAndSearchForOrg
                    radioListItems={practiceRadiosList}
                    items={
                      activeFilter === 'PRACTICE'
                        ? (activePractices ?? [])
                        : (dataActiveCustomerList ?? [])
                    }
                    className='text-black w-[240px]'
                    selectedItems={customerOrPracticeForOrg ?? ''}
                    onclick={(items) => {
                      dispatchAction(setCustomerOrPracticeForOrg(items))
                    }}
                    handleRadioChange={(items) => {
                      dispatchAction(setPracticeFilter(items))
                    }}
                    isShowRadioSelect={activeFilter === 'PRACTICE' ? true : false}
                  />
                </div>
                <Divider className='m-0' />
              </When>
            </div>
          ) : (
            <>
              <When isTrue={practiceLocationAccess && activeFilter === 'PRACTICE'}>
                <div className='flex flex-col max-h-64  overflow-y-scroll dropdownRadio'>
                  <div className='text-textColor font-figtree text-sm font-medium '>
                    Practice Location
                  </div>
                  <FilterWithSearchBox
                    items={practiceLocationsList ?? []}
                    className='text-black w-[240px]'
                    selectedItems={practiceLocation}
                    onclick={(items) => {
                      dispatchAction(setPracticeLocation(items))
                    }}
                  />
                </div>
                <Divider className='m-0' />
              </When>

              <When isTrue={practicePermissions && activeFilter === 'PRACTICE'}>
                <div className='flex flex-col max-h-74 overflow-y-scroll dropdownRadio'>
                  <div className='text-textColor font-figtree text-sm font-medium '>Practice</div>
                  <FilterWithRadioAndSearch
                    radioListItems={practiceRadiosList}
                    items={activePractices ?? []}
                    className='text-black w-[240px]'
                    selectedItems={customerOrPractice}
                    onclick={(items) => {
                      dispatchAction(setPracticeLocationForOrg(items))
                    }}
                  />
                </div>
                <Divider className='m-0' />
              </When>

              <When isTrue={practicePermissions && activeFilter === 'PRACTICE'}>
                <div className='flex flex-col max-h-72 overflow-y-scroll dropdownRadio'>
                  <div className='text-textColor font-figtree text-sm font-medium '>
                    Treatment type
                  </div>
                  <FilterWithRadioAndSearch
                    radioListItems={brandListRadiosList}
                    items={data ?? []}
                    className='text-black w-[240px]'
                    selectedItems={brandName}
                    onclick={(items) => {
                      dispatchAction(setBrandName(items))
                    }}
                  />
                </div>
                <Divider className='m-0' />
              </When>

              <When
                isTrue={
                  (patientListAccessForLabs && activeFilter === 'CUSTOMER') ||
                  (isDesignLabUser && !isEnterprisePlanUser)
                }
              >
                <div className='flex flex-col max-h-64  overflow-y-scroll dropdownRadio'>
                  <div className='text-textColor font-figtree text-sm font-medium '>Customer</div>
                  <FilterWithSearchBox
                    items={dataActiveCustomerList ?? []}
                    className='text-black w-[240px]'
                    selectedItems={customerOrPractice}
                    onclick={(items) => {
                      dispatchAction(setCustomerOrPractice(items))
                    }}
                  />
                </div>
              </When>
            </>
          )}

          <div className='flex gap-2 w-full '>
            <AntdButton
              className='bg-white hover:!bg-white w-full hover:!text-textColor h-10 font-semibold text-base border border-mediumGray text-textColor'
              isLoading={false}
              text='Reset'
              onClick={handleResetFilters}
            />
            <AntdButton
              className='bg-primaryColor text-white h-10 font-semibold text-base w-full'
              isLoading={loadingPatients}
              disabled={loadingPatients}
              text='Apply'
              htmlType='submit'
              onClick={() => {
                callFilter()
              }}
            />
          </div>
        </div>
      }
      overlayInnerStyle={{padding: '4px', fontFamily: 'Figtree', width: 300}}
      placement='bottom'
      trigger={['click']}
      className='transition ease-in-out duration-200'
    >
      {isStarterPlanUser ? (
        <button
          className={clsx(
            'rounded-lg flex justify-center items-center border  px-2 py-1 ml-2 border-mediumGray text-textColor'
          )}
          type='button'
        >
          <span className='ml-1'>Clinic</span>
          <svg
            className='w-3 h-3 ml-2 text-textColor'
            viewBox='0 0 12 8'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            aria-hidden='true'
          >
            <path
              d='M1.41 0.58 6 5.17l4.59-4.59L12 1.99 6 8 0 1.99 1.41 0.58Z'
              fill='currentColor'
            />
          </svg>
        </button>
      ) : (
        <button
          className={clsx(
            'rounded-lg flex justify-center items-center border  px-2 py-1 ml-2 border-mediumGray text-textColor'
          )}
          type='button'
        >
          <FilterIcon color={'#666666'} />
          <span className='ml-1'>Filter</span>
        </button>
      )}
    </Popover>
  )
}

export default PatientsFilterData
