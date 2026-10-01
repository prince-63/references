import {
  getCaseRecord,
  resetCaseRecordState,
} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import {useEffect, useCallback} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

interface Props {
  patient_id?: number // Make it optional
  onError?: (error: unknown) => void
}

export const useGetCaseRecordAction = ({patient_id, onError}: Props) => {
  const {dispatchAction} = useDispatchAction()

  const {caseRecordData, successGet, errorGet, loadingGet} = useSelector(
    (state: RootState) => state.caseRecord
  )

  const getCaseRecordData = useCallback(async () => {
    if (!patient_id) return // Safeguard: Skip if patient_id is not provided
    try {
      await dispatchAction(getCaseRecord({patient_id}))
    } catch (err) {
      if (onError) {
        onError(err)
      }
    }
  }, [dispatchAction, patient_id, onError])

  useEffect(() => {
    if (patient_id) {
      getCaseRecordData()
    }

    return () => {
      dispatchAction(resetCaseRecordState())
    }
  }, [patient_id])

  return {
    caseRecordData,
    successGet,
    errorGet,
    loadingGet,
    refetch: getCaseRecordData, // Expose the fetch function for manual refetching
  }
}
