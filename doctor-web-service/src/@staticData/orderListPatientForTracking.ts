import patientCountStatTypesConstants from '@constants/patientCountStatTypes.constants'

export default [
  {
    label: 'All Patients',
    value: patientCountStatTypesConstants.ALL_TREATMENT_TRACKING,
    mappedKey: 'combined_treatment_tracking_count',
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
    label: 'Paused',
    value: patientCountStatTypesConstants.PAUSED,
    mappedKey: 'paused',
  },
  {
    label: 'In Refinement',
    value: patientCountStatTypesConstants.REFINEMENT,
    mappedKey: 'refinement',
  },
  {
    label: 'Completed',
    value: patientCountStatTypesConstants.COMPLETED,
    mappedKey: 'completed',
  },
] as const
