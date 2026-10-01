import React, {Dispatch, SetStateAction, useContext, useEffect, useRef, useState} from 'react'
import ModalLayout from '../../../../components/modal/ModalLayout'
import {Image} from 'assets/images/Images/Image'
import searchResultTypes from '@constants/searchResultTypes'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import {getImageUrlById, getNavigateUrl, safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  clearSearchResults,
  DoctorInvitation,
  getSearchResults,
} from 'redux/Slices/AppSlice/Sidebar/GlobalSearch.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import {IMAGE_SEARCH_EMPTY_STATE} from 'utils/ImageConst'
import {listItemProps} from './SearchListItem'
import SearchList from './SearchList'
import {IPatientDetails, IPracticeLocationDetails} from '../component/globalSearch.interface'
import Spinner from 'components/spinner/Spinner'
import {customDebounce} from '@hooks/customDebounce'
import {ConfigProvider, Input} from 'antd'
import {SVG_SEARCH} from 'utils/SvgConstants'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import PATIENT_TYPE from '@constants/patientType.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useProfileBasePath from '@hooks/useProfileBasePath'

const ModalGlobalSearch = ({
  setIsModalGlobalSearchOpen,
}: {
  setIsModalGlobalSearchOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const {searchResults, loading} = useSelector((state: RootState) => state.globalSearch)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {isPractice, isAlignerCompanyOrg} = useAllUserPlan()
  const {isEnterprisePlanUser, isGrowthPlanUser} = useAllUserPlan()
  const {permissionChecks} = useFeatureAccess()
  const globalSearchPermissions = permissionChecks?.globalSearch
  const profileBasePath = useProfileBasePath()

  const patients = searchResults?.filter(
    (result) => result.type === searchResultTypes.PATIENT_DETAILS
  ) as IPatientDetails[]

  const customerOrInternalUser = searchResults?.filter(
    (result) => result.type === searchResultTypes.DOCTOR_INVITATION
  ) as DoctorInvitation[]

  const practiceLocations = searchResults?.filter(
    (result) => result.type === searchResultTypes.DOCTOR_PRACTICE_LOCATION
  ) as IPracticeLocationDetails[]

  const patientsList = patients.map((item) => {
    const patientId = item.patient.id
    const hasReadForm = item.patient.has_read_existing_patient_form
    let link: string

    if (
      item.patient.patient_type === PATIENT_TYPE.EXISTING_PATIENT &&
      !hasReadForm &&
      (isAlignerCompanyOrg || isPractice) // ✅ Removed isPracticeAssigned check
    ) {
      link = `/add_patient/existing_case/${patientId}`
    } else {
      link = `${profileBasePath}/${patientId}` // ✅ Always go to existing_case page
    }
    const url = item.patient.profile_image_id
      ? getImageUrlById(item.patient.profile_image_id)
      : item.patient.profile_picture_url
    return {
      type: searchResultTypes.PATIENT_DETAILS,
      image: url,
      title:
        item.patient.first_name +
        ' ' +
        (hasValue(item.patient.last_name) ? item.patient.last_name : ''),
      subtitle: item.patient.email?.toLocaleLowerCase(),
      link,
    } as listItemProps
  })

  const customerOrInternalUserList = customerOrInternalUser.map((item) => {
    const url = item.profile_image_id
      ? getImageUrlById(item.profile_image_id)
      : item.profile_picture_url
    return {
      image: url,
      type: searchResultTypes.DOCTOR_INVITATION,
      title: item.full_name,
      subtitle: item.email?.toLocaleLowerCase(),
      link: getNavigateUrl(item.role),
    } as listItemProps
  })

  const practiceLocationList = practiceLocations.map((item) => {
    return {
      type: searchResultTypes.DOCTOR_PRACTICE_LOCATION,
      title: item.practice_location_details.practice_location_name,
      subtitle: item.practice_location_details.city,
      link:
        '/practice-location-list?search=' + item.practice_location_details.practice_location_name,
    } as listItemProps
  })

  const formRef: any = useRef(null)
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if ((formRef.current && !formRef.current.contains(event.target)) || event.key === 'Escape') {
        // Clicked outside the form, close the terms popup
        setSearchTerm('')
        dispatchAction(clearSearchResults())
        setIsModalGlobalSearchOpen(false)
      } else {
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const clearSearch = () => {
    dispatchAction(clearSearchResults())
  }

  const closeSearchModal = () => {
    clearSearch()
    setIsModalGlobalSearchOpen(false)
  }

  const onSearch = async (query: string) => {
    const postData = {
      query,
      doctor_id: safeParseInt(userId),
    }
    await dispatchAction(getSearchResults(postData))
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = event.target.value
    setSearchTerm(currentValue)
    if (currentValue === '') {
      dispatchAction(clearSearchResults())
    } else {
      onSearch(currentValue)
    }
  }

  const debounceChange = customDebounce(handleInputChange, 500)
  return (
    <ModalLayout className='!p-0 w-[628px] h-[427px] flex flex-col overflow-hidden'>
      <div ref={formRef} className='flex flex-col h-full overflow-hidden'>
        <div className='w-full p-6'>
          <ConfigProvider
            theme={{
              components: {
                Input: {
                  activeBorderColor: 'transparent',
                  hoverBg: '#efefef',
                  fontFamily: 'figtree',
                  hoverBorderColor: 'transparent',
                  activeBg: 'none',
                  activeShadow: 'none',
                  colorTextPlaceholder: '#666666',
                },
              },
            }}
          >
            <div className=' w-full rounded-lg bg-lightGray text-textColor'>
              <Input
                placeholder='Search by name, ID, or practice location'
                allowClear
                onChange={debounceChange}
                maxLength={30}
                size='large'
                prefix={
                  <div className='focus:outline-none pr-3'>
                    <CommonSVG svg={SVG_SEARCH} width='18px' height='18px' />
                  </div>
                }
                autoFocus
                className='bg-transparent px-4 py-4  border-none'
              />
            </div>
          </ConfigProvider>
        </div>
        {loading ? (
          <div className='flex-1 min-h-0 flex items-center justify-center'>
            <Spinner loading={loading} />
          </div>
        ) : (
          <div className='w-full flex-1 min-h-0 overflow-y-auto'>
            <When
              isTrue={
                (isEnterprisePlanUser || isGrowthPlanUser) && hasValue(customerOrInternalUserList)
              }
            >
              <SearchList
                searchList={
                  searchTerm.length < 2
                    ? customerOrInternalUserList.slice(0, 2)
                    : customerOrInternalUserList.slice(0, 4)
                }
                heading='Users'
                closeSearchModal={closeSearchModal}
              />
            </When>
            <When isTrue={hasValue(patientsList)}>
              <SearchList
                searchList={
                  searchTerm.length < 2 ? patientsList.slice(0, 2) : patientsList.slice(0, 4)
                }
                heading='Patients'
                closeSearchModal={closeSearchModal}
              />
            </When>
            <When
              isTrue={
                hasValue(practiceLocationList) &&
                globalSearchPermissions?.practiceLocations?.isViewable
              }
            >
              <SearchList
                searchList={
                  searchTerm.length < 2
                    ? practiceLocationList.slice(0, 2)
                    : practiceLocationList.slice(0, 4)
                }
                heading='Practice Locations'
                closeSearchModal={closeSearchModal}
              />
            </When>

            <When
              isTrue={
                !hasValue(patientsList) &&
                !hasValue(practiceLocationList) &&
                !hasValue(customerOrInternalUserList) &&
                !loading
              }
            >
              <div>
                <div className='text-textColor font-semibold px-6'>Search Results</div>
                <div className='w-full text-textColor text-sm font-medium flex flex-col gap-2 items-center justify-center mt-14'>
                  <Image
                    className=''
                    src={IMAGE_SEARCH_EMPTY_STATE}
                    alt='No search results found'
                  />
                  {searchTerm.length === 0
                    ? 'Search to display results'
                    : 'No search results found'}
                </div>
              </div>
            </When>
          </div>
        )}
        <div className='bg-lightGray rounded-b-md w-full px-6 py-4 text-textColor'>
          Press <span className='font-bold'>Esc</span> to close or click outside to close
        </div>
      </div>
    </ModalLayout>
  )
}

export default ModalGlobalSearch
