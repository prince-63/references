import useDispatchAction from '@hooks/useDispatchAction'
import Page from 'components/page/Page'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useLocation, useParams, useSearchParams} from 'react-router-dom'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {getTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'
import SetupTreatmentPlan from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/SetupTreatmentPlan'
import {safeParseInt} from 'utils/ConstFunctions'

const SetupPlan = () => {
  const dispatch = useDispatch()
  const {patientId, treatmentId} = useParams()
  const {userId} = useContext(AuthContext)
  const getLeadsDetails = () => {
    const postData = {
      patient_id: safeParseInt(patientId),
      doctor_id: safeParseInt(userId),
    }
    dispatch(getLeadsProfileDetails(postData) as any)
  }

  useEffect(() => {
    getLeadsDetails()
  }, [patientId])
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const {state} = useLocation()
  const {dispatchAction} = useDispatchAction()
  const {getTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  useEffect(() => {
    dispatchAction(
      getTreatmentPlan({
        aligner_treatment_id: treatmentId?.toString() ?? '',
      })
    )
  }, [])

  return (
    <Page title='' loading={getTreatmentPlanLoading}>
      <div className='flex flex-col md:flex-row justify-between gap-4 mb-4'>
        <SetupTreatmentPlan
          {...{
            toBeCloned: state?.toBeCloned ?? true,
            hideAlignerDetails: true,
            order_id: orderId,
          }}
        />
      </div>
    </Page>
  )
}

export default SetupPlan
