import Shop from 'assets/icons/Shop'

const NoProductionFound = () => {
  return (
    <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full md:h-[calc(100vh-18rem)]'>
      <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
        <Shop />
      </div>
      <p>No Aligner's for Production</p>
    </div>
  )
}

export default NoProductionFound
