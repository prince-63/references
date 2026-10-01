import MobileRestrictModeIcon from 'assets/icons/MobileRestrictModeIcon'

const RestrictMobileView = () => {
  return (
    <div className='flex flex-col gap-3 justify-center items-center h-full md:h-[calc(100vh-18rem)]'>
      <div className='rounded-full w-fit h-fit'>
        <MobileRestrictModeIcon />
      </div>
      <div>
        <p className='text-base font-semibold text-textColor '>
          This content is best viewed on web
        </p>
        <p className='text-sm font-normal text-textColor '>
          For a better experience switch to your pc.
        </p>
      </div>
    </div>
  )
}

export default RestrictMobileView
