import patientCountStatTypesConstants from '@constants/patientCountStatTypes.constants'

export default [
  {
    label: 'All patients',
    value: patientCountStatTypesConstants.ALL,
    mappedKey: 'all_patient',
  },
  {
    label: 'In Assessment',
    value: patientCountStatTypesConstants.ASSESSMENT,
    mappedKey: 'in_assessment',
  },
  {
    label: 'In Planning',
    value: patientCountStatTypesConstants.IN_PLANNING,
    mappedKey: 'in_planning',
  },
  {
    label: 'Tracking pending',
    value: patientCountStatTypesConstants.ADD_TRACKING,
    mappedKey: 'tracking_pending',
  },
  {
    label: 'Starting soon',
    value: patientCountStatTypesConstants.STARTING_SOON,
    mappedKey: 'starting_soon',
  },
  {
    label: 'Ongoing',
    value: patientCountStatTypesConstants.ONGOING,
    mappedKey: 'ongoing',
  },
  {
    label: 'Completed',
    value: patientCountStatTypesConstants.COMPLETED,
    mappedKey: 'completed',
  },
  {
    label: 'Paused',
    value: patientCountStatTypesConstants.PAUSED,
    mappedKey: 'paused',
  },
  {
    label: 'In Refinement',
    value: patientCountStatTypesConstants.REFINEMENT,
    mappedKey: 'in_refinement',
  },
]
