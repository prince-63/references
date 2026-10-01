import cn from '@utils/cn'

const PatientProfileInitials = ({name, className}: {name?: string; className?: string}) => {
  const safeName = name ?? ''
  const initials = safeName
    .replace(/^Dr\.\s*/i, '') // remove "Dr." prefix (case-insensitive)
    .trim() // remove extra spaces
    .split(/\s+/) // split by spaces
    .map((word) => word[0]?.toUpperCase() ?? '') // take first letter of each word
    .join('') // join them together
    .slice(0, 2) // in case there are more words, limit to 2 letters

  return (
    <div
      className={cn(
        'bg-mediumGray text-textColor text-base font-medium rounded-full flex justify-center items-center min-w-8 min-h-8',
        className
      )}
    >
      <span>{initials}</span>
    </div>
  )
}

export default PatientProfileInitials
