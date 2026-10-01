const LabListHeader = () => {
  const labHeaderText = `View all labs connected to your account or awaiting your response. You\'ll receive collaboration requests from labs, which you can <b>accept or reject</b> directly from this page.`

  return (
    <div className='mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
      {/* Left Section: Title and Description */}
      <div className='flex-1'>
        <div className='text-lg font-semibold mb-2'>Labs</div>
        <p
          className='text-sm text-textColor max-w-2xl'
          dangerouslySetInnerHTML={{__html: labHeaderText}}
        />
      </div>
    </div>
  )
}

export default LabListHeader
