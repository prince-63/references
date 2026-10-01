import moment from 'moment'

interface GetDueMessageParams {
  currentAligner?: boolean
  offSetDays?: number | null
  date?: string | null
  is_aligner_changed?: boolean
  is_aligner_change_approved?: boolean
  skipForThreeDays?: boolean
}

export const getDueMessageText = ({
  currentAligner = false,
  offSetDays,
  date,
  is_aligner_changed,
  is_aligner_change_approved,
  skipForThreeDays = false,
}: GetDueMessageParams): string | null => {
  // Handle aligner change states first
  if (is_aligner_changed && currentAligner) {
    return is_aligner_change_approved ? 'Completed' : 'Changed'
  }

  // Handle regular due dates
  let days = offSetDays
  if (date && !offSetDays) {
    days = moment(date).diff(moment().format('YYYY-MM-DD'), 'days')
  }
  if (!days && days !== 0) return null
  if (skipForThreeDays && days >= 3) return null

  if (days >= 2) return `Due in ${days} days`
  if (days === 1) return 'Due tomorrow'
  if (days === 0) return 'Due today'
  if (days === -1) return 'Due yesterday'
  if (days < -1) return `Overdue by ${Math.abs(days)} days`

  return null
}

export const getDueMessageStyle = ({
  offSetDays,
  is_aligner_changed,
  is_aligner_change_approved,
}: {
  offSetDays?: number | null
  is_aligner_changed?: boolean
  is_aligner_change_approved?: boolean
}): {className: string; iconClassName: string} => {
  // Handle aligner change states first
  if (is_aligner_changed) {
    if (is_aligner_change_approved) {
      return {
        className: 'bg-tertiarySupport text-tertiaryColor',
        iconClassName: 'bg-tertiaryColor',
      }
    }
    return {
      className: 'bg-primarySupport text-primaryColor',
      iconClassName: 'bg-primaryColor',
    }
  }

  // Handle overdue states
  if (!offSetDays && offSetDays !== 0) {
    return {
      className: '',
      iconClassName: '',
    }
  }

  if (offSetDays >= 0) {
    return {
      className: 'bg-orangeSupport text-orange',
      iconClassName: 'bg-orange',
    }
  }

  return {
    className: 'bg-redSupport text-red',
    iconClassName: 'bg-red',
  }
}
