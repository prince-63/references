import {CustomEventInput} from 'screens/Calendar/calendar.types'

const transformEvents = (events: CustomEventInput[]): CustomEventInput[] => {
  return events.map((event) => {
    const {end_date = null} = event.content.details
    return {
      ...event,
      ...(end_date && {end: end_date}),
    }
  })
}
export default transformEvents
