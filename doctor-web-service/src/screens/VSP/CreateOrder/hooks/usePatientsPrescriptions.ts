import useDispatchAction from '@hooks/useDispatchAction'
import {useEffect} from 'react'
import {useSelector} from 'react-redux'
import {getVspPrescriptionsByPatient} from 'redux/Slices/AppSlice/VSP/prescriptions.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'

export const usePatientsPrescriptions = (
  patientId?: number | string,
  getFreshData: boolean = true
) => {
  const {dispatchAction} = useDispatchAction()

  const resolvedPatientId = safeParseInt(patientId)

  const {
    vspPrescriptionsByPatient,
    getVspPrescriptionsByPatientLoading,
    getVspPrescriptionsByPatientError,
  } = useSelector((state: RootState) => state.vspPrescription)

  useEffect(() => {
    if (!getFreshData) return
    if (!resolvedPatientId) return

    dispatchAction(
      getVspPrescriptionsByPatient({
        patient_id: resolvedPatientId,
      })
    )
  }, [getFreshData, resolvedPatientId])

  return {
    patientsPrescriptions: vspPrescriptionsByPatient,
    hasPrescriptions: vspPrescriptionsByPatient.length > 0,
    loadingPrescriptions: getVspPrescriptionsByPatientLoading,
    prescriptionsError: getVspPrescriptionsByPatientError,
    patientId: resolvedPatientId,
  }
}
