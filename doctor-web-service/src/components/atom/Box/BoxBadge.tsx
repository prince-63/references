import {FC} from 'react'
import {getFirstLetterCapitalOfWord} from '../../../utils/ConstFunctions'
import compilanceType from '../../../@constants/compilanceType'
import patientStatus from '../../../@constants/patientStatus'

interface BadgeProps {
  className?: string
  title?: string
  simple?: boolean
}

const BoxBadge: FC<BadgeProps> = (props) => {
  const {className, title, simple} = props
  const {GOOD, POOR, AVERAGE} = compilanceType
  const {ACTIVE, INACTIVE} = patientStatus
  let titleName: any
  if (
    title === GOOD ||
    title === POOR ||
    title === AVERAGE ||
    title === ACTIVE ||
    title === INACTIVE
  ) {
    titleName = getFirstLetterCapitalOfWord(title)
  } else {
    titleName = title
  }

  const getBadgeClassName = (title?: string, className?: string, simple?: boolean) => {
    const commonStyle = `text-sm font-semibold rounded px-4 py-1 ${className}`
    if (title === POOR || title === INACTIVE || title === '-') {
      return `bg-redSupport text-red ${commonStyle}`
    } else if (title === AVERAGE || simple) {
      return `bg-primarySupport text-primaryColor ${commonStyle}`
    } else if (title === GOOD || title === ACTIVE) {
      return `bg-tertiarySupport text-tertiaryColor ${commonStyle}`
    }
    return ''
  }
  const badgeClassName = getBadgeClassName(title, className, simple)
  return title ? <span className={badgeClassName}>{titleName}</span> : null
}

export default BoxBadge
