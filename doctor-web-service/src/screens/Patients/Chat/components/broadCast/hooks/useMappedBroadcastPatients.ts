import {useMemo} from 'react'
import hasValue from 'utils/hasValue'
import {RowDataForBroadcastListPatients} from '../broadCastTypes'

const useMappedBroadcastPatients = ({
  patientsList,
}: {
  patientsList: RowDataForBroadcastListPatients[]
}) => {
  const mappedOrders = useMemo(() => {
    if (!hasValue(patientsList)) return []
    return patientsList.map((patient) => patient)
  }, [patientsList])

  return mappedOrders
}

export default useMappedBroadcastPatients
