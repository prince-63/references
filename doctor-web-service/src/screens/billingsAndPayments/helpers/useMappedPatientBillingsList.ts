import {useMemo} from 'react'
import hasValue from 'utils/hasValue'
import {RowDataForBillingsAndPayments} from '../billingsAndPayments.types'

const useMappedPatientBillingsList = ({
  patient_details,
}: {
  patient_details: RowDataForBillingsAndPayments[]
}) => {
  const mappedAppointments = useMemo(() => {
    if (!hasValue(patient_details)) return []
    return patient_details.map((patient) => {
      return patient
    })
  }, [patient_details])

  return mappedAppointments
}

export default useMappedPatientBillingsList
