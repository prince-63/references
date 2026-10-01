import Tag from 'components/tags/Tag'

const LabelWithTag = ({
  label,
  className,
  value,
  showTag = true,
}: {
  label: string
  className?: string
  value: string
  showTag?: boolean
}) => {
  return (
    <div className='flex justify-between w-full items-center'>
      <p className=' font-base font-normal text-textColor'>{label}</p>
      {showTag ? (
        <Tag value={value} className={className} />
      ) : (
        <p className='text-base font-semibold text-black'>{value}</p>
      )}
    </div>
  )
}

export default LabelWithTag
