const NoAccess = ({moduleName}: {moduleName?: string}) => {
  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
        <span className='text-4xl'>🔒</span>
      </div>
      <div className='text-lg font-semibold text-textColor mb-2'>No access</div>
      <div className='text-sm text-gray-500 text-center max-w-md'>
        You don’t have permission to view {moduleName}.
      </div>
    </div>
  )
}

export default NoAccess
