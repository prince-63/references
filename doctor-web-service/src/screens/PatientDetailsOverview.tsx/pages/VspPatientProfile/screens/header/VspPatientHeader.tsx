import PatientProfileCard from './components/PatientProfileCard'

const VspPatientHeader = () => {
  return (
    <div className='w-full rounded-2xl border border-lightGray bg-white p-3 md:p-5 shadow-sm flex flex-col gap-3 md:gap-4'>
      <PatientProfileCard />
    </div>
  )
}

export default VspPatientHeader
