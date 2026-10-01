import trackingTypes from '@constants/trackingTypes'

export default {
  [trackingTypes.MANUAL]: {
    title: 'Manual Tracking',
    price: 300,
    features: [
      'Track your patient’s treatment yourself',
      'Get reminders on aligner change dates',
      'Flexibility to change aligners',
    ],
  },
  [trackingTypes.PATIENTAPP]: {
    title: 'Patient mobile app',
    price: 500,
    features: [
      'Connect with your patient to track progress',
      'Review aligner changes made by them',
      'Address any patient concerns or questions',
    ],
  },
  [trackingTypes.UNASSIGNED]: {
    title: '',
    price: 0,
    features: [],
  },
}
