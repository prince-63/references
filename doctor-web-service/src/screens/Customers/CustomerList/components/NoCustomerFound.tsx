import FirstAidKit from 'assets/icons/FirstAidKit'

const NoCustomerFound = ({title}: {title: string}) => {
  return (
    <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full md:h-[calc(100vh-18rem)]'>
      <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
        <FirstAidKit color='#666666' width='32' height='32' />
      </div>
      <p>{title}</p>
    </div>
  )
}

export default NoCustomerFound
