import {customStylesForDropdown} from '@constants/customStylesForDropdown'
import useActiveProfile from '@hooks/useActiveProfile'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import ageList from '@staticData/ageList'
import genderList from '@staticData/genderList'
import AntdButton from 'components/atom/Buttons/AntdButton'
import DropdownPrimary from 'components/atom/Dropdown/DropdownPrimary'
import DropdownSimple from 'components/atom/Dropdown/DropdownSimple'
import FormikSelect from 'components/atom/Inputs/FormikSelect'
import InputMobile from 'components/atom/Inputs/InputMobile'
import InputText from 'components/atom/Inputs/InputText'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import When from 'components/when/When'
import {useDispatch, useSelector} from 'react-redux'
import {useLocation} from 'react-router-dom'
import addressService from 'services/addressCityStateCountry/address.service'
import {optionType} from 'types/optionType'
import hasValue from 'utils/hasValue'
import {SVG_DROPDOWN, SVG_PLUS_PRIMARY} from 'utils/SvgConstants'
import {useContext, useEffect, useMemo} from 'react'
import {AuthContext} from 'context/AuthContext'
import {getLabsList} from 'redux/Slices/AppSlice/Labs/labs.slice'
import {RootState} from 'redux/store'
import {ServiceConfiguration} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'

const AddPatientContent = ({
  formik,
  activePractices,
  practiceLocationList,
  addClinicModalOpen,
  countryCode,
  setCountryCode,
  isEditPatient,
  patientData,
  treatmentPlanFinalized,
  allDisabled = false,
  disable,
}: {
  formik: any
  activePractices: optionType[]
  practiceLocationList: any
  addClinicModalOpen?: any
  practicesPermissions: any
  countryCode: any
  setCountryCode: any
  isEditPatient: any
  patientData?: any
  treatmentPlanFinalized?: any
  allDisabled?: boolean
  disable?: boolean
}) => {
  const dispatch = useDispatch()
  const {isCustomer, isPractice} = useAllUserPlan()
  const {activeProfile} = useActiveProfile()
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {dataLabList, loadingLabList} = useSelector((state: RootState) => state.labs)
  const location = useLocation()
  const isAddPatientPage = location.pathname.includes('add-patient')
  const isOrdersModule = location.pathname.includes('/orders')
  const {isStarterPlanUser} = useAllUserPlan()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration) as {
    serviceConfig: ServiceConfiguration | null
  }
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false

  const labOptions = useMemo(
    () =>
      (dataLabList?.doctor_invitation_details_list ?? [])
        .filter((lab) => lab.status === 'ACCEPTED' && !lab.enabled_items?.includes('MANUFACTURING'))
        .map((lab) => ({
          value: lab.profile_id,
          label: lab.org_name,
          profile_id: lab.profile_id,
          organization_id: lab.organization_id,
          doctor_id: lab.doctor_id,
        })),
    [dataLabList?.doctor_invitation_details_list]
  )
  const rolesString = activeProfile?.roles?.map((r: any) => r.name).join(',')
  const shouldFetchLabs = !isVspPlanning && isPractice && !isOrdersModule && !isEditPatient

  useEffect(() => {
    if (!userId || !organizationId || !profileId) return
    if (!shouldFetchLabs) return
    dispatch(
      getLabsList({
        payload: {
          doctor_id: userId,
          invitation_status: 'ALL',
          page_number: 0,
          page_size: 0,
          search: null,
          sort_order: 'ADDED_ON_NEWEST_TO_OLDEST',
        },
        roles: activeProfile?.roles ?? [],
        isPractice: isPractice,
      }) as any
    )
  }, [
    dispatch,
    userId,
    organizationId,
    profileId,
    rolesString,
    isPractice,
    shouldFetchLabs,
  ])

  useEffect(() => {
    if (!isPractice || isOrdersModule || isEditPatient) return
    if (loadingLabList) return
    if (hasValue(formik.values.lab_profile_id)) return
    if (labOptions.length !== 1) return

    const singleLab = labOptions[0]
    formik.setFieldValue('lab_profile_id', singleLab.value || '')
    formik.setFieldValue('receiver_profile_id', singleLab.profile_id || '')
    formik.setFieldValue('receiver_org_id', singleLab.organization_id || '')
    formik.setFieldValue('receiver_doctor_id', singleLab.doctor_id || '')
    formik.setFieldValue('receiver_name', singleLab.label || '')
  }, [
    formik,
    formik.values.lab_profile_id,
    isEditPatient,
    isOrdersModule,
    isPractice,
    labOptions,
    loadingLabList,
  ])

  const isExistingPatient = location.pathname.includes('/existing_case/')
  const {permissionChecks} = useFeatureAccess()
  const practicePermissions = permissionChecks?.customerManagement?.customerManagement?.isAddable
  const contactPermissions =
    permissionChecks?.patientDetails?.patientContactDetails?.isViewable || isStarterPlanUser

  return (
    <div className='pr-2 overflow-y-auto min-h-0 h-full md:h-auto md:w-fit w-full md:overflow-visible overflow-auto'>
      <div className='grid md:grid-cols-2  gap-4'>
        <div className='w-full'>
          <InputText
            name='firstName'
            className=''
            label='First Name'
            placeholder='Enter first name'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={true}
            disabled={isEditPatient || allDisabled}
            maxLength={50}
          />
        </div>
        <div className='w-full'>
          <InputText
            name='lastName'
            className=''
            label='Last Name'
            placeholder='Enter last name'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={false}
            disabled={allDisabled}
            maxLength={50}
          />
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-4 mt-2'>
        <div className='w-full'>
          <DropdownPrimary
            name='gender'
            className=''
            label='Gender'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={false}
            options={genderList}
            customStyles={customStylesForDropdown}
            value={formik.values.gender}
            placeholder='Select gender'
            isDisabled={allDisabled}
            isSearchable={true}
          />
        </div>
        <div className='w-full'>
          <DropdownPrimary
            name='age'
            className=''
            label='Age'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={false}
            options={ageList}
            customStyles={customStylesForDropdown}
            value={formik.values.age}
            placeholder='Select age'
            isDisabled={allDisabled}
            isSearchable={true}
          />
        </div>
      </div>

      {!isVspPlanning && contactPermissions && (
        <div className='mt-2'>
          <InputMobile
            name='mobileNumber'
            className=''
            label='Mobile Number'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={false}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            value={formik.values.mobileNumber}
            isDisable={allDisabled}
          />
        </div>
      )}

      {!isVspPlanning && contactPermissions && (
        <div className='mt-2'>
          <InputText
            name='email'
            className=''
            label='Email'
            placeholder='Enter email'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            disabled={(isEditPatient && hasValue(patientData?.email)) || allDisabled}
            maxLength={50}
          />
        </div>
      )}

      <When isTrue={!isVspPlanning && isPractice && !isOrdersModule && !isEditPatient}>
        <div className='mt-3'>
          <DropdownPrimary
            name='lab_profile_id'
            className=''
            label='Assign Lab'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={true}
            options={labOptions}
            customStyles={customStylesForDropdown}
            isClearable
            isDisabled={allDisabled || loadingLabList || isEditPatient}
            value={formik.values.lab_profile_id || ''}
            placeholder={loadingLabList ? 'Loading labs...' : 'Select Lab'}
            emptyMessage='No labs found'
            onChange={(selected) => {
              formik.setFieldValue('lab_profile_id', selected?.value || '')
              formik.setFieldValue('receiver_profile_id', selected?.profile_id || '')
              formik.setFieldValue('receiver_org_id', selected?.organization_id || '')
              formik.setFieldValue('receiver_doctor_id', selected?.doctor_id || '')
              formik.setFieldValue('receiver_name', selected?.label || '')
            }}
          />
        </div>
      </When>

      <div className='mt-3'>
        <InputText
          name='customer_mapped_id'
          className=''
          label='Patient ID'
          placeholder='Enter patient ID'
          classNameLabel='text-sm text-textColor font-medium'
          formik={formik}
          required={false}
          maxLength={32}
          disabled={allDisabled}
        />
      </div>

      <When isTrue={practicePermissions}>
        {isAddPatientPage || isExistingPatient ? (
          <div className='mt-2'>
            <FormikSelect
              name='practice_profile_id'
              label='Assign Customer'
              options={activePractices}
              placeholder='Select Customer'
              required={true}
              disabled={isEditPatient}
              showSearch={true}
              optionFilterProp='label'
              onChange={(_, option) => {
                const selected = option
                if (selected?.profile_id) {
                  formik.setFieldValue('receiver_profile_id', profileId)
                  formik.setFieldValue('receiver_org_id', organizationId)
                  formik.setFieldValue('receiver_doctor_id', userId)
                } else {
                  formik.setFieldValue('practice_invite_id', selected?.invitation_code)
                  formik.setFieldValue('practice_profile_id', null)
                }
              }}
            />
          </div>
        ) : (
          <div className='mt-2'>
            <DropdownPrimary
              name='practice_profile_id'
              className=''
              label='Assign Customer'
              classNameLabel='!text-sm text-textColor font-medium'
              formik={formik}
              required={true}
              options={activePractices}
              customStyles={customStylesForDropdown}
              isClearable={true}
              value={formik.values.practice_profile_id}
              emptyMessage={'No results found'}
              isDisabled={(isEditPatient && treatmentPlanFinalized) || allDisabled}
              isSearchable={true}
            />
          </div>
        )}
      </When>

      <When isTrue={!isVspPlanning && !isCustomer && !practicePermissions}>
        <div className='relative mt-5 '>
          <When isTrue={hasValue(addClinicModalOpen)}>
            <div
              className='hidden md:block absolute right-0 top-1 cursor-pointer text-xs text-primaryColor'
              onClick={() => addClinicModalOpen()}
            >
              Add new
            </div>
          </When>

          <DropdownPrimary
            name='practice_location_id'
            className=''
            label='Add practice location'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            isDisabled={allDisabled || disable}
            required={false}
            options={practiceLocationList}
            customStyles={customStylesForDropdown}
            value={formik.values.practice_location_id}
            onChange={async (selectedOption: any) => {
              if (selectedOption.country && selectedOption.state) {
                await Promise.all([
                  addressService.getCountryList(dispatch),
                  addressService.getStateList(dispatch, selectedOption.country ?? null),
                  addressService.getCityList(
                    dispatch,
                    selectedOption.country ?? null,
                    selectedOption.state ?? null
                  ),
                ])
              }
              formik.setFieldValue('practice_location_id', selectedOption.value)
              formik.setFieldValue('practiceLocation', selectedOption.label)
              formik.setFieldValue('country', selectedOption.country)
              formik.setFieldValue('state', selectedOption.state)
              formik.setFieldValue('city', selectedOption.city)
            }}
            placeholder='Select Practice Location'
            emptyMessage={'No practice locations found. You can add one in your profile section'}
          />

          <When isTrue={hasValue(addClinicModalOpen)}>
            <div className='md:hidden mt-2'>
              <AntdButton
                onClick={() => addClinicModalOpen()}
                text='Add New'
                className='bg-primarySupport text-primaryColor font-semibold flex items-center justify-center hover:!bg-primarySupport hover:!text-primaryColor'
                icon={<CommonSVG svg={SVG_PLUS_PRIMARY} height='16' width='16' />}
              />
            </div>
          </When>

          <div className='absolute bg-white w-3 right-3 top-[54px] transform -translate-y-1/2 focus:outline-none'>
            <CommonSVG svg={SVG_DROPDOWN} width='8' height='8' />
          </div>
        </div>

        <div className='w-full mt-2'>
          <DropdownSimple
            name='country'
            className=''
            label='Country'
            classNameLabel='text-sm text-textColor font-medium'
            formik={formik}
            required={false}
            placeholder='Select a Country'
            value={formik.getFieldProps('country').value}
            dispatch={dispatch}
            disabled={allDisabled || disable}
          />
        </div>

        <div className='grid md:grid-cols-2 md:gap-4 mt-2 pb-[20px]'>
          <div className='w-full'>
            <DropdownSimple
              name='state'
              className=''
              label='State'
              classNameLabel='text-sm text-textColor font-medium'
              formik={formik}
              required={false}
              placeholder='Select a State'
              value={formik.getFieldProps('state').value}
              dispatch={dispatch}
              disabled={allDisabled || disable}
            />
          </div>
          <div className='w-full'>
            <DropdownSimple
              name='city'
              className=''
              label='City'
              classNameLabel='text-sm text-textColor font-medium'
              formik={formik}
              required={false}
              placeholder='Select a City'
              value={formik.getFieldProps('city').value}
              dispatch={dispatch}
              disabled={allDisabled || disable}
            />
          </div>
        </div>
      </When>
    </div>
  )
}

export default AddPatientContent
