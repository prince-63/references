import formatAmount from './formatAmount'
import getEventTitle from './getEventTitle'
import getHeaderButtonRules from './headerButtonRules'
import getColorCombinationForEvent from './getColorCombinationForEvent'
import calendarEventsConstants from '@constants/calendarEvents.constants'

describe('formatAmount', () => {
  it('returns undefined for empty input', () => {
    expect(formatAmount(undefined)).toBeUndefined()
  })

  it('strips non-digits and formats in en-IN locale', () => {
    expect(formatAmount('₹12,34,567.89')).toBe('12,34,56,789')
    expect(formatAmount(123456)).toBe('1,23,456')
  })
})

describe('getEventTitle', () => {
  const baseContent = {
    patient_name: 'Alex',
    previous_aligner_jaw_type: 'upper',
    previous_aligner_number: 1,
    current_aligner_jaw_type: 'lower',
    current_aligner_number: 2,
    jaw_type: 'upper',
    check_in_for_aligner_no: 3,
  }

  const makeArgs = (type: string, view: string = 'dayGridMonth') =>
    ({
      event: {
        extendedProps: {
          calendar_response_type: type,
          content: {details: baseContent},
        },
      },
      view: {type: view},
    }) as any

  it('describes aligner change events with abbreviated jaw for month view', () => {
    const title = getEventTitle(makeArgs(calendarEventsConstants.ALIGNER_CHANGED))
    expect(title).toBe('Alex | U 1 to L 2')
  })

  it('uses full jaw name on week/day view', () => {
    const title = getEventTitle(makeArgs(calendarEventsConstants.ALIGNER_CHECK_IN, 'listWeek'))
    expect(title).toBe('Alex | Upper 3 check-in')
  })

  it('falls back to appointment title when type is appointment', () => {
    const title = getEventTitle(makeArgs(calendarEventsConstants.APPOINTMENT))
    expect(title).toBe("Alex's Appointment")
  })

  it('returns reminder label from header titles', () => {
    const title = getEventTitle(makeArgs(calendarEventsConstants.PAYMENT_REMINDER))
    expect(title).toBe('Payment reminder')
  })
})

describe('getHeaderButtonRules', () => {
  const today = new Date()

  const makeEvent = (type: string, daysOffset = 0) => {
    const date = new Date(today)
    date.setDate(today.getDate() + daysOffset)
    return {
      extendedProps: {
        calendar_response_type: type,
        header: {date: date.toISOString()},
      },
    } as any
  }

  it('shows view/edit/delete for future appointment', () => {
    const rules = getHeaderButtonRules(makeEvent(calendarEventsConstants.APPOINTMENT, 1))
    expect(rules).toEqual({
      showViewDetailsButton: true,
      showEditButton: true,
      showDeleteButton: true,
    })
  })

  it('hides edit/delete for past events', () => {
    const rules = getHeaderButtonRules(makeEvent(calendarEventsConstants.GENERAL_REMINDER, -1))
    expect(rules.showEditButton).toBe(false)
    expect(rules.showDeleteButton).toBe(true)
    expect(rules.showViewDetailsButton).toBe(false)
  })

  it('disables edit/delete and view details for resume treatment reminders', () => {
    const rules = getHeaderButtonRules(
      makeEvent(calendarEventsConstants.RESUME_TREATMENT_REMINDER, 1)
    )
    expect(rules).toEqual({
      showViewDetailsButton: true,
      showEditButton: false,
      showDeleteButton: false,
    })
  })
})

describe('getColorCombinationForEvent', () => {
  it('returns appointment color scheme', () => {
    expect(getColorCombinationForEvent(calendarEventsConstants.APPOINTMENT)).toEqual({
      primaryColor: '#0095FF',
      secondaryColor: '#E9F3FA',
    })
  })

  it('returns reminder color scheme', () => {
    expect(getColorCombinationForEvent(calendarEventsConstants.PAYMENT_REMINDER)).toEqual({
      primaryColor: '#BE8901',
      secondaryColor: '#FFEBB8',
    })
  })

  it('returns aligner related color scheme', () => {
    expect(getColorCombinationForEvent(calendarEventsConstants.ALIGNER_CHANGED)).toEqual({
      primaryColor: '#735BF2',
      secondaryColor: '#F5F4FE',
    })
  })

  it('falls back to default colors for unknown type', () => {
    expect(getColorCombinationForEvent('UNKNOWN' as any)).toEqual({
      primaryColor: '#BE8901',
      secondaryColor: '#FFEBB8',
    })
  })
})
