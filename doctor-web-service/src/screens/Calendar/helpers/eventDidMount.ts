import getColorCombinationForEvent from './getColorCombinationForEvent'

const eventDidMount = (info: any) => {
  const {primaryColor} = getColorCombinationForEvent(
    info.event.extendedProps.calendar_response_type
  )

  if (info.view.type === 'listWeek') {
    const eventEl = info.el
    const bulletIcon = eventEl.querySelector('.fc-list-event-dot')

    if (bulletIcon) {
      bulletIcon.style.setProperty(
        'border',
        `calc(var(--fc-list-event-dot-width)/2) solid var(--fc-event-border-color)`,
        'important'
      )
      bulletIcon.style.setProperty(
        'border-radius',
        `calc(var(--fc-list-event-dot-width)/2)`,
        'important'
      )
      bulletIcon.style.setProperty('box-sizing', 'content-box', 'important')
      bulletIcon.style.setProperty('display', 'inline-block', 'important')
      bulletIcon.style.setProperty('height', '0px', 'important')
      bulletIcon.style.setProperty('width', '0px', 'important')
      bulletIcon.style.setProperty('--fc-event-border-color', primaryColor, 'important')
    }
  }
}

export default eventDidMount
