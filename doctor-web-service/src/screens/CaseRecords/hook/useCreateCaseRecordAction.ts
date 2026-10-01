import useDispatchAction from '@hooks/useDispatchAction'
import {createCaseRecord} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {APIPostData} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'

export const useCreateCaseRecordAction = () => {
  const {dispatchAction} = useDispatchAction()

  const createNewCaseRecord = (payload: APIPostData) => {
    return dispatchAction(createCaseRecord(payload)).unwrap()
  }

  return {createNewCaseRecord}
}
