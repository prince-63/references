import PatientProfileCard from './components/PatientProfileCard'
import OrderButtons from './components/OrderButtons'

const CustomerPatientHeader = () => {
  return (
    <div className='w-full rounded-2xl border border-gray-100 bg-white p-3 md:p-5 shadow-sm flex flex-col gap-3 md:gap-4'>
      <PatientProfileCard />
      <hr />
      <div className='flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1'>
        <OrderButtons />
      </div>
    </div>
  )
}

export default CustomerPatientHeader
