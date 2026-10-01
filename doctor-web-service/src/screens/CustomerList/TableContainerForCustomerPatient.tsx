import TableContainerForPatientList from 'screens/Patients/PatientList/components/TableContainerForPatientList'
import type {TableContainerForPatientListProps} from 'screens/Patients/PatientList/components/TableContainerForPatientList'

export type TableContainerForCustomerPatientProps = Omit<
  TableContainerForPatientListProps,
  'hideCreatedByColumn'
>

const TableContainerForCustomerPatient = (props: TableContainerForCustomerPatientProps) => {
  return <TableContainerForPatientList {...props} hideCreatedByColumn />
}

export default TableContainerForCustomerPatient
