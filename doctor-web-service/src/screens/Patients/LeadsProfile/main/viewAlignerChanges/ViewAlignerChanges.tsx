import Page from 'components/page/Page'
import AlignerChangesSidebar from './components/AlignerChangesSidebar'
import AlignerChangesDetailsPanel from './components/alignerChangeDetails/AlignerChangesDetailsPanel'
import {useEffect, useRef, useState} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getAlignerUpdateDetails,
  getAlignerUpdates,
  setSelectedUpdate,
} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import updateCategoryConstants from '@constants/updateCategory.constants'
import {useMediaQuery} from 'react-responsive'
import {IActions} from '../../leadsProfile.types'

const ViewAlignerChanges = () => {
  const [gettingAlignerUpdateDetails, setGettingAlignerUpdateDetails] = useState(false)
  const [gettingAlignerUpdates, setGettingAlignerUpdates] = useState(false)
  const {alignerJourneyId, patientId} = useParams()
  const {alignerUpdates, selectedUpdate} = useSelector((state: RootState) => state.alignerTracking)
  const {dispatchAction} = useDispatchAction()
  const isTabletAndBelow = useMediaQuery({query: '(max-width: 1200px)'})
  const [searchParams] = useSearchParams()
  const isViewParticularEvent = searchParams.get('isViewParticularEvent') === 'true'

  const onClickSidebarItem = (actionId: number) => {
    dispatchAction(setSelectedUpdate(actionId))
  }

  const navigate = useNavigate()
  const callGetAlignerUpdates = async () => {
    setGettingAlignerUpdates(true)
    await dispatchAction(
      getAlignerUpdates({
        aligner_journey_id: parseInt(alignerJourneyId as string),
      })
    )
      .unwrap()
      .then((res: IActions) => {
        setGettingAlignerUpdates(false)
        if (isTabletAndBelow) {
          dispatchAction(setSelectedUpdate(null))
        } else if (!hasValue(selectedUpdate)) {
          dispatchAction(setSelectedUpdate(res?.actions[0]?.aligner_acton_id))
        }
      })
  }
  useEffect(() => {
    callGetAlignerUpdates()
    if (isViewParticularEvent) {
      callGetAlignerUpdateDetails()
    } else {
      return () => {
        dispatchAction(setSelectedUpdate(null))
      }
    }
  }, [alignerJourneyId])

  const callGetAlignerUpdateDetails = async () => {
    if (!selectedUpdate) return
    if (isTabletAndBelow && hasValue(selectedUpdate)) {
      return navigate(
        `/leads-profile/${patientId}/${alignerJourneyId}/alignersTracking/viewAlignerChanges/${selectedUpdate}`
      )
    }
    setGettingAlignerUpdateDetails(true)
    await dispatchAction(
      getAlignerUpdateDetails({
        aligner_action_id: selectedUpdate,
      })
    )
      .unwrap()
      .then(() => {
        setGettingAlignerUpdateDetails(false)
        // if (selectedUpdate === alignerUpdates.actions[0].aligner_acton_id) return
        const isNewUpdate =
          alignerUpdates.actions.find((item) => item.aligner_acton_id === selectedUpdate)
            ?.update_category === updateCategoryConstants.NEW
        if (!isNewUpdate) return
        dispatchAction(
          getAlignerUpdates({
            aligner_journey_id: parseInt(alignerJourneyId as string),
          })
        )
      })
  }

  const initialMount = useRef(true)

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false
    } else {
      callGetAlignerUpdateDetails()
    }
  }, [selectedUpdate])

  return (
    <Page
      title='Aligner updates'
      showBackButton
      backNavigationRoute={`/leads-profile/${patientId}/${alignerJourneyId}/alignersTracking`}
    >
      <div className='flex border-t border-t-lightGray pt-0 pb-0'>
        <When isTrue={hasValue(alignerUpdates)}>
          <div className='flex min-w-[100%] md:min-w-[35%] min-h-[calc(100vh-18.5rem)]'>
            <AlignerChangesSidebar
              onClickSidebarItem={onClickSidebarItem}
              gettingAlignerUpdates={gettingAlignerUpdates}
            />
            <div className='border-r border-lightGray min-h-[calc(100vh-7rem)] -mb-5 hidden md:block' />
          </div>
        </When>
        {alignerUpdates.actions && (
          <div className='p-3 flex-grow flex-shrink max-h-[calc(100vh-7rem)] -mb-5 overflow-auto -mr-5 hidden md:block'>
            <AlignerChangesDetailsPanel
              {...{
                gettingAlignerUpdateDetails,
                gettingAlignerUpdates,
                showBackButton: false,
                backNavigationRoute: '',
                alignerUpdateItem: alignerUpdates.actions.find(
                  (item) => item.aligner_acton_id === selectedUpdate
                )!,
              }}
            />
          </div>
        )}
      </div>
    </Page>
  )
}

export default ViewAlignerChanges
