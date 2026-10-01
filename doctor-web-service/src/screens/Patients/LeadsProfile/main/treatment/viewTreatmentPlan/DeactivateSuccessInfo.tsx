import deactivateSuccessInfoList from '@staticData/deactivateSuccessInfoList'

const InfoItem = ({title, subTitle, Icon}: {title: string; subTitle: string; Icon: any}) => {
  return (
    <div className='flex gap-2 items-start'>
      <Icon />
      <div className='flex flex-col items-start '>
        <p className='font-semibold text-base'>{title}</p>
        <p className='font-normal text-sm'>{subTitle}</p>
      </div>
    </div>
  )
}

const DeactivateSuccessInfo = () => {
  return (
    <div className='flex flex-col text-textColor gap-2'>
      <p className='font-semibold'>What can you do next?</p>
      <div className='rounded-lg bg-lightGray p-3 flex flex-col gap-4'>
        {deactivateSuccessInfoList.map((item, index) => (
          <InfoItem
            key={index}
            {...{
              title: item.title,
              subTitle: item.subTitle,
              Icon: item.icon,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default DeactivateSuccessInfo
