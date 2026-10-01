import NoInternetFound from 'assets/icons/NoInternetFound'
import RetryIcon from 'assets/icons/RetryIcon'

const NoInternetScreen = () => {
  return (
    <div className='flex flex-col gap-6 h-screen flex-1 justify-center items-center'>
      <NoInternetFound />
      <div className='flex flex-col items-center'>
        <h2 className='text-2xl font-semibold'>You're Offline</h2>
        <p className='text-textColor text-base'>
          No internet connection detected. Please check your connection and try again.
        </p>
      </div>
      <button
        className='bg-primaryColor text-white px-4 py-2 rounded-md mt-4 w-1/13 text-base font-medium'
        onClick={() => {
          window.location.reload()
        }}
      >
        <div className='flex items-center gap-1 w-full justify-center'>
          <span>
            <RetryIcon />
          </span>
          Retry
        </div>
      </button>
    </div>
  )
}

export default NoInternetScreen
