import patientAppointmentFilterRouteConstants from '@constants/patient.appointmentFilter.route.constants'

export default [
  {
    value: patientAppointmentFilterRouteConstants.ALL,
    path: '',
    label: 'All',
    index: true,
  },
  {
    value: patientAppointmentFilterRouteConstants.UPCOMING,
    path: 'upcoming',
    label: 'Upcoming',
    index: false,
  },
  {
    value: patientAppointmentFilterRouteConstants.PAST,
    path: 'past',
    label: 'Past',
    index: false,
  },
]
