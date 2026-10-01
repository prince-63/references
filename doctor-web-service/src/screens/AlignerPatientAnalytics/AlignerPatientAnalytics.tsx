import React, {useContext, useEffect, useRef, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import AlignerAnalyticsHeader from './components/AlignerAnalyticsHeader'
import AlignerChartSection from './components/AlignerChartSection'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {
  getAlignerAnalyticsCountsData,
  getAlignerPatientAnalyticsList,
  getPatientListAll,
  setIsAlignerUpdates,
  setOpenRemindDrawer,
  setRemindAll,
  setSelectedFilter,
} from 'redux/Slices/AppSlice/AlignerPatientAnalytics/AlignerPatientAnalytics.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import TableContainerForAlignerAnalytics from './components/TableContainerForAlignerAnalytics'
import OuterFilter from './components/OuterFilter'
import SortFilter from './components/SortFilter'
import When from 'components/when/When'
import {getPracticeLocationsList} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import {optionType} from 'types/optionType'
import InfoModal from './components/InfoModal'
import getColorPalette from 'utils/getColorPalette'
import InfoIcon from 'assets/icons/InfoIcon'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const AlignerPatientAnalytics = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [search, setSearch] = useState<string | null>(null)
  const {isPractice} = useAllUserPlan()
  const [showModal, setShowModal] = useState(false)
  const {selectedFilter, isAlignerUpdates, dataAllList} = useSelector(
    (state: RootState) => state.AlignerPatientAnalytics
  )
  const [selectedPracticeLocation, setSelectedPracticeLocation] = useState<optionType[] | null>(
    null
  )
  const [selectedPractice, setSelectedPractice] = useState<optionType[] | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const {permissionChecks} = useFeatureAccess()
  const alignerTreatmentAccess = permissionChecks?.alignerTreatment

  // Handle navigation state from dashboard compliance cards
  useEffect(() => {
    const state = location.state as {complianceFilter?: string}
    if (state?.complianceFilter) {
      // Map the compliance filter to the selected filter in your Redux store
      dispatchAction(setSelectedFilter(state.complianceFilter))
      // Clear the state after applying to prevent re-application on re-renders
      navigate('/aligner-patient-analytics', {replace: true, state: {}})
    }
  }, [location.state, dispatchAction, navigate])

  useEffect(() => {
    // Initial data fetch only if we don't have an incoming state
    // If we have an incoming state, the selectedFilter useEffect will handle it
    const state = location.state as {complianceFilter?: string}
    if (!state?.complianceFilter) {
      getPatientList({})
    }
    getCounts()
    getPracticeLocationList()
    getActivePracticeList('')
  }, [])

  useEffect(() => {
    if (selectedFilter) {
      dispatchAction(
        getPatientListAll({
          doctor_id: safeParseInt(userId),
          filter: selectedFilter === 'NEEDS_ATTENTION' ? 'NEED_ATTENTION' : selectedFilter,
        })
      )
    }
  }, [selectedFilter])

  const getActivePracticeList = async (query: string) => {
    await dispatchAction(
      getActivePractices({
        data: {
          sort_order: 'PRACTICE_NAME_ASC',
          page_number: 0,
          page_size: 0,
          search: query,
          doctor_id: safeParseInt(userId),
          invitation_status: 'ACCEPTED',
          invitation_roles: ['CONSULTING_ORTHODONTIST'],
        },
      })
    )
  }
  const getPracticeLocationList = () => {
    dispatchAction(
      getPracticeLocationsList({doctor_id: safeParseInt(userId), include_unassigned: false})
    )
  }
  const getCounts = () => {
    dispatchAction(getAlignerAnalyticsCountsData({doctor_id: safeParseInt(userId)}))
  }
  const getPatientList = async ({
    page = 1,
    search = null,
  }: {
    page?: number
    search?: string | null
  }) => {
    setSearch(search)
    setCurrentPageNumber(page)

    dispatchAction(
      getAlignerPatientAnalyticsList({
        doctor_id: safeParseInt(userId),
        filter: selectedFilter === 'NEEDS_ATTENTION' ? 'NEED_ATTENTION' : selectedFilter,
        page_number: page - 1,
        search: search?.trim() ?? '',
        is_aligner_pending_updates: isAlignerUpdates,
        practice_location_ids:
          selectedPracticeLocation && selectedPracticeLocation.map((item) => item.value),
        practice_profile_ids: selectedPractice && selectedPractice.map((item) => item.value),
      })
    )
  }

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      dispatchAction(setIsAlignerUpdates(false))
    }
  }, [])

  const handleSearch = (search: string | null) => {
    getPatientList({page: 1, search: search})
  }

  useEffect(() => {
    handleSearch(search)
  }, [selectedFilter, isAlignerUpdates])

  useEffect(() => {
    if (selectedPracticeLocation || selectedPractice) {
      handleSearch(search)
    }
  }, [selectedPracticeLocation, selectedPractice])

  return (
    <>
      {alignerTreatmentAccess?.alignerAnalytics?.isViewable ? (
        <div className='flex flex-col md:gap-4 gap-3 md:p-4 p-2 md:pb-0 pb-[70px]'>
          <InfoModal
            showModal={showModal}
            setShowModal={setShowModal}
            showInfoAlinerUpdate={true}
          />

          <AlignerAnalyticsHeader />
          <AlignerChartSection />

          <button
            className='flex gap-2 md:hidden'
            onClick={(e) => {
              e.stopPropagation()
              setShowModal(true)
            }}
          >
            <InfoIcon width='18' height='18' color={getColorPalette().primaryColor} />
            <div className='text-sm font-medium text-textColor'>What are pending updates?</div>
          </button>

          <div className='flex flex-wrap justify-between gap-3'>
            <div className='flex gap-2'>
              <PracticeSearchInput className='md:min-w-[400px]' handleSearch={handleSearch} />

              <SortFilter
                selectedPracticeLocation={selectedPracticeLocation ?? []}
                setSelectedPracticeLocation={setSelectedPracticeLocation}
                selectedPractice={selectedPractice ?? []}
                setSelectedPractice={setSelectedPractice}
              />
            </div>

            <When
              isTrue={
                hasValue(dataAllList) &&
                isPractice &&
                (selectedFilter === 'NEEDS_ATTENTION' || selectedFilter === 'AT_RISK')
              }
            >
              <button
                className='md:w-fit w-full px-4 py-2 bg-primaryColor text-white rounded-lg'
                onClick={() => {
                  dispatchAction(setRemindAll(true))
                  dispatchAction(setOpenRemindDrawer(true))
                }}
              >
                Remind all
              </button>
            </When>
          </div>
          <OuterFilter />
          <TableContainerForAlignerAnalytics
            search={search}
            pageNumber={pageNumber}
            handleOnSearch={getPatientList}
          />
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            <span className='text-4xl'>🔒</span>
          </div>
          <div className='text-lg font-semibold text-textColor mb-2'>No access</div>
          <div className='text-sm text-gray-500 text-center max-w-md'>
            You don’t have permission to view Aligner Analytics.
          </div>
        </div>
      )}
    </>
  )
}

export default AlignerPatientAnalytics
