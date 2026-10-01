import {useEffect, useState} from 'react'
import AlignerChangesDetailsPanel from './components/alignerChangeDetails/AlignerChangesDetailsPanel'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getAlignerUpdateDetails,
  getAlignerUpdates,
} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import {useParams} from 'react-router-dom'
import {safeParseInt} from 'utils/ConstFunctions'

const AlignerChangeDetails = () => {
  const [gettingAlignerUpdateDetails, setGettingAlignerUpdateDetails] = useState(false)
  const [gettingAlignerUpdates, setGettingAlignerUpdates] = useState(false)

  const {alignerActionId, alignerJourneyId, patientId} = useParams()
  const {alignerUpdates} = useSelector((state: RootState) => state.alignerTracking)
  const {dispatchAction} = useDispatchAction()
  const callGetAlignerUpdateDetails = async () => {
    if (!alignerActionId) return
    setGettingAlignerUpdateDetails(true)
    await dispatchAction(
      getAlignerUpdateDetails({
        aligner_action_id: safeParseInt(alignerActionId),
      })
    )
      .unwrap()
      .then(() => {
        setGettingAlignerUpdateDetails(false)
      })
  }
  const callGetAlignerUpdates = async () => {
    setGettingAlignerUpdates(true)
    await dispatchAction(
      getAlignerUpdates({
        aligner_journey_id: parseInt(alignerJourneyId as string),
      })
    )
      .unwrap()
      .then(() => {
        setGettingAlignerUpdates(false)
        callGetAlignerUpdateDetails()
      })
  }

  useEffect(() => {
    callGetAlignerUpdates()
  }, [])

  return (
    <div>
      {alignerUpdates.actions && (
        <AlignerChangesDetailsPanel
          {...{
            gettingAlignerUpdateDetails,
            showBackButton: true,
            backNavigationRoute: `/leads-profile/${patientId}/${alignerJourneyId}/alignersTracking/viewAlignerChanges`,
            gettingAlignerUpdates,
            alignerUpdateItem: alignerUpdates.actions.find((item) =>
              item.aligner_acton_id === safeParseInt(alignerActionId)
                ? safeParseInt(alignerActionId)
                : 0
            )!,
          }}
        />
      )}
    </div>
  )
}

export default AlignerChangeDetails
